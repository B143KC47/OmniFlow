import { McpProviderConfig, McpProviderType } from '../types/mcp';
import { McpError, ErrorType } from './errorUtils';

// 验证提供商名称
export const validateProviderName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};

// 验证提供商描述
export const validateProviderDescription = (description: string): boolean => {
  return description.length <= 200;
};

// 验证提供商类型
export const validateProviderType = (type: string): type is McpProviderType => {
  return ['search', 'ai', 'database', 'custom'].includes(type);
};

// 验证API密钥格式
export const validateApiKey = (apiKey: string): boolean => {
  // 最小长度要求和基本格式检查
  return apiKey.length >= 16 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
};

// 验证端点URL
export const validateEndpoint = (endpoint: string): boolean => {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

// 验证配置对象
export const validateConfig = (config: Record<string, any>): void => {
  if (config.apiKey && !validateApiKey(config.apiKey)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }

  if (config.endpoint && !validateEndpoint(config.endpoint)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }
};

// 验证完整的提供商配置
export const validateProviderConfig = (provider: Partial<McpProviderConfig>): void => {
  if (!provider.name || !validateProviderName(provider.name)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }

  if (provider.description && !validateProviderDescription(provider.description)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }

  if (provider.category && !validateProviderType(provider.category)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }

  if (provider.apiKey && !validateApiKey(provider.apiKey)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }

  if (provider.endpoint && !validateEndpoint(provider.endpoint)) {
    throw new McpError(ErrorType.INVALID_CONFIG);
  }
};