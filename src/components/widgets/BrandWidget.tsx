import { useState, useEffect, useRef } from 'react';

interface BrandWidgetProps {
  brandName: string;
  slogan: string;
  logoUrl?: string;
}

export default function BrandWidget({ }: BrandWidgetProps) {
  const mediaItems = [
    { url: "https://i.imgur.com/ySks3l5.jpeg", type: "image" },
    { url: "https://i.imgur.com/vRF0xt6.jpeg", type: "image" },
    { url: "https://i.imgur.com/jFqOIyz.jpeg", type: "image" },
    { url: "https://i.imgur.com/SbYV58R.mp4", type: "video" },
    { url: "https://i.imgur.com/CENcd2M.mp4", type: "video" }
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
  };

  useEffect(() => {
    const currentItem = mediaItems[currentIndex];

    if (currentItem.type === 'image') {
      const timer = setTimeout(() => {
        handleNext();
      }, 8000);
      return () => clearTimeout(timer);
    } else if (currentItem.type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {mediaItems.map((item, index) => {
        const isCurrent = index === currentIndex;
        const commonClasses = `absolute w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
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
              className={commonClasses}
            />
          );
        }

        return (
          <img
            key={item.url}
            src={item.url}
            alt={`Brand ${index}`}
            className={commonClasses}
          />
        );
      })}
    </div>
  );
}
