import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const INSPIRATIONAL_QUOTES = [
  { text: 'La innovación distingue a los líderes de los seguidores.', author: 'Steve Jobs' },
  { text: 'La creatividad es la inteligencia divirtiéndose.', author: 'Albert Einstein' },
  { text: 'El único modo de hacer un gran trabajo es amar lo que haces.', author: 'Steve Jobs' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
  { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
  { text: 'La excelencia no es un acto, es un hábito.', author: 'Aristóteles' },
  { text: 'El futuro pertenece a quienes creen en la belleza de sus sueños.', author: 'Eleanor Roosevelt' },
  { text: 'Trabajar duro por algo que no nos interesa se llama estrés; trabajar duro por algo que amamos se llama pasión.', author: 'Simon Sinek' }
];

export default function InspirationWidget() {
  const [quote, setQuote] = useState(INSPIRATIONAL_QUOTES[0]);

  useEffect(() => {
    let quoteIndex = 0;

    const updateQuote = async () => {
      try {
        const res = await fetch('/api/quote');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && typeof data.text === 'string' && typeof data.author === 'string') {
            setQuote(data);
            return;
          }
        }
      } catch {
        // Fall back gracefully to internal quotes without throwing or logging errors
      }

      quoteIndex = (quoteIndex + 1) % INSPIRATIONAL_QUOTES.length;
      setQuote(INSPIRATIONAL_QUOTES[quoteIndex]);
    };

    updateQuote();
    const timer = setInterval(updateQuote, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-white h-full flex flex-col justify-center px-4">
      <AnimatePresence mode='wait'>
        <motion.div
          key={quote.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="text-lg italic">"{quote.text}"</p>
          <p className="text-sm mt-2 font-bold">- {quote.author}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
