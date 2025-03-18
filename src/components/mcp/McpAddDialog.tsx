import React, { useEffect, useState } from 'react';
import McpModal from './shared/McpModal';
import McpFormGroup, { formControlStyles, buttonStyles, ConfigEditor } from './shared/McpFormGroup';
import { useConfigDialog } from './hooks/useConfigDialog';
import { useTranslation } from '../../utils/i18n';

interface ProviderData {
  name: string;
  description: string;
  category: string;
}

interface McpAddDialogProps {
  providerData: ProviderData;
  configJson: string;
  onCancel: () => void;
  onSubmit: () => void;
  onProviderDataChange: (data: Partial<ProviderData>) => void;
  onConfigJsonChange: (json: string) => void;
}

const McpAddDialog: React.FC<McpAddDialogProps> = ({
  providerData,
  configJson: initialConfigJson,
  onCancel,
  onSubmit,
  onProviderDataChange,
  onConfigJsonChange,
}) => {
  const { t } = useTranslation();
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 使用 useConfigDialog 钩子，尝试解析 initialConfigJson 为对象传入
  const initialConfig = React.useMemo(() => {
    try {
      return initialConfigJson ? JSON.parse(initialConfigJson) : {};
    } catch (e) {
      return {};
    }
  }, [initialConfigJson]);

  const {
    configJson,
    isValid: isJsonValid,
    error: jsonError,
    handleJsonChange,
    validateJson
  } = useConfigDialog(initialConfig);

  // 当本地 configJson 状态变化时，同步更新父组件状态
  useEffect(() => {
    onConfigJsonChange(configJson);
  }, [configJson, onConfigJsonChange]);

  // 表单验证
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!providerData.name.trim()) {
      errors.name = t('common.error.required');
    } else if (providerData.name.length < 2) {
      errors.name = t('mcp.form.error.nameLength');
    }
    
    if (!providerData.description.trim()) {
      errors.description = t('common.error.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    setSubmitAttempted(true);
    const isFormValid = validateForm();
    const isConfigValid = validateJson();
    
    if (isFormValid && isConfigValid) {
      onSubmit();
    }
  };

  const handleCancel = () => {
    setSubmitAttempted(false);
    setFormErrors({});
    onCancel();
  };

  const renderFooter = () => (
    <>
      <button className="mcp-cancel-btn" onClick={handleCancel}>{t('common.cancel')}</button>
      <button
        className="mcp-submit-btn"
        onClick={handleSubmit}
        disabled={!providerData.name || !isJsonValid}
      >
        {t('common.add')}
      </button>
    </>
  );

  return (
    <McpModal
      title={t('mcp.actions.add')}
      onClose={handleCancel}
      footer={renderFooter()}
    >
      <McpFormGroup 
        label={t('mcp.form.serviceName')}
        required 
        error={submitAttempted ? formErrors.name : undefined}
      >
        <input
          type="text"
          value={providerData.name}
          onChange={(e) => {
            onProviderDataChange({ name: e.target.value });
            if (submitAttempted) validateForm();
          }}
          placeholder={t('mcp.form.serviceNamePlaceholder')}
          className={formErrors.name && submitAttempted ? 'has-error' : ''}
        />
      </McpFormGroup>

      <McpFormGroup 
        label={t('mcp.form.description')}
        required
        error={submitAttempted ? formErrors.description : undefined}
      >
        <textarea
          value={providerData.description}
          onChange={(e) => {
            onProviderDataChange({ description: e.target.value });
            if (submitAttempted) validateForm();
          }}
          placeholder={t('mcp.form.descriptionPlaceholder')}
          className={formErrors.description && submitAttempted ? 'has-error' : ''}
        />
      </McpFormGroup>

      <McpFormGroup label={t('mcp.form.category')} required>
        <select
          value={providerData.category}
          onChange={(e) => onProviderDataChange({ category: e.target.value })}
        >
          <option value="search">{t('mcp.filter.search')}</option>
          <option value="ai">{t('mcp.filter.ai')}</option>
          <option value="database">{t('mcp.filter.database')}</option>
          <option value="custom">{t('mcp.filter.custom')}</option>
        </select>
        <div className="field-help">
          {t('mcp.form.categoryDescription')}
        </div>
      </McpFormGroup>

      <McpFormGroup 
        label={t('mcp.form.config')}
        required
        error={submitAttempted && jsonError ? jsonError : undefined}
      >
        <ConfigEditor
          value={configJson}
          onChange={handleJsonChange}
          hasError={!!jsonError && submitAttempted}
        />
      </McpFormGroup>

      <style jsx>{`
        input, select, textarea {
          ${formControlStyles}
        }

        .has-error {
          border-color: #e91e63 !important;
        }

        .has-error:focus {
          box-shadow: 0 0 0 1px rgba(233, 30, 99, 0.2) !important;
        }

        textarea {
          height: 80px;
          resize: vertical;
        }

        .field-help {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }

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

export default McpAddDialog;