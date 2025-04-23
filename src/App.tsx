import { useState, useEffect, useRef } from "react";
import FilterControl from "./components/FilterControl";
import DelayControl from "./components/DelayControl";
import ReverbControl from "./components/ReverbControl";
import DistortionControl from "./components/DistortionControl";
import { useMachine } from "@xstate/react";
import { effectsMachine } from "./machines/effectsMachine";
import * as Tone from "tone";
import { EffectType } from "./machines/effectsMachine";
import Keyboard from "./components/Keyboard";
import styles from "./styles/App.module.css";
import "@/styles/effects.css";
import * as Tabs from "@radix-ui/react-tabs";
import "./styles/variables.css";

function EffectsTabs({
  filterFrequency,
  filterDepth,
  filterWet,
  filterResonance,
  delayTime,
  delayFeedback,
  delayWet,
  reverbDecay,
  reverbPreDelay,
  reverbWet,
  distortionAmount,
  distortionWet,
  onFrequencyChange,
  onDepthChange,
  onFilterWetChange,
  onResonanceChange,
  onDelayTimeChange,
  onFeedbackChange,
  onDelayWetChange,
  onDecayChange,
  onPreDelayChange,
  onReverbWetChange,
  onDistortionChange,
  onDistortionWetChange,
  isEffectActive,
  onToggleFilter,
  onToggleDelay,
  onToggleReverb,
  onToggleDistortion,
}: {
  filterFrequency: number;
  filterDepth: number;
  filterWet: number;
  filterResonance: number;
  delayTime: number;
  delayFeedback: number;
  delayWet: number;
  reverbDecay: number;
  reverbPreDelay: number;
  reverbWet: number;
  distortionAmount: number;
  distortionWet: number;
  onFrequencyChange: (value: number) => void;
  onDepthChange: (value: number) => void;
  onFilterWetChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
  onDelayTimeChange: (value: number) => void;
  onFeedbackChange: (value: number) => void;
  onDelayWetChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onPreDelayChange: (value: number) => void;
  onReverbWetChange: (value: number) => void;
  onDistortionChange: (value: number) => void;
  onDistortionWetChange: (value: number) => void;
  isEffectActive: (effect: EffectType) => boolean;
  onToggleFilter: (enabled: boolean) => void;
  onToggleDelay: (enabled: boolean) => void;
  onToggleReverb: (enabled: boolean) => void;
  onToggleDistortion: (enabled: boolean) => void;
}) {
  return (
    <>
      <Tabs.Root defaultValue="filter">
        <Tabs.List className={styles.tabsList}>
          <Tabs.Trigger className={styles.tabsTrigger} value="filter">
            Filter{" "}
            <div
              className={`ledIndicator ${
                isEffectActive("autoFilter") ? "active" : ""
              }`}
            ></div>
            <label className="toggleSwitch">
              <input
                type="checkbox"
                checked={isEffectActive("autoFilter")}
                onChange={(e) => onToggleFilter(e.target.checked)}
              />
              <span className="toggleSlider"></span>
            </label>
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabsTrigger} value="delay">
            Delay{" "}
            <div
              className={`ledIndicator ${
                isEffectActive("delay") ? "active" : ""
              }`}
            ></div>
            <label className="toggleSwitch">
              <input
                type="checkbox"
                checked={isEffectActive("delay")}
                onChange={(e) => onToggleDelay(e.target.checked)}
              />
              <span className="toggleSlider"></span>
            </label>
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabsTrigger} value="reverb">
            Reverb{" "}
            <div
              className={`ledIndicator ${
                isEffectActive("reverb") ? "active" : ""
              }`}
            ></div>
            <label className="toggleSwitch">
              <input
                type="checkbox"
                checked={isEffectActive("reverb")}
                onChange={(e) => onToggleReverb(e.target.checked)}
              />
              <span className="toggleSlider"></span>
            </label>
          </Tabs.Trigger>
          <Tabs.Trigger className={styles.tabsTrigger} value="distortion">
            Drive{" "}
            <div
              className={`ledIndicator ${
                isEffectActive("distortion") ? "active" : ""
              }`}
            ></div>
            <label className="toggleSwitch">
              <input
                type="checkbox"
                checked={isEffectActive("distortion")}
                onChange={(e) => onToggleDistortion(e.target.checked)}
              />
              <span className="toggleSlider"></span>
            </label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="filter">
          <FilterControl
            frequency={filterFrequency}
            depth={filterDepth}
            wet={filterWet}
            resonance={filterResonance}
            onFrequencyChange={onFrequencyChange}
            onDepthChange={onDepthChange}
            onWetChange={onFilterWetChange}
            onResonanceChange={onResonanceChange}
            enabled={isEffectActive("autoFilter")}
            onToggle={onToggleFilter}
          />
        </Tabs.Content>
        <Tabs.Content value="delay">
          <DelayControl
            delayTime={delayTime}
            feedback={delayFeedback}
            wet={delayWet}
            onDelayTimeChange={onDelayTimeChange}
            onFeedbackChange={onFeedbackChange}
            onWetChange={onDelayWetChange}
            enabled={isEffectActive("delay")}
            onToggle={onToggleDelay}
          />
        </Tabs.Content>
        <Tabs.Content value="reverb">
          <ReverbControl
            decay={reverbDecay}
            preDelay={reverbPreDelay}
            wet={reverbWet}
            onDecayChange={onDecayChange}
            onPreDelayChange={onPreDelayChange}
            onWetChange={onReverbWetChange}
            enabled={isEffectActive("reverb")}
            onToggle={onToggleReverb}
          />
        </Tabs.Content>
        <Tabs.Content value="distortion">
          <DistortionControl
            distortion={distortionAmount}
            wet={distortionWet}
            onDistortionChange={onDistortionChange}
            onWetChange={onDistortionWetChange}
            enabled={isEffectActive("distortion")}
            onToggle={onToggleDistortion}
          />
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

