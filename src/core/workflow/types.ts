import { Node } from '../../types/index';

/**
 * 节点执行器接口
 * 定义节点执行的方法
 */
export interface NodeExecutor {
  /**
   * 执行节点
   * @param node 节点数据
   * @param inputs 节点输入数据
   */
  execute: (node: Node, inputs: Record<string, any>) => Promise<Record<string, any>>;
}

/**
 * 节点执行器映射
 * 将节点类型映射到对应的执行器
 */
export interface NodeExecutorMap {
  [key: string]: NodeExecutor;
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  /**
   * 节点输出
   * 每个节点的输出数据
   */
  nodeOutputs: Map<string, Record<string, any>>;
  
  /**
   * 节点输入
   * 每个节点的输入数据
   */
  nodeInputs: Map<string, Record<string, any>>;
}

/**
 * 工作流状态
 */
export enum WorkflowStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused'
}

/**
 * 工作流执行配置
 */
export interface WorkflowExecutionOptions {
  /**
   * 是否并行执行
   * 如果为true，则尝试并行执行没有依赖关系的节点
   */
  parallel?: boolean;
  
  /**
   * 超时时间(毫秒)
   * 如果指定，则在超时后停止执行
   */
  timeout?: number;
  
  /**
   * 错误处理策略
   * - 'stop': 任何节点失败都停止执行
   * - 'continue': 节点失败后继续执行其他节点
   * - 'retry': 失败后重试节点执行
   */
  errorHandling?: 'stop' | 'continue' | 'retry';
  
  /**
   * 重试次数
   * 当errorHandling为'retry'时有效
   */
  retryCount?: number;
}

/**
 * 节点执行状态
 */
export interface NodeExecutionState {
  /**
   * 节点ID
   */
  nodeId: string;
  
  /**
   * 状态
   */
  status: WorkflowStatus;
  
  /**
   * 开始时间
   */
  startTime?: Date;
  
  /**
   * 结束时间
   */
  endTime?: Date;
  
  /**
   * 错误信息
   */
  error?: string;
  
  /**
   * 重试次数
   */
  retryCount: number;
}