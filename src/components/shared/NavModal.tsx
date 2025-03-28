import React, { useEffect, useRef } from 'react';

interface NavModalProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const NavModal: React.FC<NavModalProps> = ({
  title,
  icon,
  onClose,
  children,
  maxWidth = '900px'
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
    
    // 延迟一下添加事件处理，避免打开模态框时立即关闭
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // 打开时添加动画类
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.classList.add('nav-modal-active');
      }
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 nav-modal-backdrop">
      <div 
        ref={modalRef}
        className="nav-modal bg-[#0a0a0a] border border-[#282828] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth, width: '100%', maxHeight: '90vh' }}
      >
        {/* 模态框标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282828] bg-[#0e0e0e]">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <span className="w-5 h-5 mr-2 text-[#10a37f]">{icon}</span>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default NavModal;