import React, { useCallback, useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { NodeData } from '../types';
import NodeFactory from '../core/nodes';
import styles from './Node.module.css';

/**
 * 创建节点内容组件
 * @param props 节点属性
 */
function CustomNodeComponent(props: NodeProps<NodeData>) {
  const { id, data, selected, isConnectable } = props;
  const { type } = props;
  const nodeType = type || data?.type; // 修复：使用props中的type或data中的type
  const nodeFactory = NodeFactory.getInstance();

  // 定义统一的事件处理函数
  const handleNodeDataChange = useCallback((newData: NodeData) => {
    if (data && data.onChange) {
      data.onChange(id, newData);
    } else {
      console.warn(`Node ${id} of type ${nodeType} has no onChange handler`);
    }
  }, [data, id, nodeType]);

  // 尝试使用工厂创建节点组件
  const NodeComponent = nodeFactory.createNodeComponent(nodeType);
  if (NodeComponent) {
    // 准备传递给节点组件的属性
    const nodeProps = {
      id,
      data,
      selected,
      isConnectable,
      onDataChange: handleNodeDataChange,
      type: nodeType
    };
    
    return <NodeComponent {...nodeProps} />;
  }

  // 如果找不到组件，返回增强的默认节点，使用统一的comfy-node样式
  console.warn(`未找到节点类型 ${nodeType} 的组件`);
  return (
    <div 
      className={`${styles['comfy-node']} ${selected ? styles['selected'] : ''}`}
      style={{
        minWidth: '200px',
        minHeight: '100px',
        zIndex: selected ? 100 : 10
      }}
    >
      <div className={styles['comfy-node-header']}>
        <div className={styles['comfy-node-title']}>
          {data?.label || nodeType}
        </div>
        <div className={styles['comfy-node-controls']}>
          <span 
            role="button"
            className={styles['comfy-node-collapse-btn']}
            onClick={() => data?.onChange && data.onChange(id, { deleted: true })}
          >
            ×
          </span>
        </div>
      </div>
      
      <div className={styles['comfy-node-content']}>
        {data?.inputs && Object.keys(data.inputs).length > 0 && (
          <div className={styles['comfy-section']}>
            <div className={styles['comfy-section-title']}>输入</div>
            {Object.entries(data.inputs).map(([key, input]: [string, any]) => (
              <div key={`input-${key}`} className={styles['comfy-node-row']}>
                <div className={styles['comfy-node-label']}>{input.label || key}</div>
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`input-${key}`}
                  className={`${styles['comfy-node-handle']} ${styles['comfy-node-handle-input']}`}
                  isConnectable={isConnectable}
                />
              </div>
            ))}
          </div>
        )}
        
        {data?.outputs && Object.keys(data.outputs).length > 0 && (
          <div className={styles['comfy-section']}>
            <div className={styles['comfy-section-title']}>输出</div>
            {Object.entries(data.outputs).map(([key, output]: [string, any]) => (
              <div key={`output-${key}`} className={styles['comfy-node-row']}>
                <div className={styles['comfy-node-label']}>{output.label || key}</div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`output-${key}`}
                  className={`${styles['comfy-node-handle']} ${styles['comfy-node-handle-output']}`}
                  isConnectable={isConnectable}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomNodeComponent;