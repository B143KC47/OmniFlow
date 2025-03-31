import { NodeDefinition, NodeCategoryType, NodeCategoryInfo } from './types';

/**
 * 节点注册表
 * 管理所有可用的节点类型
 */
class NodeRegistry {
  private static instance: NodeRegistry;
  private nodeDefinitions: Map<string, NodeDefinition>;
  private nodeCategories: Map<string, NodeCategoryInfo>;

  private constructor() {
    this.nodeDefinitions = new Map<string, NodeDefinition>();
    this.nodeCategories = new Map<string, NodeCategoryInfo>();
    this.registerDefaultCategories();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  /**
   * 注册默认节点分类
   * @private
   */
  private registerDefaultCategories(): void {
    this.registerCategory('input', {
      name: '输入',
      description: '输入数据的节点',
      icon: 'input'
    });
    
    this.registerCategory('output', {
      name: '输出',
      description: '输出数据的节点',
      icon: 'output'
    });
    
    this.registerCategory('ai', {
      name: '人工智能',
      description: 'AI模型和工具',
      icon: 'ai'
    });
    
    this.registerCategory('flow', {
      name: '流程控制',
      description: '控制工作流执行流程的节点',
      icon: 'flow'
    });
    
    this.registerCategory('data', {
      name: '数据处理',
      description: '数据处理和转换的节点',
      icon: 'data'
    });
    
    this.registerCategory('utility', {
      name: '实用工具',
      description: '各种实用功能的节点',
      icon: 'utility'
    });
    
    this.registerCategory('custom', {
      name: '自定义',
      description: '自定义功能节点',
      icon: 'custom'
    });
  }

  /**
   * 注册新的节点类型
   * @param definition 节点定义
   */
  public registerNodeType(definition: NodeDefinition): void {
    if (this.nodeDefinitions.has(definition.type)) {
      console.warn(`节点类型 ${definition.type} 已存在，将被覆盖`);
    }
    this.nodeDefinitions.set(definition.type, definition);
  }

  /**
   * 注册节点分类
   * @param id 分类ID
   * @param category 分类信息
   */
  public registerCategory(
    id: string, 
    category: { name: string; description: string; icon?: string }
  ): void {
    this.nodeCategories.set(id, {
      id,
      ...category
    });
  }

  /**
   * 获取所有注册的节点定义
   */
  public getAllNodeDefinitions(): NodeDefinition[] {
    return Array.from(this.nodeDefinitions.values());
  }

  /**
   * 获取特定节点类型的定义
   * @param type 节点类型
   */
  public getNodeDefinition(type: string): NodeDefinition | undefined {
    return this.nodeDefinitions.get(type);
  }

  /**
   * 获取按分类组织的节点
   */
  public getNodesByCategory(): Record<string, { 
    name: string; 
    description: string; 
    icon?: string; 
    nodes: NodeDefinition[] 
  }> {
    const result: Record<string, { 
      name: string; 
      description: string; 
      icon?: string; 
      nodes: NodeDefinition[] 
    }> = {};
    
    // 初始化所有分类
    this.nodeCategories.forEach((category, id) => {
      result[id] = {
        ...category,
        nodes: []
      };
    });
    
    // 将节点添加到对应分类
    this.nodeDefinitions.forEach(node => {
      const categoryId = node.category;
      if (result[categoryId]) {
        result[categoryId].nodes.push(node);
      } else {
        // 如果分类不存在，创建一个默认分类
        result[categoryId] = {
          name: categoryId,
          description: `${categoryId} 节点`,
          nodes: [node]
        };
      }
    });
    
    return result;
  }

  /**
   * 获取热门节点
   */
  public getPopularNodes(): NodeDefinition[] {
    return this.getAllNodeDefinitions().filter(node => node.popular);
  }

  /**
   * 获取新节点
   */
  public getNewNodes(): NodeDefinition[] {
    return this.getAllNodeDefinitions().filter(node => node.new);
  }

  /**
   * 搜索节点
   * @param query 搜索关键词
   */
  public searchNodes(query: string): NodeDefinition[] {
    if (!query) {
      return this.getAllNodeDefinitions();
    }
    
    const lowerQuery = query.toLowerCase();
    return this.getAllNodeDefinitions().filter(node => 
      node.name.toLowerCase().includes(lowerQuery) || 
      node.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 创建节点实例数据
   * @param type 节点类型
   * @param id 节点ID
   * @param position 节点位置
   */
  public createNodeData(
    type: string, 
    id: string, 
    position: { x: number; y: number }
  ): any {
    const definition = this.getNodeDefinition(type);
    if (!definition) {
      throw new Error(`未知的节点类型: ${type}`);
    }
    
    return {
      id,
      type,
      position,
      data: {
        label: definition.label || definition.name,
        type,
        ...(definition.initialData || {})
      }
    };
  }
}

export default NodeRegistry;