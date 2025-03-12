import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface CustomNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const CustomNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: CustomNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: data.label || '自定义节点',
    inputs: {
      config: {
        type: 'text',
        value: data.inputs?.config?.value || '',
        placeholder: '请输入节点配置（JSON格式）',
      },
    },
    outputs: {
      result: {
        type: 'text',
        value: data.outputs?.result?.value || '',
      },
    },
    onChange: (nodeId: string, newData: NodeData) => {
      onDataChange(newData);
    }
  };

  return (
    <BaseNode
      id={id}
      data={initialData}
      selected={selected}
      isConnectable={isConnectable}
    />
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;