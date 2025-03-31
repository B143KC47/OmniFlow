import React, { memo, useCallback } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';

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
  const { t } = useTranslation();
  
  // 使用useCallback优化onChange回调函数的性能
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    // 当输入改变时，同步更新输出
    onDataChange({
      ...data,
      ...newData,
      outputs: {
        text: {
          type: 'text',
          value: newData.inputs?.text?.value || data.inputs?.text?.value || '',
        }
      }
    });
  }, [data, onDataChange]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.textInput.name'),
    inputs: {
      ...data.inputs,
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
        placeholder: t('nodes.textInput.placeholder'),
      },
    },
    outputs: {
      ...data.outputs,
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
      }
    },
    onChange: handleChange
  };

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
      onDataChange={onDataChange}
    />
  );
});

TextInputNode.displayName = 'TextInputNode';

export default TextInputNode;