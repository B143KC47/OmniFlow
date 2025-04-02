import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeData } from '../types';
import NodeFactory from '../core/nodes';
import { Z_INDEX, NODE_SIZE, PORT_TYPE_COLORS } from '../styles/nodeConstants';
import styles from './ReactFlowRenderer.module.css';

/**
 * ReactFlow节点渲染器 - 作为与ReactFlow连接的桥梁
 * 这个组件负责将我们的节点系统与ReactFlow集成
 */
const ReactFlowNodeRenderer = ({ 
  id, 
  data, 
  type, 
  selected, 
  isConnectable
}: NodeProps<NodeData>) => {
  // 获取节点工厂实例
  const nodeFactory = NodeFactory.getInstance();
  
  // 检查节点数据
  if (!data) {
    console.error(`节点 ${id} 的数据为空`);
    return (
      <div className={styles.errorNode}>
        节点数据缺失
      </div>
    );
  }
  
  // 获取节点类型对应的组件
  const NodeComponent = nodeFactory.createNodeComponent(type || '');
  
  // 如果没有找到对应组件，使用默认渲染方式
  if (!NodeComponent) {
    console.warn(`未找到节点类型 ${type} 对应的组件`);
    
    // 确保输入输出对象存在
    const inputs = data.inputs || {};
    const outputs = data.outputs || {};
    
    // 计算连接点位置
    const getHandlePosition = (index: number, total: number) => {
      if (total === 1) return 0.5; // 只有一个连接点时居中
      const step = 1.0 / (total + 1);
      return step * (index + 1);
    };
    
    // 获取输入输出的条目数量
    const inputsCount = Object.keys(inputs).length;
    const outputsCount = Object.keys(outputs).length;
    
    // 返回默认节点渲染
    return (
      <div 
        className={`${styles.defaultNode} ${selected ? styles.selected : ''}`}
        style={{
          width: NODE_SIZE.DEFAULT_WIDTH,
          minHeight: NODE_SIZE.MIN_HEIGHT,
          backgroundColor: 'var(--node-color, #2d2d2d)',
          borderColor: 'var(--node-border-color, #444)',
          zIndex: selected ? Z_INDEX.NODE_SELECTED : Z_INDEX.NODE
        }}
      >
        <div className={styles.defaultNodeHeader}>
          {data.label || type || id}
        </div>
        
        <div className={styles.defaultNodeContent}>
          {/* 输入部分 */}
          {Object.keys(inputs).length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>输入</div>
              <div className={styles.portList}>
                {Object.entries(inputs).map(([key, input]: [string, any], index) => (
                  <div key={`input-${key}`} className={styles.portItem}>
                    {input.label || key}
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`input-${key}`}
                      style={{ 
                        top: `${getHandlePosition(index, inputsCount) * 100}%`,
                        backgroundColor: PORT_TYPE_COLORS[input.type as keyof typeof PORT_TYPE_COLORS] || PORT_TYPE_COLORS.default,
                        zIndex: Z_INDEX.HANDLE
                      }}
                      isConnectable={isConnectable}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 输出部分 */}
          {Object.keys(outputs).length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>输出</div>
              <div className={styles.portList}>
                {Object.entries(outputs).map(([key, output]: [string, any], index) => (
                  <div key={`output-${key}`} className={styles.portItem}>
                    {output.label || key}
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`output-${key}`}
                      style={{ 
                        top: `${getHandlePosition(index, outputsCount) * 100}%`,
                        backgroundColor: PORT_TYPE_COLORS[output.type as keyof typeof PORT_TYPE_COLORS] || PORT_TYPE_COLORS.default,
                        zIndex: Z_INDEX.HANDLE
                      }}
                      isConnectable={isConnectable}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 定义数据更改回调
  const handleDataChange = (nodeId: string, newData: any) => {
    if (data.onChange) {
      data.onChange(nodeId, newData);
    } else {
      console.warn(`节点 ${nodeId} 没有onChange处理器`);
    }
  };
  
  // 使用对应的节点组件渲染
  return (
    <NodeComponent
      id={id}
      data={data}
      selected={selected}
      isConnectable={isConnectable}
      onDataChange={handleDataChange}
    />
  );
};

export default ReactFlowNodeRenderer;