import EffectControl from "@/components/EffectControl";

interface DelayProps {
  onDelayChange?: (feedback: number) => void;
}

function Delay({ onDelayChange }: DelayProps) {
  return (
    <EffectControl
      label="Delay"
      defaultValue={0.2}
      min={0}
      max={0.95}
      step={0.01}
      onChange={onDelayChange}
    />
  );
}

export default Delay;
