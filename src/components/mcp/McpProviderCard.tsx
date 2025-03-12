import React, { useState, useEffect } from 'react';
import { ServiceProvider } from '../../types/mcp';
import { ProviderIcon, StatusIcon } from '../icons/McpIcons';
import McpFeedback from './shared/McpFeedback';

interface McpProviderCardProps {
  provider: ServiceProvider;
  isTestingConnection: boolean;
  onTestConnection: (id: string) => void;
  onEditConfig: (provider: ServiceProvider) => void;
  onRemoveProvider: (id: string) => void;
}

const McpProviderCard: React.FC<McpProviderCardProps> = ({
  provider,
  isTestingConnection,
  onTestConnection,
  onEditConfig,
  onRemoveProvider,
}) => {
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // 监听提供商状态变化来更新反馈
  useEffect(() => {
    if (!isTestingConnection && provider.status) {
      if (provider.status === 'connected') {
        setFeedback({ message: '连接成功', type: 'success' });
      } else if (provider.status === 'error') {
        setFeedback({ message: '连接失败', type: 'error' });
      }
    }
  }, [provider.status, isTestingConnection]);

  // 处理测试连接点击
  const handleTestClick = () => {
    setFeedback(null);
    onTestConnection(provider.id);
  };

  // 确认删除
  const handleRemoveClick = () => {
    if (window.confirm(`确定要删除 "${provider.name}" 服务吗？`)) {
      onRemoveProvider(provider.id);
    }
  };

  return (
    <div className={`mcp-provider-card ${provider.status}`}>
      <div className="mcp-provider-header">
        <div className="mcp-provider-icon">
          <ProviderIcon provider={provider.icon || ''} />
        </div>
        <div className="mcp-provider-title">
          <h3>{provider.name}</h3>
          <div className="mcp-provider-status">
            <StatusIcon status={provider.status} />
            <span>
              {provider.status === 'connected' ? '已连接' :
               provider.status === 'error' ? '连接错误' : '未连接'}
            </span>
          </div>
        </div>
      </div>

      <div className="mcp-provider-desc">
        {provider.description}
      </div>

      {feedback && (
        <div className="mcp-provider-feedback">
          <McpFeedback
            {...feedback}
            onDismiss={() => setFeedback(null)}
          />
        </div>
      )}

      <div className="mcp-provider-actions">
        <button
          className={`mcp-action-btn ${isTestingConnection ? 'testing' : ''}`}
          onClick={handleTestClick}
          disabled={isTestingConnection}
        >
          {isTestingConnection ? '测试中...' : '测试连接'}
        </button>
        <button
          className="mcp-action-btn"
          onClick={() => onEditConfig(provider)}
        >
          配置
        </button>
        {provider.id.startsWith('custom-') && (
          <button
            className="mcp-action-btn delete"
            onClick={handleRemoveClick}
          >
            删除
          </button>
        )}
      </div>

      <style jsx>{`
        .mcp-provider-card {
          background: #1a1a1a;
          border-radius: 6px;
          border: 1px solid #333;
          padding: 16px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
        
        .mcp-provider-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .mcp-provider-card.connected {
          border-color: #10a37f;
        }
        
        .mcp-provider-card.error {
          border-color: #e91e63;
        }
        
        .mcp-provider-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .mcp-provider-icon {
          width: 36px;
          height: 36px;
          background: #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10a37f;
        }
        
        .mcp-provider-title {
          flex: 1;
        }
        
        .mcp-provider-title h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
        }
        
        .mcp-provider-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #888;
        }
        
        .mcp-provider-desc {
          font-size: 13px;
          color: #aaa;
          margin-bottom: 16px;
          flex: 1;
        }

        .mcp-provider-feedback {
          margin-bottom: 16px;
        }
        
        .mcp-provider-actions {
          display: flex;
          gap: 8px;
        }
        
        .mcp-action-btn {
          flex: 1;
          background: #282828;
          border: 1px solid #333;
          color: #e0e0e0;
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mcp-action-btn:hover {
          background: #333;
        }
        
        .mcp-action-btn.testing {
          background-color: #10a37f;
          border-color: #10a37f;
          color: white;
        }
        
        .mcp-action-btn.delete {
          color: #e91e63;
        }
        
        .mcp-action-btn.delete:hover {
          background: rgba(233, 30, 99, 0.1);
        }
        
        .mcp-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default McpProviderCard;