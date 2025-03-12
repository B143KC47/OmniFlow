import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface LlmQueryNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const LlmQueryNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: LlmQueryNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: 'LLM 查询',
    inputs: {
      prompt: {
        type: 'text',
        value: data.inputs?.prompt?.value || '',
        placeholder: '请输入提示词',
      },
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'gpt-3.5-turbo',
        options: ['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'llama-2'],
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 0.7,
        min: 0,
        max: 2,
        step: 0.1,
      },
      maxTokens: {
        type: 'number',
        value: data.inputs?.maxTokens?.value || 1000,
        min: 1,
        max: 4096,
        step: 1,
      },
    },
    outputs: {
      text: {
        type: 'text',
        value: data.outputs?.text?.value || '',
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

LlmQueryNode.displayName = 'LlmQueryNode';

export default LlmQueryNode;