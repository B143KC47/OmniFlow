import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * 模型选择器节点执行器
 */
export class ModelSelectorNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.MODEL_SELECTOR;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
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
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return []; // 模型选择器节点不需要外部输入
  }
}