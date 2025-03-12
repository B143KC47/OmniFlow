import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface DocumentQueryNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const DocumentQueryNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: DocumentQueryNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '文档查询',
    inputs: {
      query: {
        type: 'text',
        value: data.inputs?.query?.value || '',
        placeholder: '请输入查询内容',
      },
      path: {
        type: 'text',
        value: data.inputs?.path?.value || '',
        placeholder: '请输入文档路径',
      },
      maxResults: {
        type: 'number',
        value: data.inputs?.maxResults?.value || 5,
        min: 1,
        max: 20,
        step: 1,
      },
      similarity: {
        type: 'number',
        value: data.inputs?.similarity?.value || 0.7,
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    outputs: {
      results: {
        type: 'text',
        value: data.outputs?.results?.value || '',
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

DocumentQueryNode.displayName = 'DocumentQueryNode';

export default DocumentQueryNode;