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

interface ModalProps {
  title: string;
  onClose: () => void;
  onSave?: () => void; // 添加保存回调
  children: React.ReactNode;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  saveLabel?: string; // 添加保存按钮文本
  cancelLabel?: string; // 添加取消按钮文本
  disabled?: boolean; // 添加禁用状态
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
      className="fixed inset-0 flex items-center justify-center z-[var(--z-modal)] bg-[rgba(0,0,0,0.4)] backdrop-blur-md"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-[#0a0a0a] backdrop-blur-sm border border-[rgba(16,163,127,0.2)] rounded-lg shadow-xl flex flex-col overflow-hidden ${className}`}
        style={{ width, height, maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(16,163,127,0.2)] bg-[#141414] backdrop-filter backdrop-blur-sm">
          {title && <div className="text-lg font-semibold text-white">{title}</div>}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(16,163,127,0.1)] transition-colors text-[#b0b0b0] hover:text-[#10a37f]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a] backdrop-filter backdrop-blur-sm scrollbar-thin scrollbar-thumb-[#10a37f] scrollbar-track-[#1a1a1a]">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(16,163,127,0.2)] bg-[#141414] backdrop-filter backdrop-blur-sm flex justify-end space-x-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  onSave,
  children,
  width,
  height,
  showCloseButton,
  saveLabel = '保存',
  cancelLabel = '取消',
  disabled = false
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

  const footer = onSave ? (
    <>
      <button
        onClick={onClose}
        className="px-5 py-2.5 bg-[rgba(16,163,127,0.1)] hover:bg-[rgba(16,163,127,0.15)] border border-[rgba(16,163,127,0.2)] rounded-md text-sm font-medium text-[#10a37f] hover:text-[#0fd292] transition-all duration-200"
        disabled={disabled}
      >
        {cancelLabel}
      </button>
      <button
        onClick={onSave}
        className="px-5 py-2.5 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded-md text-sm font-medium transition-all duration-200 shadow-lg shadow-[rgba(16,163,127,0.25)] hover:shadow-[rgba(16,163,127,0.35)] hover:transform hover:translate-y-[-2px]"
        disabled={disabled}
      >
        {saveLabel}
      </button>
    </>
  ) : undefined;

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