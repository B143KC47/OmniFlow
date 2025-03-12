import React, { useEffect } from 'react';
import { useMcpManager } from './mcp/hooks/useMcpManager';
import McpHeader from './mcp/McpHeader';
import McpToolbar from './mcp/McpToolbar';
import McpProviderList from './mcp/components/McpProviderList';
import McpAddDialog from './mcp/McpAddDialog';
import McpConfigDialog from './mcp/McpConfigDialog';

interface McpManagerProps {
  onClose?: () => void;
}

const McpManager: React.FC<McpManagerProps> = ({ onClose }) => {
  const {
    searchTerm,
    selectedCategory,
    testingProvider,
    isAddingProvider,
    isEditingConfig,
    activeProvider,
    configJson,
    newProviderData,
    filteredProviders,
    lastOperationStatus,
    setSearchTerm,
    setSelectedCategory,
    handleConnectionTest,
    handleSubmitNewProvider,
    handleEditConfig,
    handleSaveConfig,
    handleRemoveProvider,
    handleCancelAddProvider,
    handleCancelEditConfig,
    clearOperationStatus,
    setIsAddingProvider,
    setNewProviderData,
    setConfigJson,
  } = useMcpManager();

  // 自动清除状态信息
  useEffect(() => {
    if (lastOperationStatus) {
      const timer = setTimeout(clearOperationStatus, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastOperationStatus, clearOperationStatus]);

  return (
    <div className="mcp-manager">
      <McpHeader onClose={onClose} />
      
      <McpToolbar 
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        onAddProvider={() => setIsAddingProvider(true)}
      />
      
      {lastOperationStatus && (
        <div className={`operation-status ${lastOperationStatus.type}`}>
          <div className="status-icon">
            {lastOperationStatus.type === 'success' ? (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="status-message">{lastOperationStatus.message}</span>
        </div>
      )}
      
      <McpProviderList
        providers={filteredProviders}
        testingProvider={testingProvider}
        onTestConnection={handleConnectionTest}
        onEditConfig={handleEditConfig}
        onRemoveProvider={handleRemoveProvider}
      />

      {isAddingProvider && (
        <McpAddDialog
          providerData={newProviderData}
          configJson={configJson}
          onCancel={handleCancelAddProvider}
          onSubmit={handleSubmitNewProvider}
          onProviderDataChange={setNewProviderData}
          onConfigJsonChange={setConfigJson}
        />
      )}

      {isEditingConfig && activeProvider && (
        <McpConfigDialog
          provider={activeProvider}
          configJson={configJson}
          onCancel={handleCancelEditConfig}
          onSubmit={handleSaveConfig}
          onConfigJsonChange={setConfigJson}
        />
      )}

      <style jsx>{`
        .mcp-manager {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #141414;
          color: #e0e0e0;
        }

        .operation-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          margin: 0 20px;
          border-radius: 4px;
          animation: slideIn 0.3s ease-out;
        }

        .operation-status.success {
          background: rgba(16, 163, 127, 0.1);
          color: #10a37f;
        }

        .operation-status.error {
          background: rgba(233, 30, 99, 0.1);
          color: #e91e63;
        }

        .status-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .status-message {
          font-size: 14px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default McpManager;