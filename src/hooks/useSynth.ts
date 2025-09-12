import { useRef, useCallback, useEffect } from "react";

interface SynthConfig {
  oscillatorType: OscillatorType;
  volume: number;
}

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

export function useSynth(
  config: SynthConfig = { oscillatorType: "sine", volume: 0.3 }
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = config.volume;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
  }, [config.volume]);

  const noteToFrequency = useCallback((note: string): number => {
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
    const midiNumber = noteMap[noteName] + (octave + 1) * 12;

    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }, []);

  const noteOn = useCallback(
    (note: string) => {
      if (!audioContextRef.current || !masterGainRef.current) {
        initializeAudioContext();
      }

      if (activeNotesRef.current.has(note)) {
        return;
      }

      const audioContext = audioContextRef.current!;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = config.oscillatorType;
      oscillator.frequency.value = noteToFrequency(note);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.5,
        audioContext.currentTime + 0.01
      );

      oscillator.connect(gainNode);
      gainNode.connect(masterGainRef.current!);
      oscillator.start();

      activeNotesRef.current.set(note, { oscillator, gainNode });
    },
    [config.oscillatorType, noteToFrequency, initializeAudioContext]
  );

  const noteOff = useCallback((note: string) => {
    const activeNote = activeNotesRef.current.get(note);
    if (!activeNote || !audioContextRef.current) {
      return;
    }

    const audioContext = audioContextRef.current;
    activeNote.gainNode.gain.setValueAtTime(
      activeNote.gainNode.gain.value,
      audioContext.currentTime
    );
    activeNote.gainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + 0.1
    );

    setTimeout(() => {
      activeNote.oscillator.stop();
      activeNote.oscillator.disconnect();
      activeNote.gainNode.disconnect();
      activeNotesRef.current.delete(note);
    }, 100);
  }, []);

  const stopAllNotes = useCallback(() => {
    activeNotesRef.current.forEach((_, note) => {
      noteOff(note);
    });
  }, [noteOff]);

  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllNotes();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllNotes]);

  return {
    noteOn,
    noteOff,
    stopAllNotes,
    initializeAudioContext,
    setVolume,
  };
}
