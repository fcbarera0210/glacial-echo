'use client';

interface ConfirmModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: string;
}

export default function ConfirmModal({
  isVisible,
  title,
  message,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  onConfirm,
  onCancel,
  confirmColor = 'var(--accent-red)'
}: ConfirmModalProps) {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay visible" onClick={onCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-title" style={{ color: confirmColor }}>
          {title}
        </div>
        <div className="confirm-modal-message">
          {message}
        </div>
        <div className="confirm-modal-buttons">
          <button
            className="btn-primary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            {cancelText}
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            style={{ 
              flex: 1,
              borderColor: confirmColor,
              color: confirmColor
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

