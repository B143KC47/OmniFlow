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
  'IMAGE_INPUT': 'image',
  'FILE_INPUT': 'file',
  'LLM_QUERY': 'brain',
  'WEB_SEARCH': 'search',
  'DOCUMENT_QUERY': 'document',
  'MODEL_SELECTOR': 'model',
  'CUSTOM_NODE': 'code',
  'ENCODER': 'embed',
  'SAMPLER': 'random',
  'LOOP_CONTROL': 'loop',
  'TEXT_OUTPUT': 'text-out',
  'IMAGE_OUTPUT': 'image-out',
  'FILE_OUTPUT': 'file-out',
  'DATA_TRANSFORM': 'transform',
  'CONDITION': 'condition',
  'LOGGER': 'log',
  'VISUALIZER': 'chart',
  'USER_INPUT': 'user',
  'CONFIRMATION': 'confirm',
  'IMAGE_GENERATION': 'image'
};

// 预设文件夹与分类的映射关系
const FOLDER_CATEGORY_MAP: Record<string, string> = {
  'input': 'input',
  'ai': 'AI_Task_Execution',
  'flow': 'Flow_Control_Logic',
  'advanced': 'advanced',
  'search': 'utility',
  'output': 'output',
  'utility': 'Data_Manipulation_Utilities',
  'data': 'Data_Manipulation_Utilities',
  'debug': 'Monitoring_Debugging',
  'interaction': 'User_Interaction_Control'
};

// 分类的国际化映射
const CATEGORY_I18N_MAP: Record<string, string> = {
  'input': 'nodes.categories.input',
  'AI_Task_Execution': 'nodes.categories.aiTaskExecution',
  'Data_Manipulation_Utilities': 'nodes.categories.dataManipulation',
  'Flow_Control_Logic': 'nodes.categories.flowControl',
  'Monitoring_Debugging': 'nodes.categories.monitoring',
  'output': 'nodes.categories.output',
  'User_Interaction_Control': 'nodes.categories.userInteraction',
  'utility': 'nodes.categories.utility',
  'flow': 'nodes.categories.flow',
  'advanced': 'nodes.categories.advanced'
};

class NodeDiscoveryService {
  private static instance: NodeDiscoveryService;
  private nodeDefinitions: NodeDefinition[] = [];
  private nodeCategories: NodeCategory[] = [];
  private isInitialized = false;
  private nodeRegistry: NodeRegistry;
  private translateFunc: ((key: string) => string) | null = null;

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

