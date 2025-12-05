'use client';

import { useEffect, useState, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({ 
  text, 
  speed = 30, 
  className = '',
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const mountedRef = useRef(true);

  // Actualizar ref cuando cambia
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Resetear cuando el texto cambia
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;
    mountedRef.current = true;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Si no hay texto, no hacer nada
    if (!text || text.length === 0) {
      return;
    }

    const typeNextChar = () => {
      if (!mountedRef.current) {
        return;
      }

      if (indexRef.current < text.length) {
        // Si encontramos un <br>, agregarlo completo
        if (text.substring(indexRef.current).startsWith('<br>')) {
          setDisplayedText(prev => prev + '<br>');
          indexRef.current += 4;
        }
        // Si encontramos un tag HTML, agregarlo completo
        else if (text[indexRef.current] === '<') {
          const tagEnd = text.indexOf('>', indexRef.current);
          if (tagEnd !== -1) {
            const tag = text.substring(indexRef.current, tagEnd + 1);
            setDisplayedText(prev => prev + tag);
            indexRef.current = tagEnd + 1;
          } else {
            setDisplayedText(prev => prev + text[indexRef.current]);
            indexRef.current++;
          }
        } else {
          setDisplayedText(prev => prev + text[indexRef.current]);
          indexRef.current++;
        }
        
        timeoutRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    // Iniciar la animación
    timeoutRef.current = setTimeout(typeNextChar, speed);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text, speed]);

  // Si el texto contiene HTML, usar dangerouslySetInnerHTML
  if (text.includes('<br>') || text.includes('<')) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ 
          __html: displayedText + (isComplete ? '' : '<span class="typewriter-cursor">_</span>') 
        }}
      />
    );
  }

  // Si es texto plano, renderizar normalmente
  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="typewriter-cursor">_</span>}
    </span>
  );
}
