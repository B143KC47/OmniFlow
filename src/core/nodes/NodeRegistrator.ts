// 节点注册器 - 负责自动注册所有节点
import NodeFactory, { NodeDefinition } from './NodeFactory';
import { TextInputNodeDefinition } from '../../components/nodes/input/TextInputNode';

/**
 * 节点注册器类
 * 负责自动扫描和注册所有可用的节点
 */
class NodeRegistrator {
  /**
   * 注册单个节点
   * @param definition 节点定义
   */
  public static registerNode(definition: NodeDefinition): void {
    NodeFactory.getInstance().registerNodeType(definition);
  }

  /**
   * 手动注册所有节点
   * 理想情况下我们希望自动扫描，但为了保持简单，这里先手动列出所有节点
   */
  public static registerAllNodes(): void {
    console.log('======开始注册所有节点======');
    
    // 输入类节点
    NodeRegistrator.registerNode(TextInputNodeDefinition);
    
    // 这里需要添加更多的节点定义
    // 例如：NodeRegistrator.registerNode(ImageInputNodeDefinition);
    
    console.log('======节点注册完成======');
  }

  /**
   * 注册特定目录下的所有节点
   * 这是一个未来功能，需要根据项目实际需要实现
   * @param directory 目录路径
   */
  public static async registerNodesFromDirectory(directory: string): Promise<void> {
    // TODO: 实现自动扫描目录并注册节点的功能
    console.log(`尝试从目录 ${directory} 注册节点（未实现）`);
  }
}

export default NodeRegistrator;