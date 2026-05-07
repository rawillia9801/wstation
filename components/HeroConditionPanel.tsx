"use client";

import { CloudRain } from "lucide-react";

interface HeroConditionPanelProps {
  temperature?: number;
  feelsLike?: number;
  high?: number;
  low?: number;
  condition?: string;
}

export default function HeroConditionPanel({
  temperature = 71.4,
  feelsLike = 71,
  high = 72,
  low = 58,
  condition = "Rain",
}: HeroConditionPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-500/30 bg-[#08111f] shadow-[0_0_30px_rgba(0,255,255,0.08)]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/60" />
      <div className="relative z-10 flex h-full min-h-[320px] items-center justify-between p-8">
        <div className="flex flex-col">
          <div className="text-cyan-300 text-sm tracking-[0.3em] uppercase">Current Conditions</div>
          <div className="mt-6 flex items-start gap-2">
            <div className="text-[92px] font-black leading-none text-white">{temperature}</div>
            <div className="mt-4 text-4xl font-semibold text-white">°F</div>
          </div>
          <div className="mt-2 text-xl text-zinc-300">Feels Like {feelsLike}°</div>
          <div className="mt-8 flex gap-8">
            <div>
              <div className="text-red-400 text-2xl font-bold">↑ {high}°</div>
              <div className="text-zinc-400 text-sm uppercase">Today High</div>
            </div>
            <div>
              <div className="text-cyan-400 text-2xl font-bold">↓ {low}°</div>
              <div className="text-zinc-400 text-sm uppercase">Today Low</div>
            </div>
          </div>
        </div>
        <div className="mr-6 flex flex-col items-center">
          <CloudRain size={120} className="text-cyan-300" />
          <div className="mt-4 text-4xl font-semibold text-white">{condition}</div>
        </div>
      </div>
    </div>
  );
}
