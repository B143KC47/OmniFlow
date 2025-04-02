// 节点系统入口文件
import NodeFactory from './NodeFactory';
import NodeRegistrator from './NodeRegistrator';

// 导出组件和类型
export { 
  NodeFactory as default,  // 修改：导出NodeFactory类作为默认导出，而不是实例
  NodeRegistrator
};

// 导出类型定义
export type { 
  NodeComponentProps, 
  NodeDefinition 
} from './NodeFactory';