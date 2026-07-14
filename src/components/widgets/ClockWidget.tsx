import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function FlipNumber({ value }: { value: string | number }) {
  return (
    <AnimatePresence mode='wait'>
      <motion.span
        key={value}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = (time.getHours() % 12 || 12).toString();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="text-white flex flex-col items-center text-center">
      {/* Badge */}
      <div className="flex items-center gap-2 mb-4 bg-blue-950/50 px-3 py-1 rounded-full w-fit border border-blue-900">
        <div className="relative flex items-center justify-center">
            <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-blue-200">EN TIEMPO REAL</span>
      </div>

      {/* Time */}
      <div className="flex items-baseline gap-2 text-6xl font-bold font-sans tracking-tighter">
        <FlipNumber value={hours} />
        <span>:</span>
        <FlipNumber value={minutes} />
        <span className="text-2xl font-medium">{ampm}</span>
      </div>
      
      {/* Date */}
      <div className="text-xl font-medium text-slate-300 mt-1">
        {time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}
