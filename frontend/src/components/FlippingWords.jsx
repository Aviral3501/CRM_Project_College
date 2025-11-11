import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FlippingWords = ({ words, interval = 1800, className = "" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className={`inline-block perspective-1000 ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          initial={{ rotateX: 90, opacity: 0, y: -8 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: -90, opacity: 0, y: 8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-block origin-bottom bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default FlippingWords;
