import React from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '../types';
import CustomNodeComponent from './Node';

/**
 * 组件包装器 - 用于解决动态导入时的CSS加载问题
 * 这个组件只是简单地重新导出Node组件，但不会导致webpack尝试加载Node.css
 */
function NodeWrapper(props: NodeProps<NodeData>) {
  return <CustomNodeComponent {...props} />;
}

export default NodeWrapper;