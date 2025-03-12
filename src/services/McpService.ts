import { 
  McpProviderConfig, 
  McpQueryParams, 
  McpSearchResult, 
  ServiceProvider,
  McpProviderType
} from '../types/mcp';
import { StorageManager } from '../utils/storageUtils';
import { validateProviderConfig, validateConfig } from '../utils/validationUtils';
import { McpError, ErrorType, handleConnectionError } from '../utils/errorUtils';
import { generateProviderId, toServiceProvider } from '../utils/mcpUtils';

// Import provider classes
import { GoogleSearchProvider } from './providers/GoogleSearchProvider';
import { BingSearchProvider } from './providers/BingSearchProvider';
import { SerpApiProvider } from './providers/SerpApiProvider';
import { CustomProvider } from './providers/CustomProvider';

// 默认提供商配置
const DEFAULT_PROVIDERS: McpProviderConfig[] = [
  {
    id: 'google-default',
    name: '谷歌搜索',
    provider: 'google',
    isActive: false,
    status: 'pending',
    category: 'search',
    description: 'Google 搜索引擎',
    icon: 'google'
  },
  {
    id: 'bing-default',
    name: '必应搜索',
    provider: 'bing',
    isActive: false,
    status: 'pending',
    category: 'search',
    description: 'Microsoft Bing 搜索引擎',
    icon: 'bing'
  },
  {
    id: 'serpapi-default',
    name: 'SerpAPI',
    provider: 'serpapi',
    isActive: false,
    status: 'pending',
    category: 'search',
    description: 'SerpAPI 搜索服务',
    icon: 'search'
  }
];

class McpService {
  private static instance: McpService;
  private providers: McpProviderConfig[] = [];
  private initialized: boolean = false;

  // Provider instances
  private googleProvider: GoogleSearchProvider;
  private bingProvider: BingSearchProvider;
  private serpApiProvider: SerpApiProvider;
  private customProvider: CustomProvider;

  private constructor() {
    // Initialize provider instances
    this.googleProvider = new GoogleSearchProvider();
    this.bingProvider = new BingSearchProvider();
    this.serpApiProvider = new SerpApiProvider();
    this.customProvider = new CustomProvider();
    
    // 使用默认配置初始化
    this.providers = [...DEFAULT_PROVIDERS];
    
    // 延迟加载配置到客户端渲染时
    if (typeof window !== 'undefined') {
      this.loadProviders();
    }
  }

  public static getInstance(): McpService {
    if (!McpService.instance) {
      McpService.instance = new McpService();
    }
    return McpService.instance;
  }

  // 初始化服务
  public initialize(): void {
    if (!this.initialized && typeof window !== 'undefined') {
      this.loadProviders();
      this.initialized = true;
    }
  }

  private loadProviders(): void {
    try {
      const storedProviders = StorageManager.loadProviders();
      if (storedProviders.length > 0) {
        this.providers = storedProviders;
      } else {
        this.providers = [...DEFAULT_PROVIDERS];
        this.saveProviders();
      }
    } catch (error) {
      console.error('加载MCP提供商配置失败:', error);
      this.providers = [...DEFAULT_PROVIDERS];
    }
  }

  private saveProviders(): void {
    StorageManager.saveProviders(this.providers);
  }

  public getAllProviders(): ServiceProvider[] {
    return this.providers.map(toServiceProvider);
  }

  public getProviders(): McpProviderConfig[] {
    return [...this.providers];
  }

  public upsertProvider(provider: McpProviderConfig): void {
    validateProviderConfig(provider);
    
    const index = this.providers.findIndex(p => p.id === provider.id);
    if (index !== -1) {
      this.providers[index] = { ...this.providers[index], ...provider };
    } else {
      this.providers.push(provider);
    }
    this.saveProviders();
  }

  public deleteProvider(providerId: string): boolean {
    const initialLength = this.providers.length;
    this.providers = this.providers.filter(p => p.id !== providerId);
    if (this.providers.length !== initialLength) {
      this.saveProviders();
      return true;
    }
    return false;
  }

