import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

// 节点类型枚举
export enum NodeType {
  // 基础节点
  TEXT_INPUT = 'textInput',         // 文本输入节点
  
  // AI 处理节点
  LLM_QUERY = 'llmQuery',          // LLM 查询节点
  MODEL_SELECTOR = 'modelSelector', // 模型选择节点
  
  // 数据检索节点
  WEB_SEARCH = 'webSearch',        // 网络搜索节点
  DOCUMENT_QUERY = 'documentQuery', // 文档查询节点
  
  // 高级节点
  ENCODER = 'encoder',             // 编码器节点
  SAMPLER = 'sampler',             // 采样器节点
  CUSTOM = 'custom'                // 自定义节点
}

// 为了向后兼容，保留 NodeTypeEnum
export const NodeTypeEnum = NodeType;

export interface NodeData {
  label: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  onChange?: (nodeId: string, data: any) => void;
}

export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type Edge = ReactFlowEdge;

// 连接接口定义
export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

// 工作流接口定义
export interface Workflow {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
} 