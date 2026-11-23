// Hybrid Cyberpunk Radio Engine — 10 Multi-Genre Stations
// 5 Live 24/7 Web Radio Streams + 5 Custom Procedural Cyber Ambient Synthesizers.

export type StationType = "stream" | "procedural";

export interface StationInfo {
  id: string;
  number: string;
  name: string;
  tagline: string;
  sublabel: string;
  type: StationType;
  streamUrl?: string;
  mount?: string;
}

export const STATIONS: StationInfo[] = [
  // ─── 24/7 LIVE WEB RADIO STREAMS ───
  {
    id: "nightride",
    number: "01",
    name: "NIGHTRIDE // SYNTHWAVE",
    tagline: "24/7 RETROWAVE & 80S OUTRUN",
    sublabel: "Live Synthwave · Chiptune · Neon Electro",
    type: "stream",
    streamUrl: "https://stream.rekt.network/nightride.mp3",
    mount: "nightride.mp3",
  },
  {
    id: "chillsynth",
    number: "02",
    name: "NEO_TOKYO // CHILLSYNTH",
    tagline: "24/7 LOFI AMBIENT & DOWNTEMPO",
    sublabel: "Chillwave · Relaxing Beats · Tape Drift",
    type: "stream",
    streamUrl: "https://stream.rekt.network/chillsynth.mp3",
    mount: "chillsynth.mp3",
  },
  {
    id: "darksynth",
    number: "03",
    name: "THE_GRID // DARKSYNTH",
    tagline: "24/7 AGGRESSIVE CYBERPUNK",
    sublabel: "Heavy Darksynth · Industrial Cyber Bass",
    type: "stream",
    streamUrl: "https://stream.rekt.network/darksynth.mp3",
    mount: "darksynth.mp3",
  },
  {
    id: "datawave",
    number: "04",
    name: "DATAWAVE // CYBER_ELECTRO",
    tagline: "24/7 DYSTOPIAN ELECTRONIC",
    sublabel: "Cyber Electro · Darkwave · Future Beats",
    type: "stream",
    streamUrl: "https://stream.rekt.network/datawave.mp3",
    mount: "datawave.mp3",
  },
  {
    id: "rekt_dnb",
    number: "05",
    name: "OVERDRIVE // CYBER_DNB",
    tagline: "24/7 DRUM & BASS NEUROFUNK",
    sublabel: "High-BPM Drum & Bass · Heavy Basslines",
    type: "stream",
    streamUrl: "https://stream.rekt.network/rekt.mp3",
    mount: "rekt.mp3",
  },

  // ─── PROCEDURAL CYBER AMBIENT SYNTHESIZERS (OFFLINE, 0 KB) ───
  {
    id: "cyber_drone",
    number: "06",
    name: "SECTOR_07 // CYBER_DRONE",
    tagline: "BLADE RUNNER AMBIENT",
    sublabel: "D-Minor Detuned Pads · Breathing Filter Sweep",
    type: "procedural",
  },
  {
    id: "lofi_tape",
    number: "07",
    name: "RAINY_ROOF // LOFI_TAPE",
    tagline: "WARM RAINY CHILL",
    sublabel: "Fmaj7/Em7 Electric Piano · Vinyl Flutter",
    type: "procedural",
  },
  {
    id: "anime_dream",
    number: "08",
    name: "CELESTIAL // ANIME_DREAM",
    tagline: "SHINKAI GLASS CHIMES",
    sublabel: "Major Shimmer · Crystalline Star Bells",
    type: "procedural",
  },
  {
    id: "dark_industrial",
    number: "09",
    name: "THE_ABYSS // DARK_INDUSTRIAL",
    tagline: "SUB-BASS DYSTOPIA",
    sublabel: "55Hz Analog Drone · Dissonant Tension",
    type: "procedural",
  },
  {
    id: "synthwave_outrun",
    number: "10",
    name: "OUTRUN_84 // SYNTHWAVE",
    tagline: "NEON HIGHWAY CHASE",
    sublabel: "Analog Arp Bass · 80s Cyber Chords",
    type: "procedural",
  },
];