function App() {
  const [effectsState, effectsSend] = useMachine(effectsMachine);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isAudioContextStarted, setIsAudioContextStarted] = useState(false);
  const keyboardRef = useRef<{ instrument: Tone.DuoSynth | null }>({
    instrument: null,
  });

  const {
    filterFrequency,
    filterDepth,
    filterWet,
    filterResonance,
    delayTime,
    delayFeedback,
    delayWet,
    reverbDecay,
    reverbPreDelay,
    reverbWet,
    distortionAmount,
    distortionWet,
    activeEffects,
    effectsBus,
  } = effectsState.context;

  // Initialize effects when the app starts
  useEffect(() => {
    console.log("Initializing effects");
    effectsSend({ type: "INIT_EFFECTS" });
  }, [effectsSend]);

  // Connect keyboard to effects when both are ready
  useEffect(() => {
    if (
      keyboardRef.current.instrument &&
      effectsBus &&
      !isAudioContextStarted
    ) {
      const connectToEffects = async () => {
        try {
          await Tone.start();
          keyboardRef.current.instrument?.connect(effectsBus);
          setIsAudioContextStarted(true);
          console.log(
            "Audio context started and keyboard connected to effects"
          );
        } catch (error) {
          console.error("Error starting audio context:", error);
        }
      };
      connectToEffects();
    }
  }, [keyboardRef.current.instrument, effectsBus, isAudioContextStarted]);

  // Filter effect handlers
  function updateFilterFrequency(frequency: number) {
    effectsSend({ type: "UPDATE_FILTER_FREQUENCY", frequency });
  }

  function updateFilterDepth(depth: number) {
    effectsSend({ type: "UPDATE_FILTER_DEPTH", depth });
  }

  function updateFilterWet(wet: number) {
    effectsSend({ type: "UPDATE_FILTER_WET", wet });
  }

  function updateFilterResonance(resonance: number) {
    effectsSend({ type: "UPDATE_FILTER_RESONANCE", resonance });
  }

  function toggleFilter(enabled: boolean) {
    effectsSend({ type: "TOGGLE_EFFECT", effect: "autoFilter", enabled });
  }

  // Delay effect handlers
  function updateDelayTime(delayTime: number) {
    effectsSend({ type: "UPDATE_DELAY_TIME", delayTime });
  }

  function updateDelayFeedback(feedback: number) {
    effectsSend({ type: "UPDATE_DELAY_FEEDBACK", feedback });
  }

  function updateDelayWet(wet: number) {
    effectsSend({ type: "UPDATE_DELAY_WET", wet });
  }

  function toggleDelay(enabled: boolean) {
    effectsSend({ type: "TOGGLE_EFFECT", effect: "delay", enabled });
  }

  // Reverb effect handlers
  function updateReverbDecay(decay: number) {
    effectsSend({ type: "UPDATE_REVERB_DECAY", decay });
  }

  function updateReverbPreDelay(preDelay: number) {
    effectsSend({ type: "UPDATE_REVERB_PREDELAY", preDelay });
  }

  function updateReverbWet(wet: number) {
    effectsSend({ type: "UPDATE_REVERB_WET", wet });
  }

  function toggleReverb(enabled: boolean) {
    effectsSend({ type: "TOGGLE_EFFECT", effect: "reverb", enabled });
  }

  // Distortion effect handlers
  function updateDistortionAmount(distortion: number) {
    effectsSend({ type: "UPDATE_DISTORTION_AMOUNT", distortion });
  }

  function updateDistortionWet(wet: number) {
    effectsSend({ type: "UPDATE_DISTORTION_WET", wet });
  }

  function toggleDistortion(enabled: boolean) {
    effectsSend({ type: "TOGGLE_EFFECT", effect: "distortion", enabled });
  }

  // Helper function to check if an effect is active
  function isEffectActive(effect: EffectType): boolean {
    return activeEffects.includes(effect);
  }

  const handleKeyClick = (note: string) => {
    if (note) {
      setActiveKeys([note]);
    } else {
      setActiveKeys([]);
    }
  };

  return (
    <div className={styles.synthSides}>
      <div className={styles.synth}>
        <div className={styles.controlsContainer}>
          <div className={styles.indent}></div>
          {/* <div>
          <EffectsTabs
            filterFrequency={filterFrequency}
            filterDepth={filterDepth}
            filterWet={filterWet}
            filterResonance={filterResonance}
            delayTime={delayTime}
            delayFeedback={delayFeedback}
            delayWet={delayWet}
            reverbDecay={reverbDecay}
            reverbPreDelay={reverbPreDelay}
            reverbWet={reverbWet}
            distortionAmount={distortionAmount}
            distortionWet={distortionWet}
            onFrequencyChange={updateFilterFrequency}
            onDepthChange={updateFilterDepth}
            onFilterWetChange={updateFilterWet}
            onResonanceChange={updateFilterResonance}
            onDelayTimeChange={updateDelayTime}
            onFeedbackChange={updateDelayFeedback}
            onDelayWetChange={updateDelayWet}
            onDecayChange={updateReverbDecay}
            onPreDelayChange={updateReverbPreDelay}
            onReverbWetChange={updateReverbWet}
            onDistortionChange={updateDistortionAmount}
            onDistortionWetChange={updateDistortionWet}
            isEffectActive={isEffectActive}
            onToggleFilter={toggleFilter}
            onToggleDelay={toggleDelay}
            onToggleReverb={toggleReverb}
            onToggleDistortion={toggleDistortion}
          />
        </div> */}
          <div className={styles.indent}></div>
        </div>
        <div className={styles.keyRow}>
          <div className={styles.modWheels}>
            <div className={styles.modWheelwell}></div>
            <div className={styles.modWheelwell}></div>
          </div>
          <Keyboard
            ref={keyboardRef}
            activeKeys={activeKeys}
            onKeyClick={handleKeyClick}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
