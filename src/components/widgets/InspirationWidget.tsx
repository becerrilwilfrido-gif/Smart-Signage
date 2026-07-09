import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function InspirationWidget() {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const fetchQuote = () => {
      fetch('/api/quote')
        .then((res) => res.json())
        .then((data) => setQuote(data))
        .catch((err) => console.error('Error fetching quote:', err));
    };

    fetchQuote();
    const timer = setInterval(fetchQuote, 60000); // Fetch a new quote every minute
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
