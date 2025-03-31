import { Node, Connection } from '../types/index';
import McpService from './McpService';
import NodeExecutorFactory from '../core/nodes/NodeExecutorFactory';
import { NodeExecutorRegistry } from '../core/nodes/NodeExecutorRegistry';
import { WorkflowExecutionOptions } from '../core/workflow/types';

/**
 * 工作流引擎
 * 负责执行工作流和管理节点执行
 */
class WorkflowEngine {
  private nodeExecutorFactory: NodeExecutorFactory;
  private mcpService: McpService;
  private isInitialized: boolean = false;

  constructor() {
    this.nodeExecutorFactory = NodeExecutorFactory.getInstance();
    this.mcpService = McpService.getInstance();
  }

  /**
   * 初始化工作流引擎
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // 注册所有内置执行器
    NodeExecutorRegistry.registerBuiltinExecutors();
    
    this.isInitialized = true;
  }

  /**
   * 执行工作流
   * @param nodes 节点数据
   * @param connections 连接数据
   * @param options 执行选项
   */
  public async execute(
    nodes: Node[], 
    connections: Connection[],
    options?: WorkflowExecutionOptions
  ): Promise<{
    nodeOutputs: Map<string, Record<string, any>>;
    nodeInputs: Map<string, Record<string, any>>;
  }> {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // 确保节点按依赖关系顺序执行
    let executionOrder: Node[];
    
    if (options?.parallel) {
      // 如果启用并行执行，则确定可独立执行的节点组
      // TODO: 实现并行执行逻辑
      executionOrder = nodes;
    } else {
      // 串行执行，按拓扑排序确定执行顺序
      const nodeIds = this.determineExecutionOrder(nodes, connections);
      executionOrder = nodeIds.map(id => nodes.find(node => node.id === id)!).filter(Boolean);
    }
    
    const nodeOutputs = new Map<string, Record<string, any>>();
    const nodeInputs = new Map<string, Record<string, any>>();
    
    // 构建连接关系映射
    const nodeConnections = this.buildConnectionsMap(connections);
    
    // 执行节点
    const errorHandling = options?.errorHandling || 'stop';
    const maxRetries = options?.retryCount || 0;
    
    for (const node of executionOrder) {
      let retryCount = 0;
      let success = false;
      
      while (!success && retryCount <= maxRetries) {
        try {
          // 收集节点输入
          const inputs = this.collectNodeInputs(node.id, nodeConnections, nodeOutputs);
          nodeInputs.set(node.id, inputs);
          
          // 使用执行器工厂执行节点
          console.log(`执行节点 "${node.data.label || node.id}" (${node.id})...`);
          const output = await this.nodeExecutorFactory.executeNode(node, inputs);
          nodeOutputs.set(node.id, output);
          
          success = true;
        } catch (error: unknown) {
          retryCount++;
          
          console.error(
            `节点 "${node.data.label || node.id}" (${node.id}) 执行失败 ` +
            `(尝试 ${retryCount}/${maxRetries + 1}):`, 
            error
          );
          
          // 如果失败但还有重试次数，则继续重试
          if (retryCount <= maxRetries && errorHandling === 'retry') {
            console.log(`重试执行节点 ${node.id}...`);
            continue;
          }
          
          // 处理错误
          nodeOutputs.set(node.id, { 
            error: error instanceof Error ? error.message : String(error) 
          });
          
          // 如果错误处理策略是停止，则中止执行
          if (errorHandling === 'stop') {
            throw new Error(
              `节点 "${node.data.label || node.id}" (${node.id}) 执行失败: ` +
              `${error instanceof Error ? error.message : String(error)}`
            );
          }
          
          // 否则继续执行下一个节点
          break;
        }
      }
    }
    
    return {
      nodeOutputs,
      nodeInputs,
    };
  }

  /**
   * 构建节点连接映射
   * @param connections 连接列表
   */
  private buildConnectionsMap(connections: Connection[]): Map<string, Array<{
    source: string;
    sourceHandle: string | null | undefined;
    targetHandle: string | null | undefined;
  }>> {
    const nodeConnections = new Map<string, Array<{
      source: string;
      sourceHandle: string | null | undefined;
      targetHandle: string | null | undefined;
    }>>();
    
    connections.forEach((connection: Connection) => {
      if (!nodeConnections.has(connection.target)) {
        nodeConnections.set(connection.target, []);
      }
      const connList = nodeConnections.get(connection.target);
      if (connList) {
        connList.push({
          source: connection.source,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        });
      }
    });
    
    return nodeConnections;
  }

  /**
   * 收集节点输入
   * @param nodeId 节点ID
   * @param nodeConnections 节点连接映射
   * @param nodeOutputs 节点输出映射
   */
  private collectNodeInputs(
    nodeId: string,
    nodeConnections: Map<string, Array<{
      source: string;
      sourceHandle: string | null | undefined;
      targetHandle: string | null | undefined;
    }>>,
    nodeOutputs: Map<string, Record<string, any>>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};
    const nodeConnList = nodeConnections.get(nodeId) || [];
    
    for (const conn of nodeConnList) {
      const sourceOutput = nodeOutputs.get(conn.source);
      if (sourceOutput) {
        // 将上游节点的输出作为当前节点的输入
        Object.assign(inputs, sourceOutput);
      }
    }
    
    return inputs;
  }

  /**
   * 确定节点执行顺序 (拓扑排序)
   * @param nodes 节点列表
   * @param connections 连接列表
   */
  private determineExecutionOrder(nodes: Node[], connections: Connection[]): string[] {
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // 初始化图和入度
    nodes.forEach(node => {
      graph.set(node.id, new Set());
      inDegree.set(node.id, 0);
    });

    // 构建图
    connections.forEach(conn => {
      const sourceSet = graph.get(conn.source);
      if (sourceSet) {
        sourceSet.add(conn.target);
        const currentInDegree = inDegree.get(conn.target) || 0;
        inDegree.set(conn.target, currentInDegree + 1);
      }
    });

    // 拓扑排序
    const order: string[] = [];
    const queue: string[] = [];

    // 找到所有入度为0的节点
    nodes.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    });

    // 执行拓扑排序
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      order.push(nodeId);

      const neighbors = graph.get(nodeId) || new Set();
      neighbors.forEach(neighborId => {
        const newInDegree = (inDegree.get(neighborId) || 0) - 1;
        inDegree.set(neighborId, newInDegree);
        if (newInDegree === 0) {
          queue.push(neighborId);
        }
      });
    }

    // 检查是否有环
    if (order.length !== nodes.length) {
      throw new Error('工作流中存在循环依赖');
    }

    return order;
  }
}

export default WorkflowEngine;