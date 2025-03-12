// 节点类型枚举
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  LLM_QUERY = 'LLM_QUERY',
  WEB_SEARCH = 'WEB_SEARCH',
  DOCUMENT_QUERY = 'DOCUMENT_QUERY',
  MODEL_SELECTOR = 'MODEL_SELECTOR',
  CUSTOM_NODE = 'CUSTOM_NODE'
}

// 节点接口
export interface Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: any;
  width?: number;
  height?: number;
}

// 连接接口
export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// 工作流接口
export interface Workflow {
  id: string;
  name: string;
  nodes: Node[];
  connections: Connection[];
}

// 节点数据接口
export interface NodeData {
  label: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

// 文本输入节点数据
export interface TextInputNodeData extends NodeData {
  text: string;
}

// LLM查询节点数据
export interface LlmQueryNodeData extends NodeData {
  prompt: string;
  model: string;
  result?: string;
}

// 网络搜索节点数据
export interface WebSearchNodeData extends NodeData {
  query: string;
  results?: string[];
}

// 文档查询节点数据
export interface DocumentQueryNodeData extends NodeData {
  query: string;
  documentPath: string;
  results?: string[];
}

// 模型选择器节点数据
export interface ModelSelectorNodeData extends NodeData {
  selectedModel: string;
  availableModels: string[];
}

// 自定义节点数据
export interface CustomNodeNodeData extends NodeData {
  code: string;
  result?: any;
} 