"use client";

const forecast = [
  { day: "TODAY", high: 72, low: 58, condition: "Showers" },
  { day: "TOMORROW", high: 69, low: 53, condition: "T'Storms" },
  { day: "WEDNESDAY", high: 69, low: 49, condition: "Partly Cloudy" },
  { day: "THURSDAY", high: 60, low: 41, condition: "Sunny" },
  { day: "FRIDAY", high: 63, low: 45, condition: "Mostly Sunny" },
];

export default function ForecastStrip() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      {forecast.map((item) => (
        <div
          key={item.day}
          className="rounded-[24px] border border-cyan-500/20 bg-[#08111f] min-h-[250px] p-5 flex flex-col justify-between"
        >
          <div className="text-sm font-bold tracking-[0.2em] text-zinc-200">{item.day}</div>
          <div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-white">{item.high}°</div>
              <div className="pb-1 text-2xl text-cyan-300">{item.low}°</div>
            </div>
            <div className="mt-3 text-lg font-medium text-white">{item.condition}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
