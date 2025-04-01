import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import styles from './Node.module.css';
import { NodeData } from '../types';
import DefaultNode from './Node.js';

/**
 * 通用节点渲染器 - 作为与 ReactFlow 连接的桥梁
 * 该组件将会根据节点类型渲染对应的节点组件
 */
const ReactFlowNodeRenderer = ({ id, data, type, selected, position, isConnectable }: NodeProps<NodeData>) => {
  console.log(`渲染节点: ${id}, 类型: ${type}`, data);

  if (!data) {
    console.error(`节点 ${id} 的数据为空`);
    return <div className={styles['error-node']}>节点数据缺失</div>;
  }

  // 确保输入输出对象存在
  const inputs = data.inputs || {};
  const outputs = data.outputs || {};
  
  // 创建默认的输入和输出，确保每种节点类型都有基本的连接点
  if (Object.keys(inputs).length === 0) {
    // 为不同类型的节点添加默认输入
    switch(type) {
      case 'TEXT_INPUT':
        inputs.text = { type: 'text', value: '' };
        break;
      case 'WEB_SEARCH':
        inputs.query = { type: 'text', value: '' };
        break;
      case 'MODEL_SELECTOR':
        inputs.model = { type: 'text', value: 'gpt-4' };
        break;
      default:
        inputs.input = { type: 'any', value: null };
    }
  }
  
  if (Object.keys(outputs).length === 0) {
    // 为不同类型的节点添加默认输出
    switch(type) {
      case 'TEXT_INPUT':
        outputs.text = { type: 'text', value: '' };
        break;
      case 'WEB_SEARCH':
        outputs.results = { type: 'text', value: '' };
        break;
      case 'MODEL_SELECTOR':
        outputs.model = { type: 'text', value: '' };
        break;
      default:
        outputs.output = { type: 'any', value: null };
    }
  }

  // 构建传递给基础节点的属性
  const nodeProps = {
    node: {
      id,
      type,
      position,
      data: {
        ...data,
        inputs,
        outputs
      },
      inputs,
      outputs,
    },
    // 使用data.onChange回调通知上层组件
    onStartConnecting: (nodeId: string, portId: string, isOutput: boolean) => {
      console.log('开始连接:', nodeId, portId, isOutput ? '输出' : '输入');
    },
    onFinishConnecting: (nodeId: string, portId: string, isOutput: boolean) => {
      console.log('完成连接:', nodeId, portId, isOutput ? '输出' : '输入');
    },
    onRemove: () => {
      if (data.onChange) {
        // 通知上层组件删除该节点
        console.log(`触发删除节点: ${id}`);
        // 使用onChange回调删除节点
        data.onChange(id, { deleted: true });
      }
    }
  };

  // 计算Handle连接点的位置
  const getHandlePosition = (index: number, total: number) => {
    if (total === 1) return 0.5; // 只有一个连接点时居中
    const step = 1.0 / (total + 1);
    return step * (index + 1);
  };

  // 获取输入输出的条目数量
  const inputsCount = Object.keys(inputs).length;
  const outputsCount = Object.keys(outputs).length;

  // 在节点周围添加连接点
  return (
    <div className={`${styles['react-flow-node']} ${selected ? styles['selected'] : ''}`}>
      {/* 渲染基础节点 */}
      <DefaultNode {...nodeProps} />
      
      {/* 渲染输入连接点 */}
      {Object.entries(inputs).map(([key, input]: [string, any], index) => (
        <Handle
          key={`input-${key}`}
          type="target"
          position={Position.Left}
          id={`input-${key}`}
          style={{ top: `${getHandlePosition(index, inputsCount) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
      
      {/* 渲染输出连接点 */}
      {Object.entries(outputs).map(([key, output]: [string, any], index) => (
        <Handle
          key={`output-${key}`}
          type="source"
          position={Position.Right}
          id={`output-${key}`}
          style={{ top: `${getHandlePosition(index, outputsCount) * 100}%` }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

export default ReactFlowNodeRenderer;