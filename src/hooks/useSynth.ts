import { useRef, useCallback, useEffect } from "react";
import Tuna from "tunajs";

const logToLinear = (logValue: number): number => {
  return Math.pow(10, (logValue - 1) * 2);
};

interface SynthConfig {
  oscillatorType: OscillatorType;
  volume: number;
}

export interface DelayParams {
  wetLevel: number;
  feedback: number;
  delayTimeLeft: number;
  delayTimeRight: number;
}

export interface ReverbParams {
  highCut: number;
  lowCut: number;
  dryLevel: number;
  wetLevel: number;
  level: number;
  impulse: string;
  bypass: number;
}

export interface PhaserParams {
  rate: number;
  depth: number;
  feedback: number;
  stereoPhase: number;
  baseModulationFrequency: number;
  bypass: number;
}

interface ActiveNote {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

export function useSynth(
  config: SynthConfig = { oscillatorType: "sine", volume: 0.8 }
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tunaRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delayRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reverbRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phaserRef = useRef<any>(null);
  const delayParamsRef = useRef<DelayParams>({
    wetLevel: 0,
    feedback: 0,
    delayTimeLeft: 100,
    delayTimeRight: 200,
  });
  const reverbParamsRef = useRef<ReverbParams>({
    highCut: 22050,
    lowCut: 20,
    dryLevel: 0.7,
    wetLevel: 0.3,
    level: 1,
    impulse: "/impulses/impulse_rev.wav",
    bypass: 0,
  });
  const phaserParamsRef = useRef<PhaserParams>({
    rate: 0.5,
    depth: 0.5,
    feedback: 0.3,
    stereoPhase: 0,
    baseModulationFrequency: 700,
    bypass: 0,
  });

  const rebuildAudioChain = useCallback(() => {
    if (!masterGainRef.current || !outputGainRef.current) return;

    masterGainRef.current.disconnect();

    const phaserActive = phaserParamsRef.current.depth > 0;
    const delayActive = delayParamsRef.current.feedback > 0;
    const reverbActive = reverbParamsRef.current.wetLevel > 0;

    let currentNode = masterGainRef.current;

    if (phaserActive && phaserRef.current) {
      currentNode.connect(phaserRef.current.input);
      currentNode = phaserRef.current.output;
    }

    if (delayActive && delayRef.current) {
      currentNode.connect(delayRef.current.input);
      currentNode = delayRef.current.output;
    }

    if (reverbActive && reverbRef.current) {
      currentNode.connect(reverbRef.current.input);
      currentNode = reverbRef.current.output;
    }

    currentNode.connect(outputGainRef.current);
  }, []);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 1.0;
      outputGainRef.current = audioContextRef.current.createGain();
      outputGainRef.current.gain.value = logToLinear(config.volume);

      tunaRef.current = new Tuna(audioContextRef.current);
      delayRef.current = new tunaRef.current.PingPongDelay(
        delayParamsRef.current
      );
      reverbRef.current = new tunaRef.current.Convolver(
        reverbParamsRef.current
      );
      phaserRef.current = new tunaRef.current.Phaser(phaserParamsRef.current);

      rebuildAudioChain();
      outputGainRef.current.connect(audioContextRef.current.destination);
    }
  }, [config.volume, rebuildAudioChain]);

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
        0.1,
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
    if (outputGainRef.current) {
      outputGainRef.current.gain.value = logToLinear(volume);
    }
  }, []);

  const setPhaserRate = useCallback(
    (value: number) => {
      phaserParamsRef.current.rate = value;
      phaserParamsRef.current.depth = value;
      if (phaserRef.current) {
        phaserRef.current.rate = value;
        phaserRef.current.depth = value;
      }
      rebuildAudioChain();
    },
    [rebuildAudioChain]
  );

  const setDelayFeedback = useCallback(
    (feedback: number) => {
      delayParamsRef.current.feedback = feedback;
      if (delayRef.current) {
        delayRef.current.feedback = feedback;
        delayRef.current.wetLevel = feedback > 0 ? 0.3 : 0;
      }
      rebuildAudioChain();
    },
    [rebuildAudioChain]
  );

  const setReverbMix = useCallback(
    (mix: number) => {
      reverbParamsRef.current.wetLevel = mix;
      reverbParamsRef.current.dryLevel = 1 - mix;
      if (reverbRef.current) {
        reverbRef.current.wetLevel = mix;
        reverbRef.current.dryLevel = 1 - mix;
      }
      rebuildAudioChain();
    },
    [rebuildAudioChain]
  );

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
    initializeAudioContext,
    setVolume,
    setDelayFeedback,
    setReverbMix,
    setPhaserRate,
  };
}
