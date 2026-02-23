declare module "tunajs" {
  class Tuna {
    constructor(audioContext: AudioContext);
    PingPongDelay: new (options: {
      wetLevel: number;
      feedback: number;
      delayTimeLeft: number;
      delayTimeRight: number;
    }) => AudioNode;
    Convolver: new (options: {
      highCut: number;
      lowCut: number;
      dryLevel: number;
      wetLevel: number;
      level: number;
      impulse: string;
      bypass: number;
    }) => AudioNode;
    Phaser: new (options: {
      rate: number;
      depth: number;
      feedback: number;
      stereoPhase: number;
      baseModulationFrequency: number;
      bypass: number;
    }) => AudioNode;
  }
  export = Tuna;
}
