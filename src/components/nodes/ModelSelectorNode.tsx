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
        value: data.inputs?.model?.value || 'deepseek-chat',
        options: [
          'deepseek-chat',
        ],
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
        placeholder: '请输入DeepSeek API密钥',
      },
      systemPrompt: {
        type: 'text',
        value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
        placeholder: '系统提示词',
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 0.7,
        min: 0,
        max: 1,
        step: 0.1,
      },
      maxTokens: {
        type: 'number',
        value: data.inputs?.maxTokens?.value || 1000,
        min: 1,
        max: 4096,
        step: 1,
      },
      stream: {
        type: 'select',
        value: data.inputs?.stream?.value || 'false',
        options: ['true', 'false'],
      },
    },
    outputs: {
      model: {
        type: 'text',
        value: data.inputs?.model?.value || 'deepseek-chat',
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
      },
      systemPrompt: {
        type: 'text',
        value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
      },
      config: {
        type: 'text',
        value: JSON.stringify({
          model: data.inputs?.model?.value || 'deepseek-chat',
          apiKey: data.inputs?.apiKey?.value || '',
          systemPrompt: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
          temperature: data.inputs?.temperature?.value || 0.7,
          maxTokens: data.inputs?.maxTokens?.value || 1000,
          stream: data.inputs?.stream?.value === 'true',
        }, null, 2),
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