import React, { useEffect, useRef } from 'react';

interface BaseModalProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  title,
  icon,
  onClose,
  children,
  maxWidth = '900px',
  footer,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 处理ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-[#0a0a0a] border border-[#282828] rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ maxWidth, width: '100%', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-[#0e0e0e]">
          <h2 className="text-lg font-semibold text-white flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h2>
          {showCloseButton && (
            <button 
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-1 rounded-full hover:bg-[#1a1a1a]"
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
          <div className="px-6 py-4 border-t border-[#282828] bg-[#0e0e0e] flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseModal;