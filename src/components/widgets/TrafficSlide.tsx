import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Menu, 
  MapPin, 
  ArrowUpDown, 
  Clock, 
  Share2, 
  ExternalLink,
  Navigation,
  Layers,
  Radio
} from 'lucide-react';
import { DURAZNOS_TO_AUDITORIO_COORDS } from '../../data/duraznosAuditorioRoute';

interface TrafficSlideProps {
  isCurrent: boolean;
  key?: string | number;
}

export default function TrafficSlide({ isCurrent }: TrafficSlideProps) {
  const [selectedRoute, setSelectedRoute] = useState<1 | 2 | 3>(1);
  const [activeMapMode, setActiveMapMode] = useState<'traced' | 'wazeLive'>('traced');
  const [currentTime, setCurrentTime] = useState(new Date());
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Actualizar hora cada 30 segundos para cálculo dinámico de hora de llegada
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const getEtaString = (minutesToAdd: number) => {
    const target = new Date(currentTime.getTime() + minutesToAdd * 60000);
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Inicializar Leaflet cuando el modo es 'traced'
  useEffect(() => {
    if (activeMapMode !== 'traced') {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Crear mapa si no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles (100% libre, sin requerimiento de API key)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Línea de borde oscura exterior (para alto contraste tipo Waze)
      const borderPolyline = L.polyline(DURAZNOS_TO_AUDITORIO_COORDS, {
        color: '#240046',
        weight: 9,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Línea púrpura principal de navegación (color oficial Waze)
      L.polyline(DURAZNOS_TO_AUDITORIO_COORDS, {
        color: '#6a0dad',
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Marcador de Origen: Bosque de Duraznos 65
      const originIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #0f172a; color: white; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #334155;">
              🏢 Bosque de Duraznos 65
            </div>
            <div style="width: 22px; height: 22px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(2, 132, 199, 0.8);"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([19.40437, -99.241711], { icon: originIcon }).addTo(map);

      // Marcador de Destino: Metro Auditorio Nacional
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: white; color: #0f172a; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; white-space: nowrap; margin-bottom: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.25); border: 1px solid #cbd5e1;">
              🎭 Metro Auditorio Nacional
            </div>
            <div style="width: 26px; height: 26px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
              🏁
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([19.4258, -99.192002], { icon: destIcon }).addTo(map);

      // Ajustar vista para encuadrar la ruta completa de extremo a extremo
      map.fitBounds(borderPolyline.getBounds(), {
        padding: [60, 60],
        maxZoom: 15,
      });

      // Añadir controles de zoom limpios en la esquina inferior derecha
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Invalidar tamaño cuando el slide se activa o se redimensiona
    const resizeTimer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => clearTimeout(resizeTimer);
  }, [activeMapMode, isCurrent]);

  const wazeLiveMapUrl = `https://embed.waze.com/iframe?zoom=13&lat=19.4135&lon=-99.2150&ct=livemap`;

  return (
    <div
      className={`absolute inset-0 w-full h-full flex bg-white overflow-hidden transition-opacity duration-1000 ease-in-out font-sans ${
        isCurrent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* ======================================================== */}
      {/* PANEL LATERAL: RUTAS Y TIEMPOS ESTIMADOS (LIMPIO)        */}
      {/* ======================================================== */}
      <div className="w-[360px] flex-shrink-0 bg-white h-full border-r border-slate-200 shadow-xl flex flex-col z-20 justify-between">
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-slate-700 p-1">
                <Menu className="w-6 h-6" />
              </div>
              <h1 className="text-slate-900 font-bold text-lg tracking-tight">
                Indicaciones para llegar
              </h1>
            </div>
            <a
              href="https://waze.com/ul?q=Auditorio+Nacional+CDMX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-sky-600 p-1"
              title="Abrir en Waze"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Caja de Origen y Destino */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-3 relative">
            {/* Origen */}
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-sky-500 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">
                  Tu ubicación (Duraznos 65)
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Bosque de las Lomas, Miguel Hidalgo
                </div>
              </div>
            </div>

            {/* Conector punteado */}
            <div className="ml-2.5 my-1 flex flex-col gap-0.5">
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Destino */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 fill-red-500" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">
                  Auditorio Nacional
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Paseo de la Reforma, Miguel Hidalgo
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selector de horario y botón Guardar en la app */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Salir ahora</span>
              <span className="text-[10px]">▼</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="text-sky-500 hover:text-sky-600 p-1.5 rounded-full hover:bg-sky-50">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="bg-[#0099ff] hover:bg-[#0088ee] text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-sm transition">
                Guardar en la app
              </button>
            </div>
          </div>

          {/* Sección de Rutas */}
          <div className="mb-2">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              Rutas
            </h2>

            <div className="space-y-2">
              {/* RUTA 1 - LA MEJOR (TRAZADA EN MAPA) */}
              <div
                onClick={() => setSelectedRoute(1)}
                className={`p-3 rounded-2xl cursor-pointer transition border ${
                  selectedRoute === 1
                    ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      selectedRoute === 1
                        ? 'bg-[#0099ff] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    1
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-slate-900 font-extrabold text-lg leading-tight">
                        29 min
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Hora de llegada: {getEtaString(29)}
                      </span>
                      <span className="bg-[#0099ff] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide">
                        LA MEJOR
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Bosque de la Reforma, Av. Paseo de la Reforma, Fernando Alencastre
                    </p>

                    <div className="text-[11px] text-slate-400 font-semibold mt-1">
                      9 KM • Ruta Trazada en Mapa
                    </div>
                  </div>
                </div>
              </div>

              {/* RUTA 2 */}
              <div
                onClick={() => setSelectedRoute(2)}
                className={`p-3 rounded-2xl cursor-pointer transition border ${
                  selectedRoute === 2
                    ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      selectedRoute === 2
                        ? 'bg-[#0099ff] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    2
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-slate-900 font-extrabold text-lg leading-tight">
                        31 min
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Hora de llegada: {getEtaString(31)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Bosque de la Reforma, Av. Paseo de la Reforma, Paseo de la Reforma
                    </p>

                    <div className="text-[11px] text-slate-400 font-semibold mt-1">
                      9.2 KM
                    </div>
                  </div>
                </div>
              </div>

              {/* RUTA 3 */}
              <div
                onClick={() => setSelectedRoute(3)}
                className={`p-3 rounded-2xl cursor-pointer transition border ${
                  selectedRoute === 3
                    ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      selectedRoute === 3
                        ? 'bg-[#0099ff] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    3
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-slate-900 font-extrabold text-lg leading-tight">
                        36 min
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Hora de llegada: {getEtaString(36)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      Bosque de la Reforma, Paseo de las Palmas, Paseo de la Reforma
                    </p>

                    <div className="text-[11px] text-slate-400 font-semibold mt-1">
                      9.5 KM
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel lateral */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-1">
            <span className="cursor-pointer hover:text-slate-800">Punto de salida</span>
            <span className="text-sky-600 border-b-2 border-sky-600 pb-0.5 cursor-pointer">
              Destino
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            Auditorio Nacional
          </div>
          <div className="text-xs text-slate-500 truncate">
            Paseo de la Reforma, Miguel Hidalgo
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ÁREA DEL MAPA: TRAZADO REAL DE RUTA + CONMUTADOR         */}
      {/* ======================================================== */}
      <div className="flex-1 h-full relative overflow-hidden bg-slate-100">
        {/* Selector flotante de modo de visualización en la esquina superior derecha */}
        <div className="absolute top-3 right-4 z-[1000] flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveMapMode('traced')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeMapMode === 'traced'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Ruta Trazada GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMapMode('wazeLive')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeMapMode === 'wazeLive'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Waze Tráfico en Vivo</span>
          </button>
        </div>

        {/* MODO 1: RUTA TRAZADA CON PRECISIÓN CARTOGRÁFICA EN LEAFLET */}
        {activeMapMode === 'traced' && (
          <div className="w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Tarjeta informativa flotante en la parte inferior */}
            <div className="absolute bottom-3 left-4 z-[1000] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl px-4 py-2 flex items-center gap-3 text-xs text-slate-800">
                <span className="w-3 h-3 rounded-full bg-purple-700 inline-block flex-shrink-0" />
                <span>
                  <strong className="text-purple-900">Ruta trazada exacta:</strong> Salida por Bosque de Duraznos ➔ Ahuehuetes ➔ Bosque de Reforma ➔ Fernando Alencastre ➔ Metro Auditorio Nacional.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MODO 2: WAZE LIVE MAP (FLUJO DE TRÁFICO EN TIEMPO REAL) */}
        {activeMapMode === 'wazeLive' && (
          <div className="w-full h-full relative">
            <iframe
              src={wazeLiveMapUrl}
              title="Waze Live Map CDMX"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
