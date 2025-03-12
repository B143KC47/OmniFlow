import { useState, useCallback } from 'react';
import { ServiceProvider } from '../../../types/mcp';

interface UseConfigDialogReturn {
  configJson: string;
  isValid: boolean;
  error: string | null;
  handleJsonChange: (json: string) => void;
  validateJson: () => boolean;
  parseConfig: () => Record<string, any> | null;
  resetConfig: () => void;
}

export function useConfigDialog(initialConfig?: Record<string, any>): UseConfigDialogReturn {
  const [configJson, setConfigJson] = useState<string>(
    initialConfig ? JSON.stringify(initialConfig, null, 2) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const validateJson = useCallback(() => {
    if (!configJson.trim()) {
      setError('配置内容不能为空');
      return false;
    }

    try {
      const config = JSON.parse(configJson);
      
      if (typeof config !== 'object' || config === null || Array.isArray(config)) {
        setError('配置必须是一个有效的 JSON 对象');
        return false;
      }

      // Only validate structure if non-empty values are provided
      if (config.apiKey && typeof config.apiKey !== 'string') {
        setError('API密钥必须是字符串类型');
        return false;
      }

      if (config.endpoint) {
        if (typeof config.endpoint !== 'string') {
          setError('服务端点必须是字符串类型');
          return false;
        }

        try {
          new URL(config.endpoint);
        } catch {
          setError('服务端点必须是一个有效的URL');
          return false;
        }
      }

      if (config.options !== undefined) {
        if (typeof config.options !== 'object' || Array.isArray(config.options)) {
          setError('配置选项必须是一个对象');
          return false;
        }
      }

      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON格式无效');
      return false;
    }
  }, [configJson]);

  const handleJsonChange = useCallback((json: string) => {
    setConfigJson(json);
    if (json) {
      validateJson();
    } else {
      setError(null);
    }
  }, [validateJson]);

  const parseConfig = useCallback(() => {
    if (!validateJson()) {
      return null;
    }
    try {
      return JSON.parse(configJson);
    } catch {
      return null;
    }
  }, [configJson, validateJson]);

  const resetConfig = useCallback(() => {
    setConfigJson(initialConfig ? JSON.stringify(initialConfig, null, 2) : '');
    setError(null);
  }, [initialConfig]);

  return {
    configJson,
    isValid: !error,
    error,
    handleJsonChange,
    validateJson,
    parseConfig,
    resetConfig
  };
}