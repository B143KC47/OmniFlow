import { NodeType } from '../types';
import { getNodeComponentMap, scanNodeComponents } from '../utils/nodeScanner';
import { NodeDefinition } from './NodeDiscoveryService';
import dynamic from 'next/dynamic';
import React from 'react';

/**
 * 节点注册表类 - 负责管理节点类型和组件之间的映射关系
 */
class NodeRegistry {
  // 单例实例
  private static instance: NodeRegistry;
  
  // 节点类型到组件的映射
  private nodeComponents: Record<string, React.ComponentType<any>> = {};
  
  // 节点类型到节点定义的映射
  private nodeDefinitions: Record<string, NodeDefinition> = {};
  
  // 节点类型映射表（小写 key 到标准类型的映射）
  private nodeTypeMap: Record<string, string> = {};
  
  // 初始化标志
  private isInitialized = false;
  
  // 加载错误
  private errors: string[] = [];

  /**
   * 私有构造函数，防止直接实例化
   */
  private constructor() {}

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
   * 初始化节点注册表
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // 清空错误列表
      this.errors = [];
      
      console.log('开始初始化节点注册表...');
      
      // 1. 扫描所有节点组件
      const componentMap = this.scanNodeComponents();
      
      // 2. 注册核心节点
      this.registerCoreNodes();
      
      // 3. 验证节点类型与组件的一致性
      this.validateNodeComponents();
      
      this.isInitialized = true;
      console.log('节点注册表初始化完成');
      
