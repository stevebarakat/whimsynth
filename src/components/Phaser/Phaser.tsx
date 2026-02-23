import React from "react";

import EffectControl from "@/components/EffectControl";

interface PhaserProps {
  onPhaserChange?: (rate: number) => void;
}

function Phaser({ onPhaserChange }: PhaserProps) {
  return (
    <EffectControl
      label="Phaser"
      defaultValue={0.5}
      min={0}
      max={1}
      step={0.01}
      onChange={onPhaserChange}
    />
  );
}

export default Phaser;
