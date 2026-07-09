import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function InspirationWidget() {
  const [quote, setQuote] = useState({ text: 'La innovación distingue a los líderes de los seguidores.', author: 'Steve Jobs' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = () => {
      fetch('/api/quote')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          setQuote(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching quote, using fallback:', err);
          setLoading(false);
        });
    };

    fetchQuote();
    const timer = setInterval(fetchQuote, 30000);
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
