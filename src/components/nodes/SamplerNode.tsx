import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface SamplerNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

const SamplerNode = memo(({ id, data, selected, isConnectable }: SamplerNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '采样器',
    inputs: {
      input: {
        type: 'text',
        value: data.inputs?.input?.value || '',
        placeholder: '输入文本或向量',
      },
      samplingType: {
        type: 'select',
        value: data.inputs?.samplingType?.value || 'random',
        options: ['random', 'top-k', 'top-p', 'beam-search', 'greedy', 'temperature'],
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 0.7,
        min: 0.1,
        max: 2.0,
        step: 0.1,
      },
      topK: {
        type: 'number',
        value: data.inputs?.topK?.value || 5,
        min: 1,
        max: 100,
        step: 1,
      },
      topP: {
        type: 'number',
        value: data.inputs?.topP?.value || 0.9,
        min: 0.1,
        max: 1.0,
        step: 0.05,
      }
    },
    outputs: {
      result: {
        type: 'text',
        value: data.outputs?.result?.value || '',
      },
    },
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

SamplerNode.displayName = 'SamplerNode';

export default SamplerNode;