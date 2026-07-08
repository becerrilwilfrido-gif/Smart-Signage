import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const quotes = [
  { text: "La innovación distingue a los líderes de los seguidores.", author: "Steve Jobs" },
  { text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", author: "Robert Collier" },
  { text: "Tu tiempo es limitado, así que no lo desperdicies viviendo la vida de alguien más.", author: "Steve Jobs" }
];

export default function QuoteWidget() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 10000); // 10 seconds for testing purposes
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-white h-full flex flex-col justify-center px-4">
      <AnimatePresence mode='wait'>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="text-lg italic">"{quotes[index].text}"</p>
          <p className="text-sm mt-2 font-bold">- {quotes[index].author}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
