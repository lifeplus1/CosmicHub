import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className='modal-overlay'
      role='dialog'
      aria-modal='true'
      aria-label={title ?? 'Modal dialog'}
      tabIndex={0}
      onClick={onClose}
      onKeyDown={e => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className='modal-content'
        role='document'
        onClick={e => e.stopPropagation()}
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
        }}
        tabIndex={0}
      >
        {title && <h2 className='modal-title'>{title}</h2>}
        {children}
        <button onClick={onClose} className='modal-close'>
          ×
        </button>
      </div>
    </div>
  );
};
