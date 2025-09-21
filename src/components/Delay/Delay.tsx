import { useState } from "react";
import Slider from "@/components/Slider";
import styles from "./Delay.module.css";

interface DelayProps {
  onDelayChange?: (feedback: number) => void;
}

function Delay({ onDelayChange }: DelayProps) {
  const [feedback, setFeedback] = useState([0.2]);

  const handleFeedbackChange = (value: number[]) => {
    setFeedback(value);
    onDelayChange?.(value[0]);
  };

  return (
    <div className={styles.delayContainer}>
      <div className={styles.delayLabel}>Delay</div>
      <div className={styles.delayControls}>
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>Feedback</div>
          <Slider
            value={feedback}
            onValueChange={handleFeedbackChange}
            min={0}
            max={0.95}
            step={0.01}
          />
        </div>
      </div>
    </div>
  );
}

export default Delay;
