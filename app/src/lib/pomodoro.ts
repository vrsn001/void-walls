import { sound } from "./sound";
import { triggerHaptic } from "./haptics";

export type PomodoroMode = "work" | "short_break" | "long_break";

export interface PomodoroState {
  mode: PomodoroMode;
  secondsLeft: number;
  totalDuration: number;
  isRunning: boolean;
  cyclesCompleted: number;
}

const DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60, // 25m
  short_break: 5 * 60, // 5m
  long_break: 15 * 60, // 15m
};

class PomodoroEngine {
  private mode: PomodoroMode = "work";
  private secondsLeft: number = DURATIONS.work;
  private isRunning: boolean = false;
  private cyclesCompleted: number = 0;
  private targetEndTime: number | null = null;
  private timerId: number | null = null;
  private listeners: Set<(state: PomodoroState) => void> = new Set();

  constructor() {
    // Restore from localStorage if present
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("voidwalls_pomo");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.cyclesCompleted) this.cyclesCompleted = parsed.cyclesCompleted;
        }
      } catch {}
    }
  }

  public getState(): PomodoroState {
    return {
      mode: this.mode,
      secondsLeft: this.secondsLeft,
      totalDuration: DURATIONS[this.mode],
      isRunning: this.isRunning,
      cyclesCompleted: this.cyclesCompleted,
    };
  }

  public subscribe(fn: (state: PomodoroState) => void): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.targetEndTime = Date.now() + this.secondsLeft * 1000;
    this.tick();
    if (typeof window !== "undefined") {
      this.timerId = window.setInterval(() => this.tick(), 1000);
    }
    sound.playCommand();
    triggerHaptic("medium");
    this.notify();
  }

  public pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.targetEndTime) {
      const remaining = Math.max(0, Math.ceil((this.targetEndTime - Date.now()) / 1000));
      this.secondsLeft = remaining;
    }
    this.targetEndTime = null;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    sound.playSwitch();
    triggerHaptic("light");
    this.notify();
  }

  public toggle() {
    if (this.isRunning) this.pause();
    else this.start();
  }

  public reset() {
    this.pause();
    this.secondsLeft = DURATIONS[this.mode];
    this.notify();
  }

  public setMode(mode: PomodoroMode) {
    this.pause();
    this.mode = mode;
    this.secondsLeft = DURATIONS[mode];
    this.notify();
  }

  public skip() {
    this.onCycleComplete();
  }

  private tick() {
    if (!this.isRunning || !this.targetEndTime) return;
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((this.targetEndTime - now) / 1000));
    this.secondsLeft = remaining;

    if (remaining <= 0) {
      this.onCycleComplete();
    } else {
      this.notify();
    }
  }

  private onCycleComplete() {
    this.pause();
    sound.playCommand();
    triggerHaptic("success");

    if (this.mode === "work") {
      const nextCycles = this.cyclesCompleted + 1;
      this.cyclesCompleted = nextCycles;
      try {
        localStorage.setItem("voidwalls_pomo", JSON.stringify({ cyclesCompleted: nextCycles }));
      } catch {}

      // Every 4 cycles, suggest long break
      if (nextCycles % 4 === 0) {
        this.mode = "long_break";
        this.secondsLeft = DURATIONS.long_break;
      } else {
        this.mode = "short_break";
        this.secondsLeft = DURATIONS.short_break;
      }
    } else {
      // Break finished, back to work
      this.mode = "work";
      this.secondsLeft = DURATIONS.work;
    }

    this.notify();
  }
}

export const pomodoro = new PomodoroEngine();
