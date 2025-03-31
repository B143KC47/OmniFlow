import React, { useState, useRef, useEffect } from 'react';
import styles from './Node.module.css';

const Node = ({ node, onStartConnecting, onFinishConnecting, onRemove }) => {
  const [position, setPosition] = useState(node.position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);

  // 更新节点位置
  useEffect(() => {
    node.position = position;
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
    onStartConnecting(node.id, portId, isOutput);
  };

  // 结束连接
  const handlePortMouseUp = (portId, isOutput) => {
    onFinishConnecting(node.id, portId, isOutput);
  };

  // 为节点添加类型相关的样式
  const nodeTypeClass = node.type ? styles[`node-${node.type}`] : styles['node-custom'];
  const nodeClasses = `${styles.node} ${nodeTypeClass} ${isDragging ? styles.dragging : ''}`;

  return (
    <div
      ref={nodeRef}
      className={nodeClasses}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 100 // 确保节点始终在连接线上方
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles['node-header']}>
        <span>{node.id}</span>
        <button className={styles['node-delete-btn']} onClick={() => onRemove(node.id)}>×</button>
      </div>
      <div className={styles['node-content']}>
        <div className={styles['node-inputs']}>
          {node.inputs.map(input => (
            <div 
              key={input.id} 
              className={`${styles['node-port']} ${styles['node-input']}`}
              onMouseUp={() => handlePortMouseUp(input.id, false)}
            >
              <div 
                className={styles['port-connector']}
                onMouseDown={(e) => handlePortMouseDown(input.id, false, e)}
              />
              <span>Input</span>
            </div>
          ))}
        </div>
        <div className={styles['node-outputs']}>
          {node.outputs.map(output => (
            <div 
              key={output.id} 
              className={`${styles['node-port']} ${styles['node-output']}`}
              onMouseUp={() => handlePortMouseUp(output.id, true)}
            >
              <span>Output</span>
              <div 
                className={styles['port-connector']}
                onMouseDown={(e) => handlePortMouseDown(output.id, true, e)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Node;
