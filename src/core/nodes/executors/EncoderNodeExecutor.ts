import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * 编码器节点执行器
 */
export class EncoderNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.ENCODER;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
    const text = node.data.inputs?.text?.value || inputs.text || '';
    const model = node.data.inputs?.model?.value || 'clip';
    
    try {
      // TODO: 实现实际的编码过程
      const embedding = await this.mockEmbedding(text, model);
      return { embedding };
    } catch (error: unknown) {
      throw new Error(`编码失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 模拟生成文本嵌入向量
   */
  private async mockEmbedding(text: string, model: string): Promise<number[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // 返回一个模拟的向量数组
    return Array.from({ length: 128 }, () => Math.random());
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return ['text']; // 编码器节点需要文本输入
  }
}