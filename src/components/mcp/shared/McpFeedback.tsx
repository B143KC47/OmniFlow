import React, { useEffect } from 'react';

interface McpFeedbackProps {
  message: string;
  type: 'success' | 'error';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissTimeout?: number;
}

const McpFeedback: React.FC<McpFeedbackProps> = ({
  message,
  type,
  onDismiss,
  autoDismiss = true,
  dismissTimeout = 3000,
}) => {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, dismissTimeout);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, dismissTimeout]);

  return (
    <div className={`mcp-feedback ${type}`}>
      <div className="feedback-icon">
        {type === 'success' ? (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="feedback-message">{message}</span>
      {onDismiss && (
        <button className="dismiss-btn" onClick={onDismiss}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      <style jsx>{`
        .mcp-feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 13px;
          animation: slideIn 0.3s ease-out;
        }

        .mcp-feedback.success {
          background-color: rgba(16, 163, 127, 0.1);
          border: 1px solid rgba(16, 163, 127, 0.2);
          color: #10a37f;
        }

        .mcp-feedback.error {
          background-color: rgba(233, 30, 99, 0.1);
          border: 1px solid rgba(233, 30, 99, 0.2);
          color: #e91e63;
        }

        .feedback-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .feedback-message {
          flex: 1;
          line-height: 1.4;
        }

        .dismiss-btn {
          width: 16px;
          height: 16px;
          padding: 0;
          background: none;
          border: none;
          color: currentColor;
          opacity: 0.6;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .dismiss-btn:hover {
          opacity: 1;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default McpFeedback;