import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import * as Tone from "tone";
import { INSTRUMENT_TYPES } from "../../constants";
import styles from "./Keyboard.module.css";

interface SharedKeyboardProps {
  activeKeys?: string[];
  highlightedKeys?: string[];
  octaveRange?: { min: number; max: number };
  onKeyClick?: (note: string) => void;
  instrumentType?: string;
}

const Keyboard = forwardRef<
  { instrument: Tone.DuoSynth | null },
  SharedKeyboardProps
>(
  (
    {
      activeKeys = [],
      highlightedKeys = [],
      octaveRange = { min: 4, max: 5 },
      onKeyClick = () => {},
      instrumentType = INSTRUMENT_TYPES.SYNTH,
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [instrument, setInstrument] = useState<Tone.DuoSynth | null>(null);
    const [currentInstrumentType, setCurrentInstrumentType] =
      useState(instrumentType);
    const [isStickyKeys, setIsStickyKeys] = useState(false);
    const [stickyNote, setStickyNote] = useState<string | null>(null);

    // Keep track of currently playing notes
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

    // Define notes for one octave in order (important for layout)
    const octave = [
      { note: "C", isSharp: false },
      { note: "C#", isSharp: true },
      { note: "D", isSharp: false },
      { note: "D#", isSharp: true },
      { note: "E", isSharp: false },
      { note: "F", isSharp: false },
      { note: "F#", isSharp: true },
      { note: "G", isSharp: false },
      { note: "G#", isSharp: true },
      { note: "A", isSharp: false },
      { note: "A#", isSharp: true },
      { note: "B", isSharp: false },
    ];

    // Create a keyboard with the specified octave range
    const keys: { note: string; isSharp: boolean }[] = [];
    for (let o = octaveRange.min; o <= octaveRange.max; o++) {
      octave.forEach((key) => {
        const note = `${key.note}${o}`;
        // Only include notes from G3 to C6
        const noteValue = Tone.Frequency(note).toMidi();
        const g3Value = Tone.Frequency("G3").toMidi();
        const c6Value = Tone.Frequency("C6").toMidi();

        if (noteValue >= g3Value && noteValue <= c6Value) {
          keys.push({ note, isSharp: key.isSharp });
        }
      });
    }

    // Update current instrument type when prop changes
    useEffect(() => {
      if (currentInstrumentType !== instrumentType) {
        setCurrentInstrumentType(instrumentType);
        setIsLoaded(false);
      }
    }, [instrumentType, currentInstrumentType]);

    // Handle key press
    const handleKeyPress = (note: string) => {
      if (!instrument || !isLoaded) return;

      try {
        if (Tone.context.state !== "running") {
          Tone.start();
        }

        if (isStickyKeys) {
          if (stickyNote === note) {
            // If clicking the same note, release it
            instrument.triggerRelease(note);
            setStickyNote(null);
            setActiveNotes((prev) => {
              const next = new Set(prev);
              next.delete(note);
              return next;
            });
            onKeyClick("");
          } else {
            // If clicking a different note, switch to it
            if (stickyNote) {
              instrument.triggerRelease(stickyNote);
              setActiveNotes((prev) => {
                const next = new Set(prev);
                next.delete(stickyNote);
                next.add(note);
                return next;
              });
            } else {
              setActiveNotes((prev) => {
                const next = new Set(prev);
                next.add(note);
                return next;
              });
            }
            instrument.triggerAttack(note);
            setStickyNote(note);
            onKeyClick(note);
          }
        } else {
          // In non-sticky mode, just trigger the note and set active note
          instrument.triggerAttack(note);
          setActiveNotes(new Set([note]));
          onKeyClick(note);
        }
      } catch (e) {
        console.error("Error handling key press:", e);
      }
    };

    // Handle key release
    const handleKeyRelease = (note: string) => {
      if (!instrument || !isLoaded) return;

      try {
        // Only release if this note is actually active and we're not in sticky mode
        if (activeNotes.has(note) && !isStickyKeys) {
          // Ensure the note is valid before releasing
          if (note && typeof note === "string") {
            // For DuoSynth, we need to release both voices
            instrument.triggerRelease();
            setActiveNotes((prev) => {
              const next = new Set(prev);
              next.delete(note);
              return next;
            });
            onKeyClick("");
          }
        }
      } catch (e) {
        console.error("Error handling key release:", e);
        // Reset active notes if we encounter an error
        setActiveNotes(new Set());
      }
    };

    // Release all notes when unmounting or changing instruments
    useEffect(() => {
      return () => {
        if (instrument && activeNotes.size > 0) {
          instrument.triggerRelease();
          setActiveNotes(new Set());
        }
      };
    }, [instrument, activeNotes]);

    // Initialize the instrument
    useEffect(() => {
      let currentInstrument: Tone.DuoSynth | null = null;

      const initializeInstrument = async () => {
        try {
          // Dispose of the old instrument if it exists
          if (instrument) {
            // Release any active notes before disposing
            if (activeNotes.size > 0) {
              instrument.triggerRelease();
              setActiveNotes(new Set());
            }
            instrument.dispose();
          }

          currentInstrument = new Tone.DuoSynth({
            voice0: {
              oscillator: {
                type: "triangle",
              },
            },
            voice1: {
              oscillator: {
                type: "triangle",
              },
            },
          });

          // Connect to the effects bus
          currentInstrument.connect(Tone.getDestination());

          setIsLoaded(true);
          setInstrument(currentInstrument);

          // Start audio context
          await Tone.start();
          console.log("Audio context started");
        } catch (e) {
          console.error("Error initializing instrument:", e);
          setIsLoaded(true);
        }
      };

      if (!instrument || currentInstrumentType !== instrumentType) {
        initializeInstrument();
      }

      return () => {
        if (currentInstrumentType !== instrumentType && currentInstrument) {
          currentInstrument.dispose();
        }
      };
    }, [instrumentType, currentInstrumentType, instrument, activeNotes.size]);

    // Render white keys
    const renderWhiteKeys = () => {
      return keys
        .filter((key) => !key.isSharp)
        .map((key, index) => {
          const isActive =
            activeKeys.includes(key.note) || stickyNote === key.note;
          const isHighlighted = highlightedKeys.includes(key.note);

          return (
            <div
              key={`white-${key.note}-${index}`}
              className={`${styles.whiteKey} ${
                isActive ? styles.whiteKeyActive : ""
              } ${isHighlighted ? styles.whiteKeyHighlighted : ""}`}
              onPointerDown={() => handleKeyPress(key.note)}
              onPointerUp={() => handleKeyRelease(key.note)}
              onPointerLeave={() => handleKeyRelease(key.note)}
            />
          );
        });
    };

    // Render black keys
    const renderBlackKeys = () => {
      // Calculate positions for black keys
      const whiteKeyWidth = 100 / keys.filter((key) => !key.isSharp).length; // percentage width

      return keys
        .filter((key) => key.isSharp)
        .map((key, index) => {
          const isActive =
            activeKeys.includes(key.note) || stickyNote === key.note;
          const isHighlighted = highlightedKeys.includes(key.note);

          // Find the index of this black key in the full keys array
          const keyIndex = keys.findIndex((k) => k.note === key.note);
          // Calculate how many white keys came before this black key
          const whiteKeysBefore = keys
            .slice(0, keyIndex)
            .filter((k) => !k.isSharp).length;
          // Position is based on white keys
          const position = (whiteKeysBefore - 0.3) * whiteKeyWidth;

          return (
            <div
              key={`black-${key.note}-${index}`}
              className={`${styles.blackKey} ${
                isActive ? styles.blackKeyActive : ""
              } ${isHighlighted ? styles.blackKeyHighlighted : ""}`}
              style={{ left: `${position}%`, width: `${whiteKeyWidth * 0.7}%` }}
              onPointerDown={() => handleKeyPress(key.note)}
              onPointerUp={() => handleKeyRelease(key.note)}
              onPointerLeave={() => handleKeyRelease(key.note)}
            />
          );
        });
    };

    // Expose the instrument to parent components via ref
    useImperativeHandle(ref, () => ({
      instrument,
    }));

    return (
      <div className={styles.keyboardContainer}>
        <div className={styles.keyboard}>
          <div className={styles.pianoKeys}>
            {renderWhiteKeys()} {<div className={styles.front}></div>}
            {renderBlackKeys()}
          </div>
        </div>
      </div>
    );
  }
);

Keyboard.displayName = "Keyboard";

export default Keyboard;
