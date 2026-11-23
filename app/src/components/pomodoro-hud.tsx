"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, ShieldAlert, Zap, Timer } from "lucide-react";
import { pomodoro, type PomodoroMode, type PomodoroState } from "@/lib/pomodoro";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";

export function PomodoroHud() {
  const [state, setState] = useState<PomodoroState>(pomodoro.getState());

  useEffect(() => {
    const unsub = pomodoro.subscribe((s) => setState(s));
    return () => unsub();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const percent = Math.min(
    100,
    Math.max(0, ((state.totalDuration - state.secondsLeft) / state.totalDuration) * 100)
  );

  return (
    <div className="p-3 sm:p-5 flex flex-col items-center justify-center space-y-4 font-mono select-none">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-sm">
        {(
          [
            { id: "work", label: "DEEP WORK", time: "25M" },
            { id: "short_break", label: "REBOOT", time: "5M" },
            { id: "long_break", label: "COOLDOWN", time: "15M" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => pomodoro.setMode(m.id)}
            className={`min-h-[44px] sm:min-h-0 py-1.5 px-2 text-[10px] sm:text-[11px] font-bold border transition-colors cursor-pointer flex flex-col items-center justify-center ${
              state.mode === m.id
                ? "border-cyan bg-cyan/15 text-cyan"
                : "border-border text-zinc-400 hover:text-white hover:border-zinc-500"
            }`}
          >
            <span>{m.label}</span>
            <span className="text-[9px] text-zinc-500">{m.time}</span>
          </button>
        ))}
      </div>

      {/* Big Digital Monospace Countdown */}
      <div className="relative flex flex-col items-center justify-center py-4 w-full">
        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_25px_rgba(0,240,255,0.25)]">
          {formatTime(state.secondsLeft)}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              state.isRunning ? "bg-cyan animate-ping" : "bg-zinc-600"
            }`}
          />
          <span>
            PROTOCOL // {state.mode.toUpperCase()}{" "}
            {state.isRunning ? "[ENGAGED]" : "[STANDBY]"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-3 h-1.5 bg-zinc-900 border border-border/80 overflow-hidden relative">
          <div
            className="h-full bg-cyan transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons (Min 44px touch friendly) */}
      <div className="flex items-center gap-2 sm:gap-3 w-full max-w-xs justify-center">
        <button
          onClick={() => pomodoro.toggle()}
          className={`flex-1 min-h-[48px] px-4 flex items-center justify-center gap-2 border text-xs font-bold transition-all cursor-pointer ${
            state.isRunning
              ? "border-amber-400 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
              : "border-cyan bg-cyan/20 text-cyan hover:bg-cyan/30"
          }`}
        >
          {state.isRunning ? (
            <>
              <Pause className="h-4 w-4" />
              <span>PAUSE_PROTOCOL</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>START_FOCUS</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            sound.playSwitch();
            triggerHaptic("light");
            pomodoro.reset();
          }}
          title="Reset timer"
          aria-label="Reset timer"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center border border-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            sound.playSwitch();
            triggerHaptic("light");
            pomodoro.skip();
          }}
          title="Skip cycle"
          aria-label="Skip cycle"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center border border-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors cursor-pointer"
        >
          <FastForward className="h-4 w-4" />
        </button>
      </div>

      {/* Tactical Telemetry Stats */}
      <div className="flex items-center justify-between w-full max-w-sm pt-3 border-t border-border/60 text-[10px] text-zinc-500">
        <div>
          CYCLES_COMPLETED:{" "}
          <span className="text-white font-bold">{state.cyclesCompleted}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-cyan" />
          <span>CYBER AUDIO CHIME // ARMED</span>
        </div>
      </div>
    </div>
  );
}
