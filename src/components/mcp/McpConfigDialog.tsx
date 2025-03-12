import React, { useEffect, useState } from 'react';
import { ServiceProvider } from '../../types/mcp';
import McpModal from './shared/McpModal';
import McpFormGroup, { formControlStyles, buttonStyles, ConfigEditor } from './shared/McpFormGroup';
import { useConfigDialog } from './hooks/useConfigDialog';

interface McpConfigDialogProps {
  provider: ServiceProvider;
  configJson: string;
  onCancel: () => void;
  onSubmit: () => void;
  onConfigJsonChange: (json: string) => void;
}

const McpConfigDialog: React.FC<McpConfigDialogProps> = ({
  provider,
  configJson: initialConfigJson,
  onCancel,
  onSubmit,
  onConfigJsonChange,
}) => {
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 创建初始配置对象
  const initialConfig = React.useMemo(() => {
    // 首选尝试使用传入的 initialConfigJson
    if (initialConfigJson) {
      try {
        return JSON.parse(initialConfigJson);
      } catch (e) {
        console.error('解析配置JSON失败:', e);
      }
    }
    
    // 回退到 provider.config
    return provider.config || {
      apiKey: provider.apiKey || '',
      endpoint: provider.endpoint || '',
      options: provider.options || {}
    };
  }, [initialConfigJson, provider]);

  const {
    configJson,
    isValid,
    error,
    handleJsonChange,
    validateJson
  } = useConfigDialog(initialConfig);

  // 当本地 configJson 状态变化时，同步更新父组件状态
  useEffect(() => {
    onConfigJsonChange(configJson);
  }, [configJson, onConfigJsonChange]);

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (validateJson()) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    setSubmitAttempted(false);
    onCancel();
  };

  const renderFooter = () => (
    <>
      <button className="mcp-cancel-btn" onClick={handleCancel}>取消</button>
      <button 
        className="mcp-submit-btn" 
        onClick={handleSubmit}
        disabled={!isValid}
      >
        保存
      </button>
    </>
  );

  return (
    <McpModal
      title={`编辑 ${provider.name} 配置`}
      onClose={handleCancel}
      footer={renderFooter()}
    >
      <McpFormGroup 
        label="配置 (JSON格式)" 
        error={submitAttempted && error ? error : undefined}
      >
        <ConfigEditor
          value={configJson}
          onChange={handleJsonChange}
          hasError={!!error && submitAttempted}
        />
      </McpFormGroup>

      <style jsx>{`
        .mcp-submit-btn {
          ${buttonStyles.primary}
          min-width: 80px;
        }

        .mcp-cancel-btn {
          ${buttonStyles.secondary}
          min-width: 80px;
        }
      `}</style>
    </McpModal>
  );
};

export default McpConfigDialog;