  // Adding this method to match the interface in McpTypes.ts
  public removeProvider(id: string): void {
    this.deleteProvider(id);
  }

  public addCustomProvider(
    name: string,
    description: string,
    category: McpProviderType, // Fixed: Now using McpProviderType instead of union type
    config: Record<string, any>
  ): string {
    validateConfig(config);
    
    const id = generateProviderId('custom');
    const provider: McpProviderConfig = {
      id,
      name,
      provider: 'custom',
      description,
      category,
      isActive: true,
      status: 'pending',
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      options: config.options
    };

    validateProviderConfig(provider);
    this.upsertProvider(provider);
    return id;
  }

  public updateProviderConfig(id: string, config: Record<string, any>): void {
    validateConfig(config);
    
    const provider = this.providers.find(p => p.id === id);
    if (!provider) {
      throw new McpError(ErrorType.PROVIDER_NOT_FOUND);
    }

    const updatedProvider = {
      ...provider,
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      options: config.options
    };

    this.upsertProvider(updatedProvider);
  }

  public async testConnection(providerId: string): Promise<boolean> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new McpError(ErrorType.PROVIDER_NOT_FOUND);
    }

    try {
      let success = false;

      switch (provider.provider) {
        case 'google':
          success = await this.googleProvider.testConnection(provider);
          break;
        case 'bing':
          success = await this.bingProvider.testConnection(provider);
          break;
        case 'serpapi':
          success = await this.serpApiProvider.testConnection(provider);
          break;
        case 'custom':
          success = await this.customProvider.testConnection(provider);
          break;
        default:
          throw new McpError(ErrorType.INVALID_CONFIG);
      }

      this.upsertProvider({
        ...provider,
        status: success ? 'connected' : 'error',
        lastUsed: Date.now()
      });

      return success;
    } catch (error) {
      const mcpError = handleConnectionError(error);
      this.upsertProvider({
        ...provider,
        status: 'error',
        errorMessage: mcpError.message
      });
      throw mcpError;
    }
  }

  public async search(params: McpQueryParams): Promise<McpSearchResult[]> {
    const { query, provider: providerId, options = {} } = params;
    
    let provider: McpProviderConfig | undefined;
    if (providerId) {
      provider = this.providers.find(p => p.id === providerId);
      if (!provider) {
        throw new McpError(ErrorType.PROVIDER_NOT_FOUND);
      }
      if (!provider.isActive) {
        throw new McpError(ErrorType.INVALID_CONFIG);
      }
    } else {
      provider = this.providers.find(p => 
        p.isActive && ['google', 'bing', 'serpapi'].includes(p.provider)
      );
      if (!provider) {
        throw new McpError(ErrorType.PROVIDER_NOT_FOUND);
      }
    }

    try {
      this.upsertProvider({ ...provider, lastUsed: Date.now() });
      
      switch (provider.provider) {
        case 'google':
          return await this.googleProvider.search(query, provider, options);
        case 'bing':
          return await this.bingProvider.search(query, provider, options);
        case 'serpapi':
          return await this.serpApiProvider.search(query, provider, options);
        case 'custom':
          return await this.customProvider.search(query, provider, options);
        default:
          throw new McpError(ErrorType.INVALID_CONFIG);
      }
    } catch (error) {
      this.upsertProvider({ 
        ...provider, 
        status: 'error',
        errorMessage: error instanceof Error ? error.message : '搜索失败'
      });
      throw error;
    }
  }

  public async searchWeb(
    query: string,
    providerId: string,
    maxResults: number = 5
  ): Promise<McpSearchResult[]> {
    try {
      const results = await this.search({
        query,
        provider: providerId,
        options: { maxResults }
      });
      
      return results.slice(0, maxResults);
    } catch (error) {
      // Convert any error to a McpError with appropriate type
      if (error instanceof McpError) {
        throw error;
      } else {
        throw new McpError(
          ErrorType.OPERATION_FAILED, 
          error instanceof Error ? error : undefined
        );
      }
    }
  }
}

export default McpService;