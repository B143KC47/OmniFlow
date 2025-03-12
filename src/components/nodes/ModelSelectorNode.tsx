import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface ModelSelectorNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const ModelSelectorNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: ModelSelectorNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '模型选择',
    inputs: {
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'gpt-3.5-turbo',
        options: [
          'gpt-3.5-turbo',
          'gpt-4',
          'claude-2',
          'llama-2',
          'stable-diffusion',
          'midjourney',
          'dall-e-3',
        ],
      },
      parameters: {
        type: 'text',
        value: data.inputs?.parameters?.value || '',
        placeholder: '请输入模型参数（JSON格式）',
      },
    },
    outputs: {
      model: {
        type: 'text',
        value: data.inputs?.model?.value || '',
      },
      parameters: {
        type: 'text',
        value: data.inputs?.parameters?.value || '',
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

ModelSelectorNode.displayName = 'ModelSelectorNode';

export default ModelSelectorNode;