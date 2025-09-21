declare module "tunajs/tuna.js" {
  class Tuna {
    constructor(audioContext: AudioContext);
    Filter: new (options: any) => any;
    Delay: new (options: any) => any;
    PingPongDelay: new (options: {
      wetLevel: number;
      feedback: number;
      delayTimeLeft: number;
      delayTimeRight: number;
    }) => AudioNode;
    Convolver: new (options: any) => any;
    Overdrive: new (options: any) => any;
  }
  export = Tuna;
}
