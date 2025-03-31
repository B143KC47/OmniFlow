import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';
import McpService from '../../../services/McpService';

/**
 * Web搜索节点执行器
 */
export class WebSearchNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.WEB_SEARCH;
  private mcpService: McpService;

  constructor() {
    super();
    this.mcpService = McpService.getInstance();
  }

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
    const query = node.data.inputs?.query?.value || inputs.text || '';
    const searchEngine = node.data.inputs?.searchEngine?.value || 'google';
    const maxResults = node.data.inputs?.maxResults?.value || 5;
    
    try {
      // 使用MCP服务进行网络搜索
      const results = await this.mcpService.searchWeb(query, searchEngine, maxResults);
      
      // 格式化搜索结果
      let formattedResults = `搜索查询: "${query}"\n搜索引擎: ${searchEngine}\n\n结果:\n\n`;
      results.forEach((result: any, index: number) => {
        formattedResults += `${index + 1}. ${result.title}\n`;
        formattedResults += `   URL: ${result.url}\n`;
        formattedResults += `   ${result.snippet}\n\n`;
      });
      
      return { text: formattedResults };
    } catch (error: unknown) {
      // 搜索失败，回退到模拟搜索
      console.warn('MCP搜索失败，使用模拟数据:', error);
      return { text: await this.mockWebSearch(query) };
    }
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return []; // 虽然可接受输入，但都是可选的
  }

  /**
   * 模拟网络搜索
   */
  private async mockWebSearch(query: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `模拟搜索结果：\n查询：${query}\n结果：这是一些相关的搜索结果...`;
  }
}