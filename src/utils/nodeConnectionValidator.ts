import { Node, Edge, NodeType } from '../types';
import NodeFactory, { NodeFactory as NodeFactoryClass } from '../core/nodes';

// 定义连接类型映射表，用于确定哪些输入/输出类型可以互相连接
// 一级键是输出类型，二级键是输入类型，值为布尔值表示是否兼容
export const CONNECTION_TYPE_COMPATIBILITY: Record<string, Record<string, boolean>> = {
  'text': {
    'text': true,
    'any': true,
    'string': true,
    'prompt': true
  },
  'string': {
    'text': true,
    'any': true,
    'string': true,
    'prompt': true
  },
  'number': {
    'number': true,
    'any': true
  },
  'boolean': {
    'boolean': true,
    'any': true
  },
  'image': {
    'image': true,
    'any': true,
    'media': true
  },
  'video': {
    'video': true,
    'any': true,
    'media': true
  },
  'audio': {
    'audio': true,
    'any': true,
    'media': true
  },
  'file': {
    'file': true,
    'any': true
  },
  'array': {
    'array': true,
    'any': true
  },
  'object': {
    'object': true,
    'any': true
  },
  'any': {
    'any': true,
    'text': true,
    'string': true,
    'number': true,
    'boolean': true,
    'image': true,
    'video': true,
    'audio': true,
    'file': true,
    'array': true,
    'object': true
  },
  'embedding': {
    'embedding': true,
    'any': true,
    'array': true
  },
  'model': {
    'model': true,
    'any': true
  },
  'media': {
    'media': true,
    'any': true
  }
};

/**
 * 节点连接验证器
 * 提供验证节点连接是否有效的方法
 */
export class NodeConnectionValidator {
  private static instance: NodeConnectionValidator;
  private nodeFactory: NodeFactoryClass;
  
  private constructor() {
    this.nodeFactory = NodeFactory;
  }
  
  /**
   * 获取验证器实例
   */
  public static getInstance(): NodeConnectionValidator {
    if (!NodeConnectionValidator.instance) {
      NodeConnectionValidator.instance = new NodeConnectionValidator();
    }
    return NodeConnectionValidator.instance;
  }
  
  /**
   * 根据句柄ID获取类型名称
   * @param handleId 句柄ID，例如 "input-text" 或 "output-image"
   * @returns 类型名称，例如 "text" 或 "image"
   */
  private getTypeFromHandleId(handleId: string): string {
    if (handleId.startsWith('input-')) {
      return handleId.substring(6);
    }
    if (handleId.startsWith('output-')) {
      return handleId.substring(7);
    }
    return handleId;
  }
  
  /**
   * 验证两个节点之间的连接是否有效
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   * @param sourceHandle 源句柄
   * @param targetHandle 目标句柄
   */
  public validateConnection(
    sourceNode: Node, 
    targetNode: Node, 
    sourceHandle: string, 
    targetHandle: string
  ): { valid: boolean; message?: string } {
    // 获取句柄类型
    const sourceType = this.getTypeFromHandleId(sourceHandle);
    const targetType = this.getTypeFromHandleId(targetHandle);
    
    // 检查节点输出和输入是否存在
    const sourceOutput = sourceNode.data?.outputs?.[sourceType];
    const targetInput = targetNode.data?.inputs?.[targetType];
    
    if (!sourceOutput) {
      return { valid: false, message: `源节点 ${sourceNode.id} 没有输出 "${sourceType}"` };
    }
    
    if (!targetInput) {
      return { valid: false, message: `目标节点 ${targetNode.id} 没有输入 "${targetType}"` };
    }
    
    // 获取输出和输入的数据类型
    const outputType = sourceOutput.type || 'any';
    const inputType = targetInput.type || 'any';
    
    // 检查是否可以连接
    const isCompatible = this.isConnectionTypeCompatible(outputType, inputType);
    if (!isCompatible) {
      return { 
        valid: false, 
        message: `不兼容的连接: "${outputType}" 类型不能连接到 "${inputType}" 类型` 
      };
    }
    
    // 检查目标输入是否已经有连接（每个输入只能有一个连接）
    if (targetInput.isConnected) {
      return { 
        valid: false, 
        message: `目标输入 "${targetType}" 已经连接到其他节点` 
      };
    }
    
    // 可以通过节点实例进行更细致的验证
    const sourceNodeType = sourceNode.type as NodeType;
    const targetNodeType = targetNode.type as NodeType;
    const sourceNodeInstance = this.nodeFactory.getNodeInstance(sourceNodeType);
    const targetNodeInstance = this.nodeFactory.getNodeInstance(targetNodeType);
    
    // 如果存在实例，可以进一步验证
    if (sourceNodeInstance && 'validateOutput' in sourceNodeInstance) {
      // 这里我们假设BaseNode可能会有validateOutput方法
      // 实际项目中可能需要扩展BaseNode类
      const validateOutput = (sourceNodeInstance as any).validateOutput;
      if (typeof validateOutput === 'function') {
        const outputValidation = validateOutput.call(sourceNodeInstance, sourceType);
        if (!outputValidation.valid) {
          return outputValidation;
        }
      }
    }
    
    if (targetNodeInstance && 'validateInput' in targetNodeInstance) {
      // 同理，这里假设BaseNode可能会有validateInput方法
      const validateInput = (targetNodeInstance as any).validateInput;
      if (typeof validateInput === 'function') {
        const inputValidation = validateInput.call(targetNodeInstance, targetType, sourceType);
        if (!inputValidation.valid) {
          return inputValidation;
        }
      }
    }
    
    return { valid: true };
  }
  
