import { useState, useEffect, useRef } from 'react';

interface BrandWidgetProps {
  brandName: string;
  slogan: string;
  logoUrl?: string;
}

function ScaledIframe({ url, isCurrent }: { url: string; isCurrent: boolean }) {
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

export default function BrandWidget({ }: BrandWidgetProps) {
  const allMediaItems: Array<{
    url: string;
    type: 'image' | 'video' | 'iframe';
    duration?: number;
    allowedDays?: number[];
    exactDate?: string;
  }> = [
    { url: "https://i.imgur.com/ySks3l5.jpeg", type: "image" as const, duration: 8000 },
    { url: "https://i.imgur.com/DmKabUd.jpeg", type: "image" as const, duration: 8000, exactDate: "2026-10-05" }, // Solo 5 de Octubre
    { url: "https://i.imgur.com/GzPdH1r.png", type: "image" as const, duration: 8000, allowedDays: [1] }, // 1 = Lunes (Monday)
    { url: "https://i.imgur.com/mn6bxkA.png", type: "image" as const, duration: 8000, allowedDays: [2] }, // 2 = Martes (Tuesday)
    { url: "https://i.imgur.com/Gk24c7A.png", type: "image" as const, duration: 8000, allowedDays: [4] }, // 4 = Jueves (Thursday)
    { url: "https://i.imgur.com/CENcd2M.mp4", type: "video" as const },
    { url: "https://i.imgur.com/0rI0Sl2.mp4", type: "video" as const },
    { url: "https://smartlearning.business/public/ranking", type: "iframe" as const, duration: 20000 }
  ];

  // Fecha y día actuales para programación dinámica
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const yearStr = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const dayStr = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;
  const todayMonthDayStr = `${monthStr}-${dayStr}`;

  const mediaItems = allMediaItems.filter((item) => {
    // Si tiene fecha exacta especificada (ej. '2026-10-05' o '10-05'), solo se muestra en esa fecha
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
  const videoRef = useRef<HTMLVideoElement>(null);

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

    if (currentItem.type === 'image' || currentItem.type === 'iframe') {
      const duration = currentItem.duration || (currentItem.type === 'iframe' ? 20000 : 8000);
      const timer = setTimeout(() => {
        handleNext();
      }, duration);
      return () => clearTimeout(timer);
    } else if (currentItem.type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, mediaItems]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {mediaItems.map((item, index) => {
        const isCurrent = index === currentIndex;
        const commonClasses = `absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
          isCurrent ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`;

        if (item.type === 'video') {
          return (
            <video
              key={item.url}
              ref={isCurrent ? videoRef : null}
              src={item.url}
              autoPlay
              muted
              playsInline
              onEnded={handleNext}
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
