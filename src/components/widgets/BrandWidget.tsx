import { useState, useEffect } from 'react';

interface BrandWidgetProps {
  brandName: string;
  slogan: string;
  logoUrl?: string;
}

export default function BrandWidget({ }: BrandWidgetProps) {
  const images = [
    "https://i.imgur.com/ySks3l5.jpeg",
    "https://i.imgur.com/aSkQKYQ.jpeg",
    "https://i.imgur.com/bDg8eQn.jpeg"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full max-w-[800px] h-[600px] flex items-center justify-center">
      {images.map((img, index) => (
        <img
          key={img}
          src={img}
          alt={`Brand ${index}`}
          className={`absolute w-full h-full object-contain p-4 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
