import { useState, useEffect, useCallback } from 'react';
import McpService from '../../../services/McpService';
import { ServiceProvider, McpProviderType } from '../../../types/mcp';

export interface NewProviderData {
  name: string;
  description: string;
  category: McpProviderType;
  provider: string;
}

export function useMcpManager() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ServiceProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [configJson, setConfigJson] = useState('');
  const [lastOperationStatus, setLastOperationStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [newProviderData, setNewProviderData] = useState<NewProviderData>({
    name: '',
    description: '',
    category: 'search',
    provider: 'custom'
  });

  const mcpService = McpService.getInstance();

  // Load providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const allProviders = mcpService.getAllProviders();
        setProviders(allProviders);
      } catch (error) {
        console.error('Failed to load providers:', error);
        setLastOperationStatus({
          type: 'error',
          message: '加载服务列表失败'
        });
      }
    };
    
    loadProviders();
  }, []);

  // Filter providers based on search term and category
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      searchTerm === '' || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.description ? provider.description.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      provider.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Test provider connection
  const handleConnectionTest = useCallback(async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      await mcpService.testConnection(providerId);
      // Refresh providers list to get updated status
      setProviders(mcpService.getAllProviders());
      setLastOperationStatus({
        type: 'success',
        message: '连接测试成功'
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setLastOperationStatus({
        type: 'error',
        message: '连接测试失败: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setTestingProvider(null);
    }
  }, []);

  // Add new provider
  const handleSubmitNewProvider = useCallback(async () => {
    try {
      const config = JSON.parse(configJson);
      const providerId = mcpService.addCustomProvider(
        newProviderData.name,
        newProviderData.description,
        newProviderData.category,
        config
      );
      
      // Refresh providers list
      setProviders(mcpService.getAllProviders());
      setIsAddingProvider(false);
      
      // Reset form
      setNewProviderData({
        name: '',
        description: '',
        category: 'search',
        provider: 'custom'
      });
      setConfigJson('');

      setLastOperationStatus({
        type: 'success',
        message: '服务添加成功'
      });
      
      // Optional: Test connection for the new provider
      await handleConnectionTest(providerId);
    } catch (error) {
      console.error('Failed to add provider:', error);
      setLastOperationStatus({
        type: 'error',
        message: `添加服务失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, [newProviderData, configJson, handleConnectionTest]);

  // Edit provider config
  const handleEditConfig = useCallback((provider: ServiceProvider) => {
    setActiveProvider(provider);
    setIsEditingConfig(true);
    
    const config: Record<string, any> = {
      apiKey: provider.apiKey || '',
      endpoint: provider.endpoint || '',
      options: provider.options || {}
    };
    
    setConfigJson(JSON.stringify(config, null, 2));
  }, []);

  // Cancel edit config
  const handleCancelEditConfig = useCallback(() => {
    setIsEditingConfig(false);
    setActiveProvider(null);
    setConfigJson('');
    setLastOperationStatus(null);
  }, []);

  // Save edited config
  const handleSaveConfig = useCallback(async () => {
    if (!activeProvider) return;
    
    try {
      const config = JSON.parse(configJson);
      mcpService.updateProviderConfig(activeProvider.id, config);
      
      // Refresh providers list
      setProviders(mcpService.getAllProviders());
      
      // Close dialog
      setIsEditingConfig(false);
      setActiveProvider(null);
      setConfigJson('');
      
      setLastOperationStatus({
        type: 'success',
        message: '配置更新成功'
      });
      
      // Optional: Test connection with new config
      await handleConnectionTest(activeProvider.id);
    } catch (error) {
      console.error('Failed to update provider config:', error);
      setLastOperationStatus({
        type: 'error',
        message: `更新配置失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, [activeProvider, configJson, handleConnectionTest]);

  // Remove provider
  const handleRemoveProvider = useCallback((providerId: string) => {
    try {
      mcpService.deleteProvider(providerId);
      // Refresh providers list
      setProviders(mcpService.getAllProviders());
      setLastOperationStatus({
        type: 'success',
        message: '服务删除成功'
      });
    } catch (error) {
      console.error('Failed to remove provider:', error);
      setLastOperationStatus({
        type: 'error',
        message: `删除服务失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }, []);

  // Cancel add provider
  const handleCancelAddProvider = useCallback(() => {
    setIsAddingProvider(false);
    setNewProviderData({
      name: '',
      description: '',
      category: 'search',
      provider: 'custom'
    });
    setConfigJson('');
    setLastOperationStatus(null);
  }, []);

  // Clear operation status
  const clearOperationStatus = useCallback(() => {
    setLastOperationStatus(null);
  }, []);

  return {
    searchTerm,
    selectedCategory,
    testingProvider,
    isAddingProvider,
    isEditingConfig,
    activeProvider,
    configJson,
    newProviderData,
    filteredProviders,
    lastOperationStatus,
    setSearchTerm,
    setSelectedCategory,
    handleConnectionTest,
    handleSubmitNewProvider,
    handleEditConfig,
    handleSaveConfig,
    handleRemoveProvider,
    handleCancelAddProvider,
    handleCancelEditConfig,
    clearOperationStatus,
    setIsAddingProvider,
    setNewProviderData,
    setConfigJson,
  };
}