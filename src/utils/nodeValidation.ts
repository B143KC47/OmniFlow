import { Node, NodeType } from '../types';

/**
 * 节点输入验证器接口
 */
export interface NodeInputValidator {
  /**
   * 验证节点输入
   * @param node 需要验证的节点
   * @param inputs 节点输入值
   * @returns 验证结果，包含是否有效和错误信息
   */
  validate(node: Node, inputs: Record<string, any>): { 
    valid: boolean;
    errors: string[];
  };
}

/**
 * 默认节点验证器
 * 提供基本的验证功能
 */
class DefaultNodeValidator implements NodeInputValidator {
  validate(node: Node, inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 检查节点是否有有效的类型
    if (!node.type || !Object.values(NodeType).includes(node.type)) {
      errors.push(`无效的节点类型: ${node.type}`);
    }
    
    // 检查节点是否有有效的ID
    if (!node.id || typeof node.id !== 'string') {
      errors.push('节点缺少有效的ID');
    }
    
    // 检查节点是否有有效的位置信息
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      errors.push('节点缺少有效的位置信息');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * 文本输入节点验证器
 */
class TextInputNodeValidator extends DefaultNodeValidator {
  validate(node: Node, inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const baseResult = super.validate(node, inputs);
    const errors = [...baseResult.errors];
    
    // 检查节点是否有必需的输入
    if (!node.data?.inputs?.text && !inputs.text) {
      errors.push('文本输入节点缺少文本输入');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Web搜索节点验证器
 */
class WebSearchNodeValidator extends DefaultNodeValidator {
  validate(node: Node, inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const baseResult = super.validate(node, inputs);
    const errors = [...baseResult.errors];
    
    // 检查搜索查询
    const query = node.data?.inputs?.query?.value || inputs.text;
    if (!query) {
      errors.push('Web搜索节点缺少搜索查询');
    }
    
    // 检查搜索引擎
    const searchEngine = node.data?.inputs?.searchEngine?.value;
    if (searchEngine && !['google', 'bing', 'baidu'].includes(searchEngine)) {
      errors.push(`不支持的搜索引擎: ${searchEngine}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * LLM查询节点验证器
 */
class LlmQueryNodeValidator extends DefaultNodeValidator {
  validate(node: Node, inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const baseResult = super.validate(node, inputs);
    const errors = [...baseResult.errors];
    
    // 检查提示词
    const prompt = node.data?.inputs?.prompt?.value || inputs.text;
    if (!prompt) {
      errors.push('LLM查询节点缺少提示词');
    }
    
    // 检查模型
    const model = node.data?.inputs?.model?.value || inputs.model;
    if (!model) {
      errors.push('LLM查询节点缺少模型');
    }
    
    // 检查温度参数是否有效
    const temperature = parseFloat(node.data?.inputs?.temperature?.value || inputs.temperature || '0.7');
    if (isNaN(temperature) || temperature < 0 || temperature > 2) {
      errors.push('温度参数必须是0到2之间的数值');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * 节点验证器注册表
 */
export class NodeValidatorRegistry {
  private static validators: Record<string, NodeInputValidator> = {
    [NodeType.TEXT_INPUT]: new TextInputNodeValidator(),
    [NodeType.WEB_SEARCH]: new WebSearchNodeValidator(),
    [NodeType.LLM_QUERY]: new LlmQueryNodeValidator(),
    // 其他节点类型的验证器...
  };
  
  private static defaultValidator = new DefaultNodeValidator();
  
  /**
   * 获取节点验证器
   * @param nodeType 节点类型
   */
  public static getValidator(nodeType: string): NodeInputValidator {
    return this.validators[nodeType] || this.defaultValidator;
  }
  
  /**
   * 注册验证器
   * @param nodeType 节点类型
   * @param validator 验证器实例
   */
  public static registerValidator(nodeType: string, validator: NodeInputValidator): void {
    this.validators[nodeType] = validator;
  }
  
  /**
   * 验证节点
   * @param node 节点
   * @param inputs 节点输入
   */
  public static validate(node: Node, inputs: Record<string, any> = {}): { valid: boolean; errors: string[] } {
    const validator = this.getValidator(node.type);
    return validator.validate(node, inputs);
  }
}