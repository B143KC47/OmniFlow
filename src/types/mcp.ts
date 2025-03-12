// 服务提供商类型
export type McpProviderType = 'search' | 'ai' | 'database' | 'custom';

// 服务提供商状态
export type McpProviderStatus = 'connected' | 'error' | 'pending';

// 服务提供商基础配置
export interface McpProviderConfig {
  id: string;
  name: string;
  provider: string;
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, any>;
  isActive: boolean;
  lastUsed?: number;
  status: McpProviderStatus;
  errorMessage?: string;
  category?: McpProviderType;
  description?: string;
  icon?: string;
}

// 服务提供商（包含配置信息）
export interface ServiceProvider extends McpProviderConfig {
  config?: Record<string, any>;
}

// MCP查询参数
export interface McpQueryParams {
  query: string;
  provider?: string;
  options?: Record<string, any>;
}

// MCP查询结果
export interface McpSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  date?: string;
}

// 新增提供商表单数据
export interface McpProviderFormData {
  name: string;
  description: string;
  category: McpProviderType;
}

// 对话框Props基础接口
export interface McpDialogBaseProps {
  onCancel: () => void;
  onSubmit: () => void;
}