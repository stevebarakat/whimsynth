import Slider from "@/components/Slider";
import styles from "./Volume.module.css";

interface VolumeProps {
  value: number[];
  onValueChange: (value: number[]) => void;
}

function Volume({ value, onValueChange }: VolumeProps) {
  return (
    <div className={styles.volumeContainer}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={0}
        max={2}
        step={0.01}
      />
      <div className={styles.volumeLabel}>Volume</div>
    </div>
  );
}

export default Volume;
