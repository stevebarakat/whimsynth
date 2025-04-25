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
      octaveRange = { min: 3, max: 5 },
      onKeyClick = () => {},
      instrumentType = INSTRUMENT_TYPES.SYNTH,
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [instrument, setInstrument] = useState<Tone.DuoSynth | null>(null);
    const [currentInstrumentType, setCurrentInstrumentType] =
      useState(instrumentType);

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
        // Only include notes from G3 to B5 (two and a half octaves)
        const noteValue = Tone.Frequency(note).toMidi();
        const g3Value = Tone.Frequency("G3").toMidi();
        const b5Value = Tone.Frequency("B5").toMidi();

        if (noteValue >= g3Value && noteValue <= b5Value) {
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

        // Trigger the note and set active note
        instrument.triggerAttack(note);
        setActiveNotes(new Set([note]));
        onKeyClick(note);
      } catch (e) {
        console.error("Error handling key press:", e);
      }
    };

    // Handle key release
    const handleKeyRelease = (note: string) => {
      if (!instrument || !isLoaded) return;

      try {
        // Only release if this note is actually active
        if (activeNotes.has(note)) {
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
          const isActive = activeKeys.includes(key.note);
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
          const isActive = activeKeys.includes(key.note);
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
            {<div className={styles.leftShadow} />}
            {renderWhiteKeys()}
            {<div className={styles.rightShadow} />}
            {renderBlackKeys()}
          </div>
        </div>
      </div>
    );
  }
);

export default Keyboard;
