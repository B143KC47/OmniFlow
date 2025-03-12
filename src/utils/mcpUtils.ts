import { ServiceProvider, McpProviderConfig, McpProviderType } from '../types/mcp';

/**
 * 生成唯一的提供商ID
 */
export const generateProviderId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 验证配置JSON
 */
export const validateConfigJson = (json: string): boolean => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};

/**
 * 解析配置JSON
 */
export const parseConfigJson = (json: string): Record<string, any> | null => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * 格式化配置JSON为字符串
 */
export const formatConfigJson = (config: Record<string, any>): string => {
  return JSON.stringify(config, null, 2);
};

/**
 * 获取提供商的显示状态文本
 */
export const getProviderStatusText = (status: McpProviderConfig['status']): string => {
  switch (status) {
    case 'connected':
      return '已连接';
    case 'error':
      return '连接错误';
    default:
      return '未连接';
  }
};

/**
 * 获取提供商类型的显示文本
 */
export const getProviderTypeText = (type: McpProviderType): string => {
  switch (type) {
    case 'search':
      return '搜索';
    case 'ai':
      return 'AI';
    case 'database':
      return '数据库';
    case 'custom':
      return '自定义';
    default:
      return type;
  }
};

/**
 * 过滤提供商列表
 */
export const filterProviders = (
  providers: ServiceProvider[],
  category: string,
  searchTerm: string
): ServiceProvider[] => {
  return providers.filter(provider => {
    // 根据分类过滤
    if (category !== 'all' && provider.category !== category) {
      return false;
    }
    
    // 根据搜索词过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = provider.name.toLowerCase().includes(searchLower);
      const descMatch = provider.description?.toLowerCase().includes(searchLower) || false;
      
      if (!nameMatch && !descMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 转换为ServiceProvider类型
 */
export const toServiceProvider = (config: McpProviderConfig): ServiceProvider => {
  return {
    ...config,
    config: {
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      options: config.options
    }
  };
};

/**
 * 创建默认的提供商配置
 */
export const createDefaultProviderConfig = (
  name: string,
  type: McpProviderType,
  description: string = ''
): McpProviderConfig => {
  return {
    id: generateProviderId(type),
    name,
    provider: type,
    description,
    category: type,
    isActive: false,
    status: 'pending',
    icon: type
  };
};