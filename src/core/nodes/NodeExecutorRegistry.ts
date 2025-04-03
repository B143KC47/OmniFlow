import NodeExecutorFactory from './NodeExecutorFactory';
import { TextInputNodeExecutor } from './executors/TextInputNodeExecutor';
import { WebSearchNodeExecutor } from './executors/WebSearchNodeExecutor';
import { DocumentQueryNodeExecutor } from './executors/DocumentQueryNodeExecutor';
import { ModelSelectorNodeExecutor } from './executors/ModelSelectorNodeExecutor';
import { LlmQueryNodeExecutor } from './executors/LlmQueryNodeExecutor';
import { EncoderNodeExecutor } from './executors/EncoderNodeExecutor';
import { SamplerNodeExecutor } from './executors/SamplerNodeExecutor';
import { CustomNodeExecutor } from './executors/CustomNodeExecutor';

/**
 * 节点执行器注册器
 * 负责将所有节点执行器注册到工厂
 */
export class NodeExecutorRegistry {
  // 添加静态标志，表示内置执行器是否已注册
  private static isBuiltinExecutorsRegistered: boolean = false;

  /**
   * 注册所有内置节点执行器
   */
  public static registerBuiltinExecutors(): void {
    // 如果已经注册过内置执行器，则直接返回
    if (NodeExecutorRegistry.isBuiltinExecutorsRegistered) {
      return;
    }
    
    const factory = NodeExecutorFactory.getInstance();
    
    // 注册文本输入节点执行器
    factory.registerExecutor('TEXT_INPUT', new TextInputNodeExecutor());
    
    // 注册Web搜索节点执行器
    factory.registerExecutor('WEB_SEARCH', new WebSearchNodeExecutor());
    
    // 注册文档查询节点执行器
    factory.registerExecutor('DOCUMENT_QUERY', new DocumentQueryNodeExecutor());
    
    // 注册模型选择器节点执行器
    factory.registerExecutor('MODEL_SELECTOR', new ModelSelectorNodeExecutor());
    
    // 注册LLM查询节点执行器
    factory.registerExecutor('LLM_QUERY', new LlmQueryNodeExecutor());
    
    // 注册编码器节点执行器
    factory.registerExecutor('ENCODER', new EncoderNodeExecutor());
    
    // 注册采样器节点执行器
    factory.registerExecutor('SAMPLER', new SamplerNodeExecutor());
    
    // 注册自定义节点执行器
    factory.registerExecutor('CUSTOM', new CustomNodeExecutor());
    
    console.log('已注册所有内置节点执行器');
    
    // 设置标志，表示内置执行器已注册
    NodeExecutorRegistry.isBuiltinExecutorsRegistered = true;
  }
  
  /**
   * 注册自定义节点执行器
   * @param nodeType 节点类型
   * @param executorClass 执行器类
   */
  public static registerCustomExecutor(nodeType: string, executorClass: any): void {
    const factory = NodeExecutorFactory.getInstance();
    try {
      const executor = new executorClass();
      factory.registerExecutor(nodeType, executor);
      console.log(`已注册自定义节点执行器: ${nodeType}`);
    } catch (error) {
      console.error(`注册自定义节点执行器失败: ${nodeType}`, error);
    }
  }
}