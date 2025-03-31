import { Node, NodeType } from '../../types';
import { PortDefinition, PortType, PortDataType } from './types';

/**
 * 基础节点抽象类
 * 所有节点类型的基类
 */
export abstract class BaseNode {
  /**
   * 节点类型唯一标识符
   */
  abstract readonly type: NodeType;
  
  /**
   * 节点名称
   */
  abstract readonly name: string;
  
  /**
   * 节点描述
   */
  abstract readonly description: string;
  
  /**
   * 节点类别
   */
  abstract readonly category: string;
  
  /**
   * 节点图标
   */
  icon?: string;
  
  /**
   * 节点标签（显示在节点上的文本）
   */
  label: string;
  
  /**
   * 节点端口定义
   */
  protected ports: PortDefinition[] = [];
  
  /**
   * 是否为热门节点
   */
  popular: boolean = false;
  
  /**
   * 是否为新节点
   */
  isNew: boolean = false;
  
  /**
   * 构造函数
   * @param label 节点标签
   * @param icon 节点图标
   */
  constructor(label?: string, icon?: string) {
    // 初始化标签，如果没有提供标签，使用默认值
    // 避免在构造函数中直接访问抽象属性
    this.label = label || '';
    this.icon = icon;
  }
  
  /**
   * 初始化方法，由子类在构造函数中调用
   */
  protected initialize(): void {
    // 如果构造函数中没有设置标签，使用名称作为默认标签
    if (!this.label) {
      this.label = this.name;
    }
  }
  
  /**
   * 获取节点输入端口
   */
  getInputPorts(): PortDefinition[] {
    return this.ports.filter(port => port.type === PortType.INPUT);
  }
  
  /**
   * 获取节点输出端口
   */
  getOutputPorts(): PortDefinition[] {
    return this.ports.filter(port => port.type === PortType.OUTPUT);
  }
  
  /**
   * 添加输入端口
   * @param id 端口ID
   * @param name 端口名称
   * @param dataType 数据类型
   * @param description 端口描述
   * @param required 是否必需
   * @param multiple 是否允许多个连接
   */
  protected addInputPort(
    id: string,
    name: string,
    dataType: PortDataType = PortDataType.ANY,
    description?: string,
    required: boolean = false,
    multiple: boolean = false
  ): void {
    this.ports.push({
      id,
      name,
      type: PortType.INPUT,
      dataType,
      description,
      required,
      multiple
    });
  }
  
  /**
   * 添加输出端口
   * @param id 端口ID
   * @param name 端口名称
   * @param dataType 数据类型
   * @param description 端口描述
   * @param multiple 是否允许多个连接
   */
  protected addOutputPort(
    id: string,
    name: string,
    dataType: PortDataType = PortDataType.ANY,
    description?: string,
    multiple: boolean = true
  ): void {
    this.ports.push({
      id,
      name,
      type: PortType.OUTPUT,
      dataType,
      description,
      multiple
    });
  }
  
  /**
   * 创建节点数据
   * @param id 节点ID
   * @param position 节点位置
   * @param data 附加数据
   */
  createNodeData(
    id: string, 
    position: { x: number; y: number }, 
    data?: Record<string, any>
  ): Node {
    return {
      id,
      type: this.type,
      position,
      data: {
        label: this.label,
        type: this.type,
        inputs: this.createDefaultInputs(),
        ...data
      }
    };
  }
  
  /**
   * 创建默认输入数据
   * 子类可以覆盖此方法以提供特定的默认值
   */
  protected createDefaultInputs(): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    // 为每个输入端口创建默认值
    this.getInputPorts().forEach(port => {
      inputs[port.id] = {
        type: port.dataType,
        value: this.getDefaultValueForType(port.dataType),
      };
    });
    
    return inputs;
  }
  
  /**
   * 获取特定数据类型的默认值
   * @param dataType 数据类型
   */
  private getDefaultValueForType(dataType: PortDataType): any {
    switch (dataType) {
      case PortDataType.TEXT:
        return '';
      case PortDataType.NUMBER:
        return 0;
      case PortDataType.BOOLEAN:
        return false;
      case PortDataType.OBJECT:
        return {};
      case PortDataType.ARRAY:
        return [];
      case PortDataType.IMAGE:
      case PortDataType.AUDIO:
      case PortDataType.VIDEO:
      case PortDataType.FILE:
      case PortDataType.EMBEDDING:
        return null;
      case PortDataType.ANY:
      default:
        return null;
    }
  }
  
  /**
   * 验证节点输入
   * @param inputs 节点输入
   */
  validateInputs(inputs: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredPorts = this.getInputPorts().filter(port => port.required);
    
    requiredPorts.forEach(port => {
      if (!inputs[port.id] || inputs[port.id].value === undefined || inputs[port.id].value === null) {
        errors.push(`缺少必需输入: ${port.name}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 获取节点渲染样式
   * 可被子类覆盖以提供自定义样式
   */
  getStyles(): Record<string, any> {
    return {
      width: 180,
      padding: 10,
      borderRadius: 5,
      backgroundColor: this.getBackgroundColorByCategory(),
      borderColor: this.getBorderColorByCategory(),
      color: '#000',
    };
  }
  
  /**
   * 根据节点类别获取背景颜色
   */
  private getBackgroundColorByCategory(): string {
    switch (this.category) {
      case 'input':
        return '#e3f2fd'; // 浅蓝色
      case 'output':
        return '#e8f5e9'; // 浅绿色
      case 'ai':
        return '#f3e5f5'; // 浅紫色
      case 'utility':
        return '#fff3e0'; // 浅橙色
      case 'flow':
        return '#e0f7fa'; // 浅青色
      case 'data':
        return '#fce4ec'; // 浅粉色
      case 'custom':
        return '#f5f5f5'; // 浅灰色
      default:
        return '#f5f5f5'; // 默认浅灰色
    }
  }
  
  /**
   * 根据节点类别获取边框颜色
   */
  private getBorderColorByCategory(): string {
    switch (this.category) {
      case 'input':
        return '#2196f3'; // 蓝色
      case 'output':
        return '#4caf50'; // 绿色
      case 'ai':
        return '#9c27b0'; // 紫色
      case 'utility':
        return '#ff9800'; // 橙色
      case 'flow':
        return '#00bcd4'; // 青色
      case 'data':
        return '#e91e63'; // 粉色
      case 'custom':
        return '#9e9e9e'; // 灰色
      default:
        return '#9e9e9e'; // 默认灰色
    }
  }
}