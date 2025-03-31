import { NodeProps } from 'reactflow';
import { Node } from '../../types';

/**
 * 节点类别枚举
 */
export enum NodeCategoryType {
  INPUT = 'input',
  PROCESSING = 'processing',
  OUTPUT = 'output',
  AI = 'ai',
  UTILITY = 'utility',
  FLOW = 'flow',
  DATA = 'data',
  CUSTOM = 'custom'
}

/**
 * 端口类型枚举
 */
export enum PortType {
  INPUT = 'input',
  OUTPUT = 'output'
}

/**
 * 端口数据类型枚举
 */
export enum PortDataType {
  ANY = 'any',
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  EMBEDDING = 'embedding',
  MODEL = 'model'
}

/**
 * 端口定义接口
 */
export interface PortDefinition {
  /**
   * 端口唯一标识符
   */
  id: string;
  
  /**
   * 端口名称
   */
  name: string;
  
  /**
   * 端口类型
   */
  type: PortType;
  
  /**
   * 端口数据类型
   */
  dataType: PortDataType;
  
  /**
   * 端口描述
   */
  description?: string;
  
  /**
   * 是否为必需端口
   */
  required?: boolean;
  
  /**
   * 是否允许多个连接
   */
  multiple?: boolean;
  
  /**
   * 默认值
   */
  defaultValue?: any;
}

/**
 * 节点状态枚举
 */
export enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
  WAITING = 'waiting'
}

/**
 * 节点定义接口
 */
export interface NodeDefinition {
  /**
   * 节点类型唯一标识符
   */
  type: string;
  
  /**
   * 节点名称
   */
  name: string;
  
  /**
   * 节点描述
   */
  description: string;
  
  /**
   * 节点类别
   */
  category: string;
  
  /**
   * 节点图标
   */
  icon?: string;
  
  /**
   * 节点标签
   */
  label?: string;
  
  /**
   * 输入端口
   */
  inputs?: PortDefinition[];
  
  /**
   * 输出端口
   */
  outputs?: PortDefinition[];
  
  /**
   * 是否为热门节点
   */
  popular?: boolean;
  
  /**
   * 是否为新节点
   */
  new?: boolean;
  
  /**
   * 初始数据
   */
  initialData?: Record<string, any>;
  
  /**
   * 自定义样式
   */
  style?: Record<string, any>;
}

/**
 * 节点执行上下文接口
 */
export interface NodeExecutionContext {
  /**
   * 工作流ID
   */
  workflowId: string;
  
  /**
   * 执行ID
   */
  executionId: string;
  
  /**
   * 节点ID
   */
  nodeId: string;
  
  /**
   * 上下文元数据
   */
  metadata: Record<string, any>;
}

/**
 * 节点执行结果接口
 */
export interface NodeExecutionResult {
  /**
   * 输出数据
   */
  outputs: Record<string, any>;
  
  /**
   * 执行状态
   */
  status: NodeStatus;
  
  /**
   * 错误信息
   */
  error?: Error | string;
  
  /**
   * 执行元数据
   */
  metadata?: Record<string, any>;
  
  /**
   * 执行耗时（毫秒）
   */
  executionTime?: number;
}

/**
 * 节点分类接口
 */
export interface NodeCategoryInfo {
  /**
   * 分类ID
   */
  id: string;
  
  /**
   * 分类名称
   */
  name: string;
  
  /**
   * 分类描述
   */
  description: string;
  
  /**
   * 分类图标
   */
  icon?: string;
}