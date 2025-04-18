import { Node, Connection, NodeType } from '../../types/index';
import { NodeExecutorMap, NodeExecutor } from './types';
import McpService from '../../services/McpService';

/**
 * 工作流引擎
 * 负责执行节点和管理工作流
 */
class WorkflowEngine {
  private nodeExecutors: NodeExecutorMap;
  private mcpService: McpService;

  constructor() {
    this.nodeExecutors = {} as NodeExecutorMap;
    this.mcpService = McpService.getInstance();
    this.registerDefaultExecutors();
  }

  /**
   * 注册默认节点执行器
   * @private
   */
  private registerDefaultExecutors() {
    // 加载默认执行器
    this.loadCoreExecutors();
    this.loadAiExecutors();
    this.loadDataExecutors();
    this.loadUtilityExecutors();
  }

  /**
   * 加载核心执行器
   * @private
   */
  private loadCoreExecutors() {
    // 文本输入节点执行器
    this.nodeExecutors[NodeType.TEXT_INPUT] = {
      execute: async (node: Node) => {
        return {
          text: node.data.inputs?.text?.value || '',
        };
      },
    };
  }

  /**
   * 加载AI相关执行器
   * @private
   */
  private loadAiExecutors() {
    // LLM查询节点执行器
    this.nodeExecutors[NodeType.LLM_QUERY] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const prompt = node.data.inputs?.prompt?.value || inputs.text || '';
        const model = node.data.inputs?.model?.value || 'deepseek-chat';
        const systemPrompt = node.data.inputs?.systemPrompt?.value || 'You are a helpful assistant';
        const temperature = node.data.inputs?.temperature?.value || 0.7;
        const maxTokens = node.data.inputs?.maxTokens?.value || 1000;
        const stream = node.data.inputs?.stream?.value === 'true';
        
        // Use the API key from inputs if available (from ModelSelectorNode)
        const apiKey = inputs.apiKey || '';

        try {
          // If no API key, use mock response
          if (!apiKey) {
            return { text: this.mockLlmCallDeepseek(prompt, model, systemPrompt, temperature, maxTokens, stream) };
          }
          
          // Attempt actual API call for DeepSeek
          const response = await this.callDeepseekAPI(apiKey, prompt, model, systemPrompt, temperature, maxTokens, stream);
          return { text: response };
        } catch (error: unknown) {
          throw new Error(`LLM查询失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };

    // 模型选择器节点执行器
    this.nodeExecutors[NodeType.MODEL_SELECTOR] = {
      execute: async (node: Node) => {
        const model = node.data.inputs?.model?.value || 'deepseek-chat';
        const apiKey = node.data.inputs?.apiKey?.value || '';
        const systemPrompt = node.data.inputs?.systemPrompt?.value || 'You are a helpful assistant';
        const temperature = node.data.inputs?.temperature?.value || 0.7;
        const maxTokens = node.data.inputs?.maxTokens?.value || 1000;
        const stream = node.data.inputs?.stream?.value === 'true';

        return {
          model,
          apiKey,
          systemPrompt,
          temperature,
          maxTokens,
          stream
        };
      },
    };
  }

  /**
   * 加载数据相关执行器
   * @private
   */
  private loadDataExecutors() {
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
  }

  /**
   * 加载实用工具执行器
   * @private
   */
  private loadUtilityExecutors() {
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
    
    // 采样器节点执行器
    this.nodeExecutors[NodeType.SAMPLER] = {
      execute: async (node: Node, inputs: Record<string, any>) => {
        const options = (node.data.inputs?.options?.value || '').split('\n').filter((line: string) => line.trim() !== '');
        const samplingMethod = node.data.inputs?.samplingMethod?.value || 'random';
        const count = parseInt(node.data.inputs?.count?.value || '1', 10);
        const temperature = parseFloat(node.data.inputs?.temperature?.value || '1.0');
        
        try {
          let sampledOptions: string[] = [];
          
          if (options.length === 0) {
            return { sampled: '', count: 0 };
          }
          
          // 根据不同的采样方法进行采样
          switch (samplingMethod) {
            case 'random':
              // 随机采样
              sampledOptions = this.randomSample(options, count);
              break;
            case 'top-p':
              // 使用 top-p 采样 (简化版)
              sampledOptions = this.randomSample(options, count);
              break;
            case 'top-k':
              // 使用 top-k 采样 (简化版)
              sampledOptions = this.randomSample(options.slice(0, Math.min(count * 2, options.length)), count);
              break;
            case 'temperature':
              // 使用温度采样 (简化版)
              sampledOptions = this.randomSample(options, count);
              break;
            default:
              sampledOptions = this.randomSample(options, count);
          }
          
          return { 
            sampled: sampledOptions.join('\n'),
            count: sampledOptions.length,
            config: JSON.stringify({
              method: samplingMethod,
              temperature,
              count,
              totalOptions: options.length
            })
          };
        } catch (error: unknown) {
          throw new Error(`采样失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    };
  }
  
  // 随机采样辅助方法
  private randomSample(array: string[], count: number): string[] {
    const result = [...array];
    count = Math.min(count, result.length);
    
    // Fisher-Yates 洗牌算法
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result.slice(0, count);
  }

  // 使用DeepSeek API调用
  private async callDeepseekAPI(
    apiKey: string, 
    prompt: string,
    model: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    stream: boolean
  ): Promise<string> {
    try {
      // This would be a call to DeepSeek API - here's the code structure
      // In a browser environment, you would use fetch instead
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": prompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          stream: stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`DeepSeek API error: ${error.message || response.statusText}`);
      }

      if (stream) {
        // Handle streaming response - in a real implementation this would use proper streaming
        return "Streaming response started. Check console for messages.";
      } else {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error("DeepSeek API call failed:", error);
      // Fall back to mock if API call fails
      return this.mockLlmCallDeepseek(prompt, model, systemPrompt, temperature, maxTokens, stream);
    }
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

  // 模拟DeepSeek LLM调用
  private mockLlmCallDeepseek(
    prompt: string,
    model: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
    stream: boolean
  ): string {
    return `模拟DeepSeek响应：
输入: ${prompt}
系统提示词: ${systemPrompt}
模型: ${model}
温度: ${temperature}
最大Token数: ${maxTokens}
流式输出: ${stream}

注意：这是一个模拟响应。实际使用时，请提供有效的DeepSeek API密钥。`;
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

  /**
   * 注册自定义节点执行器
   * @param type 节点类型
   * @param executor 执行器
   */
  public registerExecutor(type: string, executor: NodeExecutor) {
    this.nodeExecutors[type] = executor;
  }

  /**
   * 执行工作流
   * @param nodes 节点列表
   * @param connections 连接列表
   * @returns 执行结果
   */
  public async execute(nodes: Node[], connections: Connection[]) {
    const nodeOutputs = new Map<string, Record<string, any>>();
    const nodeInputs = new Map<string, Record<string, any>>();
    
    // 获取执行顺序
    const executionOrder = this.determineExecutionOrder(nodes, connections);
    const orderedNodes = executionOrder.map(id => nodes.find(node => node.id === id)).filter(Boolean) as Node[];
    
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
    for (const node of orderedNodes) {
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

  /**
   * 确定节点执行顺序
   * @param nodes 节点列表
   * @param connections 连接列表
   * @returns 执行顺序
   * @private
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
      console.warn('工作流中可能存在循环依赖，使用默认顺序');
      return nodes.map(n => n.id);
    }

    return order;
  }

  /**
   * 收集节点输入
   * @param node 节点
   * @param connections 连接列表
   * @param nodeOutputs 节点输出
   * @returns 节点输入
   * @private
   */
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