import { Sun, Cloud, CloudRain, CloudSun, Droplets, Wind, SunDim, MapPin, Thermometer } from 'lucide-react';

export default function WeatherWidget() {
  const weather = {
    temp: 24,
    desc: 'Parcialmente nublado',
    max: 28,
    min: 18,
    humidity: 62,
    wind: 12,
    uv: 'Moderado',
    location: 'Ciudad de México',
    forecast: [
      { day: 'MIÉ', max: 27, min: 19, icon: <CloudSun className="w-8 h-8 text-yellow-400" /> },
      { day: 'JUE', max: 29, min: 20, icon: <Sun className="w-8 h-8 text-yellow-400" /> },
      { day: 'VIE', max: 26, min: 18, icon: <Cloud className="w-8 h-8 text-gray-300" /> },
      { day: 'SÁB', max: 28, min: 19, icon: <CloudSun className="w-8 h-8 text-yellow-400" /> },
      { day: 'DOM', max: 24, min: 17, icon: <CloudRain className="w-8 h-8 text-blue-300" /> },
    ]
  };

  const getWeatherIcon = (desc: string, className: string) => {
    const d = desc.toLowerCase();
    if (d.includes('soleado')) return <Sun className={className} />;
    if (d.includes('nublado')) return <CloudSun className={className} />;
    if (d.includes('lluvia')) return <CloudRain className={className} />;
    return <Cloud className={className} />;
  };

  return (
    <div className="text-white space-y-6 flex flex-col items-center text-center">
      {/* Current Weather */}
      <div className="flex items-center gap-4">
        {getWeatherIcon(weather.desc, "w-16 h-16 text-yellow-400")}
        <div>
          <div className="text-6xl font-bold">{weather.temp}°C</div>
          <div className="text-sm text-slate-300">{weather.desc}</div>
        </div>
      </div>
      
      {/* Max/Min */}
      <div className="flex gap-4 text-sm text-slate-300">
        <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-red-500"/> Máx: {weather.max}°</div>
        <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-blue-500"/> Mín: {weather.min}°</div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <MapPin className="w-4 h-4" /> {weather.location}
      </div>

      {/* Forecast Grid */}
      <div className="grid grid-cols-5 gap-2 pt-4">
        {weather.forecast.map((f, i) => (
          <div key={i} className="flex flex-col items-center gap-2 bg-blue-950/30 p-2 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400">{f.day}</span>
            {f.icon}
            <span className="font-bold text-sm">{f.max}°</span>
            <span className="text-[10px] text-slate-400">{f.min}°</span>
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="border-t border-slate-700 pt-4 grid grid-cols-1 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/> Humedad: {weather.humidity}%</div>
          <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-blue-400"/> Viento: {weather.wind} km/h</div>
          <div className="flex items-center gap-2"><SunDim className="w-4 h-4 text-yellow-400"/> Índice UV: {weather.uv}</div>
      </div>
    </div>
  );
}
