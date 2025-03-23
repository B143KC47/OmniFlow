import React, { memo, useCallback } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

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
    label: data.label || t('nodes.webSearch.name'),
    inputs: {
      ...data.inputs,
      query: {
        type: 'text',
        value: data.inputs?.query?.value || '',
        placeholder: t('nodes.webSearch.queryPlaceholder'),
      },
      maxResults: {
        type: 'number',
        value: data.inputs?.maxResults?.value || 5,
        min: 1,
        max: 20,
        step: 1,
        label: t('nodes.webSearch.resultCount')
      },
      searchEngine: {
        type: 'select',
        value: data.inputs?.searchEngine?.value || 'google',
        options: ['google', 'bing', 'duckduckgo'],
        label: t('nodes.webSearch.provider')
      },
    },
    outputs: {
      ...data.outputs,
      results: {
        type: 'text',
        value: data.outputs?.results?.value || '',
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

WebSearchNode.displayName = 'WebSearchNode';

export default WebSearchNode;