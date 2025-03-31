import { NodeData } from '../../types';

/**
 * 所有节点组件共用的属性接口
 */
export interface BaseNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

/**
 * 节点组件接口 - 使用nodeId和data参数的回调函数
 */
export interface NodePropsWithIdCallback {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: any) => void;
}

/**
 * 统一的节点构建函数类型
 * 用于从节点数据构建完整的节点配置
 */
export type NodeBuilder = (nodeData: NodeData, id: string, t: (key: string) => string) => NodeData;

/**
 * 节点验证函数类型
 * 用于验证节点输入和连接是否有效
 */
export type NodeValidator = (nodeData: NodeData) => { valid: boolean; message?: string };

/**
 * 节点数据转换器类型
 * 用于在不同格式之间转换节点数据
 */
export type NodeDataTransformer = (data: any) => NodeData;

/**
 * 节点处理器接口
 * 定义节点执行相关的方法
 */
export interface NodeProcessor {
  execute: (nodeData: NodeData, inputs?: Record<string, any>) => Promise<Record<string, any>>;
  validate: NodeValidator;
  getSchema: () => any;
}