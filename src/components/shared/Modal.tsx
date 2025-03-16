import React, { useEffect, useRef } from 'react';

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
  width = '70vw',
  height = '80vh',
  showCloseButton = true,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 按ESC键关闭模态框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // 防止点击内部内容时关闭模态框
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-[#141414] border border-[#282828] rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ width, height, maxWidth: '95vw', maxHeight: '90vh' }}
        onClick={handleModalClick}
      >
        {/* 模态框标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-[#0a0a0a]">
          <h2 className="text-lg font-semibold text-white flex items-center">
            {title}
          </h2>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#282828] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* 模态框内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {/* 模态框底部（如果有） */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#282828] bg-[#0a0a0a] flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;