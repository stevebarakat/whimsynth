import Keyboard from "./components/Keyboard";
import styles from "./styles/App.module.css";
import "@/styles/effects.css";
import "./styles/variables.css";

function App() {
  return (
    <div className={styles.synthSides}>
      <div className={styles.synth}>
        <div className={styles.controlsContainer}>
          <div className={styles.backPanel}></div>
          <div className={styles.innerControlsContainer}>
            <div className={styles.box}></div>
            <div className={styles.indent}></div>{" "}
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
          <Keyboard />
        </div>
      </div>
    </div>
  );
}

export default App;