    // 保存翻译函数用于后续操作
    this.translateFunc = t;

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
        category: 'AI_Task_Execution',
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
        category: 'Data_Manipulation_Utilities',
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
        category: 'Data_Manipulation_Utilities',
        inputs: 1,
        outputs: 1,
        icon: 'document'
      },
      {
        id: 'MODEL_SELECTOR',
        type: 'MODEL_SELECTOR',
        name: t('nodes.modelSelector.name'),
        description: t('nodes.modelSelector.description'),
        category: 'AI_Task_Execution',
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
        category: 'Data_Manipulation_Utilities',
        inputs: 1,
        outputs: 1,
        icon: 'embed'
      },
      {
        id: 'SAMPLER',
        type: 'SAMPLER',
        name: t('nodes.sampler.name'),
        description: t('nodes.sampler.description'),
        category: 'Flow_Control_Logic',
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
        // 确定正确的分类ID
        const mappedCategory = FOLDER_CATEGORY_MAP[category] || category;
        
        // 对于每个发现的节点，添加到列表中
        nodes.forEach(node => {
          // 确保节点有一个合适的图标
          if (!node.icon && NODE_ICON_MAP[node.type]) {
            node.icon = NODE_ICON_MAP[node.type];
          } else if (!node.icon) {
            node.icon = category; // 使用类别作为默认图标
          }
          
          // 确保节点分类正确
          const nodeWithCategory = {
            ...node,
            category: mappedCategory
          };
          
          discoveredNodes.push(nodeWithCategory);
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
      { id: 'input', name: t('nodes.categories.input'), description: t('nodes.categories.inputDescription') },
      { id: 'AI_Task_Execution', name: t('nodes.categories.aiTaskExecution') || t('defaultCategories.aiTaskExecution'), description: t('nodes.categories.aiTaskExecutionDescription') || t('defaultDescriptions.aiTaskExecution') },
      { id: 'Data_Manipulation_Utilities', name: t('nodes.categories.dataManipulation') || t('defaultCategories.dataManipulation'), description: t('nodes.categories.dataManipulationDescription') || t('defaultDescriptions.dataManipulation') },
      { id: 'Flow_Control_Logic', name: t('nodes.categories.flowControl') || t('defaultCategories.flowControl'), description: t('nodes.categories.flowControlDescription') || t('defaultDescriptions.flowControl') },
      { id: 'Monitoring_Debugging', name: t('nodes.categories.monitoring') || t('defaultCategories.monitoring'), description: t('nodes.categories.monitoringDescription') || t('defaultDescriptions.monitoring') },
      { id: 'output', name: t('nodes.categories.output'), description: t('nodes.categories.outputDescription') || t('defaultDescriptions.output')},
      { id: 'User_Interaction_Control', name: t('nodes.categories.userInteraction') || t('defaultCategories.userInteraction'), description: t('nodes.categories.userInteractionDescription') || t('defaultDescriptions.userInteraction') },
      { id: 'utility', name: t('nodes.categories.utility'), description: t('nodes.categories.utilityDescription') },
      { id: 'flow', name: t('nodes.categories.flow'), description: t('nodes.categories.flowDescription') },
      { id: 'advanced', name: t('nodes.categories.advanced'), description: t('nodes.categories.advancedDescription') }
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
    
    // 检查是否有未包含在预定义分类中的节点类别
    for (const [categoryId, nodes] of categoryMap.entries()) {
      if (!categories.some(cat => cat.id === categoryId)) {
        // 尝试获取此类别的国际化名称
        const categoryName = this.translateCategory(categoryId, t);
        const categoryDescription = this.translateCategoryDescription(categoryId, t);
        
        categories.push({
          id: categoryId,
          name: categoryName,
          description: categoryDescription,
          nodes: nodes
        });
      }
    }
    
    this.nodeCategories = categories;
  }

  // 翻译分类名称
  private translateCategory(categoryId: string, t: (key: string) => string): string {
    // 检查是否有预设的国际化映射
    if (CATEGORY_I18N_MAP[categoryId]) {
      const translated = t(CATEGORY_I18N_MAP[categoryId]);
      if (translated !== CATEGORY_I18N_MAP[categoryId]) {
        return translated;
      }
    }
    
    // 尝试使用默认的分类国际化路径
    const defaultKey = `nodes.categories.${categoryId.toLowerCase()}`;
    const translated = t(defaultKey);
    if (translated !== defaultKey) {
      return translated;
    }
    
    // 尝试使用备用分类国际化路径
    const fallbackKey = `defaultCategories.${categoryId.toLowerCase()}`;
    const fallbackTranslated = t(fallbackKey);
    if (fallbackTranslated !== fallbackKey) {
      return fallbackTranslated;
    }
    
    // 格式化分类ID作为后备
    return categoryId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  }
  
  // 翻译分类描述
  private translateCategoryDescription(categoryId: string, t: (key: string) => string): string {
    // 尝试使用描述国际化路径
    const descriptionKey = `nodes.categories.${categoryId.toLowerCase()}Description`;
    const translated = t(descriptionKey);
    if (translated !== descriptionKey) {
      return translated;
    }
    
    // 尝试使用备用描述国际化路径
    const fallbackKey = `defaultDescriptions.${categoryId.toLowerCase()}`;
    const fallbackTranslated = t(fallbackKey);
    if (fallbackTranslated !== fallbackKey) {
      return fallbackTranslated;
    }
    
    // 格式化分类ID作为后备
    return `${this.translateCategory(categoryId, t)} 类型的节点`;
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
    
    // 如果有翻译函数，使用它更新节点名称和描述
    if (this.translateFunc) {
      const nodeType = node.type.toLowerCase().replace(/_/g, '');
      const nameKey = `nodes.${nodeType}.name`;
      const descKey = `nodes.${nodeType}.description`;
      
      const translatedName = this.translateFunc(nameKey);
      if (translatedName !== nameKey) {
        node.name = translatedName;
      }
      
      const translatedDesc = this.translateFunc(descKey);
      if (translatedDesc !== descKey) {
        node.description = translatedDesc;
      }
    }
    
    // 重新组织节点分类
    if (this.translateFunc) {
      this.organizeNodesByCategory(this.translateFunc);
    } else {
      this.organizeNodesByCategory((key: string) => key);
    }
  }

  // 获取节点注册表实例
  public getNodeRegistry(): NodeRegistry {
    return this.nodeRegistry;
  }
}

export default NodeDiscoveryService;