import { NodeType } from '../types';
import { scanNodeComponents } from '../utils/nodeScanner';
import NodeRegistry from './NodeRegistry';

// 节点描述信息接口
export interface NodeDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  inputs: number;
  outputs: number;
  icon: string;
  component?: string;
  popular?: boolean;
  new?: boolean;
}

// 节点分类信息
export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  nodes: NodeDefinition[];
}

// 预设节点类型与图标的映射关系
const NODE_ICON_MAP: Record<string, string> = {
  'TEXT_INPUT': 'text',
  'LLM_QUERY': 'brain',
  'WEB_SEARCH': 'search',
  'DOCUMENT_QUERY': 'document',
  'MODEL_SELECTOR': 'model',
  'CUSTOM_NODE': 'code',
  'ENCODER': 'embed',
  'SAMPLER': 'random',
};

// 预设文件夹与分类的映射关系
const FOLDER_CATEGORY_MAP: Record<string, string> = {
  'input': 'input',
  'ai': 'ai',
  'flow': 'flow',
  'advanced': 'advanced',
  'search': 'utility',
  'output': 'output',
  'utility': 'utility',
};

class NodeDiscoveryService {
  private static instance: NodeDiscoveryService;
  private nodeDefinitions: NodeDefinition[] = [];
  private nodeCategories: NodeCategory[] = [];
  private isInitialized = false;
  private nodeRegistry: NodeRegistry;

  private constructor() {
    // 初始化节点注册表
    this.nodeRegistry = NodeRegistry.getInstance();
  }

  public static getInstance(): NodeDiscoveryService {
    if (!NodeDiscoveryService.instance) {
      NodeDiscoveryService.instance = new NodeDiscoveryService();
    }
    return NodeDiscoveryService.instance;
  }

  // 初始化节点定义，从预设和自动扫描中收集
  public async initialize(t: (key: string) => string): Promise<void> {
    if (this.isInitialized) return;

    // 确保节点注册表已初始化
    await this.nodeRegistry.initialize();

    // 添加预设的核心节点
    this.registerCoreNodes(t);

    // 动态扫描并注册节点文件夹中的节点
    await this.scanNodeFolders();

    // 按照分类组织节点
    this.organizeNodesByCategory(t);

    // 验证节点定义与注册的组件一致性
    this.validateNodeConsistency();

    this.isInitialized = true;
  }

  // 获取所有节点定义
  public getAllNodeDefinitions(): NodeDefinition[] {
    return this.nodeDefinitions;
  }

  // 获取所有节点分类
  public getAllNodeCategories(): NodeCategory[] {
    return this.nodeCategories;
  }

  // 根据类型获取节点定义
  public getNodeDefinitionByType(type: string): NodeDefinition | undefined {
    // 尝试通过节点注册表解析标准化的类型
    const resolvedType = this.nodeRegistry.resolveNodeType(type) || type;
    return this.nodeDefinitions.find(node => node.type === resolvedType);
  }

  // 验证节点定义与组件的一致性
  private validateNodeConsistency(): void {
    // 获取节点注册表中的错误
    const registryErrors = this.nodeRegistry.getErrors();
    
    if (registryErrors.length > 0) {
      console.warn('节点注册表验证发现问题:');
      registryErrors.forEach(error => console.warn(`- ${error}`));
    }
    
    // 检查所有节点定义是否有对应的组件
    const missingComponents = this.nodeDefinitions.filter(def => 
      !this.nodeRegistry.getNodeComponent(def.type)
    );
    
    if (missingComponents.length > 0) {
      console.warn('发现没有对应组件实现的节点定义:');
      missingComponents.forEach(def => {
        console.warn(`- 节点类型 "${def.type}" (${def.name}) 没有对应的组件实现`);
      });
    }
  }

