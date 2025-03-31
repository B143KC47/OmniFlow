import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { NodeData, Node, Edge, ExecutionState, NodeExecutionState, NodeType } from '../types';
import NodeFactory from '../core/nodes';  // 使用正确的导入路径，从index.ts中导入默认实例
import { v4 as uuidv4 } from 'uuid';

// 节点上下文状态接口
interface NodeContextState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  executionState: ExecutionState;
  isLoading: boolean;
  error: string | null;
}

// 节点上下文操作接口
interface NodeContextActions {
  addNode: (nodeType: NodeType, position: { x: number, y: number }) => Node;
  updateNode: (nodeId: string, data: Partial<NodeData>) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdge: (edgeId: string, data: Partial<Edge>) => void;
  executeWorkflow: () => Promise<void>;
  clearExecutionState: () => void;
  validateConnection: (sourceNodeId: string, targetNodeId: string, sourceHandle: string, targetHandle: string) => boolean;
}

// 创建节点上下文
const NodeContext = createContext<{
  state: NodeContextState;
  actions: NodeContextActions;
} | undefined>(undefined);

// 创建节点提供器组件
export const NodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const nodeFactory = NodeFactory;  // 直接使用导入的工厂实例
  
  // 定义节点上下文状态
  const [state, setState] = useState<NodeContextState>({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    executionState: {
      status: 'idle',
      nodeStates: {}
    },
    isLoading: false,
    error: null
  });
  
  // 添加节点
  const addNode = useCallback((nodeType: NodeType, position: { x: number, y: number }) => {
    const nodeId = `node-${uuidv4()}`;
    const newNode = nodeFactory.createNode(nodeType, nodeId, position);
    setState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    return newNode;
  }, [nodeFactory]);
  
  // 更新节点
  const updateNode = useCallback((nodeId: string, data: Partial<NodeData>) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    }));
  }, []);
  
  // 移除节点
  const removeNode = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      // 同时移除与该节点相关的边
      edges: prev.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    }));
  }, []);
  
  // 选择节点
  const selectNode = useCallback((nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: nodeId
    }));
  }, []);
  
  // 添加边
  const addEdge = useCallback((edge: Edge) => {
    setState(prev => ({
      ...prev,
      edges: [...prev.edges, edge]
    }));
  }, []);
  
  // 移除边
  const removeEdge = useCallback((edgeId: string) => {
    setState(prev => ({
      ...prev,
      edges: prev.edges.filter(edge => edge.id !== edgeId)
    }));
  }, []);
  
  // 更新边
  const updateEdge = useCallback((edgeId: string, data: Partial<Edge>) => {
    setState(prev => ({
      ...prev,
      edges: prev.edges.map(edge => 
        edge.id === edgeId ? { ...edge, ...data } : edge
      )
    }));
  }, []);

  // 验证连接是否有效
  const validateConnection = useCallback((
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle: string,
    targetHandle: string
  ) => {
    // 获取源节点和目标节点
    const sourceNode = state.nodes.find(node => node.id === sourceNodeId);
    const targetNode = state.nodes.find(node => node.id === targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return false;
    }
    
    // 提取句柄类型（移除 "input-" 或 "output-" 前缀）
    const sourceType = sourceHandle.startsWith('output-') 
      ? sourceHandle.substring(7)
      : sourceHandle;
      
    const targetType = targetHandle.startsWith('input-')
      ? targetHandle.substring(6)
      : targetHandle;
    
    // 获取源输出和目标输入的类型
    const sourceOutput = sourceNode.data?.outputs?.[sourceType];
    const targetInput = targetNode.data?.inputs?.[targetType];
    
    if (!sourceOutput || !targetInput) {
      return false;
    }
    
    // 简单类型检查：相同类型可以连接，或者目标接受任意类型
    return sourceOutput.type === targetInput.type || targetInput.type === 'any';
  }, [state.nodes]);
  
  // 执行整个工作流
  const executeWorkflow = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        executionState: {
          status: 'running',
          nodeStates: {}
        }
      }));
      
      // 找到入口节点（没有输入边的节点）
      const entryNodes = state.nodes.filter(node => {
        return !state.edges.some(edge => edge.target === node.id);
      });
      
      if (entryNodes.length === 0) {
        throw new Error('找不到工作流入口节点');
      }
      
      // 由于我们不再实现executeNode方法，这里简化工作流执行逻辑
      // 实际项目中需要实现具体的执行逻辑
      console.log('执行工作流:', entryNodes);
      
      // 模拟执行完成
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          executionState: {
            status: 'completed',
            nodeStates: {}
          }
        }));
      }, 1000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
        executionState: {
          ...prev.executionState,
          status: 'error'
        }
      }));
      console.error('执行工作流时出错:', error);
    }
  }, [state.nodes, state.edges]);
  
  // 清除执行状态
  const clearExecutionState = useCallback(() => {
    setState(prev => ({
      ...prev,
      executionState: {
        status: 'idle',
        nodeStates: {}
      },
      error: null
    }));
  }, []);
  
  // 创建上下文值
  const contextValue = {
    state,
    actions: {
      addNode,
      updateNode,
      removeNode,
      selectNode,
      addEdge,
      removeEdge,
      updateEdge,
      executeWorkflow,
      clearExecutionState,
      validateConnection,
    }
  };
  
  return (
    <NodeContext.Provider value={contextValue}>
      {children}
    </NodeContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问节点上下文
export const useNodeContext = () => {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error('useNodeContext 必须在 NodeProvider 内部使用');
  }
  return context;
};

// 自定义钩子，用于获取节点状态
export const useNodeState = (nodeId: string) => {
  const { state } = useNodeContext();
  const node = state.nodes.find(n => n.id === nodeId);
  const nodeState = state.executionState.nodeStates[nodeId];
  
  return {
    node,
    status: nodeState?.status || 'idle',
    result: nodeState?.result,
    error: nodeState?.error,
    isSelected: state.selectedNodeId === nodeId
  };
};

export default NodeContext;