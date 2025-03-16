import React, { useEffect, useRef } from 'react';

interface BaseModalProps {
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  title,
  onClose,
  children,
  width = '70vw',
  height = '80vh',
  showCloseButton = true,
  footer,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[var(--z-modal)] bg-[var(--bg-overlay)] backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className={`bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-lg shadow-xl flex flex-col overflow-hidden ${className}`}
        style={{ width, height, maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-base)] bg-[var(--bg-base)]">
          {title && <div className="text-lg font-semibold text-[var(--text-primary)]">{title}</div>}
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-[var(--border-base)] bg-[var(--bg-base)] flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  width,
  height,
  showCloseButton,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <BaseModal
      title={title}
      onClose={onClose}
      width={width}
      height={height}
      showCloseButton={showCloseButton}
      footer={footer}
    >
      {children}
    </BaseModal>
  );
};

export default Modal;