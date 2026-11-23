import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "VOID//WALLS (虚無) — Command Terminal",
  description: "3,245+ curated wallpapers. Zero bloat. Keyboard-driven terminal.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} h-full`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("void_theme");var map={cyan_2077:["#00f0ff","rgba(0,240,255,0.15)","rgba(0,240,255,0.45)"],matrix_green:["#00ff66","rgba(0,255,102,0.15)","rgba(0,255,102,0.45)"],amber_84:["#ffb000","rgba(255,176,0,0.15)","rgba(255,176,0,0.45)"],outrun_magenta:["#ff007f","rgba(255,0,127,0.15)","rgba(255,0,127,0.45)"],blood_rekt:["#ff2a40","rgba(255,42,64,0.15)","rgba(255,42,64,0.45)"]};if(t&&map[t]){var r=document.documentElement;r.style.setProperty("--accent",map[t][0]);r.style.setProperty("--accent-dim",map[t][1]);r.style.setProperty("--accent-glow",map[t][2]);r.setAttribute("data-theme",t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full font-mono">{children}</body>
    </html>
  );
}
