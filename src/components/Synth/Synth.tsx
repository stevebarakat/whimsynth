import Keyboard from "@/components/Keyboard";
import styles from "./Synth.module.css";
import Volume from "@/components/Volume";
import { useSynth } from "@/hooks/useSynth";
import { useState } from "react";

function Synth() {
  const [volume, setVolumeState] = useState([0.3]);
  const { setVolume, noteOn, noteOff, initializeAudioContext } = useSynth({
    oscillatorType: "sine",
    volume: volume[0],
  });

  const handleVolumeChange = (value: number[]) => {
    setVolumeState(value);
    setVolume(value[0]);
  };

  return (
    <div className={styles.synthSides}>
      <div className={styles.synth}>
        <div className={styles.controlsContainer}>
          <div className={styles.backPanel}></div>
          <div className={styles.innerControlsContainer}>
            <div className={styles.box}>
              <Volume value={volume} onValueChange={handleVolumeChange} />
            </div>
            <div className={styles.indent}></div>
            <div className={styles.box}></div>
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
