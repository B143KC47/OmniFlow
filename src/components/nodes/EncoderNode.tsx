import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface EncoderNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

const EncoderNode = memo(({ id, data, selected, isConnectable }: EncoderNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '编码器',
    inputs: {
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
        placeholder: '请输入文本',
      },
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'clip',
        options: ['clip', 'bert', 'sentence-transformer'],
      },
    },
    outputs: {
      embedding: {
        type: 'text',
        value: data.outputs?.embedding?.value || '',
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

EncoderNode.displayName = 'EncoderNode';

export default EncoderNode; 