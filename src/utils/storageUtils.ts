import { McpProviderConfig } from '../types/mcp';
import { McpError, ErrorType } from './errorUtils';

const STORAGE_KEYS = {
  PROVIDERS: 'mcp_providers',
  SETTINGS: 'mcp_settings'
} as const;

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

/**
 * 存储管理类
 */
export class StorageManager {
  /**
   * 保存提供商配置列表
   */
  static saveProviders(providers: McpProviderConfig[]): void {
    if (!isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
    } catch (error) {
      console.error('保存提供商配置失败:', error);
      throw new McpError(ErrorType.OPERATION_FAILED, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 加载提供商配置列表
   */
  static loadProviders(): McpProviderConfig[] {
    if (!isClient) return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('加载提供商配置失败:', error);
      return [];
    }
  }

  /**
   * 保存单个提供商配置
   */
  static saveProvider(provider: McpProviderConfig): void {
    if (!isClient) return;
    
    try {
      const providers = this.loadProviders();
      const index = providers.findIndex(p => p.id === provider.id);
      
      if (index !== -1) {
        providers[index] = provider;
      } else {
        providers.push(provider);
      }
      
      this.saveProviders(providers);
    } catch (error) {
      console.error('保存提供商失败:', error);
      throw new McpError(ErrorType.OPERATION_FAILED, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 删除提供商配置
   */
  static deleteProvider(providerId: string): void {
    if (!isClient) return;
    
    try {
      const providers = this.loadProviders();
      const filtered = providers.filter(p => p.id !== providerId);
      this.saveProviders(filtered);
    } catch (error) {
      console.error('删除提供商失败:', error);
      throw new McpError(ErrorType.OPERATION_FAILED, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 保存MCP设置
   */
  static saveSettings(settings: Record<string, any>): void {
    if (!isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
      throw new McpError(ErrorType.OPERATION_FAILED, error instanceof Error ? error : undefined);
    }
  }

  /**
   * 加载MCP设置
   */
  static loadSettings(): Record<string, any> {
    if (!isClient) return {};
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('加载设置失败:', error);
      return {};
    }
  }

  /**
   * 清除所有MCP相关数据
   */
  static clearAll(): void {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.PROVIDERS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('清除数据失败:', error);
      throw new McpError(ErrorType.OPERATION_FAILED, error instanceof Error ? error : undefined);
    }
  }
}