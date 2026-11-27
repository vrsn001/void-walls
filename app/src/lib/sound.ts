// High-Fidelity Procedural Tactile Audio Engine — Pure Web Audio API
// 0 KB external assets, zero latency, multi-layer physical acoustics.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled: boolean = true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("void_sfx_enabled");
      this.enabled = saved === null ? true : saved === "true";
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== "undefined") {
      localStorage.setItem("void_sfx_enabled", String(val));
    }
    this.listeners.forEach((l) => l());
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playSwitch();
    }
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const size = Math.floor(ctx.sampleRate * 0.1); // 100ms
      const b = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = b.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = b;
    }
    return this.noiseBuffer;
  }

  /**
   * High-End Mechanical Switch "Thock" (Layered Noise Transient + Low Body Thump)
   * With organic pitch jitter (±12Hz) so each click feels like a distinct physical key.
   */
  public playSwitch() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const jitter = (Math.random() - 0.5) * 24;

      // Layer 1: Plastic/Metal Contact Transient (Filtered Noise Click)
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoise(ctx);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(2600 + jitter * 10, now);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.09, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.02);

      // Layer 2: Deep Switch Body "Thock" (Resonant Low Pulse)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240 + jitter, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.032);

      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Whisper-Quiet Terminal Keypress Tick
   * Triggered when typing queries in the search bar.
   */
  public playKeypress() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const jitter = (Math.random() - 0.5) * 40;

      // Subtle click transient
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520 + jitter, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.012);

      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.013);
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Randomizer Tumbler Roll (3 Rapid Mechanical Micro-Ticks)
   * Triggered when hitting the RANDOM button.
   */
  public playShuffle() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0, 0.035, 0.075].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(280 + i * 160, now + delay);
        osc.frequency.exponentialRampToValueAtTime(90, now + delay + 0.02);

        gain.gain.setValueAtTime(0.12 + i * 0.02, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.02);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.022);
      });
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Metallic Resonant Pop (Warm Harmonic Dual Tone)
   * Used for Stash / Favorite Heart toggle.
   */
  public playStash(isSaving: boolean = true) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const f1 = isSaving ? 587.33 : 880; // D5 vs A5
      const f2 = isSaving ? 880 : 523.25; // A5 vs C5
      const f3 = isSaving ? 1174.66 : 392; // D6 shimmer

      // Tone 1: Fundamental
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(f1, now);
      gain1.gain.setValueAtTime(0.14, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.042);

      // Tone 2: Harmonics
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(f2, now + 0.015);
      gain2.gain.setValueAtTime(0.15, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.068);

      if (isSaving) {
        // High crystalline shimmer
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "triangle";
        osc3.frequency.setValueAtTime(f3, now + 0.03);
        gain3.gain.setValueAtTime(0.08, now + 0.03);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.03);
        osc3.stop(now + 0.095);
      }
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Optical Camera Shutter Latch (20ms)
   * Used for Lightbox preview open, next/prev slide, swipe.
   */
  public playSlide() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft mechanical snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.024);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.026);
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Heavy Solenoid Relay Clack (Dual-Stage Industrial Latch)
   * Triggered when the user clicks DOWNLOAD WALLPAPER.
   */
  public playDownload() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Stage 1: Solenoid Relay Snap (4ms after click)
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoise(ctx);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(1400, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.038);

      // Stage 2: Heavy Mechanical Bottom Clack (Low frequency resonance)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, now + 0.012);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.11);

      oscGain.gain.setValueAtTime(0.24, now + 0.012);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now + 0.012);
      osc.stop(now + 0.115);
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Download Complete Confirmation Chime (Sleek 3-Note Cyber Harmonic Arpeggio)
   * Triggered when file download & conversion completes in RAM.
   */
  public playDownloadComplete() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [659.25, 830.61, 1046.5]; // E5 -> G#5 -> C6 (Major Cyber Chord)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.13);
      });
    } catch {
      // Audio fails silently
    }
  }

  /**
   * Retro CRT Terminal Command Prompt Chirp (16ms)
   * Triggered when opening/closing Command Palette ⌘K.
   */
  public playCommand() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.02);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.022);
    } catch {
      // Audio fails silently
    }
  }
}

export const sound = new SoundEngine();
