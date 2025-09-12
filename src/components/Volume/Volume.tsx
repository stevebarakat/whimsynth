import Slider from "@/components/Slider";
import styles from "./Volume.module.css";

interface VolumeProps {
  value: number[];
  onValueChange: (value: number[]) => void;
}

function Volume({ value, onValueChange }: VolumeProps) {
  return (
    <div className={styles.volumeContainer}>
      <Slider value={value} onValueChange={onValueChange} />
    </div>
  );
}

export default Volume;
