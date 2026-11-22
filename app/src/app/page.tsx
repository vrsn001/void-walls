import { TerminalApp } from "@/components/terminal-app";
import wallpapersData from "@/data/wallpapers.json";
import type { Wallpaper } from "@/lib/types";

export default function Home() {
  return <TerminalApp wallpapers={wallpapersData as Wallpaper[]} />;
}
