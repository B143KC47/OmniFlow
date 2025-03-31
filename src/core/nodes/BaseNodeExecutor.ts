import { Node } from '../../types';
import { NodeExecutor } from '../workflow/types';
import { NodeValidatorRegistry } from '../../utils/nodeValidation';

/**
 * 基础节点执行器抽象类
 * 所有节点执行器的基类
 */
export abstract class BaseNodeExecutor implements NodeExecutor {
  /**
   * 节点类型
   */
  protected abstract readonly nodeType: string;

  /**
   * 执行节点
   * @param node 节点数据
   * @param inputs 节点输入
   */
  async execute(node: Node, inputs: Record<string, any> = {}): Promise<Record<string, any>> {
    if (node.type !== this.nodeType) {
      throw new Error(`节点执行器类型不匹配: 期望 ${this.nodeType}, 实际 ${node.type}`);
    }
    
    try {
      // 执行前处理
      await this.beforeExecute(node, inputs);
      
      // 验证节点输入
      this.validateInputs(node, inputs);
      
      // 执行节点逻辑
      const outputs = await this.processNode(node, inputs);
      
      // 执行后处理
      await this.afterExecute(node, outputs);
      
      return outputs;
    } catch (error) {
      // 捕获并处理错误
      await this.handleError(node, error);
      throw error;
    }
  }

  /**
   * 执行前处理
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async beforeExecute(node: Node, inputs: Record<string, any>): Promise<void> {
    // 默认实现为空，子类可以覆盖
  }

  /**
   * 执行节点逻辑
   * 子类必须实现此方法
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected abstract processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>>;

  /**
   * 执行后处理
   * @param node 节点数据
   * @param outputs 节点输出
   */
  protected async afterExecute(node: Node, outputs: Record<string, any>): Promise<void> {
    // 默认实现为空，子类可以覆盖
  }

  /**
   * 处理错误
   * @param node 节点数据
   * @param error 错误信息
   */
  protected async handleError(node: Node, error: unknown): Promise<void> {
    console.error(`节点 ${node.id} (${node.type}) 执行错误:`, error);
    // 默认实现为记录错误，子类可以覆盖以提供更多的错误处理逻辑
  }

  /**
   * 验证输入
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected validateInputs(node: Node, inputs: Record<string, any>): void {
    // 使用节点验证器进行验证
    const validationResult = NodeValidatorRegistry.validate(node, inputs);
    
    // 如果验证失败，抛出错误
    if (!validationResult.valid) {
      const errorMessage = validationResult.errors.join('\n');
      throw new Error(`节点 ${node.id} (${node.type}) 输入验证失败:\n${errorMessage}`);
    }
    
    // 检查必需的输入
    const requiredInputs = this.getRequiredInputs();
    for (const inputKey of requiredInputs) {
      if (!inputs[inputKey] && !node.data?.inputs?.[inputKey]?.value) {
        throw new Error(`节点 ${node.id} 缺少必需的输入: ${inputKey}`);
      }
    }
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    // 默认不需要任何输入，子类应该覆盖此方法
    return [];
  }

  /**
   * 格式化输出
   * @param outputs 原始输出
   */
  protected formatOutputs(outputs: Record<string, any>): Record<string, any> {
    // 默认直接返回原始输出，子类可以覆盖以提供更复杂的输出格式化
    return outputs;
  }
}