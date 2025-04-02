import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NodeData } from '../types';
import NodeFactory from '../core/nodes';
import { Z_INDEX, NODE_SIZE, PORT_TYPE_COLORS } from '../styles/nodeConstants';
import styles from './ReactFlowRenderer.module.css';
import nodeStyles from './Node.module.css'; // 导入统一的节点样式

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
    
    // 返回默认节点渲染，使用统一的comfy-node样式
    return (
      <div 
        className={`${nodeStyles['comfy-node']} ${selected ? nodeStyles['selected'] : ''}`}
        style={{
          width: NODE_SIZE.DEFAULT_WIDTH,
          minHeight: NODE_SIZE.MIN_HEIGHT,
          zIndex: selected ? Z_INDEX.NODE_SELECTED : Z_INDEX.NODE
        }}
      >
        <div className={nodeStyles['comfy-node-header']}>
          <div className={nodeStyles['comfy-node-title']}>
            {data.label || type || id}
          </div>
          <div className={nodeStyles['comfy-node-controls']}>
            <span
              role="button"
              className={nodeStyles['comfy-node-collapse-btn']}
              onClick={() => data.onChange && data.onChange(id, { deleted: true })}
            >
              ×
            </span>
          </div>
        </div>
        
        <div className={nodeStyles['comfy-node-content']}>
          {/* 输入部分 */}
          {Object.keys(inputs).length > 0 && (
            <div className={nodeStyles['comfy-section']}>
              <div className={nodeStyles['comfy-section-title']}>输入</div>
              <div>
                {Object.entries(inputs).map(([key, input]: [string, any], index) => (
                  <div key={`input-${key}`} className={nodeStyles['comfy-node-row']}>
                    <div className={nodeStyles['comfy-node-label']}>{input.label || key}</div>
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`input-${key}`}
                      className={nodeStyles['comfy-node-handle']}
                      style={{ 
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
            <div className={nodeStyles['comfy-section']}>
              <div className={nodeStyles['comfy-section-title']}>输出</div>
              <div>
                {Object.entries(outputs).map(([key, output]: [string, any], index) => (
                  <div key={`output-${key}`} className={nodeStyles['comfy-node-row']}>
                    <div className={nodeStyles['comfy-node-label']}>{output.label || key}</div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`output-${key}`}
                      className={nodeStyles['comfy-node-handle']}
                      style={{ 
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