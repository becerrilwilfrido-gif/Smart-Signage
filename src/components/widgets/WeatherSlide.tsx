import { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  ChevronLeft,
  ChevronRight,
  Sunset,
  Sunrise,
  Car,
  MapPin,
  Sparkles
} from 'lucide-react';

interface WeatherSlideProps {
  isCurrent?: boolean;
  key?: string;
}

interface HourlyDataPoint {
  timeLabel: string;
  isNow?: boolean;
  isPast?: boolean;
  tempC: number;
  tempF: number;
  rainProb: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
  isSunset?: boolean;
  sunsetLabel?: string;
}

interface DailyDataPoint {
  dayName: string;
  dateStr: string;
  maxC: number;
  minC: number;
  maxF: number;
  minF: number;
  rainProb: number;
  weatherCode: number;
}

// Convertidor de Celsius a Fahrenheit
const cToF = (c: number) => Math.round((c * 9) / 5 + 32);

// Tipo de condición para las animaciones solicitadas
type WeatherConditionCategory = 'cloudy' | 'rainy' | 'sunny';

// Determina la categoría del clima: nublado, lluvia o sol
function getWeatherCategory(code: number): WeatherConditionCategory {
  // Lluvia, llovizna, chubascos o tormenta
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) {
    return 'rainy';
  }
  // Sol / Despejado
  if (code === 0) {
    return 'sunny';
  }
  // Nublado / Parcialmente nublado / Niebla
  return 'cloudy';
}

// Selector de icono y texto estilo Google Weather
function getGoogleWeatherDetails(code: number, isDay = true) {
  if (code === 0) {
    return {
      label: isDay ? 'Despejado' : 'Despejado',
      icon: isDay ? Sun : Moon,
      color: isDay ? 'text-amber-500' : 'text-indigo-400',
      isStorm: false
    };
  }
  if (code === 1 || code === 2) {
    return {
      label: 'Parcialmente nublado',
      icon: CloudSun,
      color: 'text-amber-400',
      isStorm: false
    };
  }
  if (code === 3) {
    return {
      label: 'Nublado',
      icon: Cloud,
      color: 'text-slate-400',
      isStorm: false
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      label: 'Niebla',
      icon: Cloud,
      color: 'text-slate-400',
      isStorm: false
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      label: 'Llovizna',
      icon: CloudDrizzle,
      color: 'text-sky-400',
      isStorm: false
    };
  }
  if (code >= 61 && code <= 65) {
    return {
      label: 'Lluvia',
      icon: CloudRain,
      color: 'text-blue-500',
      isStorm: false
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      label: 'Chubascos',
      icon: CloudRain,
      color: 'text-blue-500',
      isStorm: false
    };
  }
  if (code >= 95) {
    return {
      label: 'Tormenta eléctrica',
      icon: CloudLightning,
      color: 'text-amber-400',
      isStorm: true
    };
  }
  return {
    label: 'Nublado',
    icon: Cloud,
    color: 'text-slate-400',
    isStorm: false
  };
}

// Información oficial de Hoy No Circula CDMX
function getHoyNoCirculaInfo() {
  const day = new Date().getDay();
  switch (day) {
    case 1:
      return { color: 'Amarillo', badge: 'bg-amber-400 text-amber-950', placas: '5 y 6', holograma: '1 y 2' };
    case 2:
      return { color: 'Rosa', badge: 'bg-pink-600 text-white', placas: '7 y 8', holograma: '1 y 2' };
    case 3:
      return { color: 'Rojo', badge: 'bg-red-600 text-white', placas: '3 y 4', holograma: '1 y 2' };
    case 4:
      return { color: 'Verde', badge: 'bg-emerald-600 text-white', placas: '1 y 2', holograma: '1 y 2' };
    case 5:
      return { color: 'Azul', badge: 'bg-blue-600 text-white', placas: '9 y 0', holograma: '1 y 2' };
    default:
      return { color: 'Fin de Semana', badge: 'bg-slate-200 text-slate-800', placas: 'Sin restricción', holograma: 'Libre' };
  }
}

