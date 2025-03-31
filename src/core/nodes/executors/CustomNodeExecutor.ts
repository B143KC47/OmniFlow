import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * 自定义节点执行器
 * 允许用户执行自定义JavaScript代码
 */
export class CustomNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.CUSTOM;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
    const code = node.data.inputs?.code?.value || '';
    
    try {
      // 实际应用中应该使用更安全的沙箱执行
      // 这里仅作为示例
      const result = await this.executeCustomCode(code, inputs);
      return result;
    } catch (error: unknown) {
      throw new Error(`自定义代码执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 执行自定义代码
   * 在实际生产环境中，应该使用安全的沙箱执行策略
   */
  private async executeCustomCode(code: string, inputs: Record<string, any>): Promise<Record<string, any>> {
    try {
      // 警告: 在生产环境中，这种方法存在严重的安全风险
      // 应该使用专门的沙箱库，如vm2、isolated-vm等
      const processInputs = new Function('inputs', `
        try {
          ${code}
          return { success: true, result: "代码执行成功" };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `);
      
      const result = processInputs(inputs);
      
      if (!result.success) {
        throw new Error(result.error || '未知错误');
      }
      
      return { result: result.result || '代码执行成功，但未返回结果' };
    } catch (error: unknown) {
      console.error('自定义代码执行错误:', error);
      throw error;
    }
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return []; // 自定义节点没有固定的输入要求
  }

  /**
   * 执行前处理
   */
  protected async beforeExecute(): Promise<void> {
    console.log('⚠️ 警告: 执行自定义代码可能存在安全风险');
  }

  /**
   * 处理错误
   */
  protected async handleError(node: Node, error: unknown): Promise<void> {
    await super.handleError(node, error);
    console.error('自定义节点执行错误详情:', {
      nodeId: node.id,
      nodeType: node.type,
      error
    });
  }
}