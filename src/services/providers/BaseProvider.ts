import { McpProviderConfig, McpSearchResult } from '../../types/mcp';
import { McpError, ErrorType } from '../../utils/errorUtils';

export abstract class BaseProvider {
  /**
   * 测试提供商连接
   */
  public async testConnection(config: McpProviderConfig): Promise<boolean> {
    try {
      // 实例方法调用实例方法进行验证
      this.validateConfig(config);
      return true;
    } catch (error) {
      throw new McpError(ErrorType.CONNECTION_FAILED, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 执行搜索
   */
  public async search(
    query: string,
    config: McpProviderConfig,
    options?: Record<string, any>
  ): Promise<McpSearchResult[]> {
    // 验证配置
    this.validateConfig(config);
    
    // 子类应实现此方法
    throw new McpError(ErrorType.OPERATION_FAILED);
  }

  /**
   * 验证配置
   */
  protected validateConfig(config: McpProviderConfig): void {
    if (!config.apiKey && this.requiresApiKey()) {
      throw new McpError(ErrorType.INVALID_CONFIG);
    }

    if (!config.endpoint && this.requiresEndpoint()) {
      throw new McpError(ErrorType.INVALID_CONFIG);
    }
  }

  /**
   * 检查是否需要API密钥
   */
  protected requiresApiKey(): boolean {
    return true;
  }

  /**
   * 检查是否需要端点URL
   */
  protected requiresEndpoint(): boolean {
    return false;
  }

  /**
   * 格式化搜索结果
   */
  protected formatResults(rawResults: any[]): McpSearchResult[] {
    return rawResults.map(result => ({
      title: result.title || '',
      snippet: result.snippet || result.description || '',
      url: result.url || result.link || '',
      source: result.source || this.name,
      date: result.date || undefined
    }));
  }

  /**
   * 提供商名称
   */
  protected get name(): string {
    return this.constructor.name.replace('Provider', '');
  }
}