import React from 'react';
import { ServiceProvider } from '../../../types/mcp';
import McpProviderCard from '../McpProviderCard';

interface McpProviderListProps {
  providers: ServiceProvider[];
  testingProvider: string | null;
  onTestConnection: (id: string) => void;
  onEditConfig: (provider: ServiceProvider) => void;
  onRemoveProvider: (id: string) => void;
  isLoading?: boolean;
}

const McpProviderList: React.FC<McpProviderListProps> = ({
  providers,
  testingProvider,
  onTestConnection,
  onEditConfig,
  onRemoveProvider,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="mcp-provider-list empty">
        <div className="loading-state">
          <svg className="loading-icon" viewBox="0 0 24 24">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
          <p>加载服务列表中...</p>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="mcp-provider-list empty">
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>暂无服务</p>
          <span>点击右上角的"添加服务"按钮开始添加</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mcp-provider-list">
      {providers.map(provider => (
        <McpProviderCard
          key={provider.id}
          provider={provider}
          isTestingConnection={testingProvider === provider.id}
          onTestConnection={onTestConnection}
          onEditConfig={onEditConfig}
          onRemoveProvider={onRemoveProvider}
        />
      ))}

      <style jsx>{`
        .mcp-provider-list {
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .mcp-provider-list.empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: #1a1a1a;
        }

        .empty-state, .loading-state {
          text-align: center;
          color: #888;
        }

        .empty-icon, .loading-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          color: #666;
        }

        .loading-icon {
          animation: spin 1s linear infinite;
        }

        .empty-state p, .loading-state p {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #e0e0e0;
        }

        .empty-state span {
          font-size: 14px;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .mcp-provider-list {
            padding: 16px;
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default McpProviderList;