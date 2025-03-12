import { Node, Connection, NodeType } from '../types';
import McpService from './McpService';

interface NodeExecutor {
  execute: (node: Node, inputs: Record<string, any>) => Promise<Record<string, any>>;
}

interface NodeExecutorMap {
  [key: string]: NodeExecutor;
}

class WorkflowEngine {
  private nodeExecutors: NodeExecutorMap;
  private mcpService: McpService;

  constructor() {
    this.nodeExecutors = {} as NodeExecutorMap;
    this.mcpService = McpService.getInstance();
    this.registerDefaultExecutors();
  }

  private registerDefaultExecutors() {
    // 文本输入节点执行器
    this.nodeExecutors[NodeType.TEXT_INPUT] = {
      execute: async (node: Node) => {
        return {
          text: node.data.inputs?.text?.value || '',
        };
      },
    };

    // LLM查询节点执行器
    this.nodeExecutors[NodeType.LLM_QUERY] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const prompt = node.data.inputs?.prompt?.value || inputs.text || '';
        const model = node.data.inputs?.model?.value || 'gpt-3.5-turbo';
        const temperature = node.data.inputs?.temperature?.value || 0.7;
        const maxTokens = node.data.inputs?.maxTokens?.value || 1000;

        try {
          // TODO: 实现实际的LLM API调用
          const response = await this.mockLlmCall(prompt, model, temperature, maxTokens);
          return { text: response };
        } catch (error: unknown) {
          throw new Error(`LLM查询失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };

    // 网络搜索节点执行器 - 使用MCP服务
    this.nodeExecutors[NodeType.WEB_SEARCH] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const query = node.data.inputs?.query?.value || inputs.text || '';
        const searchEngine = node.data.inputs?.searchEngine?.value || 'google';
        const maxResults = node.data.inputs?.maxResults?.value || 5;
        
        try {
          // 使用MCP服务进行网络搜索
          const searchResults = await this.performWebSearch(query, searchEngine, maxResults);
          return { text: searchResults };
        } catch (error: unknown) {
          throw new Error(`网络搜索失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };

    // 文档查询节点执行器
    this.nodeExecutors[NodeType.DOCUMENT_QUERY] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const query = node.data.inputs?.query?.value || inputs.text || '';
        const documentPath = node.data.inputs?.path?.value || '';
        try {
          // TODO: 实现实际的文档查询
          const results = await this.mockDocumentQuery(query, documentPath);
          return { text: results };
        } catch (error: unknown) {
          throw new Error(`文档查询失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };

    // 模型选择器节点执行器
    this.nodeExecutors[NodeType.MODEL_SELECTOR] = {
      execute: async (node: Node) => {
        const model = node.data.inputs?.model?.value || 'gpt-3.5-turbo';
        const parameters = node.data.inputs?.parameters?.value || '';
        return {
          model,
          parameters,
        };
      },
    };

    // 自定义节点执行器
    this.nodeExecutors[NodeType.CUSTOM] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const code = node.data.inputs?.code?.value || '';
        try {
          // 非常危险，实际应用中应该使用安全的沙箱执行
          // 这里仅作为示例
          const processInputs = new Function('inputs', `
            try {
              ${code}
              return { result: "代码执行成功" };
            } catch (error) {
              return { error: error.message };
            }
          `);
          const result = processInputs(inputs);
          return result;
        } catch (error: unknown) {
          throw new Error(`自定义代码执行失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };

    // 编码器节点执行器
    this.nodeExecutors[NodeType.ENCODER] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const text = node.data.inputs?.text?.value || inputs.text || '';
        const model = node.data.inputs?.model?.value || 'clip';
        try {
          // TODO: 实现实际的编码过程
          const embedding = await this.mockEmbedding(text, model);
          return { embedding };
        } catch (error: unknown) {
          throw new Error(`编码失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };
  }

  // 使用MCP服务执行网络搜索
  private async performWebSearch(query: string, provider: string, maxResults: number): Promise<string> {
    try {
      // 尝试执行搜索
      const results = await this.mcpService.searchWeb(query, provider, maxResults);
      
      // 格式化搜索结果
      let formattedResults = `搜索查询: "${query}"\n搜索引擎: ${provider}\n\n结果:\n\n`;
      results.forEach((result, index) => {
        formattedResults += `${index + 1}. ${result.title}\n`;
        formattedResults += `   URL: ${result.url}\n`;
        formattedResults += `   ${result.snippet}\n\n`;
      });
      
      return formattedResults;
    } catch (error: unknown) {
      // 搜索失败，回退到模拟搜索
      console.warn('MCP搜索失败，使用模拟数据:', error);
      return this.mockWebSearch(query);
    }
  }

  // 模拟LLM调用
  private async mockLlmCall(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `模拟LLM响应：\n输入：${prompt}\n模型：${model}\n温度：${temperature}\n最大长度：${maxTokens}`;
  }

  // 模拟网络搜索
  private async mockWebSearch(query: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `模拟搜索结果：\n查询：${query}\n结果：这是一些相关的搜索结果...`;
  }

  // 模拟文档查询
  private async mockDocumentQuery(query: string, path: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `模拟文档查询结果：\n查询：${query}\n文档：${path}\n结果：这是一些相关的文档内容...`;
  }

  // 模拟文本嵌入
  private async mockEmbedding(text: string, model: string): Promise<number[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // 返回一个模拟的向量数组
    return Array.from({ length: 128 }, () => Math.random());
  }

  // 注册自定义节点执行器
  public registerExecutor(type: string, executor: NodeExecutor) {
    this.nodeExecutors[type] = executor;
  }

  // 执行工作流
  public async execute(nodes: Node[], connections: Connection[]) {
    const nodeOutputs = new Map<string, Record<string, any>>();
    const nodeInputs = new Map<string, Record<string, any>>();
    
    // 构建连接关系
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
    
    // 按顺序执行节点
    for (const node of nodes) {
      const executor = this.nodeExecutors[node.type];
      if (!executor) {
        console.warn(`未找到节点类型 "${node.type}" 的执行器`);
        continue;
      }
      
      // 收集节点的输入
      const inputs: Record<string, any> = {};
      const nodeConnList = nodeConnections.get(node.id) || [];
      for (const conn of nodeConnList) {
        const sourceOutput = nodeOutputs.get(conn.source);
        if (sourceOutput) {
          // 将上游节点的输出作为当前节点的输入
          Object.assign(inputs, sourceOutput);
        }
      }
      
      nodeInputs.set(node.id, inputs);
      
      try {
        // 执行节点
        console.log(`执行节点 "${node.data.label}" (${node.id})...`);
        const output = await executor.execute(node, inputs);
        nodeOutputs.set(node.id, output);
      } catch (error: unknown) {
        console.error(`节点 "${node.data.label}" (${node.id}) 执行失败:`, error);
        nodeOutputs.set(node.id, { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    return {
      nodeOutputs,
      nodeInputs,
    };
  }

  // 确定节点执行顺序
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

  // 收集节点输入
  private collectInputs(
    node: Node,
    connections: Connection[],
    nodeOutputs: Map<string, Record<string, any>>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    connections
      .filter(conn => conn.target === node.id)
      .forEach(conn => {
        const sourceOutputs = nodeOutputs.get(conn.source);
        if (sourceOutputs) {
          const sourceHandle = conn.sourceHandle?.split('-')[1];
          const targetHandle = conn.targetHandle?.split('-')[1];
          if (sourceHandle && targetHandle && sourceOutputs[sourceHandle]) {
            inputs[targetHandle] = sourceOutputs[sourceHandle];
          }
        }
      });

    return inputs;
  }
}

export default WorkflowEngine;