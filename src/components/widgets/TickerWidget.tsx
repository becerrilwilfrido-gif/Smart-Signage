import { useState, useEffect } from 'react';

function TickerSkeleton() {
  return (
    <div className="w-full bg-blue-900 py-6 overflow-hidden border-t border-slate-700">
      <div className="animate-pulse w-1/2 h-8 bg-slate-700 rounded mx-4"></div>
    </div>
  );
}

export default function TickerWidget() {
  const [loading, setLoading] = useState(true);
  const text = "Bienvenido a BSD";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <TickerSkeleton />;

  return (
    <div className="w-full bg-blue-900 text-white py-6 overflow-hidden whitespace-nowrap border-t border-slate-700">
      <div className="animate-marquee inline-block min-w-full">
        <span className="text-3xl font-bold">{text}</span>
      </div>
    </div>
  );
}
