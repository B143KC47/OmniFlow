import React, { useEffect, useRef } from 'react';

interface McpModalProps {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

const McpModal: React.FC<McpModalProps> = ({
  title,
  onClose,
  footer,
  children,
  maxWidth = '600px'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock background scrolling
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Handle modal content scrolling
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      contentRef.current.classList.toggle('scrolled-top', scrollTop > 0);
      contentRef.current.classList.toggle('scrolled-bottom', scrollTop + clientHeight < scrollHeight);
    }
  };

  return (
    <div className="mcp-modal-overlay" onClick={handleOverlayClick}>
      <div className="mcp-modal" ref={modalRef} style={{ maxWidth }}>
        <div className="mcp-modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div 
          className="mcp-modal-content" 
          ref={contentRef}
          onScroll={handleScroll}
        >
          {children}
        </div>
        
        {footer && (
          <div className="mcp-modal-footer">
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        .mcp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .mcp-modal {
          background: #1a1a1a;
          border-radius: 8px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          border: 1px solid #282828;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.3s ease-out;
        }

        .mcp-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #282828;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .mcp-modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
          color: #e0e0e0;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          padding: 6px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #282828;
          color: #e0e0e0;
        }

        .mcp-modal-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
          position: relative;
        }

        .mcp-modal-content.scrolled-top::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%);
          pointer-events: none;
        }

        .mcp-modal-content.scrolled-bottom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%);
          pointer-events: none;
        }

        .mcp-modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #282828;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .mcp-modal-overlay {
            padding: 16px;
          }

          .mcp-modal {
            max-height: calc(100vh - 32px);
          }
        }
      `}</style>
    </div>
  );
};

export default McpModal;