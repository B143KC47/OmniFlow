// MCP提供商配置类型
export interface McpProviderConfig {
  id: string;
  name: string;
  provider: string; // 'google' | 'bing' | 'openai' | 'serpapi' | 'custom' | 'mysql' | 'postgres' | 'elasticsearch'
  apiKey?: string;
  endpoint?: string;
  options?: Record<string, any>;
  isActive: boolean;
  lastUsed?: number; // 时间戳
  status: 'connected' | 'error' | 'pending';
  errorMessage?: string;
  category?: string; // 'search' | 'ai' | 'database' | 'custom'
  description?: string;
  icon?: string;
}

// MCP服务的查询参数类型
export interface McpQueryParams {
  query: string;
  provider?: string;
  options?: Record<string, any>;
}

// MCP查询结果类型
export interface McpSearchResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
  date?: string;
}

// 服务提供商类型（包含配置信息）
export interface ServiceProvider extends McpProviderConfig {
  config?: Record<string, any>;
}

// MCP服务接口定义
export interface IMcpService {
  getInstance(): IMcpService;
  getAllProviders(): ServiceProvider[];
  getProviders(): McpProviderConfig[];
  upsertProvider(provider: McpProviderConfig): void;
  deleteProvider(providerId: string): boolean;
  addCustomProvider(
    name: string,
    description: string,
    category: string,
    config: Record<string, any>
  ): string;
  updateProviderConfig(id: string, config: Record<string, any>): void;
  removeProvider(id: string): void;
  testConnection(providerId: string): Promise<boolean>;
  search(params: McpQueryParams): Promise<McpSearchResult[]>;
  searchWeb(query: string, providerId: string, maxResults?: number): Promise<McpSearchResult[]>;
}