/* ======================================================== */
/* COMPONENTE DE ATMÓSFERA ANIMADA DEL BANNER               */
/* ======================================================== */
interface AtmosphereProps {
  condition: WeatherConditionCategory;
  isStorm?: boolean;
  isActive: boolean;
}

function WeatherBannerAtmosphere({ condition, isStorm = false, isActive }: AtmosphereProps) {
  // Cuando está soleado: NO hacer nada de animación, se mantiene limpio y estático
  if (condition === 'sunny' || !isActive) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <style>{`
        /* Animación suave de nubes grises desplazándose */
        @keyframes driftCloudSlow {
          0% { transform: translateX(105%); }
          100% { transform: translateX(-160%); }
        }
        @keyframes driftCloudMedium {
          0% { transform: translateX(120%); }
          100% { transform: translateX(-180%); }
        }
        @keyframes driftCloudFast {
          0% { transform: translateX(110%); }
          100% { transform: translateX(-150%); }
        }

        /* Animación de lluvia cayendo en ángulo */
        @keyframes raindropFall {
          0% {
            transform: translate3d(0, -60px, 0);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(-35px, 260px, 0);
            opacity: 0;
          }
        }

        /* Ondas de impacto de gotas */
        @keyframes raindropRipple {
          0% {
            transform: scale(0.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }

        /* Relámpago ocasional sutil para tormentas */
        @keyframes lightningFlash {
          0%, 94%, 98%, 100% { opacity: 0; }
          95%, 97% { opacity: 0.35; }
          96% { opacity: 0.7; }
        }
      `}</style>

      {/* CASO 1: NUBLADO - Nubes grises flotando y desplazándose suavemente */}
      {condition === 'cloudy' && (
        <div className="absolute inset-0">
          {/* Nube Gris 1: Grande y profunda (fondo) */}
          <div
            className="absolute top-2 w-[420px] h-[160px] opacity-40"
            style={{
              animation: 'driftCloudSlow 42s linear infinite',
              animationDelay: '0s'
            }}
          >
            <svg viewBox="0 0 400 160" className="w-full h-full fill-slate-400 drop-shadow-md">
              <path d="M 60,130 A 40,40 0 0,1 90,80 A 60,60 0 0,1 210,65 A 50,50 0 0,1 300,90 A 40,40 0 0,1 350,130 Z" />
            </svg>
          </div>

          {/* Nube Gris 2: Tono grafito/plata medio, altura media */}
          <div
            className="absolute top-6 w-[340px] h-[140px] opacity-60"
            style={{
              animation: 'driftCloudMedium 28s linear infinite',
              animationDelay: '-12s'
            }}
          >
            <svg viewBox="0 0 340 140" className="w-full h-full fill-slate-300 drop-shadow-lg">
              <path d="M 40,110 A 35,35 0 0,1 70,60 A 55,55 0 0,1 180,45 A 45,45 0 0,1 260,70 A 35,35 0 0,1 300,110 Z" />
            </svg>
          </div>

          {/* Nube Gris 3: Gris cenizo suave, capa delantera */}
          <div
            className="absolute -top-4 w-[480px] h-[180px] opacity-50"
            style={{
              animation: 'driftCloudFast 34s linear infinite',
              animationDelay: '-22s'
            }}
          >
            <svg viewBox="0 0 480 180" className="w-full h-full fill-slate-500 drop-shadow-xl">
              <path d="M 80,140 A 45,45 0 0,1 120,80 A 70,70 0 0,1 260,60 A 55,55 0 0,1 360,95 A 45,45 0 0,1 420,140 Z" />
            </svg>
          </div>

          {/* Nube Gris 4: Nube baja en el borde inferior */}
          <div
            className="absolute bottom-[-20px] w-[380px] h-[130px] opacity-45"
            style={{
              animation: 'driftCloudMedium 24s linear infinite',
              animationDelay: '-5s'
            }}
          >
            <svg viewBox="0 0 380 130" className="w-full h-full fill-slate-400">
              <path d="M 50,100 A 35,35 0 0,1 80,60 A 50,50 0 0,1 190,40 A 45,45 0 0,1 280,65 A 35,35 0 0,1 330,100 Z" />
            </svg>
          </div>

          {/* Neblina tenue difusa en el horizonte */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-600/30 via-transparent to-slate-900/10 pointer-events-none" />
        </div>
      )}

      {/* CASO 2: LLUVIA - Gotas cayendo en diagonal constante */}
      {condition === 'rainy' && (
        <div className="absolute inset-0">
          {/* Relámpago sutil si hay tormenta */}
          {isStorm && (
            <div
              className="absolute inset-0 bg-white pointer-events-none"
              style={{ animation: 'lightningFlash 7s infinite ease-out' }}
            />
          )}

          {/* Cortina de 36 gotas de lluvia distribuidas */}
          {Array.from({ length: 36 }).map((_, i) => {
            const leftPct = (i * 2.8 + (i % 3) * 1.5) % 98;
            const duration = 0.6 + (i % 5) * 0.12; // 0.6s a 1.2s
            const delay = -(i * 0.17); // desfasado para que empiece de inmediato
            const height = 18 + (i % 4) * 8; // 18px a 42px
            const opacity = 0.45 + (i % 3) * 0.25;

            return (
              <div
                key={i}
                className="absolute w-[1.5px] rounded-full bg-gradient-to-b from-sky-200/0 via-sky-100/70 to-sky-200/90 pointer-events-none"
                style={{
                  left: `${leftPct}%`,
                  top: '-30px',
                  height: `${height}px`,
                  opacity,
                  animation: `raindropFall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  transformOrigin: 'top center'
                }}
              />
            );
          })}

          {/* Ondas / salpicaduras en el suelo/fondo del banner */}
          {Array.from({ length: 7 }).map((_, i) => {
            const leftPct = 12 + i * 13;
            const delay = -(i * 0.4);
            return (
              <div
                key={`ripple-${i}`}
                className="absolute bottom-2 w-3.5 h-1 rounded-full border border-sky-200/60 pointer-events-none"
                style={{
                  left: `${leftPct}%`,
                  animation: 'raindropRipple 1.4s ease-out infinite',
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WeatherSlide({ isCurrent = true }: WeatherSlideProps) {
  // Selector de unidad: °C o °F (como el pantallazo de Google)
  const [unit, setUnit] = useState<'C' | 'F'>('F');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'today' | 'weekly'>('today');

  // Modo de simulación/prueba para que el usuario pueda alternar y ver las animaciones
  // 'auto' usa el clima real en tiempo real de Open-Meteo
  const [conditionOverride, setConditionOverride] = useState<'auto' | 'cloudy' | 'rainy' | 'sunny'>('auto');

  // Datos en vivo
  const [currentTempC, setCurrentTempC] = useState<number>(18);
  const [apparentTempC, setApparentTempC] = useState<number>(18);
  const [highTempC, setHighTempC] = useState<number>(22);
  const [lowTempC, setLowTempC] = useState<number>(13);
  const [currentRainProb, setCurrentRainProb] = useState<number>(2);
  const [currentPrecipitationMm, setCurrentPrecipitationMm] = useState<number>(0);
  const [currentWeatherCode, setCurrentWeatherCode] = useState<number>(3);
  const [currentIsDay, setCurrentIsDay] = useState<boolean>(true);
  const [windSpeed, setWindSpeed] = useState<number>(5);
  const [humidity, setHumidity] = useState<number>(68);

  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>([]);
  const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos en vivo de Bosques de las Lomas (19.4044, -99.2417)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=19.4044&longitude=-99.2417&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=America%2FMexico_City&forecast_days=6'
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data?.current && data?.daily) {
          const tempC = Math.round(data.current.temperature_2m);
          const appC = Math.round(data.current.apparent_temperature);
          const maxC = Math.round(data.daily.temperature_2m_max?.[0] ?? 22);
          const minC = Math.round(data.daily.temperature_2m_min?.[0] ?? 13);

          setCurrentTempC(tempC);
          setApparentTempC(appC);
          setHighTempC(maxC);
          setLowTempC(minC);
          setCurrentRainProb(data.daily.precipitation_probability_max?.[0] ?? 2);
          setCurrentPrecipitationMm(data.current.precipitation ?? 0);
          setCurrentWeatherCode(data.current.weather_code ?? 3);
          setCurrentIsDay(Boolean(data.current.is_day));
          setWindSpeed(Math.round(data.current.wind_speed_10m ?? 5));
          setHumidity(Math.round(data.current.relative_humidity_2m ?? 65));
        }

        // Construir la serie horaria para la curva (igual que Google Weather)
        if (data?.hourly && Array.isArray(data.hourly.time)) {
          const now = new Date();
          const currentHour = now.getHours();

          // Identificar hora de puesta del sol
          let sunsetHour = 18;
          let sunsetMinute = 20;
          if (data.daily?.sunset?.[0]) {
            const ss = new Date(data.daily.sunset[0]);
            sunsetHour = ss.getHours();
            sunsetMinute = ss.getMinutes();
          }

          const points: HourlyDataPoint[] = [];

          // Mostramos desde 2 horas antes de ahora hasta las siguientes 14 horas
          const startIdx = Math.max(0, currentHour - 2);
          const endIdx = Math.min(data.hourly.time.length - 1, startIdx + 16);

          for (let i = startIdx; i <= endIdx; i++) {
            const itemDate = new Date(data.hourly.time[i]);
            const hour = itemDate.getHours();
            const isNow = hour === currentHour && itemDate.getDate() === now.getDate();
            const isPast = itemDate.getTime() < now.getTime() && !isNow;

            const tC = Math.round(data.hourly.temperature_2m[i]);
            const tF = cToF(tC);
            const rProb = data.hourly.precipitation_probability[i] ?? 0;
            const pMm = data.hourly.precipitation[i] ?? 0;
            const wCode = data.hourly.weather_code[i] ?? 3;
            const isD = hour >= 7 && hour < 19;

            points.push({
              timeLabel: isNow ? 'Ahora' : `${String(hour).padStart(2, '0')}:00`,
              isNow,
              isPast,
              tempC: tC,
              tempF: tF,
              rainProb: rProb,
              precipitationMm: pMm,
              weatherCode: wCode,
              isDay: isD
            });

            // Insertar punto de puesta de sol entre la hora correspondiente
            if (hour === sunsetHour && sunsetMinute > 0) {
              const sunsetTC = Math.round(data.hourly.temperature_2m[i]);
              points.push({
                timeLabel: `${String(sunsetHour).padStart(2, '0')}:${String(sunsetMinute).padStart(2, '0')}`,
                tempC: sunsetTC,
                tempF: cToF(sunsetTC),
                rainProb: rProb,
                precipitationMm: pMm,
                weatherCode: 0,
                isDay: false,
                isSunset: true,
                sunsetLabel: 'Puesta del sol'
              });
            }
          }
          setHourlyData(points);
        }

        // Construir pronóstico de 5 días
        if (data?.daily && Array.isArray(data.daily.time)) {
          const days: DailyDataPoint[] = [];
          for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
            const d = new Date(data.daily.time[i] + 'T12:00:00');
            const dayName = i === 0 ? 'Hoy' : d.toLocaleDateString('es-MX', { weekday: 'short' });
            const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
            const maxC = Math.round(data.daily.temperature_2m_max[i] ?? 22);
            const minC = Math.round(data.daily.temperature_2m_min[i] ?? 13);

            days.push({
              dayName,
              dateStr,
              maxC,
              minC,
              maxF: cToF(maxC),
              minF: cToF(minC),
              rainProb: data.daily.precipitation_probability_max[i] ?? 0,
              weatherCode: data.daily.weather_code[i] ?? 3
            });
          }
          setDailyData(days);
        }
      } catch (err) {
        console.error('Error fetching live weather', err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Desplazar suavemente a la izquierda o derecha en la gráfica
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Determinar condición efectiva: automática según API real o prueba seleccionada
  const liveCategory = getWeatherCategory(currentWeatherCode);
  const effectiveCondition: WeatherConditionCategory =
    conditionOverride === 'auto' ? liveCategory : conditionOverride;

  // Código simulado para iconos/etiquetas si hay override
  const effectiveWeatherCode =
    conditionOverride === 'sunny'
      ? 0
      : conditionOverride === 'cloudy'
      ? 3
      : conditionOverride === 'rainy'
      ? 61
      : currentWeatherCode;

  // Convertir temperaturas según unidad activa
  const displayCurrentTemp = unit === 'C' ? currentTempC : cToF(currentTempC);
  const displayApparentTemp = unit === 'C' ? apparentTempC : cToF(apparentTempC);
  const displayHighTemp = unit === 'C' ? highTempC : cToF(highTempC);
  const displayLowTemp = unit === 'C' ? lowTempC : cToF(lowTempC);

  const currentWeatherDetails = getGoogleWeatherDetails(effectiveWeatherCode, currentIsDay);
  const CurrentIcon = currentWeatherDetails.icon;
  const noCircula = getHoyNoCirculaInfo();

  // Color de fondo del Banner según condición atmosférica
  const bannerBackground =
    effectiveCondition === 'sunny'
      ? 'linear-gradient(135deg, #1D4ED8 0%, #0284C7 55%, #38BDF8 100%)' // Sol: Azul cielo brillante limpio
      : effectiveCondition === 'cloudy'
      ? 'linear-gradient(135deg, #475569 0%, #64748B 50%, #334155 100%)' // Nublado: Pizarra y nubes grises
      : 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #1E3A5F 100%)'; // Lluvia: Azul tormentoso profundo

  // Formato de hora en el encabezado estilo Google
  const timeStringHeader = currentTime.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  // Generación matemática de la curva SVG de temperatura
  const columnWidth = 84;
  const graphHeight = 85;
  const graphPaddingTop = 22;
  const graphPaddingBottom = 18;

  // Rango de temperaturas visibles en la gráfica
  const tempsInView = hourlyData.map(d => (unit === 'C' ? d.tempC : d.tempF));
  const minTempChart = tempsInView.length > 0 ? Math.min(...tempsInView) - 1 : 10;
  const maxTempChart = tempsInView.length > 0 ? Math.max(...tempsInView) + 1 : 25;
  const tempRange = Math.max(1, maxTempChart - minTempChart);

  // Calcular coordenadas (x, y) de cada punto
  const pointsCoords = hourlyData.map((d, index) => {
    const temp = unit === 'C' ? d.tempC : d.tempF;
    const x = index * columnWidth + columnWidth / 2;
    // Y invertido: más alta temp = más arriba
    const y =
      graphHeight -
      graphPaddingBottom -
      ((temp - minTempChart) / tempRange) * (graphHeight - graphPaddingTop - graphPaddingBottom);
    return { x, y, isPast: d.isPast, isNow: d.isNow };
  });

  // Generar path spline suave
  let solidPathD = '';
  let dashedPathD = '';

  if (pointsCoords.length > 1) {
    const nowIdx = pointsCoords.findIndex(p => p.isNow);
    const splitIndex = nowIdx !== -1 ? nowIdx : 1;

    // Tramo pasado (punteado / dashed)
    if (splitIndex > 0) {
      dashedPathD = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
      for (let i = 1; i <= splitIndex; i++) {
        const p0 = pointsCoords[i - 1];
        const p1 = pointsCoords[i];
        const cpx1 = p0.x + (p1.x - p0.x) / 2;
        const cpx2 = cpx1;
        dashedPathD += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
      }
    }

    // Tramo futuro (línea sólida dorada Google)
    solidPathD = `M ${pointsCoords[splitIndex].x} ${pointsCoords[splitIndex].y}`;
    for (let i = splitIndex + 1; i < pointsCoords.length; i++) {
      const p0 = pointsCoords[i - 1];
      const p1 = pointsCoords[i];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpx2 = cpx1;
      solidPathD += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  return (
    <div className="w-full h-full bg-white flex flex-col justify-between p-6 select-none overflow-hidden font-sans text-neutral-800">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col justify-between">
        {/* ======================================================== */}
        {/* ENCABEZADO SUPERIOR: TÍTULO GOOGLE + CONTROLES            */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              El tiempo en Ciudad de México
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Bosques de las Lomas
              </span>
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              Ciudad de México · A partir de las {timeStringHeader} GMT-6 (Bosque de Duraznos)
            </p>
          </div>

          {/* Selector de Unidades °C / °F, Selector de Animación y Pestañas */}
          <div className="flex items-center gap-2.5">
            {/* Control de animación / simulación para verificar en vivo */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setConditionOverride('auto')}
                title="Clima real en vivo para Bosques de las Lomas"
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  conditionOverride === 'auto'
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>En vivo</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionOverride('cloudy')}
                title="Animación de nubes grises"
                className={`px-2 py-1 rounded-md transition-all ${
                  conditionOverride === 'cloudy'
                    ? 'bg-slate-700 text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ☁️ Nubes
              </button>
              <button
                type="button"
                onClick={() => setConditionOverride('rainy')}
                title="Animación de lluvia cayendo"
                className={`px-2 py-1 rounded-md transition-all ${
                  conditionOverride === 'rainy'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                🌧️ Lluvia
              </button>
              <button
                type="button"
                onClick={() => setConditionOverride('sunny')}
                title="Soleado: Sin animación, cielo limpio estático"
                className={`px-2 py-1 rounded-md transition-all ${
                  conditionOverride === 'sunny'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ☀️ Sol
              </button>
            </div>

            {/* Selector de Unidades */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUnit('C')}
                className={`px-2 py-1 rounded-md transition-all ${
                  unit === 'C' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit('F')}
                className={`px-2 py-1 rounded-md transition-all ${
                  unit === 'F' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                °F
              </button>
            </div>

            {/* Pestañas Previsión de hoy / Próximos días */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'today' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Previsión de hoy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('weekly')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'weekly' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Próximos días
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BANNER ATMOSFÉRICO DE CLIMA ACTUAL CON ANIMACIONES        */}
        {/* ======================================================== */}
        <div
          className="w-full rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex-shrink-0 my-2 transition-all duration-700"
          style={{ background: bannerBackground }}
        >
          {/* Capa de animación meteorológica (Nubes grises / Lluvia / Sol estático) */}
          <WeatherBannerAtmosphere
            condition={effectiveCondition}
            isStorm={currentWeatherDetails.isStorm}
            isActive={isCurrent}
          />

          {/* Sutil textura de cristal */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] pointer-events-none z-[1]" />

          <div className="relative z-10 flex items-center justify-between">
            {/* Lado Izquierdo: Temperatura en tamaño gigante y métricas */}
            <div>
              <div className="flex items-baseline">
                <span className="text-8xl font-bold tracking-tight text-white leading-none drop-shadow-sm">
                  {displayCurrentTemp}°
                </span>
                <span className="text-xl text-white/80 ml-2 font-medium">
                  {unit === 'C' ? 'C' : 'F'}
                </span>
              </div>

              <div className="mt-3 text-sm text-white/95 font-medium flex items-center gap-3 drop-shadow-xs">
                <span>
                  Sensación térmica <strong>{displayApparentTemp}°</strong>
                </span>
                <span className="text-white/50">|</span>
                <span>
                  High <strong>{displayHighTemp}°</strong>
                </span>
                <span className="text-white/50">|</span>
                <span>
                  Low <strong>{displayLowTemp}°</strong>
                </span>
              </div>

              <div className="mt-1 text-sm text-white/90 font-medium flex items-center gap-3 drop-shadow-xs">
                <span>
                  Probabilidad de lluvia <strong>{currentRainProb}%</strong>
                </span>
                <span className="text-white/50">|</span>
                <span>
                  {unit === 'F'
                    ? `${(currentPrecipitationMm * 0.03937).toFixed(1)} in`
                    : `${currentPrecipitationMm} mm`}
                </span>
                <span className="text-white/50">|</span>
                <span>
                  Viento <strong>{windSpeed} km/h</strong>
                </span>
                <span className="text-white/50">|</span>
                <span>
                  Humedad <strong>{humidity}%</strong>
                </span>
              </div>
            </div>

            {/* Lado Derecho: Icono de Nube grande y Nombre de la Condición */}
            <div className="flex flex-col items-center justify-center mr-8">
              <div className="w-24 h-24 flex items-center justify-center">
                <CurrentIcon className="w-20 h-20 text-white drop-shadow-md" strokeWidth={1.75} />
              </div>
              <span className="text-lg font-bold text-white mt-1 capitalize tracking-wide drop-shadow-sm">
                {currentWeatherDetails.label}
              </span>
              {/* Etiqueta animada sutil para el estado */}
              {effectiveCondition === 'cloudy' && (
                <span className="text-[11px] font-semibold text-slate-200/90 bg-white/15 px-2 py-0.5 rounded-full mt-1">
                  ☁️ Cielo con nubosidad
                </span>
              )}
              {effectiveCondition === 'rainy' && (
                <span className="text-[11px] font-semibold text-sky-100 bg-sky-500/30 px-2 py-0.5 rounded-full mt-1 animate-pulse">
                  🌧️ Precipitación activa
                </span>
              )}
              {effectiveCondition === 'sunny' && (
                <span className="text-[11px] font-semibold text-amber-100 bg-amber-400/25 px-2 py-0.5 rounded-full mt-1">
                  ☀️ Cielo despejado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN PREVISIÓN DE HOY CON CURVA GRÁFICA               */}
        {/* ======================================================== */}
        {activeTab === 'today' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="mb-1.5 flex-shrink-0">
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Previsión de hoy
              </h2>
              <p className="text-xs text-neutral-600 font-normal">
                {currentHighTempCloseMessage(highTempC)}
              </p>
            </div>

            {/* Tarjeta Contenedora de la Gráfica y Horas (Estilo Google) */}
            <div className="relative w-full bg-white rounded-3xl border border-neutral-200 shadow-xs p-3 overflow-hidden flex-1 flex flex-col justify-center">
              {/* Flechas de navegación flotantes */}
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 transition-all cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Contenedor desplazable con las horas e iconos */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-none scroll-smooth px-8 py-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div
                  className="flex flex-col relative"
                  style={{ width: `${hourlyData.length * columnWidth}px` }}
                >
                  {/* Fila 1: Hora / Ahora / Puesta del sol */}
                  <div className="flex">
                    {hourlyData.map((d, index) => (
                      <div
                        key={`hour-${index}`}
                        style={{ width: `${columnWidth}px` }}
                        className="text-center flex-shrink-0 flex flex-col items-center justify-end"
                      >
                        {d.isSunset ? (
                          <div className="text-[11px] font-bold text-red-500 leading-tight">
                            Puesta del sol
                            <br />
                            <span className="text-[10px] text-red-400">{d.timeLabel}</span>
                          </div>
                        ) : (
                          <span
                            className={`text-xs ${
                              d.isNow
                                ? 'font-black text-neutral-900'
                                : d.isPast
                                ? 'text-neutral-400 font-medium'
                                : 'text-neutral-700 font-semibold'
                            }`}
                          >
                            {d.timeLabel}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Fila 2: Iconos del clima y porcentaje de lluvia */}
                  <div className="flex mt-2 mb-1">
                    {hourlyData.map((d, index) => {
                      const details = getGoogleWeatherDetails(d.weatherCode, d.isDay);
                      const HourIcon = details.icon;

                      return (
                        <div
                          key={`icon-${index}`}
                          style={{ width: `${columnWidth}px` }}
                          className="flex flex-col items-center justify-center flex-shrink-0"
                        >
                          {d.isSunset ? (
                            <Sunset className="w-7 h-7 text-red-500 drop-shadow-xs" />
                          ) : (
                            <HourIcon
                              className={`w-7 h-7 ${
                                d.isPast ? 'text-neutral-300' : details.color
                              }`}
                            />
                          )}

                          {/* Probabilidad de lluvia en % azul bajo el icono */}
                          <div className="h-4 flex items-center justify-center mt-1">
                            {d.rainProb > 0 && !d.isSunset && (
                              <span
                                className={`text-[11px] font-bold ${
                                  d.isPast ? 'text-neutral-300' : 'text-sky-600'
                                }`}
                              >
                                {d.rainProb}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fila 3: Lienzo SVG con Curva de Temperatura estilo Google Weather */}
                  <div className="relative my-2" style={{ height: `${graphHeight}px` }}>
                    <svg
                      width={hourlyData.length * columnWidth}
                      height={graphHeight}
                      className="overflow-visible pointer-events-none"
                    >
                      <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.3" />
                        </filter>
                      </defs>

                      {/* Línea pasada punteada gris */}
                      {dashedPathD && (
                        <path
                          d={dashedPathD}
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Línea sólida dorada estilo Google Weather */}
                      {solidPathD && (
                        <path
                          d={solidPathD}
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glow)"
                        />
                      )}

                      {/* Puntos y círculos sobre la curva */}
                      {pointsCoords.map((p, idx) => {
                        const isSunset = hourlyData[idx]?.isSunset;
                        return (
                          <g key={`pt-${idx}`}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={p.isNow ? 5 : 3.5}
                              fill={isSunset ? '#ef4444' : p.isPast ? '#cbd5e1' : '#eab308'}
                              stroke="#ffffff"
                              strokeWidth={p.isNow ? 2.5 : 1.5}
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Fila 4: Temperaturas numéricas alineadas exactamente con cada punto */}
                  <div className="flex">
                    {hourlyData.map((d, index) => {
                      const temp = unit === 'C' ? d.tempC : d.tempF;
                      return (
                        <div
                          key={`temp-${index}`}
                          style={{ width: `${columnWidth}px` }}
                          className={`text-center flex-shrink-0 ${
                            d.isNow
                              ? 'font-black text-neutral-900 text-sm'
                              : d.isPast
                              ? 'text-neutral-400 font-medium text-xs'
                              : 'text-neutral-700 font-semibold text-xs'
                          }`}
                        >
                          {temp}°
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* PESTAÑA: PRÓXIMOS DÍAS (EXTENDIDO SEMANAL)                */
          /* ======================================================== */
          <div className="flex-1 bg-white rounded-3xl border border-neutral-200 shadow-xs p-4 flex flex-col justify-between overflow-hidden">
            <h2 className="text-base font-bold text-neutral-900 mb-2">
              Pronóstico de los próximos 5 días • Bosques de las Lomas
            </h2>
            <div className="grid grid-cols-5 gap-3 flex-1 items-stretch">
              {dailyData.map((day, idx) => {
                const details = getGoogleWeatherDetails(day.weatherCode, true);
                const DayIcon = details.icon;
                const max = unit === 'C' ? day.maxC : day.maxF;
                const min = unit === 'C' ? day.minC : day.minF;

                return (
                  <div
                    key={idx}
                    className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 flex flex-col items-center justify-between text-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">{day.dayName}</span>
                      <span className="text-[11px] text-neutral-500 font-normal">{day.dateStr}</span>
                    </div>

                    <div className="my-2 flex flex-col items-center">
                      <DayIcon className={`w-8 h-8 ${details.color}`} />
                      <span className="text-xs text-neutral-600 font-medium mt-1 truncate max-w-[90px]">
                        {details.label}
                      </span>
                      {day.rainProb > 0 && (
                        <span className="text-[11px] font-bold text-sky-600 mt-0.5">
                          {day.rainProb}% lluvia
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-neutral-800">
                      <span className="text-neutral-900">{max}°</span>
                      <span className="text-neutral-400 mx-1.5 font-normal">/</span>
                      <span className="text-neutral-500 font-normal">{min}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CINTILLO DISCRETO: HOY NO CIRCULA CDMX                   */}
        {/* ======================================================== */}
        <div className="mt-2.5 bg-neutral-50 border border-neutral-200/80 rounded-2xl px-5 py-2 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Car className="w-4 h-4 text-neutral-600 flex-shrink-0" />
            <span className="font-bold text-neutral-900">Hoy No Circula CDMX:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${noCircula.badge}`}>
              Engomado {noCircula.color}
            </span>
            <span className="text-neutral-600">
              Placas: <strong>{noCircula.placas}</strong> • Hologramas: <strong>{noCircula.holograma}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Bosques de las Lomas • Poniente Ciudad de México</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mensaje dinámico de comparación como en Google Weather
function currentHighTempCloseMessage(maxC: number) {
  if (maxC >= 23) {
    return 'La temperatura alta de hoy será ligeramente más cálida que la de ayer.';
  }
  if (maxC <= 18) {
    return 'La temperatura alta de hoy será fresca con ambiente templado en la zona poniente.';
  }
  return 'La temperatura alta de hoy será casi la misma que la de ayer.';
}
