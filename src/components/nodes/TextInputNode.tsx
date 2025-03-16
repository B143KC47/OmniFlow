import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface TextInputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const TextInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: TextInputNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '文本输入',
    inputs: {
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
        placeholder: '请输入文本',
      },
    },
    outputs: {
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
      }
    },
    onChange: (nodeId: string, newData: NodeData) => {
      // 当输入改变时，同步更新输出
      const updatedData = {
        ...newData,
        outputs: {
          text: {
            type: 'text',
            value: newData.inputs?.text?.value || '',
          }
        }
      };
      onDataChange(updatedData);
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

TextInputNode.displayName = 'TextInputNode';

export default TextInputNode;