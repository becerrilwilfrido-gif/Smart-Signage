import { motion } from 'motion/react';

export default function TickerWidget() {
  return (
    <div className="w-full bg-blue-900 text-white py-5 overflow-hidden whitespace-nowrap border-t border-slate-700 relative flex items-center h-16">
      <motion.div
        initial={{ x: '100vw' }}
        animate={{ x: '-100%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 26,
          ease: 'linear',
        }}
        className="inline-block whitespace-nowrap absolute left-0"
      >
        <span className="text-2xl lg:text-3xl font-bold tracking-wide">
          ¡Bienvenidos a BSD SmartPayroll! &nbsp;•&nbsp; Donde tu talento nos impulsa a crecer juntos.
        </span>
      </motion.div>
    </div>
  );
}
