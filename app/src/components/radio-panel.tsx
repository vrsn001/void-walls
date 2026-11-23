"use client";

import { useEffect, useState } from "react";
import { X, Radio, Volume2, VolumeX, Power, Sparkles, Disc, Waves, Activity, Zap, Music2, CloudRain, Timer } from "lucide-react";
import { radio, STATIONS, StationInfo } from "@/lib/radio";
import { sound } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";
import { AudioVisualizer } from "./audio-visualizer";
import { PomodoroHud } from "./pomodoro-hud";

interface RadioPanelProps {
  onClose: () => void;
  onStatusChange?: (msg: string) => void;
}

const STATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  nightride: Zap,
  chillsynth: Disc,
  darksynth: Activity,
  datawave: Waves,
  rekt_dnb: Radio,
  cyber_drone: Waves,
  lofi_tape: Disc,
  anime_dream: Sparkles,
  dark_industrial: Activity,
  synthwave_outrun: Zap,
};

export function RadioPanel({ onClose, onStatusChange }: RadioPanelProps) {
  const [isLive, setIsLive] = useState(radio.isActive());
  const [activeStation, setActiveStation] = useState<string>(radio.getStation());
  const [volume, setVolume] = useState(Math.round(radio.getVolume() * 100));
  const [rainVol, setRainVol] = useState(Math.round(radio.getRainVolume() * 100));
  const [vinylVol, setVinylVol] = useState(Math.round(radio.getVinylVolume() * 100));
  const [currentTrack, setCurrentTrack] = useState<string | null>(radio.getCurrentTrack());
  const [filterTab, setFilterTab] = useState<"all" | "stream" | "procedural">("all");
  const [panelTab, setPanelTab] = useState<"radio" | "pomodoro">("radio");

  useEffect(() => {
    const unsubscribe = radio.subscribe(() => {
      setIsLive(radio.isActive());
      setActiveStation(radio.getStation());
      setVolume(Math.round(radio.getVolume() * 100));
      setRainVol(Math.round(radio.getRainVolume() * 100));
      setVinylVol(Math.round(radio.getVinylVolume() * 100));
      setCurrentTrack(radio.getCurrentTrack());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.playSwitch();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleToggle = () => {
    triggerHaptic("medium");
    const next = radio.toggle();
    if (next) {
      sound.playCommand();
      const current = STATIONS.find((s) => s.id === radio.getStation());
      onStatusChange?.(`RADIO: ON AIR // ${current?.tagline || "CYBER BROADCAST"}`);
    } else {
      sound.playSwitch();
      onStatusChange?.("RADIO: DISCONNECTED");
    }
  };

  const handleSelectStation = (id: string) => {
    triggerHaptic("light");
    sound.playSwitch();
    radio.setStation(id);
    if (!radio.isActive()) {
      radio.start(id);
    }
    const found = STATIONS.find((s) => s.id === id);
    onStatusChange?.(`RADIO STATION: [${found?.number}] ${found?.name}`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    radio.setVolume(val / 100);
  };

  const filteredStations = STATIONS.filter((s) => {
    if (filterTab === "all") return true;
    return s.type === filterTab;
  });

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm"
      onClick={() => {
        sound.playSwitch();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg border border-border bg-[#0a0a0f] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cyberpunk Radio Station Tuner"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-border px-3.5 sm:px-4 py-2.5 shrink-0 bg-black/40">
          <div className="flex items-center gap-2">
            <Radio className={`h-4 w-4 ${isLive ? "text-cyan animate-pulse" : "text-zinc-500"}`} />
            <h2 className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              CYBER_AUDIO <span className="text-cyan">{"//"}</span> {panelTab === "radio" ? "10-STATION HUD" : "POMODORO FOCUS"}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playSwitch();
              onClose();
            }}
            aria-label="Close Tuner"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Panel Mode Switcher: 10-Station Radio vs Pomodoro HUD */}
        <div className="grid grid-cols-2 border-b border-border bg-black/70 shrink-0 font-mono">
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setPanelTab("radio");
            }}
            className={`min-h-[44px] py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 border-r border-border transition-colors cursor-pointer ${
              panelTab === "radio"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>10-STATION TUNER</span>
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              triggerHaptic("light");
              setPanelTab("pomodoro");
            }}
            className={`min-h-[44px] py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              panelTab === "pomodoro"
                ? "bg-cyan/15 text-cyan border-b-2 border-b-cyan"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            <span>POMODORO_HUD</span>
          </button>
        </div>

        {panelTab === "pomodoro" ? (
          <div className="flex-1 overflow-y-auto">
            <PomodoroHud />
          </div>
        ) : (
          <>
            {/* Pinned Top Card: Status + Visualizer + Master Power */}
            <div className="border-b border-border bg-black/60 p-3 sm:p-3.5 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isLive ? "bg-cyan" : "bg-zinc-600"
                  }`}
                ></span>
              </span>
              <span className="text-[11px] font-mono tracking-wider font-semibold text-zinc-300">
                {isLive ? (
                  <span className="text-cyan">CARRIER LOCKED // 104.7 MHZ</span>
                ) : (
                  <span className="text-zinc-500">CARRIER SILENT // STANDBY</span>
                )}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {isLive ? "BROADCAST ONLINE" : "OFF-AIR"}
            </span>
          </div>

          {/* Now Playing Live Metadata Banner */}
          {isLive && currentTrack && (
            <div className="border border-cyan/40 bg-cyan/[0.08] px-2.5 py-1 flex items-center gap-2 overflow-hidden">
              <span className="text-[9px] font-mono font-bold bg-cyan text-black px-1.5 py-0.2 shrink-0">
                NOW PLAYING
              </span>
              <span className="text-[11px] font-mono text-cyan truncate font-semibold">
                {currentTrack}
              </span>
            </div>
          )}

          {/* Live Audio-Reactive Canvas Visualizer */}
          <AudioVisualizer height={58} showToggle={true} />

          {/* Master Power Toggle Button */}
          <button
            onClick={handleToggle}
            className={`w-full min-h-[44px] px-4 py-2 flex items-center justify-center gap-2 border text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
              isLive
                ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                : "border-cyan bg-cyan/15 text-cyan hover:bg-cyan/25 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{isLive ? "DISCONNECT BROADCAST" : "INITIALIZE FREQUENCY"}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-border bg-black/40 px-3 py-1.5 gap-1.5 shrink-0 text-[10px] font-mono">
          <button
            onClick={() => {
              sound.playSwitch();
              setFilterTab("all");
            }}
            className={`px-2 py-1 border transition-colors cursor-pointer ${
              filterTab === "all"
                ? "border-cyan text-cyan bg-cyan/10 font-bold"
                : "border-border text-zinc-400 hover:text-white"
            }`}
          >
            ALL [{STATIONS.length}]
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              setFilterTab("stream");
            }}
            className={`px-2 py-1 border transition-colors cursor-pointer ${
              filterTab === "stream"
                ? "border-cyan text-cyan bg-cyan/10 font-bold"
                : "border-border text-zinc-400 hover:text-white"
            }`}
          >
            24/7 STREAMS [5]
          </button>
          <button
            onClick={() => {
              sound.playSwitch();
              setFilterTab("procedural");
            }}
            className={`px-2 py-1 border transition-colors cursor-pointer ${
              filterTab === "procedural"
                ? "border-cyan text-cyan bg-cyan/10 font-bold"
                : "border-border text-zinc-400 hover:text-white"
            }`}
          >
            OFFLINE SYNTHS [5]
          </button>
        </div>

        {/* Scrollable Stations List */}
        <div className="overflow-y-auto p-3 sm:p-3.5 space-y-2 flex-1">
          {filteredStations.map((station) => {
            const isSelected = activeStation === station.id;
            const IconComponent = STATION_ICONS[station.id] || Music2;

            return (
              <button
                key={station.id}
                onClick={() => handleSelectStation(station.id)}
                className={`w-full min-h-[52px] p-2.5 sm:p-3 text-left border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan bg-cyan/[0.09] text-white shadow-[inset_0_0_12px_rgba(0,240,255,0.06)]"
                    : "border-border/70 bg-black/30 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-none border flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                      isSelected
                        ? "border-cyan text-cyan bg-cyan/15"
                        : "border-border text-zinc-500 bg-zinc-900/50"
                    }`}
                  >
                    {station.number}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold tracking-wide truncate ${
                          isSelected ? "text-cyan" : "text-zinc-200"
                        }`}
                      >
                        {station.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 uppercase border ${
                          station.type === "stream"
                            ? "border-cyan/40 text-cyan bg-cyan/10"
                            : "border-border text-zinc-400 bg-white/[0.02]"
                        }`}
                      >
                        {station.type === "stream" ? "24/7 STREAM" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {station.sublabel}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <IconComponent
                    className={`h-4 w-4 ${
                      isSelected ? "text-cyan" : "text-zinc-600"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Procedural Soundscape Mixer (Rain & Vinyl Crackle) */}
        <div className="border-t border-border bg-[#08080d] px-3 sm:px-4 py-2.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan" />
              <span>SOUNDSCAPE MIXER // PROCEDURAL FX</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">0 KB SYNTH · ZERO LAG</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Rain Mixer */}
            <div className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 px-2.5 py-1.5 min-h-[44px]">
              <button
                onClick={() => {
                  const next = rainVol > 0 ? 0 : 50;
                  setRainVol(next);
                  radio.setRainVolume(next / 100);
                  triggerHaptic("light");
                  sound.playSwitch();
                }}
                className={`flex items-center gap-1.5 text-xs font-mono shrink-0 cursor-pointer min-h-[36px] px-1 ${
                  rainVol > 0 ? "text-cyan font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Toggle Procedural Rain Soundscape"
              >
                <CloudRain className="h-3.5 w-3.5" />
                <span>RAIN</span>
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {rainVol > 0 ? `${rainVol}%` : "OFF"}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={rainVol}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setRainVol(val);
                  radio.setRainVolume(val / 100);
                }}
                className="w-24 sm:w-28 accent-cyan bg-zinc-800 h-1.5 rounded-none cursor-pointer"
                aria-label="Procedural Rain Volume"
              />
            </div>

            {/* Vinyl Crackle Mixer */}
            <div className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 px-2.5 py-1.5 min-h-[44px]">
              <button
                onClick={() => {
                  const next = vinylVol > 0 ? 0 : 40;
                  setVinylVol(next);
                  radio.setVinylVolume(next / 100);
                  triggerHaptic("light");
                  sound.playSwitch();
                }}
                className={`flex items-center gap-1.5 text-xs font-mono shrink-0 cursor-pointer min-h-[36px] px-1 ${
                  vinylVol > 0 ? "text-cyan font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Toggle Procedural Vinyl Crackle Soundscape"
              >
                <Disc className="h-3.5 w-3.5" />
                <span>VINYL</span>
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {vinylVol > 0 ? `${vinylVol}%` : "OFF"}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={vinylVol}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setVinylVol(val);
                  radio.setVinylVolume(val / 100);
                }}
                className="w-24 sm:w-28 accent-cyan bg-zinc-800 h-1.5 rounded-none cursor-pointer"
                aria-label="Procedural Vinyl Crackle Volume"
              />
            </div>
          </div>
        </div>
        </>
        )}

        {/* Volume Footer */}
        <div className="border-t border-border bg-black/60 p-3 sm:px-4 py-2.5 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-mono shrink-0">
            {volume === 0 ? (
              <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-cyan" />
            )}
            <span>VOL</span>
            <span className="text-zinc-400 tabular-nums text-[11px]">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full max-w-[240px] accent-cyan bg-zinc-800 h-1.5 rounded-none cursor-pointer"
            aria-label="Master Radio Volume"
          />
        </div>
      </div>
    </div>
  );
}