      // 如果有错误，输出日志
      if (this.errors.length > 0) {
        console.warn(`初始化节点注册表时发现 ${this.errors.length} 个问题:`);
        this.errors.forEach(error => console.warn(`- ${error}`));
      }
    } catch (error) {
      console.error('初始化节点注册表失败:', error);
      throw error;
    }
  }

  /**
   * 扫描所有节点组件并构建映射
   */
  private scanNodeComponents(): Record<string, any> {
    try {
      // 获取所有节点组件
      const componentMap = getNodeComponentMap();
      console.log('获取节点组件映射完成');
      
      // 遍历节点定义，为每个节点类型创建动态导入
      Object.entries(componentMap).forEach(([nodeType, componentPath]) => {
        try {
          // 标准化节点类型
          const normalizedType = this.normalizeNodeType(nodeType);
          
          // 将路径字符串转换为动态导入的组件
          if (typeof componentPath === 'string') {
            console.log(`为节点 ${normalizedType} 创建动态导入，路径: ${componentPath}`);
            
            // 创建动态导入组件，使用通用渲染器
            this.nodeComponents[normalizedType] = dynamic(
              () => import('../components/ReactFlowNodeRenderer')
                .then(mod => {
                  console.log(`成功加载节点渲染器: ${normalizedType}`);
                  return mod.default;
                })
                .catch(err => {
                  console.error(`加载节点渲染器失败 ${normalizedType}:`, err);
                  // 返回一个基本的占位组件，但不使用JSX语法
                  return function PlaceholderComponent() {
                    // 使用React.createElement代替JSX
                    return React.createElement('div', {
                      style: { 
                        padding: '10px', 
                        background: '#141414', 
                        border: '1px solid #333',
                        borderRadius: '5px',
                        color: '#fff',
                        width: '120px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    }, normalizedType);
                  };
                }),
              { 
                ssr: false,
                loading: function LoadingComponent() {
                  return React.createElement('div', {
                    style: { 
                      padding: '10px', 
                      background: '#141414', 
                      border: '1px dashed #333',
                      borderRadius: '5px',
                      color: '#555',
                      width: '120px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }
                  }, '加载中...');
                }
              }
            );
          } else {
            // 如果已经是组件，直接使用
            this.nodeComponents[normalizedType] = componentPath;
          }
          
          // 添加类型映射（小写 -> 标准类型）
          this.nodeTypeMap[normalizedType.toLowerCase()] = normalizedType;
        } catch (itemError) {
          console.error(`处理节点 ${nodeType} 时出错:`, itemError);
          this.errors.push(`处理节点 ${nodeType} 时出错: ${itemError instanceof Error ? itemError.message : String(itemError)}`);
        }
      });
      
      return componentMap;
    } catch (error) {
      console.error('扫描节点组件失败:', error);
      this.errors.push(`扫描节点组件失败: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  /**
   * 注册核心节点
   */
  private registerCoreNodes(): void {
    // 设置常用节点的动态导入
    const coreNodeTypes: [string, string][] = [
      ['TEXT_INPUT', '../components/nodes/input/TextInputNode'],
      ['WEB_SEARCH', '../components/nodes/WebSearchNode'],
      ['DOCUMENT_QUERY', '../components/nodes/DocumentQueryNode'],
      ['MODEL_SELECTOR', '../components/nodes/ai/ModelSelectorNode'],
      ['LLM_QUERY', '../components/nodes/ai/LlmQueryNode'],
      ['CUSTOM_NODE', '../components/nodes/CustomNode'],
      ['ENCODER', '../components/nodes/EncoderNode'],
      ['SAMPLER', '../components/nodes/SamplerNode'],
    ];
    
    // 注册核心节点
    coreNodeTypes.forEach(([nodeType, path]) => {
      const normalizedType = this.normalizeNodeType(nodeType);

      // 如果没有已经注册的组件，使用动态导入
      if (!this.nodeComponents[normalizedType]) {
        console.log(`正在注册核心节点: ${normalizedType}`);
        
        // 使用统一的节点渲染器组件
        this.nodeComponents[normalizedType] = dynamic(() => import('../components/ReactFlowNodeRenderer').then(mod => {
          console.log(`成功加载节点组件: ${normalizedType}`);
          return mod.default;
        }), { 
          ssr: false 
        });
      }
      
      // 添加类型映射（小写 -> 标准类型）
      this.nodeTypeMap[normalizedType.toLowerCase()] = normalizedType;
      
      // 添加类型映射（驼峰 -> 标准类型）
      const camelCaseKey = this.toCamelCase(normalizedType);
      this.nodeTypeMap[camelCaseKey] = normalizedType;
    });
  }

  /**
   * 验证节点组件一致性
   */
  private validateNodeComponents(): void {
    // 获取所有枚举的节点类型
    const nodeTypeValues = Object.values(NodeType);
    
    // 检查每个节点类型是否都有对应的组件
    nodeTypeValues.forEach(nodeType => {
      const normalizedType = this.normalizeNodeType(nodeType);
      
      if (!this.nodeComponents[normalizedType]) {
        this.errors.push(`节点类型 "${normalizedType}" 没有对应的组件实现`);
      }
    });
    
    // 检查是否有组件没有对应的类型
    Object.keys(this.nodeComponents).forEach(nodeType => {
      if (!nodeTypeValues.includes(nodeType as NodeType) && !Object.values(NodeType).includes(nodeType as any)) {
        console.warn(`组件类型 "${nodeType}" 不在 NodeType 枚举中，可能需要添加到枚举定义`);
      }
    });
  }

  /**
   * 标准化节点类型字符串
   */
  private normalizeNodeType(nodeType: string): string {
    // 移除空格并转为大写
    return nodeType.trim().toUpperCase();
  }

  /**
   * 将大写下划线格式转为驼峰格式
   */
  private toCamelCase(str: string): string {
    // 将大写下划线格式 (TEXT_INPUT) 转为驼峰格式 (textInput)
    return str.toLowerCase()
      .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  }

  /**
   * 获取所有注册的节点组件
   */
  public getNodeComponents(): Record<string, React.ComponentType<any>> {
    return this.nodeComponents;
  }

  /**
   * 获取节点类型映射表
   */
  public getNodeTypeMap(): Record<string, string> {
    return this.nodeTypeMap;
  }

  /**
   * 注册新的节点类型
   */
  public registerNodeType(
    nodeType: string, 
    component: React.ComponentType<any>,
    nodeDefinition?: NodeDefinition
  ): void {
    const normalizedType = this.normalizeNodeType(nodeType);
    
    // 存储组件
    this.nodeComponents[normalizedType] = component;
    
    // 添加类型映射（小写 -> 标准类型）
    this.nodeTypeMap[normalizedType.toLowerCase()] = normalizedType;
    
    // 添加类型映射（驼峰 -> 标准类型）
    const camelCaseKey = this.toCamelCase(normalizedType);
    this.nodeTypeMap[camelCaseKey] = normalizedType;
    
    // 如果提供了节点定义，存储它
    if (nodeDefinition) {
      this.nodeDefinitions[normalizedType] = nodeDefinition;
    }
    
    console.log(`注册节点类型: ${normalizedType}`);
  }

  /**
   * 获取节点类型对应的组件
   */
  public getNodeComponent(nodeType: string): React.ComponentType<any> | undefined {
    // 标准化节点类型
    const normalizedType = this.normalizeNodeType(nodeType);
    
    // 查找组件
    return this.nodeComponents[normalizedType];
  }

  /**
   * 从任意类型表示获取标准化的节点类型
   */
  public resolveNodeType(nodeType: string): string | undefined {
    // 如果是标准类型，直接返回
    if (this.nodeComponents[this.normalizeNodeType(nodeType)]) {
      return this.normalizeNodeType(nodeType);
    }
    
    // 尝试从映射表中查找
    return this.nodeTypeMap[nodeType.toLowerCase()] || 
           this.nodeTypeMap[nodeType];
  }

  /**
   * 获取初始化错误信息
   */
  public getErrors(): string[] {
    return this.errors;
  }

  /**
   * 确保基本组件可用，即使在初始化失败的情况下
   */
  private ensureBasicComponents(): void {
    // 确保至少有一个默认组件可用
    if (Object.keys(this.nodeComponents).length === 0) {
      console.log('添加默认组件作为应急措施');
      
      // 添加一个默认组件
      try {
        // 直接使用一个简单的占位组件，避免动态导入可能引起的问题
        this.nodeComponents['DEFAULT_NODE'] = function DefaultNode() {
          return React.createElement('div', {
            style: { 
              padding: '10px', 
              background: '#141414', 
              border: '1px solid #333',
              borderRadius: '5px',
              color: '#fff',
              width: '120px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }
          }, '默认节点');
        };
        
        // 添加类型映射
        this.nodeTypeMap['default_node'] = 'DEFAULT_NODE';
        console.log('成功添加默认占位节点组件');
      } catch (error) {
        console.error('添加默认组件失败:', error);
      }
    }
  }
}

export default NodeRegistry;