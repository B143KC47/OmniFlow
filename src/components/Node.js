import React, { useState, useRef, useEffect } from 'react';
import styles from './Node.module.css';

const Node = ({ node, onStartConnecting, onFinishConnecting, onRemove }) => {
  // 添加默认值，防止 node 为 undefined
  const defaultPosition = { x: 0, y: 0 };
  const [position, setPosition] = useState(node?.position || defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  // 更新节点位置
  useEffect(() => {
    if (node) {
      node.position = position;
    }
  }, [position, node]);

  // 处理拖拽开始
  const handleMouseDown = (e) => {
    if (e.target === nodeRef.current || e.target.classList.contains(styles['node-header'])) {
      setIsDragging(true);
      const rect = nodeRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.stopPropagation();
    }
  };

  // 设置全局鼠标事件处理
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
        e.preventDefault();
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // 开始连接
  const handlePortMouseDown = (portId, isOutput, e) => {
    e.stopPropagation();
    onStartConnecting(node?.id, portId, isOutput);
  };

  // 结束连接
  const handlePortMouseUp = (portId, isOutput) => {
    onFinishConnecting(node?.id, portId, isOutput);
  };

  // 为节点添加类型相关的样式 - 添加防御性检查
  const nodeTypeClass = node?.type ? styles[`node-${node.type}`] : styles['node-custom'];
  const nodeClasses = `${styles.node} ${nodeTypeClass} ${isDragging ? styles.dragging : ''}`;

  // 如果 node 不存在，返回 null 或一个占位组件
  if (!node) {
    return null; // 或者返回一个默认的占位节点
  }

  // 处理节点输入输出的渲染
  // 我们需要适应inputs可能是对象而不是数组的情况
  const renderNodeInputs = () => {
    // 如果inputs是数组，直接使用map
    if (Array.isArray(node?.inputs)) {
      return node.inputs.map(input => (
        <div 
          key={input.id} 
          className={`${styles['node-port']} ${styles['node-input']}`}
          onMouseUp={() => handlePortMouseUp(input.id, false)}
        >
          <div 
            className={styles['port-connector']}
            onMouseDown={(e) => handlePortMouseDown(input.id, false, e)}
          />
          <span>{input.label || 'Input'}</span>
        </div>
      ));
    } 
    // 如果inputs是对象，将其转换为数组再渲染
    else if (node?.inputs && typeof node.inputs === 'object') {
      return Object.entries(node.inputs).map(([key, input]) => (
        <div 
          key={key} 
          className={`${styles['node-port']} ${styles['node-input']}`}
          onMouseUp={() => handlePortMouseUp(key, false)}
        >
          <div 
            className={styles['port-connector']}
            onMouseDown={(e) => handlePortMouseDown(key, false, e)}
          />
          <span>{input.label || key}</span>
        </div>
      ));
    }
    
    // 默认返回空数组
    return [];
  };

  // 同样处理输出
  const renderNodeOutputs = () => {
    // 如果outputs是数组，直接使用map
    if (Array.isArray(node?.outputs)) {
      return node.outputs.map(output => (
        <div 
          key={output.id} 
          className={`${styles['node-port']} ${styles['node-output']}`}
          onMouseUp={() => handlePortMouseUp(output.id, true)}
        >
          <span>{output.label || 'Output'}</span>
          <div 
            className={styles['port-connector']}
            onMouseDown={(e) => handlePortMouseDown(output.id, true, e)}
          />
        </div>
      ));
    } 
    // 如果outputs是对象，将其转换为数组再渲染
    else if (node?.outputs && typeof node.outputs === 'object') {
      return Object.entries(node.outputs).map(([key, output]) => (
        <div 
          key={key} 
          className={`${styles['node-port']} ${styles['node-output']}`}
          onMouseUp={() => handlePortMouseUp(key, true)}
        >
          <span>{output.label || key}</span>
          <div 
            className={styles['port-connector']}
            onMouseDown={(e) => handlePortMouseDown(key, true, e)}
          />
        </div>
      ));
    }
    
    // 默认返回空数组
    return [];
  };

  return (
    <div 
      ref={nodeRef} 
      className={nodeClasses}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className={styles['node-header']}>
        <span>{node.data?.label || node.id}</span>
        <button className={styles['node-delete-btn']} onClick={() => onRemove(node.id)}>×</button>
      </div>
      <div className={styles['node-content']}>
        <div className={styles['node-inputs']}>
          {renderNodeInputs()}
        </div>
        <div className={styles['node-outputs']}>
          {renderNodeOutputs()}
        </div>
      </div>
    </div>
  );
};

export default Node;
