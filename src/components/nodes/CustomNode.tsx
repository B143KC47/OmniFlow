import React, { memo, useCallback } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

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
  const { t } = useTranslation();
  
  // 使用useCallback优化onChange回调函数的性能
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    onDataChange({
      ...data,
      ...newData,
    });
  }, [data, onDataChange]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.custom.name'),
    inputs: {
      ...data.inputs,
      code: {
        type: 'textarea',
        value: data.inputs?.code?.value || '',
        placeholder: t('nodes.custom.codePlaceholder'),
        rows: 10,
        language: 'javascript'
      },
      config: {
        type: 'textarea',
        value: data.inputs?.config?.value || '{}',
        placeholder: t('nodes.custom.configPlaceholder'),
        rows: 5,
        language: 'json'
      }
    },
    outputs: {
      ...data.outputs,
      result: {
        type: 'text',
        value: data.outputs?.result?.value || '',
      },
    },
    onChange: handleChange
  };

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      isConnectable={isConnectable}
    />
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;