  // 注册核心预设节点
  private registerCoreNodes(t: (key: string) => string): void {
    const coreNodes: NodeDefinition[] = [
      {
        id: 'TEXT_INPUT',
        type: 'TEXT_INPUT',
        name: t('nodes.textInput.name'),
        description: t('nodes.textInput.description'),
        category: 'input',
        inputs: 0,
        outputs: 1,
        icon: 'text',
        popular: true
      },
      {
        id: 'LLM_QUERY',
        type: 'LLM_QUERY',
        name: t('nodes.llmQuery.name'),
        description: t('nodes.llmQuery.description'),
        category: 'ai',
        inputs: 1,
        outputs: 1,
        icon: 'brain',
        popular: true
      },
      {
        id: 'WEB_SEARCH',
        type: 'WEB_SEARCH',
        name: t('nodes.webSearch.name'), 
        description: t('nodes.webSearch.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'search',
        new: true
      },
      {
        id: 'DOCUMENT_QUERY',
        type: 'DOCUMENT_QUERY',
        name: t('nodes.documentQuery.name'),
        description: t('nodes.documentQuery.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'document'
      },
      {
        id: 'MODEL_SELECTOR',
        type: 'MODEL_SELECTOR',
        name: t('nodes.modelSelector.name'),
        description: t('nodes.modelSelector.description'),
        category: 'ai',
        inputs: 0,
        outputs: 1,
        icon: 'model'
      },
      {
        id: 'CUSTOM_NODE',
        type: 'CUSTOM_NODE',
        name: t('nodes.custom.name'),
        description: t('nodes.custom.description'),
        category: 'advanced',
        inputs: 1,
        outputs: 1,
        icon: 'code'
      },
      {
        id: 'ENCODER',
        type: 'ENCODER',
        name: t('nodes.encoder.name'),
        description: t('nodes.encoder.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'embed'
      },
      {
        id: 'SAMPLER',
        type: 'SAMPLER',
        name: t('nodes.sampler.name'),
        description: t('nodes.sampler.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'random'
      }
    ];

    this.nodeDefinitions.push(...coreNodes);
  }

  // 扫描节点文件夹并注册发现的节点
  private async scanNodeFolders(): Promise<void> {
    try {
      // 使用节点扫描器获取所有节点
      const categoryNodeMap = scanNodeComponents();
      
      // 收集所有发现的节点
      const discoveredNodes: NodeDefinition[] = [];
      
      // 处理每个类别中的节点
      Object.entries(categoryNodeMap).forEach(([category, nodes]) => {
        // 对于每个发现的节点，添加到列表中
        nodes.forEach(node => {
          // 确保节点有一个合适的图标
          if (!node.icon && NODE_ICON_MAP[node.type]) {
            node.icon = NODE_ICON_MAP[node.type];
          } else if (!node.icon) {
            node.icon = category; // 使用类别作为默认图标
          }
          
          discoveredNodes.push(node);
        });
      });
      
      // 过滤掉已存在的节点（避免与核心节点重复）
      const uniqueNodes = discoveredNodes.filter(node => 
        !this.nodeDefinitions.some(existing => existing.id === node.id)
      );
      
      this.nodeDefinitions.push(...uniqueNodes);
      
      console.log(`发现 ${uniqueNodes.length} 个新节点`);
    } catch (error) {
      console.error('扫描节点文件夹时出错:', error);
    }
  }

  // 按照分类组织节点
  private organizeNodesByCategory(t: (key: string) => string): void {
    const categoryMap: Map<string, NodeDefinition[]> = new Map();
    
    // 按照类别分组节点
    for (const node of this.nodeDefinitions) {
      const category = node.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      const nodesInCategory = categoryMap.get(category);
      if (nodesInCategory) {
        nodesInCategory.push(node);
      }
    }
    
    // 创建分类数组
    const categories: NodeCategory[] = [];
    
    // 处理所有分类，包括新添加的分类
    const allCategories = [
      { id: 'input', name: t('categories.input'), description: t('categories.inputDescription') },
      { id: 'AI_Task_Execution', name: t('categories.aiTaskExecution') || 'AI任务执行', description: t('categories.aiTaskExecutionDescription') || 'AI和机器学习相关的任务执行节点' },
      { id: 'Data_Manipulation_Utilities', name: t('categories.dataManipulation') || '数据操作工具', description: t('categories.dataManipulationDescription') || '数据处理、转换和操作工具' },
      { id: 'Flow_Control_Logic', name: t('categories.flowControl') || '流程控制逻辑', description: t('categories.flowControlDescription') || '控制工作流执行逻辑的节点' },
      { id: 'Monitoring_Debugging', name: t('categories.monitoring') || '监控与调试', description: t('categories.monitoringDescription') || '工作流监控和调试工具' },
      { id: 'output', name: t('categories.output'), description: t('categories.outputDescription') },
      { id: 'User_Interaction_Control', name: t('categories.userInteraction') || '用户交互控制', description: t('categories.userInteractionDescription') || '处理用户交互的节点' },
      { id: 'utility', name: t('categories.utility'), description: t('categories.utilityDescription') },
      { id: 'flow', name: t('categories.flow'), description: t('categories.flowDescription') },
      { id: 'advanced', name: t('categories.advanced'), description: t('categories.advancedDescription') }
    ];
    
    // 添加所有存在节点的分类
    for (const categoryInfo of allCategories) {
      if (categoryMap.has(categoryInfo.id)) {
        categories.push({
          id: categoryInfo.id,
          name: categoryInfo.name,
          description: categoryInfo.description,
          nodes: categoryMap.get(categoryInfo.id) || []
        });
      }
    }
    
    this.nodeCategories = categories;
  }

  // 注册自定义节点
  public registerCustomNode(node: NodeDefinition): void {
    // 检查节点是否已经存在
    const existingIndex = this.nodeDefinitions.findIndex(n => n.id === node.id);
    if (existingIndex >= 0) {
      // 更新现有节点
      this.nodeDefinitions[existingIndex] = { ...this.nodeDefinitions[existingIndex], ...node };
    } else {
      // 添加新节点
      this.nodeDefinitions.push(node);
    }
    
    // 重新组织节点分类
    this.organizeNodesByCategory((key: string) => key);
  }

  // 获取节点注册表实例
  public getNodeRegistry(): NodeRegistry {
    return this.nodeRegistry;
  }
}

export default NodeDiscoveryService;