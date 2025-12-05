'use client';

interface LogEntry {
  text: string;
  type: string;
  timestamp: string;
}

interface GameOverModalProps {
  isVisible: boolean;
  title: string;
  description: string;
  titleColor?: string;
  logEntries: LogEntry[];
  onRestart: () => void;
}

export default function GameOverModal({
  isVisible,
  title,
  description,
  titleColor = 'var(--text-primary)',
  logEntries,
  onRestart
}: GameOverModalProps) {
  if (!isVisible) return null;

  const exportLog = () => {
    // Convertir el log a texto plano
    const logText = logEntries.map(entry => {
      // Remover HTML tags y convertir <br> a saltos de línea
      const cleanText = entry.text
        .replace(/<br>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      
      return `[${entry.timestamp}] ${cleanText}`;
    }).join('\n\n');

    // Crear el contenido del archivo
    const fullLog = `GLACIAL_ECHO.EXE - LOG DE PARTIDA\n` +
      `==========================================\n\n` +
      `FINAL: ${title}\n` +
      `${description.replace(/<[^>]*>/g, '').replace(/<br>/gi, '\n')}\n\n` +
      `==========================================\n` +
      `LOG COMPLETO DE LA PARTIDA\n` +
      `==========================================\n\n` +
      logText;

    // Crear y descargar el archivo
    const blob = new Blob([fullLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glacial-echo-log-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-content">
        <h2 className="modal-title" style={{ color: titleColor }}>
          {title}
        </h2>
        <div 
          className="modal-description" 
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto', width: '100%' }}>
          <button 
            className="btn-primary" 
            onClick={exportLog}
          >
            EXPORTAR LOG (.TXT)
          </button>
          <button 
            className="btn-primary" 
            onClick={onRestart}
          >
            REINICIAR SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
}
