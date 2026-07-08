import { useState, useEffect } from 'react';

export default function TickerWidget() {
  const [avisos, setAvisos] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/ticker')
      .then((res) => res.json())
      .then((data) => setAvisos(data.announcements))
      .catch((err) => console.error('Error fetching ticker:', err));
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div className="w-full bg-blue-900 text-white py-4 overflow-hidden whitespace-nowrap border-t border-slate-700">
      <div className="inline-block animate-marquee min-w-full">
        {avisos.join(' | ')} | {avisos.join(' | ')}
      </div>
    </div>
  );
}
