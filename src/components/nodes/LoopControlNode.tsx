import React from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';

const LoopControlNode = ({ data, isConnectable }) => {
  return (
    <BaseNode title="循环控制">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
      <div className="node-content">
        <div className="p-2">
          <select 
            className="w-full p-1 border rounded"
            value={data.condition || 'always'}
            onChange={(e) => data.onChange?.('condition', e.target.value)}
          >
            <option value="always">持续执行</option>
            <option value="conditional">条件执行</option>
            <option value="count">指定次数</option>
            <option value="confirm">手动确认</option>
          </select>
          {data.condition === 'conditional' && (
            <input
              type="text"
              className="w-full mt-2 p-1 border rounded"
              placeholder="条件表达式"
              value={data.expression || ''}
              onChange={(e) => data.onChange?.('expression', e.target.value)}
            />
          )}
          {data.condition === 'count' && (
            <input
              type="number"
              className="w-full mt-2 p-1 border rounded"
              placeholder="循环次数"
              min="1"
              value={data.iterationCount || ''}
              onChange={(e) => data.onChange?.('iterationCount', e.target.value)}
            />
          )}
          {data.condition === 'confirm' && (
            <div className="mt-2 text-sm text-gray-600">
              每次迭代时将提示"是否继续迭代？"
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
};

export default LoopControlNode;