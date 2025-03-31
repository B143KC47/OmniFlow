// filepath: c:\Users\ko202\Desktop\project\OmniFlow\src\core\nodes\index.ts
import { NodeFactory } from './NodeFactory';
import NodeRegistry from './NodeRegistry';
import { BaseNode } from './BaseNode';
import { NodeCategoryType, PortType, PortDataType, NodeStatus, NodeDefinition, PortDefinition, NodeCategoryInfo } from './types';

export {
  NodeFactory,
  NodeRegistry,
  BaseNode,
  NodeCategoryType,
  PortType,
  PortDataType,
  NodeStatus
};

export type {
  NodeDefinition,
  PortDefinition,
  NodeCategoryInfo
};

// 默认导出工厂实例，方便直接使用
export default NodeFactory.getInstance();