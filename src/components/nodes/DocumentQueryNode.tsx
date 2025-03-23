import React, { memo, useCallback, useEffect } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

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
  const { t } = useTranslation();
  
  // 使用useCallback优化onChange回调函数的性能，增加智能处理逻辑
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    // 获取更新后的输入数据
    const updatedInputs = newData.inputs || data.inputs || {};
    
    // 智能调整: 当相似度阈值变化时，调整结果数量
    let maxResults = updatedInputs.maxResults?.value;
    const similarity = updatedInputs.similarity?.value;
    
    if (similarity !== undefined && similarity !== data.inputs?.similarity?.value) {
      // 根据相似度调整结果数量 - 相似度高时可能需要更少结果
      if (similarity > 0.85 && maxResults > 3) {
        maxResults = 3;
      } else if (similarity < 0.5 && maxResults < 10) {
        maxResults = 10;
      }
    }
    
    // 更新节点数据，包括智能调整的字段和元数据
    onDataChange({
      ...data,
      ...newData,
      inputs: maxResults !== updatedInputs.maxResults?.value ? {
        ...updatedInputs,
        maxResults: {
          ...updatedInputs.maxResults,
          value: maxResults
        }
      } : updatedInputs,
      outputs: {
        ...data.outputs,
        metadata: {
          type: 'text',
          value: JSON.stringify({
            totalChunks: 0,
            matchedChunks: 0,
            processingTime: 0,
            similarityThreshold: similarity || data.inputs?.similarity?.value || 0.7
          }, null, 2)
        }
      }
    });
  }, [data, onDataChange]);
  
  // 节点挂载或文档路径更改时的副作用
  useEffect(() => {
    // 如果有路径但没有查询，可以自动生成默认查询
    if (data.inputs?.path?.value && !data.inputs?.query?.value) {
      onDataChange({
        ...data,
        inputs: {
          ...data.inputs,
          query: {
            ...data.inputs.query,
            value: t('nodes.documentQuery.defaultQuery')
          }
        }
      });
    }
  }, [data.inputs?.path?.value, t, data, onDataChange]);
  
  // 构建完整的节点数据，添加更多有用的配置项
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.documentQuery.name'),
    inputs: {
      ...data.inputs,
      query: {
        type: 'text',
        value: data.inputs?.query?.value || '',
        placeholder: t('nodes.documentQuery.queryPlaceholder'),
      },
      path: {
        type: 'text',
        value: data.inputs?.path?.value || '',
        placeholder: t('nodes.documentQuery.pathPlaceholder'),
      },
      maxResults: {
        type: 'number',
        value: data.inputs?.maxResults?.value || 5,
        min: 1,
        max: 20,
        step: 1,
        label: t('nodes.documentQuery.maxResults')
      },
      similarity: {
        type: 'number',
        value: data.inputs?.similarity?.value || 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        label: t('nodes.documentQuery.similarity')
      },
      chunkSize: {
        type: 'number',
        value: data.inputs?.chunkSize?.value || 1024,
        min: 256,
        max: 4096,
        step: 256,
        label: t('nodes.documentQuery.chunkSize')
      },
      chunkOverlap: {
        type: 'number',
        value: data.inputs?.chunkOverlap?.value || 128,
        min: 0,
        max: 1024,
        step: 64,
        label: t('nodes.documentQuery.chunkOverlap')
      },
    },
    outputs: {
      ...data.outputs,
      results: {
        type: 'text',
        value: data.outputs?.results?.value || '',
      },
      metadata: {
        type: 'text',
        value: data.outputs?.metadata?.value || JSON.stringify({
          totalChunks: 0,
          matchedChunks: 0,
          processingTime: 0
        }, null, 2)
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
    />
  );
});

DocumentQueryNode.displayName = 'DocumentQueryNode';

export default DocumentQueryNode;