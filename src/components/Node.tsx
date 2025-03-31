import React from 'react';
import { NodeProps } from 'reactflow';
import styles from './Node.module.css';
import { NodeData } from '../types';
import NodeFactory from '../core/nodes/NodeFactory';

/**
 * 创建节点内容组件
 * @param props 节点属性
 */
function CustomNodeComponent(props: NodeProps<NodeData>) {
  const { id, data, selected, isConnectable } = props;
  const { type } = props;
  const nodeType = type || props.data?.type;
  const nodeFactory = NodeFactory.getInstance();

  // 定义统一的事件处理函数
  const handleNodeDataChange = (newData: NodeData) => {
    if (data && data.onChange) {
      data.onChange(id, newData);
    } else {
      console.warn(`Node ${id} of type ${nodeType} has no onChange handler`);
    }
  };

  // 适配参数类型为 (nodeId, data) 的处理函数
  const handleNodeIdDataChange = (nodeId: string, nodeData: any) => {
    if (data && data.onChange) {
      data.onChange(nodeId, nodeData);
    } else {
      console.warn(`Node ${nodeId} of type ${nodeType} has no onChange handler`);
    }
  };

  // 尝试使用工厂创建节点组件
  const NodeComponent = nodeFactory.createNodeComponent(nodeType);
  if (NodeComponent) {
    // 根据组件参数类型传递适当的回调函数
    const nodeProps = {
      id,
      data,
      selected,
      isConnectable,
      onDataChange: handleNodeDataChange,
    };

    // 检查组件是否需要 nodeId 格式的回调
    const usesNodeIdCallback = (
      nodeType === 'IMAGE_INPUT' || 
      nodeType === 'VIDEO_INPUT' || 
      nodeType === 'AUDIO_INPUT' || 
      nodeType === 'FILE_INPUT' || 
      nodeType === 'TEXT_OUTPUT' || 
      nodeType === 'IMAGE_OUTPUT' || 
      nodeType === 'VIDEO_OUTPUT' || 
      nodeType === 'FILE_OUTPUT'
    );

    if (usesNodeIdCallback) {
      return <NodeComponent {...nodeProps} onDataChange={handleNodeIdDataChange} />;
    }
    
    return <NodeComponent {...nodeProps} />;
  }

  // 如果找不到组件，返回一个默认节点
  console.warn(`未找到节点类型 ${nodeType} 的组件`);
  return (
    <div className={styles['default-node']}>
      <div className={styles['default-node-header']}>{data?.label || nodeType}</div>
      <div className={styles['default-node-content']}>未找到节点组件</div>
    </div>
  );
}

export default CustomNodeComponent;