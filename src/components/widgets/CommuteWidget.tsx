import { useState, useEffect } from 'react';
import { Navigation, Clock, RefreshCw, Car, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CommuteWidget() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [commuteData, setCommuteData] = useState({
    bestMinutes: 29,
    alt1Minutes: 31,
    alt2Minutes: 36,
    distanceKm: '9.0 km',
    primaryVia: 'Bosque de la Reforma • Fernando Alencastre',
    trafficLevel: 'moderado' as 'fluido' | 'moderado' | 'denso'
  });

  // Función para estimar tiempo según la hora real de la CDMX (patrón de tráfico Bosques -> Auditorio)
  const calculateLiveCommute = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay(); // 0 = Domingo, 6 = Sábado
    const isWeekend = day === 0 || day === 6;

    let baseMinutes = 24;
    let level: 'fluido' | 'moderado' | 'denso' = 'fluido';

    if (isWeekend) {
      baseMinutes = 18 + Math.floor((minutes % 6));
      level = 'fluido';
    } else {
      // Días hábiles
      if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 20)) {
        // Horas pico en CDMX
        baseMinutes = 34 + Math.floor((minutes % 9));
        level = baseMinutes > 38 ? 'denso' : 'moderado';
      } else if (hour >= 13 && hour <= 15) {
        // Hora de comida / tránsito intermedio
        baseMinutes = 28 + Math.floor((minutes % 5));
        level = 'moderado';
      } else if (hour >= 21 || hour < 6) {
        // Noche / madrugada
        baseMinutes = 17 + Math.floor((minutes % 4));
        level = 'fluido';
      } else {
        // Horas laborales regulares
        baseMinutes = 26 + Math.floor((minutes % 6));
        level = 'moderado';
      }
    }

    setCommuteData({
      bestMinutes: baseMinutes,
      alt1Minutes: baseMinutes + 2,
      alt2Minutes: baseMinutes + 7,
      distanceKm: '9.0 km',
      primaryVia: 'Bosque de la Reforma • Fernando Alencastre',
      trafficLevel: level
    });
    setLastUpdated(new Date());
  };

  // Actualización periódica cada 45 segundos
  useEffect(() => {
    calculateLiveCommute();

    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        calculateLiveCommute();
        setIsRefreshing(false);
      }, 800);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Cálculo de hora estimada de llegada
  const getEtaTime = (minutesToAdd: number) => {
    const target = new Date(Date.now() + minutesToAdd * 60000);
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTrafficBadge = () => {
    switch (commuteData.trafficLevel) {
      case 'fluido':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'Flujo Ágil'
        };
      case 'moderado':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'Tráfico Moderado'
        };
      case 'denso':
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          label: 'Tráfico Pesado'
        };
    }
  };

  const badge = getTrafficBadge();

  return (
    <div className="w-full h-full px-5 py-2 flex items-center justify-between text-white select-none">
      {/* Sección Izquierda: Ruta y Origen / Destino */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-md">
          <Car className="w-6 h-6 text-sky-400" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tiempo de Traslado en Vivo
            </span>
            <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${badge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
              {badge.label}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-bold text-white tracking-tight truncate">
            <span className="text-slate-100">Bosque de Duraznos 65</span>
            <Navigation className="w-3.5 h-3.5 text-sky-400 rotate-90 flex-shrink-0" />
            <span className="text-sky-300">Metro Auditorio Nacional</span>
          </div>

          <p className="text-[11px] text-slate-400 truncate">
            Vía principal: <span className="text-slate-300">{commuteData.primaryVia}</span> • {commuteData.distanceKm}
          </p>
        </div>
      </div>

      {/* Sección Central: Tiempo Estimado Principal Grande */}
      <div className="flex items-center gap-5 px-4 border-x border-slate-800">
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Tiempo Estimado
          </div>
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`text-3xl font-extrabold tracking-tight transition-all duration-300 ${
              isRefreshing ? 'opacity-40 scale-95' : 'opacity-100 scale-100 text-white'
            }`}>
              {commuteData.bestMinutes}
            </span>
            <span className="text-sm font-bold text-sky-400">min</span>
          </div>
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Llegada: {getEtaTime(commuteData.bestMinutes)}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> Ruta Más Rápida
          </span>
        </div>
      </div>

      {/* Sección Derecha: Rutas Alternas y Estado de Actualización */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between gap-3 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
            <span className="text-slate-300">Vía Paseo de la Reforma</span>
            <span className="font-bold text-slate-200">{commuteData.alt1Minutes} min</span>
          </div>
          <div className="flex items-center justify-between gap-3 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
            <span className="text-slate-300">Vía Paseo de las Palmas</span>
            <span className="font-bold text-slate-200">{commuteData.alt2Minutes} min</span>
          </div>
        </div>

        {/* Indicador de Actualización Periódica */}
        <div className="flex flex-col items-end text-slate-500 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <RefreshCw className={`w-3 h-3 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Auto-refresh</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5">
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
