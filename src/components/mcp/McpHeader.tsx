import React from 'react';
import { useTranslation, Trans } from '../../utils/i18n';

interface McpHeaderProps {
  onClose?: () => void;
}

const McpHeader: React.FC<McpHeaderProps> = ({ onClose }) => {
  const { t } = useTranslation();
  
  return (
    <div className="mcp-header">
      <h2><Trans id="mcp.header.title" /></h2>
      <button 
        className="mcp-close-btn" 
        onClick={onClose} 
        aria-label={t("mcp.header.close")}
      >×</button>
      
      <style jsx>{`
        .mcp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #282828;
        }
        
        .mcp-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .mcp-close-btn {
          background: transparent;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .mcp-close-btn:hover {
          background: #1a1a1a;
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default McpHeader;