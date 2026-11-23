"use client";

import { useEffect, useRef, useState } from "react";
import { radio } from "@/lib/radio";
import { Activity, BarChart2 } from "lucide-react";

interface AudioVisualizerProps {
  height?: number;
  mode?: "oscilloscope" | "spectrum";
  showToggle?: boolean;
}

export function AudioVisualizer({
  height = 64,
  mode: initialMode = "oscilloscope",
  showToggle = true,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"oscilloscope" | "spectrum">(initialMode);
  const [isLive, setIsLive] = useState(radio.isActive());

  useEffect(() => {
    const unsub = radio.subscribe(() => {
      setIsLive(radio.isActive());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const bufferLength = 64; // Microscopic buffer: 32-64 samples, ultra lightweight
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== h * dpr) {
        canvas.width = width * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      // Subtle radar grid background
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Center line
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      // Vertical grid ticks
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      if (!radio.isActive()) {
        // Flatline standby state
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIGNAL // STANDBY", width / 2, h / 2 - 8);
        ctx.restore();
        return;
      }

      if (mode === "oscilloscope") {
        // Real-time Oscilloscope Waveform
        radio.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 8;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
      } else {
        // Real-time Frequency Spectrum Bars
        radio.getByteFrequencyData(dataArray);

        const barCount = 28;
        const barWidth = (width / barCount) - 2;
        ctx.shadowBlur = 4;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[Math.floor((i / barCount) * (bufferLength / 2))];
          const percent = val / 255;
          const barHeight = Math.max(3, percent * (h - 8));
          const bx = i * (barWidth + 2);
          const by = h - barHeight;

          // Cyber gradient bar
          const grad = ctx.createLinearGradient(0, by, 0, h);
          grad.addColorStop(0, "#00f0ff");
          grad.addColorStop(1, "rgba(0, 240, 255, 0.2)");

          ctx.fillStyle = grad;
          ctx.shadowColor = "#00f0ff";
          ctx.fillRect(bx, by, barWidth, barHeight);

          // Top peak pixel cap
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(bx, by - 1, barWidth, 1.5);
        }
      }

      ctx.restore();
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isLive]);

  return (
    <div className="relative border border-cyan/30 bg-black/60 overflow-hidden w-full select-none">
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        className="w-full block"
      />
      {showToggle && (
        <div className="absolute top-1.5 right-2 flex items-center gap-1 z-10">
          <button
            onClick={() => setMode(mode === "oscilloscope" ? "spectrum" : "oscilloscope")}
            title="Toggle Visualizer Mode (Oscilloscope / Spectrum)"
            className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold border border-cyan/40 bg-black/70 text-cyan hover:bg-cyan/20 cursor-pointer uppercase transition-colors"
          >
            {mode === "oscilloscope" ? (
              <>
                <Activity className="h-2.5 w-2.5" />
                <span>OSC</span>
              </>
            ) : (
              <>
                <BarChart2 className="h-2.5 w-2.5" />
                <span>FFT</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
