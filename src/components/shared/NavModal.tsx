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
        <div className="flex items-center justify-between p-4 border-b border-[#282828] bg-[#0c0c0c]">
          <div className="flex items-center">
            <div className="text-[#10a37f] mr-3">
              {icon}
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors text-[#666] hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        <div className="border-t border-[#282828] p-4 flex justify-end bg-[#0c0c0c]">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-[#10a37f] hover:bg-[#0fd292] text-white font-medium rounded transition-all duration-200 shadow-lg shadow-[#10a37f]/20 flex items-center"
          >
            关闭
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        .nav-modal {
          transform: scale(0.95);
          opacity: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        
        .nav-modal-active {
          transform: scale(1);
          opacity: 1;
        }
        
        .nav-modal-backdrop {
          animation: fadeIn 0.2s ease forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NavModal;