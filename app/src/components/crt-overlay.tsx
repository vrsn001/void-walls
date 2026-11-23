"use client";

interface CrtOverlayProps {
  enabled: boolean;
}

export function CrtOverlay({ enabled }: CrtOverlayProps) {
  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Scanline Stripes */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0px, rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 3px)",
          transform: "translateZ(0)",
        }}
      />
      {/* CRT Vignette Edge Shadow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.02) 0%, transparent 70%, rgba(0, 0, 0, 0.45) 100%)",
        }}
      />
    </div>
  );
}
