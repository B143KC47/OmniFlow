// 节点工厂 - 负责创建和管理节点组件
import React from 'react';
import { NodeData } from '../../types';

/**
 * 节点组件的属性接口
 */
export interface NodeComponentProps {
  id: string;
  data: NodeData;
  selected?: boolean;
  isConnectable?: boolean;
  onDataChange?: (nodeId: string, newData: any) => void;
}

/**
 * 节点定义接口 - 用于向节点工厂注册节点类型
 */
export interface NodeDefinition {
  type: string;             // 节点类型标识符
  category: string;         // 节点分类
  name: string;             // 节点显示名称
  description: string;      // 节点描述
  icon: string;             // 节点图标（可以是Unicode字符或图标名称）
  component: React.ComponentType<NodeComponentProps>; // 节点React组件
  defaultConfig?: any;      // 节点的默认配置
}

/**
 * 节点工厂类 - 单例模式
 * 负责管理所有注册的节点类型和创建节点实例
 */
class NodeFactory {
  private static instance: NodeFactory;
  private nodeDefinitions: Map<string, NodeDefinition>;
  private initialized: boolean = false;

  /**
   * 私有构造函数，防止外部直接实例化
   */
  private constructor() {
    this.nodeDefinitions = new Map();
  }

  /**
   * 获取NodeFactory单例
   */
  public static getInstance(): NodeFactory {
    if (!NodeFactory.instance) {
      NodeFactory.instance = new NodeFactory();
    }
    return NodeFactory.instance;
  }

  /**
   * 初始化节点工厂
   */
  public initialize(): void {
    if (this.initialized) {
      console.warn('NodeFactory已经初始化');
      return;
    }
    
    console.log('初始化节点工厂');
    this.initialized = true;
  }

  /**
   * 检查节点工厂是否已初始化
   * @returns 是否已初始化
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 注册节点类型
   * @param definition 节点定义
   */
  public registerNodeType(definition: NodeDefinition): void {
    if (this.nodeDefinitions.has(definition.type)) {
      console.warn(`节点类型 ${definition.type} 已存在，将被覆盖`);
    }
    
    this.nodeDefinitions.set(definition.type, definition);
    console.log(`已注册节点类型: ${definition.type}`);
  }

  /**
   * 批量注册节点类型
   * @param definitions 节点定义数组
   */
  public registerNodeTypes(definitions: NodeDefinition[]): void {
    definitions.forEach(definition => this.registerNodeType(definition));
  }

  /**
   * 根据类型创建节点组件
   * @param type 节点类型
   * @returns 对应的React组件
   */
  public createNodeComponent(type: string): React.ComponentType<NodeComponentProps> | null {
    const definition = this.nodeDefinitions.get(type);
    
    if (!definition) {
      console.warn(`未找到节点类型 ${type} 的定义`);
      return null;
    }
    
    return definition.component;
  }

  /**
   * 获取节点定义
   * @param type 节点类型
   * @returns 节点定义
   */
  public getNodeDefinition(type: string): NodeDefinition | undefined {
    return this.nodeDefinitions.get(type);
  }

  /**
   * 获取所有节点定义
   * @returns 所有节点定义的数组
   */
  public getAllNodeDefinitions(): NodeDefinition[] {
    return Array.from(this.nodeDefinitions.values());
  }

  /**
   * 获取特定分类的节点定义
   * @param category 节点分类
   * @returns 符合该分类的节点定义数组
   */
  public getNodeDefinitionsByCategory(category: string): NodeDefinition[] {
    return this.getAllNodeDefinitions().filter(def => def.category === category);
  }

  /**
   * 检查节点类型是否已注册
   * @param type 节点类型
   * @returns 是否已注册
   */
  public hasNodeType(type: string): boolean {
    return this.nodeDefinitions.has(type);
  }

  /**
   * 根据节点类型获取默认配置
   * @param type 节点类型
   * @returns 默认配置对象
   */
  public getDefaultConfig(type: string): any {
    const definition = this.nodeDefinitions.get(type);
    return definition?.defaultConfig || {};
  }

  /**
   * 清除所有注册的节点类型（主要用于测试）
   */
  public clearNodeTypes(): void {
    this.nodeDefinitions.clear();
  }
}

export default NodeFactory;