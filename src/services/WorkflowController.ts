import { Node, Connection } from '../types';
import WorkflowEngine from './WorkflowEngine';
import { WorkflowExecutionOptions } from '../core/workflow/types';

export interface ExecutionState {
  isRunning: boolean;
  currentNodeId: string | null;
  completedNodeIds: Set<string>;
  nodeResults: Map<string, any>;
  nodeInputs?: Map<string, any>;
  progress: number;
  error: Error | null;
}

/**
 * 工作流控制器
 * 负责管理工作流执行状态和进度
 */
class WorkflowController {
  private engine: WorkflowEngine;
  private state: ExecutionState;
  private stateChangeCallbacks: ((state: ExecutionState) => void)[] = [];
  private executionTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
    this.engine = new WorkflowEngine();
    this.engine.initialize();
    this.state = this.getInitialState();
  }

  /**
   * 获取初始状态
   */
  private getInitialState(): ExecutionState {
    return {
      isRunning: false,
      currentNodeId: null,
      completedNodeIds: new Set<string>(),
      nodeResults: new Map<string, any>(),
      nodeInputs: new Map<string, any>(),
      progress: 0,
      error: null,
    };
  }

  /**
   * 重置状态
   */
  private resetState() {
    this.state = this.getInitialState();
  }

  /**
   * 订阅状态变化
   * @param callback 状态变化回调
   */
  public onStateChange(callback: (state: ExecutionState) => void) {
    this.stateChangeCallbacks.push(callback);
    // 立即触发一次回调，同步当前状态
    callback(this.cloneState());
  }

  /**
   * 取消订阅状态变化
   * @param callback 状态变化回调
   */
  public offStateChange(callback: (state: ExecutionState) => void) {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange() {
    const stateCopy = this.cloneState();
    this.stateChangeCallbacks.forEach(callback => callback(stateCopy));
  }

  /**
   * 克隆当前状态
   */
  private cloneState(): ExecutionState {
    return {
      ...this.state,
      completedNodeIds: new Set(this.state.completedNodeIds),
      nodeResults: new Map(this.state.nodeResults),
      nodeInputs: this.state.nodeInputs ? new Map(this.state.nodeInputs) : undefined
    };
  }

  /**
   * 执行工作流
   * @param nodes 节点列表
   * @param connections 连接列表
   * @param options 执行选项
   */
  public async execute(
    nodes: Node[], 
    connections: Connection[],
    options?: WorkflowExecutionOptions
  ) {
    if (this.state.isRunning) {
      throw new Error('工作流正在执行中');
    }

    this.resetState();
    this.state.isRunning = true;
    this.notifyStateChange();

    // 设置全局超时
    if (options?.timeout) {
      this.setExecutionTimeout(options.timeout);
    }

    try {
      // 显示执行准备动画
      for (const node of nodes) {
        this.state.currentNodeId = node.id;
        this.state.progress = this.calculateProgress(nodes.length);
        this.notifyStateChange();
        
        // 等待一小段时间，以便UI更新
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      // 实际执行工作流
      console.log('开始执行工作流...', { 
        节点数: nodes.length, 
        连接数: connections.length 
      });
      
      const result = await this.engine.execute(nodes, connections, options);
      
      // 更新执行结果
      result.nodeOutputs.forEach((outputs, nodeId) => {
        this.state.nodeResults.set(nodeId, outputs);
        this.state.completedNodeIds.add(nodeId);
      });
      
      // 可选保存节点输入
      if (result.nodeInputs) {
        this.state.nodeInputs = result.nodeInputs;
      }

      this.state.currentNodeId = null;
      this.state.isRunning = false;
      this.state.progress = 1; // 100% 完成
      this.clearExecutionTimeout();
      this.notifyStateChange();
      
      console.log('工作流执行完成');
      return result;
    } catch (error) {
      this.state.error = error as Error;
      this.state.isRunning = false;
      this.clearExecutionTimeout();
      this.notifyStateChange();
      
      console.error('工作流执行失败:', error);
      throw error;
    }
  }

  /**
   * 停止工作流执行
   */
  public stop() {
    if (!this.state.isRunning) {
      return;
    }

    this.state.isRunning = false;
    this.state.error = new Error("工作流已手动停止");
    this.clearExecutionTimeout();
    this.notifyStateChange();
    
    console.log('工作流已手动停止');
  }

  /**
   * 设置执行超时
   * @param timeout 超时时间(毫秒)
   */
  private setExecutionTimeout(timeout: number) {
    this.clearExecutionTimeout();
    
    this.executionTimeoutId = setTimeout(() => {
      if (this.state.isRunning) {
        this.state.isRunning = false;
        this.state.error = new Error(`工作流执行超时(${timeout}ms)`);
        this.notifyStateChange();
        
        console.error(`工作流执行超时(${timeout}ms)`);
      }
    }, timeout);
  }

  /**
   * 清除执行超时
   */
  private clearExecutionTimeout() {
    if (this.executionTimeoutId) {
      clearTimeout(this.executionTimeoutId);
      this.executionTimeoutId = null;
    }
  }

  /**
   * 计算当前进度
   * @param totalNodes 节点总数
   */
  private calculateProgress(totalNodes: number): number {
    return totalNodes === 0 ? 0 : this.state.completedNodeIds.size / totalNodes;
  }

  /**
   * 获取节点执行结果
   * @param nodeId 节点ID
   */
  public getNodeResult(nodeId: string) {
    return this.state.nodeResults.get(nodeId);
  }

  /**
   * 获取节点输入数据
   * @param nodeId 节点ID
   */
  public getNodeInput(nodeId: string) {
    return this.state.nodeInputs?.get(nodeId);
  }

  /**
   * 获取当前执行状态
   */
  public getState(): ExecutionState {
    return this.cloneState();
  }

  /**
   * 检查节点是否已完成执行
   * @param nodeId 节点ID
   */
  public isNodeCompleted(nodeId: string): boolean {
    return this.state.completedNodeIds.has(nodeId);
  }

  /**
   * 获取执行进度
   */
  public getProgress(): number {
    return this.state.progress;
  }
}

export default WorkflowController;