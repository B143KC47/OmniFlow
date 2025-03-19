import { Node, Connection } from '../types';
import WorkflowEngine from './WorkflowEngine';

export interface ExecutionState {
  isRunning: boolean;
  currentNodeId: string | null;
  completedNodeIds: Set<string>;
  nodeResults: Map<string, any>;
  error: Error | null;
}

class WorkflowController {
  private engine: WorkflowEngine;
  private state: ExecutionState = {
    isRunning: false,
    currentNodeId: null,
    completedNodeIds: new Set(),
    nodeResults: new Map(),
    error: null,
  };
  private stateChangeCallbacks: ((state: ExecutionState) => void)[];

  constructor() {
    this.engine = new WorkflowEngine();
    this.stateChangeCallbacks = [];
    this.resetState();
  }

  private resetState() {
    this.state = {
      isRunning: false,
      currentNodeId: null,
      completedNodeIds: new Set(),
      nodeResults: new Map(),
      error: null,
    };
  }

  // 订阅状态变化
  public onStateChange(callback: (state: ExecutionState) => void) {
    this.stateChangeCallbacks.push(callback);
    // 立即触发一次回调，同步当前状态
    callback({ ...this.state });
  }

  // 取消订阅状态变化
  public offStateChange(callback: (state: ExecutionState) => void) {
    const index = this.stateChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.stateChangeCallbacks.splice(index, 1);
    }
  }

  // 通知状态变化
  private notifyStateChange() {
    const stateCopy = { ...this.state };
    this.stateChangeCallbacks.forEach(callback => callback(stateCopy));
  }

  // 执行工作流
  public async execute(nodes: Node[], connections: Connection[]) {
    if (this.state.isRunning) {
      throw new Error('工作流正在执行中');
    }

    this.resetState();
    this.state.isRunning = true;
    this.notifyStateChange();

    try {
      // 逐个执行节点
      for (const node of nodes) {
        this.state.currentNodeId = node.id;
        this.notifyStateChange();
        
        // 等待一小段时间，以便UI更新
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 实际执行工作流
      const result = await this.engine.execute(nodes, connections);
      
      // 更新执行结果
      result.nodeOutputs.forEach((outputs, nodeId) => {
        this.state.nodeResults.set(nodeId, outputs);
        this.state.completedNodeIds.add(nodeId);
      });

      this.state.currentNodeId = null;
      this.state.isRunning = false;
      this.notifyStateChange();
      
      return result;
    } catch (error) {
      this.state.error = error as Error;
      this.state.isRunning = false;
      this.notifyStateChange();
      throw error;
    }
  }

  // 停止工作流执行
  public stop() {
    if (!this.state.isRunning) {
      return;
    }

    this.state.isRunning = false;
    this.state.error = new Error("工作流已手动停止");
    this.notifyStateChange();
  }

  // 获取节点执行结果
  public getNodeResult(nodeId: string) {
    return this.state.nodeResults.get(nodeId);
  }

  // 获取当前执行状态
  public getState(): ExecutionState {
    return { ...this.state };
  }

  // 检查节点是否已完成执行
  public isNodeCompleted(nodeId: string): boolean {
    return this.state.completedNodeIds.has(nodeId);
  }

  // 获取执行进度（已完成节点数/总节点数）
  public getProgress(totalNodes: number): number {
    return totalNodes === 0 ? 0 : this.state.completedNodeIds.size / totalNodes;
  }
}

export default WorkflowController;