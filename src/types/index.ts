// 节点类型枚举
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  LLM_QUERY = 'LLM_QUERY',
  WEB_SEARCH = 'WEB_SEARCH',
  DOCUMENT_QUERY = 'DOCUMENT_QUERY',
  MODEL_SELECTOR = 'MODEL_SELECTOR',
  CUSTOM_NODE = 'CUSTOM_NODE'
}

// 通用节点类型定义
export interface BaseNode {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: number;
  outputs: number;
  icon: string;
  popular?: boolean;
  new?: boolean;
}

// 节点分类定义
export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  nodes: BaseNode[];
}

// 工作流节点数据
export interface NodeData {
  id: string;
  type: string;
  position: Position;
  data: any;
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 工作流定义
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

// 边定义
export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: any;
}

// 执行状态定义
export interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  nodeStates: Record<string, NodeExecutionState>;
}

// 节点执行状态
export interface NodeExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

// 设置接口
export interface Settings {
  theme: 'dark' | 'light';
  language: string;
  autoSave: boolean;
  animationsEnabled: boolean;
  connectionStyle: 'bezier' | 'straight' | 'step' | 'smoothstep';
  nodeSnapToGrid: boolean;
  enableNotifications: boolean;
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

// 公共类型定义
export interface BaseProps {
  onClose?: () => void;
}

// 数据类型
export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  size?: string;
  category: string;
  tags: string[];
  parameters: number;
  lastUpdated: Date;
  installed?: boolean;
  popular?: boolean;
}

// 通用分类定义
export const Categories = {
  MODEL: {
    ALL: { id: 'all', name: '所有模型' },
    TEXT: { id: 'text', name: '文本模型' },
    IMAGE: { id: 'image', name: '图像模型' },
    AUDIO: { id: 'audio', name: '音频模型' },
    EMBEDDING: { id: 'embedding', name: '嵌入模型' },
    MULTIMODAL: { id: 'multimodal', name: '多模态模型' }
  }
} as const;

// 系统设置类型
export interface SystemSettings {
  theme: 'dark' | 'light';
  language: string;
  autoSave: boolean;
  animationsEnabled: boolean;
  connectionStyle: 'bezier' | 'straight' | 'step' | 'smoothstep';
  nodeSnapToGrid: boolean;
  enableNotifications: boolean;
}

// 默认系统设置
export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  language: 'zh-CN',
  autoSave: true,
  animationsEnabled: true,
  connectionStyle: 'bezier',
  nodeSnapToGrid: true,
  enableNotifications: true
};