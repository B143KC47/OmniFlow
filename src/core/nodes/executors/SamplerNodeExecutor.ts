import { Node } from '../../../types';
import { NodeType } from '../../../types/index';
import { BaseNodeExecutor } from '../BaseNodeExecutor';

/**
 * 采样器节点执行器
 */
export class SamplerNodeExecutor extends BaseNodeExecutor {
  protected readonly nodeType = NodeType.SAMPLER;

  /**
   * 实现节点处理逻辑
   * @param node 节点数据
   * @param inputs 节点输入
   */
  protected async processNode(node: Node, inputs: Record<string, any>): Promise<Record<string, any>> {
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
          sampledOptions = this.temperatureSample(options, count, temperature);
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
  }

  /**
   * 随机采样实现
   */
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

  /**
   * 温度采样实现 (简化版)
   */
  private temperatureSample(array: string[], count: number, temperature: number): string[] {
    // 温度接近0时，总是选择排列较前的选项
    if (temperature < 0.01) {
      return array.slice(0, count);
    }
    
    // 温度越高，随机性越大
    const indices = Array.from({ length: array.length }, (_, i) => i);
    
    // 通过温度调整概率分布
    const probabilities = indices.map(i => Math.exp(-i / Math.max(temperature * 10, 0.01)));
    const sum = probabilities.reduce((a, b) => a + b, 0);
    const normalizedProb = probabilities.map(p => p / sum);
    
    // 使用轮盘赌法进行加权随机采样
    const selected: string[] = [];
    for (let i = 0; i < Math.min(count, array.length); i++) {
      const r = Math.random();
      let accumProb = 0;
      let selectedIndex = 0;
      
      for (let j = 0; j < normalizedProb.length; j++) {
        accumProb += normalizedProb[j];
        if (r <= accumProb) {
          selectedIndex = j;
          break;
        }
      }
      
      selected.push(array[selectedIndex]);
      
      // 移除已选项，避免重复选择
      array.splice(selectedIndex, 1);
      normalizedProb.splice(selectedIndex, 1);
      
      // 重新归一化概率
      const newSum = normalizedProb.reduce((a, b) => a + b, 0);
      for (let j = 0; j < normalizedProb.length; j++) {
        normalizedProb[j] /= newSum;
      }
    }
    
    return selected;
  }

  /**
   * 获取节点所需的输入
   */
  protected getRequiredInputs(): string[] {
    return []; // 采样器节点不需要外部输入，依赖节点自己的选项列表
  }
}