import { Node } from '../../types';
import { NodeExecutor } from '../workflow/types';

/**
 * 节点执行器工厂
 * 负责创建和管理节点执行器
 */
class NodeExecutorFactory {
  private static instance: NodeExecutorFactory;
  private executors: Map<string, NodeExecutor>;

  private constructor() {
    this.executors = new Map<string, NodeExecutor>();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): NodeExecutorFactory {
    if (!NodeExecutorFactory.instance) {
      NodeExecutorFactory.instance = new NodeExecutorFactory();
    }
    return NodeExecutorFactory.instance;
  }

  /**
   * 注册节点执行器
   * @param type 节点类型
   * @param executor 执行器实例
   * @param force 是否强制覆盖现有的执行器，默认为false
   */
  public registerExecutor(type: string, executor: NodeExecutor, force: boolean = false): void {
    // 检查执行器是否已存在
    if (this.executors.has(type)) {
      // 如果不强制覆盖，则输出警告并返回
      if (!force) {
        console.warn(`节点执行器 ${type} 已存在，跳过注册`);
        return;
      }
      // 强制覆盖时输出信息
      console.warn(`节点执行器 ${type} 已存在，将被覆盖`);
    }
    
    // 注册执行器
    this.executors.set(type, executor);
  }

  /**
   * 获取节点执行器
   * @param type 节点类型
   */
  public getExecutor(type: string): NodeExecutor | undefined {
    return this.executors.get(type);
  }

  /**
   * 获取所有执行器
   */
  public getAllExecutors(): Map<string, NodeExecutor> {
    return new Map(this.executors);
  }

  /**
   * 执行特定节点
   * @param node 节点数据
   * @param inputs 节点输入
   */
  public async executeNode(node: Node, inputs: Record<string, any> = {}): Promise<Record<string, any>> {
    const executor = this.getExecutor(node.type);
    if (!executor) {
      throw new Error(`未找到节点类型 "${node.type}" 的执行器`);
    }
    
    try {
      return await executor.execute(node, inputs);
    } catch (error: unknown) {
      console.error(`节点 ${node.id} 执行失败:`, error);
      throw new Error(`节点执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 创建模拟执行器
   * @param type 节点类型
   * @param mockOutput 模拟输出
   */
  public createMockExecutor(type: string, mockOutput: Record<string, any>): void {
    const mockExecutor: NodeExecutor = {
      execute: async () => mockOutput,
    };
    
    this.registerExecutor(type, mockExecutor);
  }
}

export default NodeExecutorFactory;