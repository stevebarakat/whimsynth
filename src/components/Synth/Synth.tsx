import Keyboard from "@/components/Keyboard";
import styles from "./Synth.module.css";
import Volume from "@/components/Volume";
import { useSynth } from "@/hooks/useSynth";
import { useState } from "react";
import Logo from "@/components/Logo";
import Distort from "../Distort";
import Filter from "../Filter";
import Phaser from "../Phaser";
import Reverb from "../Reverb";
import Delay from "../Delay";
import Tremolo from "../Tremolo";

const linearToLog = (linearValue: number): number => {
  return 1 + Math.log10(Math.max(linearValue, 0.001)) / 2;
};

function Synth() {
  const initialVolume = 0.8;
  const [volume, setVolumeState] = useState([linearToLog(initialVolume)]);
  const {
    setVolume,
    noteOn,
    noteOff,
    initializeAudioContext,
    setDelayFeedback,
    setReverbMix,
    setPhaserRate,
  } = useSynth({
    oscillatorType: "sine",
    volume: initialVolume,
  });

  const handleVolumeChange = (value: number[]) => {
    setVolumeState(value);
    setVolume(value[0]);
  };

  const handleDelayChange = (feedback: number) => {
    setDelayFeedback(feedback);
  };

  const handleReverbChange = (mix: number) => {
    setReverbMix(mix);
  };

  const handlePhaserChange = (rate: number) => {
    setPhaserRate(rate);
  };

  return (
    <div className={styles.synthSides}>
      <div className={styles.synth}>
        <div className={styles.controlsContainer}>
          <div className={styles.backPanel}></div>
          <div className={styles.innerControlsContainer}>
            <div className={styles.box}>
              <div className="flex-column-between gap-1">
                <Logo />
                <Volume value={volume} onValueChange={handleVolumeChange} />
              </div>
            </div>
            <div className={styles.indent}></div>
            <div className={styles.box}>
              <div className="flex-column-between gap-1">
                <div className="flex-between gap-1">
                  <Filter />
                  <Distort />
                  <Phaser onPhaserChange={handlePhaserChange} />
                </div>
                <div className="flex-between gap-1">
                  <Tremolo />
                  <Reverb onReverbChange={handleReverbChange} />
                  <Delay onDelayChange={handleDelayChange} />
                </div>
              </div>
            </div>
            <div className={styles.indent}></div>
            <div className={styles.box}></div>
          </div>
          <div className={styles.horizontalIndent}></div>
        </div>
        <div className={styles.keyRow}>
          <div className={styles.modWheels}>
            <div className={styles.modWheelwell}>
              <div className={styles.modWheel}>
                <div className={styles.modWheelKnob}></div>
              </div>
            </div>
            <div className={styles.modWheelwell}>
              <div className={styles.modWheel}>
                <div className={styles.modWheelKnob}></div>
              </div>
            </div>
          </div>
          <Keyboard
            noteOn={noteOn}
            noteOff={noteOff}
            initializeAudioContext={initializeAudioContext}
          />
        </div>
      </div>
    </div>
  );
}

export default Synth;
