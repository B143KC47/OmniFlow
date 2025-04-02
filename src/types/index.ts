// 节点类型枚举
export enum NodeType {
  TEXT_INPUT = 'TEXT_INPUT',
  WEB_SEARCH = 'WEB_SEARCH',
  DOCUMENT_QUERY = 'DOCUMENT_QUERY',
  MODEL_SELECTOR = 'MODEL_SELECTOR',
  LLM_QUERY = 'LLM_QUERY',
  ENCODER = 'ENCODER',
  CUSTOM = 'CUSTOM_NODE',
  SAMPLER = 'SAMPLER',
  // 添加更多节点类型
  IMAGE_INPUT = 'IMAGE_INPUT',
  VIDEO_INPUT = 'VIDEO_INPUT',
  AUDIO_INPUT = 'AUDIO_INPUT',
  TEXT_OUTPUT = 'TEXT_OUTPUT',
  IMAGE_OUTPUT = 'IMAGE_OUTPUT',
  VIDEO_OUTPUT = 'VIDEO_OUTPUT',
  AUDIO_OUTPUT = 'AUDIO_OUTPUT',
  FILE_OUTPUT = 'FILE_OUTPUT',
  FILE_INPUT = 'FILE_INPUT',
  NOTE = 'NOTE',
  LOOP_CONTROL = 'LOOP_CONTROL'
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

// 节点分类类型
export enum NodeCategoryType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  PROCESSING = 'PROCESSING',
  AI_MODEL = 'AI_MODEL',
  FLOW_CONTROL = 'FLOW_CONTROL',
  DATA_OPERATION = 'DATA_OPERATION',
  UTILITY = 'UTILITY',
  CUSTOM = 'CUSTOM'
}

// 工作流节点数据 - 作为节点的 data 字段
export interface NodeData {
  label?: string;
  type?: string;  // 添加节点类型属性
  inputs?: {
    [key: string]: {
      type: string;
      value: any;
      placeholder?: string;
      options?: any[];
      [key: string]: any;
    };
  };
  outputs?: {
    [key: string]: {
      type: string;
      value: any;
      [key: string]: any;
    };
  };
  onChange?: (nodeId: string, data: any) => void;
  // 添加状态相关的属性
  status?: 'idle' | 'running' | 'completed' | 'error' | 'connected';
  connectStatus?: 'compatible' | 'incompatible' | null;
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 工作流节点接口 - 符合 ReactFlow 节点结构
export interface WorkflowNode {
  id: string;
  type: NodeType | string;
  position: Position;
  data: NodeData;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
}

// 工作流定义
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];         // 工作流标签
  favorite?: boolean;      // 是否收藏
  lastExecuted?: Date;     // 最后执行时间
  executionCount?: number; // 执行次数
  version?: string;        // 版本号
  author?: string;         // 作者
  isTemplate?: boolean;    // 是否为模板
  category?: string;       // 工作流分类
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

// 节点接口 - 保留用于兼容性
export interface Node {
  id: string;
  type: NodeType;  // 使用枚举类型
  position: { x: number; y: number };
  data: NodeData;
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