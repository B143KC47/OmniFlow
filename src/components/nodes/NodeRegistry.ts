import { NodeType, NodeCategoryType } from '../../types';

/**
 * 节点元数据
 */
export interface NodeMeta {
  type: string;           // 节点类型
  name: string;           // 节点名称
  description: string;    // 节点描述
  category: NodeCategoryType; // 节点分类
  icon?: string;          // 节点图标
  color?: string;         // 节点颜色
  tags?: string[];        // 标签
  author?: string;        // 作者
  version?: string;       // 版本
  inputs?: {              // 输入定义
    [key: string]: {
      type: string;       // 输入类型
      description: string; // 输入描述
      required: boolean;   // 是否必须
      defaultValue?: any;  // 默认值
    }
  };
  outputs?: {             // 输出定义
    [key: string]: {
      type: string;       // 输出类型
      description: string; // 输出描述
    }
  };
}

/**
 * 节点分类注册表
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private nodeMetas: Map<string, NodeMeta> = new Map();
  
  private constructor() {
    this.registerBuiltinNodes();
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
   * 注册节点元数据
   * @param meta 节点元数据
   */
  public register(meta: NodeMeta): void {
    if (this.nodeMetas.has(meta.type)) {
      console.warn(`节点类型 "${meta.type}" 已存在，将被覆盖`);
    }
    this.nodeMetas.set(meta.type, meta);
  }
  
  /**
   * 获取节点元数据
   * @param type 节点类型
   */
  public getNodeMeta(type: string): NodeMeta | undefined {
    return this.nodeMetas.get(type);
  }
  
  /**
   * 获取指定分类的所有节点
   * @param category 节点分类
   */
  public getNodesByCategory(category: NodeCategoryType): NodeMeta[] {
    return Array.from(this.nodeMetas.values())
      .filter(meta => meta.category === category);
  }
  
  /**
   * 获取所有节点元数据
   */
  public getAllNodeMetas(): NodeMeta[] {
    return Array.from(this.nodeMetas.values());
  }
  
  /**
   * 根据标签搜索节点
   * @param tag 标签
   */
  public searchByTag(tag: string): NodeMeta[] {
    return Array.from(this.nodeMetas.values())
      .filter(meta => meta.tags?.includes(tag));
  }
  
  /**
   * 根据关键词搜索节点
   * @param keyword 关键词
   */
  public searchByKeyword(keyword: string): NodeMeta[] {
    const lowercaseKeyword = keyword.toLowerCase();
    return Array.from(this.nodeMetas.values())
      .filter(meta => 
        meta.name.toLowerCase().includes(lowercaseKeyword) || 
        meta.description.toLowerCase().includes(lowercaseKeyword) ||
        meta.tags?.some(tag => tag.toLowerCase().includes(lowercaseKeyword))
      );
  }
  
  /**
   * 注册内置节点
   */
  private registerBuiltinNodes(): void {
    // 文本输入节点
    this.register({
      type: NodeType.TEXT_INPUT,
      name: '文本输入',
      description: '接收文本输入的节点',
      category: NodeCategoryType.INPUT,
      icon: 'text-input-icon',
      color: '#4CAF50', // 绿色
      tags: ['输入', '文本', '基础'],
      inputs: {
        text: {
          type: 'string',
          description: '输入文本',
          required: true,
          defaultValue: ''
        }
      },
      outputs: {
        text: {
          type: 'string',
          description: '输出文本'
        }
      }
    });
    
    // Web搜索节点
    this.register({
      type: NodeType.WEB_SEARCH,
      name: 'Web搜索',
      description: '执行网络搜索的节点',
      category: NodeCategoryType.UTILITY,
      icon: 'web-search-icon',
      color: '#2196F3', // 蓝色
      tags: ['搜索', '网络', '工具'],
      inputs: {
        query: {
          type: 'string',
          description: '搜索查询',
          required: true
        },
        searchEngine: {
          type: 'string',
          description: '搜索引擎',
          required: false,
          defaultValue: 'google'
        },
        maxResults: {
          type: 'number',
          description: '最大结果数',
          required: false,
          defaultValue: 5
        }
      },
      outputs: {
        text: {
          type: 'string',
          description: '搜索结果'
        }
      }
    });
    
    // 文档查询节点
    this.register({
      type: NodeType.DOCUMENT_QUERY,
      name: '文档查询',
      description: '在文档中执行查询的节点',
      category: NodeCategoryType.UTILITY,
      icon: 'document-query-icon',
      color: '#FF9800', // 橙色
      tags: ['查询', '文档', '工具'],
      inputs: {
        query: {
          type: 'string',
          description: '查询文本',
          required: true
        },
        path: {
          type: 'string',
          description: '文档路径',
          required: true
        }
      },
      outputs: {
        text: {
          type: 'string',
          description: '查询结果'
        }
      }
    });
    
    // 模型选择器节点
    this.register({
      type: NodeType.MODEL_SELECTOR,
      name: '模型选择器',
      description: '选择AI模型和参数的节点',
      category: NodeCategoryType.AI_MODEL,
      icon: 'model-selector-icon',
      color: '#9C27B0', // 紫色
      tags: ['模型', 'AI', '配置'],
      inputs: {
        model: {
          type: 'string',
          description: '模型名称',
          required: true,
          defaultValue: 'deepseek-chat'
        },
        apiKey: {
          type: 'string',
          description: 'API密钥',
          required: false
        },
        systemPrompt: {
          type: 'string',
          description: '系统提示词',
          required: false,
          defaultValue: 'You are a helpful assistant.'
        },
        temperature: {
          type: 'number',
          description: '温度',
          required: false,
          defaultValue: 0.7
        },
        maxTokens: {
          type: 'number',
          description: '最大Token数',
          required: false,
          defaultValue: 1000
        }
      },
      outputs: {
        model: {
          type: 'string',
          description: '模型名称'
        },
        apiKey: {
          type: 'string',
          description: 'API密钥'
        },
        systemPrompt: {
          type: 'string',
          description: '系统提示词'
        },
        temperature: {
          type: 'number',
          description: '温度'
        }
      }
    });
    
    // LLM查询节点
    this.register({
      type: NodeType.LLM_QUERY,
      name: 'LLM查询',
      description: '执行大型语言模型查询的节点',
      category: NodeCategoryType.AI_MODEL,
      icon: 'llm-query-icon',
      color: '#E91E63', // 粉红色
      tags: ['LLM', 'AI', '查询', '语言模型'],
      inputs: {
        prompt: {
          type: 'string',
          description: '提示词',
          required: true
        },
        model: {
          type: 'string',
          description: '模型名称',
          required: false,
          defaultValue: 'deepseek-chat'
        },
        systemPrompt: {
          type: 'string',
          description: '系统提示词',
          required: false,
          defaultValue: 'You are a helpful assistant.'
        },
        temperature: {
          type: 'number',
          description: '温度',
          required: false,
          defaultValue: 0.7
        }
      },
      outputs: {
        text: {
          type: 'string',
          description: 'LLM响应'
        }
      }
    });
    
    // 编码器节点
    this.register({
      type: NodeType.ENCODER,
      name: '编码器',
      description: '将文本转换为嵌入向量的节点',
      category: NodeCategoryType.PROCESSING,
      icon: 'encoder-icon',
      color: '#607D8B', // 蓝灰色
      tags: ['嵌入', '向量', '处理'],
      inputs: {
        text: {
          type: 'string',
          description: '输入文本',
          required: true
        },
        model: {
          type: 'string',
          description: '嵌入模型',
          required: false,
          defaultValue: 'clip'
        }
      },
      outputs: {
        embedding: {
          type: 'array',
          description: '嵌入向量'
        }
      }
    });
    
    // 采样器节点
    this.register({
      type: NodeType.SAMPLER,
      name: '采样器',
      description: '从选项中采样的节点',
      category: NodeCategoryType.PROCESSING,
      icon: 'sampler-icon',
      color: '#FF5722', // 深橙色
      tags: ['采样', '随机', '处理'],
      inputs: {
        options: {
          type: 'string',
          description: '选项列表（每行一个）',
          required: true
        },
        samplingMethod: {
          type: 'string',
          description: '采样方法',
          required: false,
          defaultValue: 'random'
        },
        count: {
          type: 'number',
          description: '采样数量',
          required: false,
          defaultValue: 1
        },
        temperature: {
          type: 'number',
          description: '温度',
          required: false,
          defaultValue: 1.0
        }
      },
      outputs: {
        sampled: {
          type: 'string',
          description: '采样结果'
        },
        count: {
          type: 'number',
          description: '采样数量'
        }
      }
    });
    
    // 自定义节点
    this.register({
      type: NodeType.CUSTOM,
      name: '自定义节点',
      description: '执行自定义JavaScript代码的节点',
      category: NodeCategoryType.CUSTOM,
      icon: 'custom-node-icon',
      color: '#795548', // 棕色
      tags: ['自定义', '代码', '脚本', 'JavaScript'],
      inputs: {
        code: {
          type: 'string',
          description: 'JavaScript代码',
          required: true,
          defaultValue: 'return { result: "Hello World" };'
        }
      },
      outputs: {
        result: {
          type: 'any',
          description: '代码执行结果'
        }
      }
    });
  }
}

export default NodeRegistry;