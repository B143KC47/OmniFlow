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

  // 添加日志输出，帮助调试
  console.log(`Node.tsx渲染节点: ${id}, 类型: ${nodeType}`, data);

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

  // 如果找不到组件，返回一个增强的默认节点，确保可见性
  console.warn(`未找到节点类型 ${nodeType} 的组件`);
  return (
    <div 
      className={styles['default-node']} 
      style={{
        backgroundColor: 'var(--node-color, #2d2d2d)',
        border: '1px solid var(--node-border-color, #444)',
        borderRadius: '6px',
        minWidth: '200px',
        minHeight: '100px',
        boxShadow: selected ? '0 0 0 2px var(--primary-color, #10a37f)' : 'var(--shadow-md, 0 2px 4px rgba(0,0,0,0.2))',
        overflow: 'visible',
        position: 'relative',
        zIndex: selected ? 100 : 10
      }}
    >
      <div 
        className={styles['default-node-header']}
        style={{
          backgroundColor: 'var(--node-header-color, #383838)',
          color: 'var(--node-title-color, #eee)',
          padding: '8px 12px',
          borderBottom: '1px solid var(--node-border-color, #444)',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {data?.label || nodeType}
        <span 
          role="button"
          onClick={() => data?.onChange && data.onChange(id, { deleted: true })}
          style={{ cursor: 'pointer', opacity: 0.7 }}
        >
          ×
        </span>
      </div>
      <div 
        className={styles['default-node-content']}
        style={{
          padding: '12px',
          color: 'var(--node-text-color, #ddd)'
        }}
      >
        {data?.inputs && Object.keys(data.inputs).length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>输入:</strong> {Object.keys(data.inputs).join(', ')}
          </div>
        )}
        {data?.outputs && Object.keys(data.outputs).length > 0 && (
          <div>
            <strong>输出:</strong> {Object.keys(data.outputs).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomNodeComponent;