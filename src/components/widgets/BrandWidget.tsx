import { useState, useEffect, useRef } from 'react';
import TrafficSlide from './TrafficSlide';

interface BrandWidgetProps {
  brandName: string;
  slogan: string;
  logoUrl?: string;
}

function ScaledIframe({ url, isCurrent }: { url: string; isCurrent: boolean; key?: string | number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const baseWidth = 1200;
  const baseHeight = 980;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth === 0 || clientHeight === 0) return;
      
      const scaleX = (clientWidth - 16) / baseWidth;
      const scaleY = (clientHeight - 16) / baseHeight;
      const fittedScale = Math.min(scaleX, scaleY);
      setScale(fittedScale > 0 ? fittedScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-white transition-opacity duration-1000 ease-in-out ${
        isCurrent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="flex-shrink-0 flex items-center justify-center"
      >
        <iframe
          src={url}
          title="Ranking SmartLearning"
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

function checkIsTrafficSchedule(): boolean {
  const now = new Date();
  const day = now.getDay(); // 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes
  if (day < 1 || day > 5) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= (17 * 60 + 30) && minutes < (18 * 60 + 30); // 17:30 a 18:30 (5:30 PM a 6:30 PM)
}

export default function BrandWidget({ }: BrandWidgetProps) {
  const [isTrafficActive, setIsTrafficActive] = useState<boolean>(checkIsTrafficSchedule);

  // Evaluar periódicamente si entra o sale de la ventana 17:30 - 18:30 de Lunes a Viernes
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTrafficActive(prev => {
        const next = checkIsTrafficSchedule();
        return prev !== next ? next : prev;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const yearStr = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const todayMonthDayStr = `${monthStr}-${dayStr}`;

  const allMediaItems: Array<{
    url: string;
    type: 'image' | 'video' | 'iframe' | 'traffic';
    duration?: number;
    allowedDays?: number[];
    exactDate?: string;
  }> = [
    { url: "https://i.imgur.com/ySks3l5.jpeg", type: "image" as const, duration: 8000 },
    { url: "https://i.imgur.com/DmKabUd.jpeg", type: "image" as const, duration: 8000, exactDate: "2026-10-05" }, // Solo 5 de Octubre
    { url: "https://i.imgur.com/GzPdH1r.png", type: "image" as const, duration: 8000, allowedDays: [1] }, // 1 = Lunes
    { url: "https://i.imgur.com/mn6bxkA.png", type: "image" as const, duration: 8000, allowedDays: [2] }, // 2 = Martes
    { url: "https://i.imgur.com/Gk24c7A.png", type: "image" as const, duration: 8000, allowedDays: [4] }, // 4 = Jueves
    // Waze Tráfico: solo visible si está en horario (Lunes a Viernes de 5:30 PM a 6:30 PM)
    ...(isTrafficActive ? [
      { url: "traffic-bosques-auditorio", type: "traffic" as const, duration: 45000 }
    ] : []),
    { url: "https://i.imgur.com/CENcd2M.mp4", type: "video" as const },
    { url: "https://i.imgur.com/0rI0Sl2.mp4", type: "video" as const },
    { url: "https://smartlearning.business/public/ranking", type: "iframe" as const, duration: 20000 } // Ranking (20 seg)
  ];

  const mediaItems = allMediaItems.filter((item) => {
    // Si tiene fecha exacta especificada (ej. '2026-10-05' o '10-05')
    if (item.exactDate) {
      if (item.exactDate !== todayDateStr && item.exactDate !== todayMonthDayStr) {
        return false;
      }
    }

    // Si tiene días de la semana especificados (0: Domingo, 1: Lunes, etc.)
    if (item.allowedDays && !item.allowedDays.includes(currentDayOfWeek)) {
      return false;
    }

    return true;
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
  };

  useEffect(() => {
    if (currentIndex >= mediaItems.length) {
      setCurrentIndex(0);
      return;
    }

    const currentItem = mediaItems[currentIndex];
    if (!currentItem) return;

    if (currentItem.type === 'image' || currentItem.type === 'iframe' || currentItem.type === 'traffic') {
      const duration = currentItem.duration || (currentItem.type === 'image' ? 8000 : 20000);
      const timer = setTimeout(() => {
        handleNext();
      }, duration);
      return () => clearTimeout(timer);
    } else if (currentItem.type === 'video') {
      // Temporizador de respaldo por si el video no dispara onEnded
      const fallbackTimer = setTimeout(() => {
        handleNext();
      }, 45000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [currentIndex, mediaItems.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {mediaItems.map((item, index) => {
        const isCurrent = index === currentIndex;
        const commonClasses = `absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
          isCurrent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`;

        if (item.type === 'traffic') {
          return (
            <TrafficSlide
              key="traffic-bosques-auditorio"
              isCurrent={isCurrent}
            />
          );
        }

        if (item.type === 'video') {
          return (
            <video
              key={item.url}
              src={item.url}
              muted
              playsInline
              onEnded={() => {
                if (isCurrent) {
                  handleNext();
                }
              }}
              ref={(el) => {
                if (el) {
                  if (isCurrent) {
                    el.currentTime = 0;
                    el.play().catch(() => {});
                  } else {
                    el.pause();
                    el.currentTime = 0;
                  }
                }
              }}
              className={`${commonClasses} object-contain`}
            />
          );
        }

        if (item.type === 'iframe') {
          return (
            <ScaledIframe
              key={item.url}
              url={item.url}
              isCurrent={isCurrent}
            />
          );
        }

        return (
          <img
            key={item.url}
            src={item.url}
            alt={`Brand ${index}`}
            className={`${commonClasses} object-contain`}
          />
        );
      })}
    </div>
  );
}
