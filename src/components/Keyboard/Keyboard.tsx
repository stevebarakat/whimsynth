import { useState, forwardRef } from "react";
import styles from "./Keyboard.module.css";

function Keyboard() {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const octaveRange = { min: 3, max: 5 };

  const handleKeyPress = (note: string) => {
    setActiveKeys((prev) => [...prev, note]);
  };

  const handleKeyRelease = (note: string) => {
    setActiveKeys((prev) => prev.filter((key) => key !== note));
  };

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

  // Helper function to convert note to MIDI number
  const noteToMidi = (note: string): number => {
    const noteMap: { [key: string]: number } = {
      C: 0,
      "C#": 1,
      D: 2,
      "D#": 3,
      E: 4,
      F: 5,
      "F#": 6,
      G: 7,
      "G#": 8,
      A: 9,
      "A#": 10,
      B: 11,
    };

    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));

    return noteMap[noteName] + (octave + 1) * 12;
  };

  // Create a keyboard with the specified octave range
  const keys: { note: string; isSharp: boolean }[] = [];
  for (let o = octaveRange.min; o <= octaveRange.max; o++) {
    octave.forEach((key) => {
      const note = `${key.note}${o}`;
      // Only include notes from G3 to B5 (two and a half octaves)
      const noteValue = noteToMidi(note);
      const g3Value = noteToMidi("G3");
      const b5Value = noteToMidi("B5");

      if (noteValue >= g3Value && noteValue <= b5Value) {
        keys.push({ note, isSharp: key.isSharp });
      }
    });
  }
  // Render white keys
  function renderWhiteKeys() {
    return keys
      .filter((key) => !key.isSharp)
      .map((key, index) => {
        const isActive = activeKeys.includes(key.note);

        return (
          <div
            key={`white-${key.note}-${index}`}
            className={`${styles.whiteKey} ${
              isActive ? styles.whiteKeyActive : ""
            } `}
            onPointerDown={() => handleKeyPress(key.note)}
            onPointerUp={() => handleKeyRelease(key.note)}
            onPointerLeave={() => handleKeyRelease(key.note)}
          />
        );
      });
  }

  // Render black keys
  function renderBlackKeys() {
    // Calculate positions for black keys
    const whiteKeyWidth = 100 / keys.filter((key) => !key.isSharp).length; // percentage width

    return keys
      .filter((key) => key.isSharp)
      .map((key, index) => {
        const isActive = activeKeys.includes(key.note);

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
            }`}
            style={{ left: `${position}%`, width: `${whiteKeyWidth * 0.7}%` }}
            onPointerDown={() => handleKeyPress(key.note)}
            onPointerUp={() => handleKeyRelease(key.note)}
            onPointerLeave={() => handleKeyRelease(key.note)}
          />
        );
      });
  }

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

export default forwardRef(Keyboard);
