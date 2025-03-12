import React, { memo } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';

interface WebSearchNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const WebSearchNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: WebSearchNodeProps) => {
  const initialData: NodeData = {
    ...data,
    label: '网络搜索',
    inputs: {
      query: {
        type: 'text',
        value: data.inputs?.query?.value || '',
        placeholder: '请输入搜索关键词',
      },
      maxResults: {
        type: 'number',
        value: data.inputs?.maxResults?.value || 5,
        min: 1,
        max: 20,
        step: 1,
      },
      searchEngine: {
        type: 'select',
        value: data.inputs?.searchEngine?.value || 'google',
        options: ['google', 'bing', 'duckduckgo'],
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

WebSearchNode.displayName = 'WebSearchNode';

export default WebSearchNode;