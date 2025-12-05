'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import TypewriterText from './TypewriterText';

interface LogEntry {
  text: string;
  type: string;
  timestamp: string;
}

interface LogPanelProps {
  entries: LogEntry[];
  onJournalSubmit: (text: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export default function LogPanel({ entries, onJournalSubmit, textareaRef: externalTextareaRef }: LogPanelProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef || internalTextareaRef;
  const [animatingEntries, setAnimatingEntries] = useState<Set<number>>(new Set());
  const previousEntriesLengthRef = useRef(0);
  const completedEntriesRef = useRef<Set<number>>(new Set());

  // Callback estable para completar animación
  const handleAnimationComplete = useCallback((index: number) => {
    setAnimatingEntries(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
    completedEntriesRef.current.add(index);
  }, []);

  // Detectar nuevas entradas y marcarlas para animación
  useEffect(() => {
    if (entries.length > previousEntriesLengthRef.current) {
      const newIndices = new Set<number>();
      for (let i = previousEntriesLengthRef.current; i < entries.length; i++) {
        newIndices.add(i);
      }
      setAnimatingEntries(prev => {
        const combined = new Set(prev);
        newIndices.forEach(idx => combined.add(idx));
        return combined;
      });
    } else if (previousEntriesLengthRef.current === 0 && entries.length > 0) {
      // Primera carga: animar todas las entradas iniciales
      const initialIndices = new Set<number>();
      for (let i = 0; i < entries.length; i++) {
        initialIndices.add(i);
      }
      setAnimatingEntries(initialIndices);
    }
    previousEntriesLengthRef.current = entries.length;
  }, [entries.length]);

  // Scroll automático cuando se agregan nuevas entradas
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries.length, animatingEntries]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = textareaRef.current?.value.trim();
      if (text) {
        onJournalSubmit(text);
        if (textareaRef.current) {
          textareaRef.current.value = '';
        }
      }
    }
  };

  const handleLogDoubleClick = (entry: LogEntry) => {
    if (textareaRef.current) {
      // Remover cualquier prefijo que empiece con ">"
      let text = entry.text;
      // Remover cualquier prefijo que empiece con ">" seguido de cualquier texto hasta ":"
      text = text.replace(/^>\s*[^:]*:\s*/i, '');
      // También remover prefijos que solo tienen ">" sin ":"
      text = text.replace(/^>\s+/i, '');
      // Remover HTML tags si existen
      text = text.replace(/<[^>]*>/g, '');
      // Remover <br> y reemplazar por espacios
      text = text.replace(/<br\s*\/?>/gi, ' ');
      // Limpiar espacios múltiples
      text = text.replace(/\s+/g, ' ').trim();
      
      textareaRef.current.value = text;
      textareaRef.current.focus();
    }
  };

  return (
    <div className="log-panel">
      <div className="log-output" ref={logRef}>
        {entries.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Esperando inicio del sistema...
          </div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={`entry-${index}-${entry.timestamp}`}
              className={`log-entry ${entry.type}`}
              onDoubleClick={() => handleLogDoubleClick(entry)}
              style={{ cursor: 'pointer' }}
              title="Doble click para copiar a bitácora"
            >
              <span className="timestamp">{entry.timestamp}</span>{' '}
              {animatingEntries.has(index) && !completedEntriesRef.current.has(index) ? (
                <TypewriterText 
                  key={`typewriter-${index}-${entry.timestamp}`}
                  text={entry.text} 
                  speed={index === 0 ? 20 : 30}
                  onComplete={() => handleAnimationComplete(index)}
                />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: entry.text }} />
              )}
            </div>
          ))
        )}
      </div>
      
      <textarea
        ref={textareaRef}
        className="journal-input"
        placeholder="Escribe tu entrada de bitácora aquí..."
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
