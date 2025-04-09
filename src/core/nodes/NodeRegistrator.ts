// 节点注册器 - 负责自动注册所有节点
import NodeFactory, { NodeDefinition } from './NodeFactory';
import { TextInputNodeDefinition } from '../../components/nodes/input/TextInputNode';
import { ImageInputNodeDefinition } from '../../components/nodes/input/ImageInputNode';
import { DEFAULT_NODE_CONFIG } from '../../styles/nodeConstants';

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
    NodeRegistrator.registerNode(ImageInputNodeDefinition);

    // 注册其他节点类型
    NodeRegistrator.registerDefaultNodes();

    console.log('======节点注册完成======');
  }

  /**
   * 注册默认节点
   * 当实际节点组件不存在时，使用默认配置创建通用节点
   */
  private static registerDefaultNodes(): void {
    // 从默认配置中获取所有节点类型
    const nodeTypes = Object.keys(DEFAULT_NODE_CONFIG);

    // 遍历所有节点类型，为每个类型创建一个通用节点定义
    nodeTypes.forEach(type => {
      // 跳过已经注册的节点类型
      if (NodeFactory.getInstance().getNodeDefinition(type)) {
        return;
      }

      // 根据类型确定节点分类
      const category = this.getCategoryFromType(type);

      // 创建通用节点定义
      const genericDefinition: NodeDefinition = {
        type,
        category,
        name: this.getReadableName(type),
        description: `${this.getReadableName(type)} Node`,
        icon: this.getIconForType(type),
        component: NodeFactory.getInstance().getGenericNodeComponent(), // 使用通用节点组件
        defaultConfig: DEFAULT_NODE_CONFIG[type]
      };

      // 注册节点
      NodeRegistrator.registerNode(genericDefinition);
      console.log(`注册通用节点: ${type}`);
    });
  }

  /**
   * 根据节点类型获取分类
   */
  private static getCategoryFromType(type: string): string {
    const typeMap: Record<string, string> = {
      'TEXT_INPUT': 'INPUT',
      'FILE_INPUT': 'INPUT',
      'IMAGE_INPUT': 'INPUT',
      'AUDIO_INPUT': 'INPUT',
      'VIDEO_INPUT': 'INPUT',
      'LLM_QUERY': 'AI_TASK_EXECUTION',
      'MODEL_SELECTOR': 'AI_TASK_EXECUTION',
      'IMAGE_GENERATION': 'AI_TASK_EXECUTION',
      'WEB_SEARCH': 'DATA_MANIPULATION',
      'DOCUMENT_QUERY': 'DATA_MANIPULATION',
      'DATA_TRANSFORM': 'DATA_MANIPULATION',
      'ENCODER': 'DATA_MANIPULATION',
      'CONDITION': 'FLOW_CONTROL',
      'LOOP': 'FLOW_CONTROL',
      'SAMPLER': 'FLOW_CONTROL',
      'LOGGER': 'DEBUG',
      'VISUALIZER': 'DEBUG',
      'TEXT_OUTPUT': 'OUTPUT',
      'FILE_OUTPUT': 'OUTPUT',
      'IMAGE_OUTPUT': 'OUTPUT',
      'USER_INPUT': 'INTERACTION',
      'CONFIRMATION': 'INTERACTION',
      'CUSTOM_NODE': 'ADVANCED'
    };

    return typeMap[type] || 'UTILITY';
  }

  /**
   * 获取节点类型的可读名称
   */
  private static getReadableName(type: string): string {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * 根据节点类型获取图标
   */
  private static getIconForType(type: string): string {
    const iconMap: Record<string, string> = {
      'TEXT_INPUT': '📝', // 文档
      'FILE_INPUT': '📁', // 文件夹
      'IMAGE_INPUT': '🖼', // 图片
      'AUDIO_INPUT': '🎧', // 耳机
      'VIDEO_INPUT': '🎥', // 摄像机
      'LLM_QUERY': '🧠', // 大脑
      'MODEL_SELECTOR': '📊', // 图表
      'IMAGE_GENERATION': '🎨', // 调色板
      'WEB_SEARCH': '🔍', // 放大镜
      'DOCUMENT_QUERY': '📑', // 文件
      'DATA_TRANSFORM': '🔄', // 循环箭头
      'ENCODER': '🔒', // 锁
      'CONDITION': '🔗', // 链接
      'LOOP': '🔁', // 循环
      'SAMPLER': '🎲', // 骰子
      'LOGGER': '📓', // 记事本
      'VISUALIZER': '📈', // 图表上升
      'TEXT_OUTPUT': '💬', // 对话气泡
      'FILE_OUTPUT': '💾', // 软盘
      'IMAGE_OUTPUT': '🖼', // 图片
      'USER_INPUT': '👤', // 用户
      'CONFIRMATION': '✅', // 勾选
      'CUSTOM_NODE': '⚙️' // 齿轮
    };

    return iconMap[type] || '📌'; // 默认使用固定针图标
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