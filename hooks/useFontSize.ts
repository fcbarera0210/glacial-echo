'use client';

import { useState, useEffect } from 'react';

const FONT_SIZE_KEY = 'glacial-echo-font-size';
const DEFAULT_FONT_SIZE = 1;
const MIN_FONT_SIZE = 0.8;
const MAX_FONT_SIZE = 1.5;
const STEP = 0.1;

export function useFontSize() {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      if (saved) {
        const size = parseFloat(saved);
        if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
          setFontSize(size);
          document.documentElement.style.setProperty('--font-size-multiplier', size.toString());
        }
      } else {
        document.documentElement.style.setProperty('--font-size-multiplier', DEFAULT_FONT_SIZE.toString());
      }
    }
  }, []);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + STEP, MAX_FONT_SIZE);
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_SIZE_KEY, newSize.toString());
      document.documentElement.style.setProperty('--font-size-multiplier', newSize.toString());
    }
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - STEP, MIN_FONT_SIZE);
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FONT_SIZE_KEY, newSize.toString());
      document.documentElement.style.setProperty('--font-size-multiplier', newSize.toString());
    }
  };

  return { fontSize, increaseFontSize, decreaseFontSize };
}

