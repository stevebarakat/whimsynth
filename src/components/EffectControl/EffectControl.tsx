import { useState } from "react";
import Slider from "@/components/Slider";
import styles from "./EffectControl.module.css";

interface EffectControlProps {
  label: string;
  controlLabel: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
}

function EffectControl({
  label,
  controlLabel,
  defaultValue = 0.3,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: EffectControlProps) {
  const [value, setValue] = useState([defaultValue]);

  const handleChange = (newValue: number[]) => {
    setValue(newValue);
    onChange?.(newValue[0]);
  };

  return (
    <div className={styles.effectContainer}>
      <div className={styles.effectLabel}>{label}</div>
      <div className={styles.effectControls}>
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>{controlLabel}</div>
          <Slider
            value={value}
            onValueChange={handleChange}
            min={min}
            max={max}
            step={step}
          />
        </div>
      </div>
    </div>
  );
}

export default EffectControl;