  /**
   * 检查两种数据类型是否兼容
   * @param outputType 输出类型
   * @param inputType 输入类型
   */
  public isConnectionTypeCompatible(outputType: string, inputType: string): boolean {
    // 检查连接兼容性表
    const outputCompatibility = CONNECTION_TYPE_COMPATIBILITY[outputType];
    if (outputCompatibility && outputCompatibility[inputType]) {
      return true;
    }
    
    // 对于未明确定义的类型，默认只有相同类型或 'any' 类型可以连接
    return outputType === inputType || inputType === 'any' || outputType === 'any';
  }
  
  /**
   * 获取一个输入类型与哪些输出类型兼容
   * @param inputType 输入类型
   */
  public getCompatibleOutputTypes(inputType: string): string[] {
    const compatibleTypes: string[] = [];
    
    // 遍历所有输出类型
    Object.entries(CONNECTION_TYPE_COMPATIBILITY).forEach(([outputType, compatibility]) => {
      if (compatibility[inputType]) {
        compatibleTypes.push(outputType);
      }
    });
    
    // 添加与输入类型相同的类型（如果未在映射表中）    
    if (!compatibleTypes.includes(inputType)) {
      compatibleTypes.push(inputType);
    }
    
    // 'any' 类型与所有类型兼容
    if (inputType === 'any' && !compatibleTypes.includes('any')) {
      compatibleTypes.push('any');
    }
    
    return compatibleTypes;
  }
  
  /**
   * 获取一个输出类型与哪些输入类型兼容
   * @param outputType 输出类型
   */
  public getCompatibleInputTypes(outputType: string): string[] {
    const compatibleTypes: string[] = [];
    const outputCompatibility = CONNECTION_TYPE_COMPATIBILITY[outputType];
    
    if (outputCompatibility) {
      // 添加兼容的输入类型
      Object.entries(outputCompatibility).forEach(([inputType, isCompatible]) => {
        if (isCompatible && !compatibleTypes.includes(inputType)) {
          compatibleTypes.push(inputType);
        }
      });
    } else {
      // 如果未定义，默认只与相同类型和 'any' 类型兼容
      compatibleTypes.push(outputType);
      compatibleTypes.push('any');
    }
    
    return compatibleTypes;
  }
  
  /**
   * 验证工作流中的所有连接是否有效
   * @param nodes 节点数据数组
   * @param edges 连接数据数组
   */
  public validateWorkflowConnections(
    nodes: Node[], 
    edges: Edge[]
  ): { valid: boolean; invalidEdges: { edge: Edge; message: string }[] } {
    const invalidEdges: { edge: Edge; message: string }[] = [];
    
    for (const edge of edges) {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        invalidEdges.push({
          edge,
          message: !sourceNode 
            ? `找不到源节点 ${edge.source}` 
            : `找不到目标节点 ${edge.target}`
        });
        continue;
      }
      
      const validation = this.validateConnection(
        sourceNode, 
        targetNode, 
        edge.sourceHandle || '', 
        edge.targetHandle || ''
      );
      
      if (!validation.valid) {
        invalidEdges.push({
          edge,
          message: validation.message || '无效的连接'
        });
      }
    }
    
    return {
      valid: invalidEdges.length === 0,
      invalidEdges
    };
  }
  
  /**
   * 设置节点的连接状态
   * 用于可视化反馈哪些节点可以连接
   * @param nodes 节点列表
   * @param sourceNode 当前正在连接的源节点
   * @param sourceHandle 源连接点
   * @param showCompatible 是否显示兼容状态
   */
  public setConnectionState(
    nodes: Node[],
    sourceNode: Node | null,
    sourceHandle: string | null,
    showCompatible: boolean
  ): Node[] {
    if (!sourceNode || !sourceHandle || !showCompatible) {
      // 清除所有节点的连接状态
      return nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          connectStatus: null
        }
      }));
    }
    
    // 获取源连接点的类型
    const sourceType = this.getTypeFromHandleId(sourceHandle);
    const sourceOutput = sourceNode.data?.outputs?.[sourceType];
    
    if (!sourceOutput) {
      return nodes;
    }
    
    const outputType = sourceOutput.type || 'any';
    
    // 更新每个节点的连接状态
    return nodes.map(node => {
      // 源节点自身不需要标记兼容性
      if (node.id === sourceNode.id) {
        return node;
      }
      
      // 检查节点的每个输入是否与当前输出兼容
      let hasCompatibleInput = false;
      
      if (node.data?.inputs) {
        for (const [inputName, input] of Object.entries(node.data.inputs)) {
          // 确保输入对象有type属性，如果没有则使用'any'
          const inputType = (input && typeof input === 'object' && 'type' in input) 
            ? input.type as string 
            : 'any';
            
          if (this.isConnectionTypeCompatible(outputType, inputType)) {
            hasCompatibleInput = true;
            break;
          }
        }
      }
      
      return {
        ...node,
        data: {
          ...node.data,
          connectStatus: hasCompatibleInput ? 'compatible' : 'incompatible'
        }
      };
    });
  }
}

export default NodeConnectionValidator;