// filepath: c:\Users\ko202\Desktop\project\OmniFlow\src\core\nodes\NodeFactory.ts
import { Node, NodeType } from '../../types';
import { BaseNode } from './BaseNode';
import NodeRegistry from './NodeRegistry';

/**
 * 节点工厂类
 * 负责创建和管理所有类型的节点实例
 */
export class NodeFactory {
  private static instance: NodeFactory;
  private nodeRegistry: NodeRegistry;
  private nodeInstances: Map<NodeType, BaseNode>;
  
  private constructor() {
    this.nodeRegistry = NodeRegistry.getInstance();
    this.nodeInstances = new Map();
  }
  
  /**
   * 获取单例实例
   */
  public static getInstance(): NodeFactory {
    if (!NodeFactory.instance) {
      NodeFactory.instance = new NodeFactory();
    }
    return NodeFactory.instance;
  }
  
  /**
   * 注册节点类
   * @param nodeType 节点类型
   * @param nodeInstance 节点实例
   */
  public registerNode(nodeType: NodeType, nodeInstance: BaseNode): void {
    if (this.nodeInstances.has(nodeType)) {
      console.warn(`节点类型 ${nodeType} 已存在，将被覆盖`);
    }
    this.nodeInstances.set(nodeType, nodeInstance);
  }
  
  /**
   * 创建节点实例
   * @param nodeType 节点类型
   * @param id 节点ID
   * @param position 节点位置
   * @param data 附加数据
   */
  public createNode(
    nodeType: NodeType, 
    id: string, 
    position: { x: number; y: number }, 
    data?: Record<string, any>
  ): Node {
    // 从注册表中获取节点实例
    const nodeInstance = this.nodeInstances.get(nodeType);
    
    if (!nodeInstance) {
      // 如果找不到实例，则尝试从注册表创建
      const nodeDefinition = this.nodeRegistry.getNodeDefinition(nodeType);
      if (nodeDefinition) {
        return {
          id,
          type: nodeType,
          position,
          data: {
            label: nodeDefinition.label || nodeDefinition.name,
            type: nodeType,
            ...(nodeDefinition.initialData || {}),
            ...data
          }
        };
      }
      throw new Error(`未找到节点类型 ${nodeType} 的实例或定义`);
    }
    
    // 使用节点实例创建数据
    return nodeInstance.createNodeData(id, position, data);
  }
  
  /**
   * 获取节点实例
   * @param nodeType 节点类型
   */
  public getNodeInstance(nodeType: NodeType): BaseNode | undefined {
    return this.nodeInstances.get(nodeType);
  }
  
  /**
   * 验证节点输入
   * @param nodeType 节点类型
   * @param inputs 节点输入
   */
  public validateNodeInputs(
    nodeType: NodeType, 
    inputs: Record<string, any>
  ): { isValid: boolean; errors: string[] } {
    const nodeInstance = this.getNodeInstance(nodeType);
    
    if (!nodeInstance) {
      return {
        isValid: false,
        errors: [`未找到节点类型 ${nodeType} 的实例`]
      };
    }
    
    return nodeInstance.validateInputs(inputs);
  }
  
  /**
   * 初始化系统内置节点
   * 应用启动时调用
   */
  public initializeBuiltinNodes(): void {
    // 这个方法将在应用启动时被调用，用于初始化所有内置节点
    // 后续可以在这里添加所有内置节点的注册逻辑
    console.log('初始化节点工厂');
  }
}

export default NodeFactory;