import EffectControl from "@/components/EffectControl";

interface ReverbProps {
  onReverbChange?: (mix: number) => void;
}

function Reverb({ onReverbChange }: ReverbProps) {
  return (
    <EffectControl
      label="Reverb"
      controlLabel="Mix"
      defaultValue={0.3}
      min={0}
      max={1}
      step={0.01}
      onChange={onReverbChange}
    />
  );
}

export default Reverb;
