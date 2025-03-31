import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * 文本输入节点执行器
 */
export class TextInputNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.TEXT_INPUT;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
    return {
      text: node.data.inputs?.text?.value || '',
    };
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return []; // 文本输入节点不需要外部输入
  }
}