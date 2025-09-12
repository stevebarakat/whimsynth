import { Track, Range, Thumb, Root, SliderProps } from "@radix-ui/react-slider";
import styles from "./Slider.module.css";

function Slider({
  min,
  max,
  step,
  defaultValue,
  onValueChange,
  value,
}: SliderProps) {
  return (
    <Root
      className={styles.SliderRoot}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
      value={value}
    >
      <Track className={styles.SliderTrack}>
        <Range className={styles.SliderRange} />
      </Track>
      <Thumb className={styles.SliderThumb} />
    </Root>
  );
}

export default Slider;
