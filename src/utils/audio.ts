/**
 * MoveBuddy Web Audio API Sound Synthesizer
 * Generates cinematic, real-time audio entirely in the browser
 * with zero external dependencies or network overhead.
 */

class MoveBuddyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;

  // Sound nodes
  private cityNoiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private cityOsc: OscillatorNode | null = null;
  private cityFilter: BiquadFilterNode | null = null;
  private cityGain: GainNode | null = null;

  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  private alarmOsc: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private alarmInterval: any = null;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.initContext();

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isMuted) {
      this.stopAll();
    } else {
      this.startCityAmbient();
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  public startCityAmbient() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      // Create city rumble (low frequency wind + hum)
      this.cityOsc = this.ctx.createOscillator();
      this.cityFilter = this.ctx.createBiquadFilter();
      this.cityGain = this.ctx.createGain();

      this.cityOsc.type = "sine";
      this.cityOsc.frequency.setValueAtTime(65, this.ctx.currentTime); // Low C hum

      this.cityFilter.type = "lowpass";
      this.cityFilter.frequency.setValueAtTime(150, this.ctx.currentTime);

      this.cityGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Quiet background

      this.cityOsc.connect(this.cityFilter);
      this.cityFilter.connect(this.cityGain);
      this.cityGain.connect(this.ctx.destination);

      this.cityOsc.start();

      // Create a secondary ambient rumble to represent distant traffic
      const trafficOsc = this.ctx.createOscillator();
      const trafficGain = this.ctx.createGain();
      trafficOsc.type = "triangle";
      trafficOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      trafficGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      trafficOsc.connect(this.cityFilter);
      trafficOsc.connect(trafficGain);
      trafficGain.connect(this.ctx.destination);
      trafficOsc.start();

      // Store reference to clean up later
      (this as any)._trafficOsc = trafficOsc;
      (this as any)._trafficGain = trafficGain;

    } catch (e) {
      console.error("Error starting city ambient sound:", e);
    }
  }

  public startAlarm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.stopAlarm(); // Ensure no duplicates

      // Play a beautiful, natural mechanical double-bell alarm ring
      let strikeIndex = 0;
      this.alarmInterval = setInterval(() => {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        
        // Simulating the rapid striking of a mechanical double-bell alarm (classic bell ringing)
        // Two main resonant frequencies representing the two bells (e.g., 980 Hz and 1320 Hz)
        const freqs = [980, 1320];
        
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();

          // Combine sine and triangle for a warmer, metallic ringing texture
          osc.type = idx === 0 ? "sine" : "triangle";
          
          // Add slight pitch variations per strike to make it feel organic
          const jitter = Math.sin(strikeIndex * 2.3) * 8;
          osc.frequency.setValueAtTime(freq + jitter, now);

          // Fast mechanical strike decay envelope
          oscGain.gain.setValueAtTime(0, now);
          oscGain.gain.linearRampToValueAtTime(idx === 0 ? 0.08 : 0.04, now + 0.005);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

          osc.connect(oscGain);
          oscGain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);
        });

        strikeIndex++;
      }, 130); // 130ms repeat represents a realistic mechanical metal hammer speed (tremolo)

    } catch (e) {
      console.error("Error starting alarm synth:", e);
    }
  }

  public stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  public startEngine() {
    // Engine sound removed as per user requirements
  }

  /**
   * Updates bike engine sound based on speed ratio (0 to 1)
   */
  public updateEngineRPM(speedRatio: number) {
    // Engine sound removed as per user requirements
  }

  public stopEngine() {
    // Engine sound removed as per user requirements
  }

  public playPaymentDing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Harmonic minor 7th bell synth (C6, E6, G6, B6)
      const frequencies = [1046.50, 1318.51, 1567.98, 1975.53];

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03); // Staggered arpeggio!

        // Classic bell envelope (quick strike, long ring)
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.08 - idx * 0.015, now + idx * 0.03 + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + 2.0);
      });

    } catch (e) {
      console.error("Error playing payment chime:", e);
    }
  }

  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      // Fail-safe
    }
  }

  public stopAll() {
    this.stopAlarm();
    this.stopEngine();

    try {
      if (this.cityOsc) {
        this.cityOsc.stop();
        this.cityOsc = null;
      }
      if ((this as any)._trafficOsc) {
        (this as any)._trafficOsc.stop();
        (this as any)._trafficOsc = null;
      }
    } catch (e) {
      // Fail-safe
    }
  }
}

export const audio = new MoveBuddyAudioEngine();