class HybridRadioEngine {
  private ctx: AudioContext | null = null;
  private isLive: boolean = false;
  private currentStationId: string = "nightride";
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private volume: number = 0.5;
  private currentTrack: string | null = null;
  private listeners: Set<() => void> = new Set();
  private metaInterval: ReturnType<typeof setInterval> | null = null;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  // Active procedural nodes
  private oscillators: OscillatorNode[] = [];
  private filters: BiquadFilterNode[] = [];
  private lfos: OscillatorNode[] = [];
  private intervals: ReturnType<typeof setInterval>[] = [];

  // Procedural Soundscape Mixer (Rain & Vinyl)
  private rainVolume: number = 0;
  private vinylVolume: number = 0;
  private rainGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private rainBufferSource: AudioBufferSourceNode | null = null;
  private vinylBufferSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.isLive = false;
    if (typeof window !== "undefined") {
      try {
        const r = localStorage.getItem("void_rain_vol");
        if (r !== null) this.rainVolume = parseFloat(r) || 0;
        const v = localStorage.getItem("void_vinyl_vol");
        if (v !== null) this.vinylVolume = parseFloat(v) || 0;
      } catch {}
    }
  }

  public isActive(): boolean {
    return this.isLive;
  }

  public getStation(): string {
    return this.currentStationId;
  }

  public getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getRainVolume(): number {
    return this.rainVolume;
  }

  public getVinylVolume(): number {
    return this.vinylVolume;
  }

  public setRainVolume(v: number) {
    this.rainVolume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem("void_rain_vol", String(this.rainVolume));
    } catch {}

    if (this.rainVolume > 0) {
      this.initSoundscape();
      const ctx = this.getContext();
      if (this.rainGain && ctx) {
        this.rainGain.gain.setTargetAtTime(this.rainVolume * 0.25, ctx.currentTime, 0.05);
      }
    } else if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public setVinylVolume(v: number) {
    this.vinylVolume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem("void_vinyl_vol", String(this.vinylVolume));
    } catch {}

    if (this.vinylVolume > 0) {
      this.initSoundscape();
      const ctx = this.getContext();
      if (this.vinylGain && ctx) {
        this.vinylGain.gain.setTargetAtTime(this.vinylVolume * 0.35, ctx.currentTime, 0.05);
      }
    } else if (this.vinylGain && this.ctx) {
      this.vinylGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  private initSoundscape() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!this.rainGain) {
      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(this.rainVolume * 0.25, ctx.currentTime);

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "lowpass";
      rainFilter.frequency.setValueAtTime(800, ctx.currentTime);
      rainFilter.Q.setValueAtTime(1.2, ctx.currentTime);

      // Pink noise 4-second loop
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          data[i] = pink * 0.11;
        }
      }

      this.rainBufferSource = ctx.createBufferSource();
      this.rainBufferSource.buffer = noiseBuffer;
      this.rainBufferSource.loop = true;
      this.rainBufferSource.connect(rainFilter);
      rainFilter.connect(this.rainGain);
      this.rainGain.connect(ctx.destination);
      this.rainBufferSource.start();
    }

    if (!this.vinylGain) {
      this.vinylGain = ctx.createGain();
      this.vinylGain.gain.setValueAtTime(this.vinylVolume * 0.35, ctx.currentTime);

      const vinylFilter = ctx.createBiquadFilter();
      vinylFilter.type = "highpass";
      vinylFilter.frequency.setValueAtTime(1000, ctx.currentTime);

      // Vinyl crackle 5-second loop
      const bufferSize = ctx.sampleRate * 5;
      const crackleBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = crackleBuffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
          let s = (Math.random() * 2 - 1) * 0.006;
          const r = Math.random();
          if (r < 0.0006) {
            s += (Math.random() * 2 - 1) * 0.8;
          } else if (r < 0.0025) {
            s += (Math.random() * 2 - 1) * 0.22;
          }
          data[i] = s;
        }
      }

      this.vinylBufferSource = ctx.createBufferSource();
      this.vinylBufferSource.buffer = crackleBuffer;
      this.vinylBufferSource.loop = true;
      this.vinylBufferSource.connect(vinylFilter);
      vinylFilter.connect(this.vinylGain);
      this.vinylGain.connect(ctx.destination);
      this.vinylBufferSource.start();
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {}
    });
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.18, this.ctx.currentTime, 0.05);
    }
    this.notify();
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getByteFrequencyData(array: Uint8Array): void {
    const current = STATIONS.find((s) => s.id === this.currentStationId);
    if (!this.isLive) {
      array.fill(0);
      return;
    }

    if (current?.type === "procedural" && this.analyser) {
      this.analyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      // Dynamic rhythmic pulse for live stream
      const t = performance.now() * 0.005;
      const len = array.length;
      for (let i = 0; i < len; i++) {
        const beat = Math.sin(t * 3.5) * 0.3 + 0.7;
        const freq = Math.sin(t * 2 + i * 0.4) * 0.5 + 0.5;
        array[i] = Math.floor(freq * beat * (220 - (i / len) * 120) * this.volume);
      }
    }
  }

  public getByteTimeDomainData(array: Uint8Array): void {
    const current = STATIONS.find((s) => s.id === this.currentStationId);
    if (!this.isLive) {
      array.fill(128);
      return;
    }

    if (current?.type === "procedural" && this.analyser) {
      this.analyser.getByteTimeDomainData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      // Dynamic oscilloscope waveform for live stream
      const t = performance.now() * 0.004;
      const len = array.length;
      for (let i = 0; i < len; i++) {
        const wave =
          Math.sin(t * 5 + (i / len) * Math.PI * 4) * 0.6 +
          Math.sin(t * 11 + (i / len) * Math.PI * 8) * 0.3;
        array[i] = Math.floor(128 + wave * 48 * this.volume);
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initAudioPipeline() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!this.masterGain) {
      const master = ctx.createGain();
      master.gain.setValueAtTime(this.volume * 0.18, ctx.currentTime);
      this.masterGain = master;
    }

    if (!this.analyser) {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      this.analyser = analyser;

      this.masterGain.connect(analyser);
      analyser.connect(ctx.destination);
    }
  }

  private clearProceduralNodes() {
    this.intervals.forEach((t) => clearInterval(t));
    this.intervals = [];

    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];

    this.lfos.forEach((lfo) => {
      try {
        lfo.stop();
        lfo.disconnect();
      } catch {}
    });
    this.lfos = [];

    this.filters.forEach((f) => {
      try {
        f.disconnect();
      } catch {}
    });
    this.filters = [];
  }

  private startMetadataPolling(mount?: string) {
    if (this.metaInterval) {
      clearInterval(this.metaInterval);
      this.metaInterval = null;
    }
    if (!mount) {
      this.currentTrack = "PROCEDURAL CYBER SYNTH";
      this.notify();
      return;
    }

    const fetchMeta = async () => {
      try {
        const res = await fetch("https://stream.rekt.network/status-json.xsl", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const sources = data?.icestats?.source;
        const list = Array.isArray(sources) ? sources : sources ? [sources] : [];
        const match = list.find((s: { listenurl?: string }) => s.listenurl?.includes(mount));
        if (match && match.title) {
          this.currentTrack = match.title;
          this.notify();
        }
      } catch {}
    };

    fetchMeta();
    this.metaInterval = setInterval(fetchMeta, 15000);
  }

  // ─── PROCEDURAL SYNTH IMPLEMENTATIONS ───

  private buildCyberDrone(ctx: AudioContext, output: AudioNode) {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(2.8, now);
    filter.connect(output);
    this.filters.push(filter);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.07, now);
    lfoGain.gain.setValueAtTime(130, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    this.lfos.push(lfo);

    const chord = [73.42, 110.0, 146.83, 174.61, 220.0];
    chord.forEach((freq, idx) => {
      [-2.5, 2.5].forEach((cents) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx === 0 ? "sawtooth" : idx % 2 === 0 ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(freq * Math.pow(2, cents / 1200), now);
        oscGain.gain.setValueAtTime(idx === 0 ? 0.22 : 0.14, now);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        this.oscillators.push(osc);
      });
    });
  }

  private buildLofiTape(ctx: AudioContext, output: AudioNode) {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, now);
    filter.connect(output);
    this.filters.push(filter);

    const flutter = ctx.createOscillator();
    const flutterGain = ctx.createGain();
    flutter.frequency.setValueAtTime(0.35, now);
    flutterGain.gain.setValueAtTime(1.8, now);
    flutter.connect(flutterGain);
    flutter.start(now);
    this.lfos.push(flutter);

    const chords = [
      [174.61, 220.0, 261.63, 329.63],
      [164.81, 196.0, 246.94, 293.66],
      [146.83, 174.61, 220.0, 261.63],
      [130.81, 164.81, 196.0, 246.94],
    ];

    let chordIdx = 0;
    const playNext = () => {
      if (!this.isLive || !this.ctx) return;
      const cNow = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, cNow);
        flutterGain.connect(osc.frequency);

        oscGain.gain.setValueAtTime(0.0001, cNow);
        oscGain.gain.linearRampToValueAtTime(0.12, cNow + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, cNow + 3.2);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(cNow);
        osc.stop(cNow + 3.4);
      });
    };

    playNext();
    const lofiTimer = setInterval(playNext, 3400);
    this.intervals.push(lofiTimer);
  }

  private buildAnimeDream(ctx: AudioContext, output: AudioNode) {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(220, now);
    filter.connect(output);
    this.filters.push(filter);

    const shimmer = [110.0, 164.81, 261.63, 392.0, 493.88];
    shimmer.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      oscGain.gain.setValueAtTime(0.08, now);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      this.oscillators.push(osc);
    });

    const bells = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const bellTimer = setInterval(() => {
      if (!this.isLive || !this.ctx) return;
      try {
        const cNow = this.ctx.currentTime;
        const note = bells[Math.floor(Math.random() * bells.length)];
        const bell = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bell.type = "sine";
        bell.frequency.setValueAtTime(note, cNow);
        bGain.gain.setValueAtTime(0.0001, cNow);
        bGain.gain.linearRampToValueAtTime(0.09, cNow + 0.02);
        bGain.gain.exponentialRampToValueAtTime(0.0001, cNow + 2.8);
        bell.connect(bGain);
        bGain.connect(output);
        bell.start(cNow);
        bell.stop(cNow + 3.0);
      } catch {}
    }, 2800);
    this.intervals.push(bellTimer);
  }

  private buildDarkIndustrial(ctx: AudioContext, output: AudioNode) {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(180, now);
    filter.Q.setValueAtTime(3.5, now);
    filter.connect(output);
    this.filters.push(filter);

    const subDrone = [55.0, 55.4, 110.0, 116.54];
    subDrone.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx < 2 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      oscGain.gain.setValueAtTime(idx < 2 ? 0.28 : 0.12, now);
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start(now);
      this.oscillators.push(osc);
    });
  }

  private buildSynthwaveOutrun(ctx: AudioContext, output: AudioNode) {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, now);
    filter.Q.setValueAtTime(2.2, now);
    filter.connect(output);
    this.filters.push(filter);

    const padFreqs = [110.0, 164.81, 220.0, 261.63, 329.63];
    padFreqs.forEach((freq, idx) => {
      [-3, 3].forEach((cents) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq * Math.pow(2, cents / 1200), now);
        oscGain.gain.setValueAtTime(0.12, now);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start(now);
        this.oscillators.push(osc);
      });
    });

    const arpNotes = [110.0, 130.81, 146.83, 164.81, 196.0, 164.81, 146.83, 130.81];
    let step = 0;
    const arpTimer = setInterval(() => {
      if (!this.isLive || !this.ctx) return;
      try {
        const cNow = this.ctx.currentTime;
        const note = arpNotes[step % arpNotes.length];
        step++;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const arpFilter = this.ctx.createBiquadFilter();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(note, cNow);
        arpFilter.type = "lowpass";
        arpFilter.frequency.setValueAtTime(600, cNow);
        arpFilter.frequency.exponentialRampToValueAtTime(150, cNow + 0.22);
        arpFilter.Q.setValueAtTime(3.0, cNow);
        oscGain.gain.setValueAtTime(0.2, cNow);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, cNow + 0.24);
        osc.connect(arpFilter);
        arpFilter.connect(oscGain);
        oscGain.connect(output);
        osc.start(cNow);
        osc.stop(cNow + 0.26);
      } catch {}
    }, 260);
    this.intervals.push(arpTimer);
  }

  // ─── PROCEDURAL FAILOVER ENGINE (ZERO SILENCE GUARANTEE) ───

  private activateProceduralFallback(stationId: string, ctx: AudioContext, output: AudioNode) {
    this.clearProceduralNodes();
    switch (stationId) {
      case "darksynth":
        this.buildDarkIndustrial(ctx, output);
        this.currentTrack = "DARK INDUSTRIAL SYNTH [FAILOVER]";
        break;
      case "datawave":
        this.buildCyberDrone(ctx, output);
        this.currentTrack = "CYBER DRONE SYNTH [FAILOVER]";
        break;
      case "rekt_dnb":
        this.buildSynthwaveOutrun(ctx, output);
        this.currentTrack = "CYBER DNB SYNTH [FAILOVER]";
        break;
      case "nightride":
        this.buildSynthwaveOutrun(ctx, output);
        this.currentTrack = "RETROWAVE SYNTH [FAILOVER]";
        break;
      case "chillsynth":
      default:
        this.buildLofiTape(ctx, output);
        this.currentTrack = "LOFI TAPE SYNTH [FAILOVER]";
        break;
    }
    this.notify();
  }

  // ─── AUDIO STATION LOADER ───

  private loadStation(station: StationInfo) {
    this.initAudioPipeline();
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    this.clearProceduralNodes();

    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    // Cleanly tear down any previous audio element to avoid aborted socket collisions
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.oncanplay = null;
        this.audioElement.onerror = null;
        this.audioElement.onwaiting = null;
        this.audioElement.onplaying = null;
        this.audioElement.removeAttribute("src");
        this.audioElement.load();
      } catch {}
      this.audioElement = null;
    }

    if (station.type === "stream" && station.streamUrl) {
      if (typeof window !== "undefined") {
        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = this.volume;
        // Append cache-busting timestamp to open a fresh TCP socket and avoid ERR_ABORTED socket lock
        const streamUrl = `${station.streamUrl}?t=${Date.now()}`;
        audio.src = streamUrl;

        let hasStartedPlaying = false;
        let failoverTriggered = false;

        const triggerFallback = (reason: string) => {
          if (failoverTriggered || !this.isLive || this.currentStationId !== station.id) return;
          failoverTriggered = true;
          console.warn(`[VOID RADIO] Stream ${station.id} (${reason}) — engaging procedural failover`);
          try {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
          } catch {}
          this.activateProceduralFallback(station.id, ctx, this.masterGain!);
        };

        audio.onplaying = () => {
          hasStartedPlaying = true;
          if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
          }
        };

        audio.onerror = () => {
          triggerFallback("network/stream error");
        };

        // 3.5s buffer watchdog: if stream doesn't produce sound, fallback seamlessly
        this.watchdogTimer = setTimeout(() => {
          if (!hasStartedPlaying) {
            triggerFallback("stream buffer timeout");
          }
        }, 3500);

        audio.play().catch((err) => {
          console.warn("Direct stream play notice:", err);
          triggerFallback("autoplay rejection");
        });

        this.audioElement = audio;
      }
      this.startMetadataPolling(station.mount);
    } else {
      switch (station.id) {
        case "cyber_drone":
          this.buildCyberDrone(ctx, this.masterGain);
          break;
        case "lofi_tape":
          this.buildLofiTape(ctx, this.masterGain);
          break;
        case "anime_dream":
          this.buildAnimeDream(ctx, this.masterGain);
          break;
        case "dark_industrial":
          this.buildDarkIndustrial(ctx, this.masterGain);
          break;
        case "synthwave_outrun":
          this.buildSynthwaveOutrun(ctx, this.masterGain);
          break;
      }
      this.startMetadataPolling(undefined);
    }
  }

  public setStation(id: string): boolean {
    this.currentStationId = id;
    const found = STATIONS.find((s) => s.id === id) || STATIONS[0];
    if (this.isLive) {
      this.loadStation(found);
    }
    this.notify();
    return true;
  }

  public start(stationId?: string): boolean {
    if (this.isLive) return true;
    const ctx = this.getContext();
    if (!ctx) return false;

    try {
      this.initAudioPipeline();
      this.isLive = true;
      if (stationId) {
        this.currentStationId = stationId;
      }
      const found = STATIONS.find((s) => s.id === this.currentStationId) || STATIONS[0];
      this.loadStation(found);
      this.notify();
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (!this.isLive) return;
    this.isLive = false;
    this.notify();

    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    if (this.metaInterval) {
      clearInterval(this.metaInterval);
      this.metaInterval = null;
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.oncanplay = null;
        this.audioElement.onerror = null;
        this.audioElement.onwaiting = null;
        this.audioElement.onplaying = null;
        this.audioElement.removeAttribute("src");
        this.audioElement.load();
      } catch {}
      this.audioElement = null;
    }
    this.clearProceduralNodes();
  }

  public toggle(stationId?: string): boolean {
    if (this.isLive) {
      this.stop();
      return false;
    } else {
      return this.start(stationId);
    }
  }
}

export const radio = new HybridRadioEngine();
