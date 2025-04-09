import React, { memo, useCallback, useEffect } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface DocumentQueryNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 文档查询节点 - 用于在文档中执行语义搜索
 * 
 * 功能：
 * - 支持多种文档格式（PDF、DOCX、TXT等）
 * - 提供语义搜索和关键词搜索
 * - 可配置搜索参数（相似度阈值、结果数量等）
 */
const DocumentQueryNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: DocumentQueryNodeProps) => {
  const { t } = useTranslation();
  
  // 处理查询变更
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        query: e.target.value
      });
    }
  }, [data]);

  // 处理文档路径变更
  const handlePathChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        path: e.target.value
      });
    }
  }, [data]);

  // 处理最大结果数变更
  const handleMaxResultsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        maxResults: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理相似度阈值变更
  const handleSimilarityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        similarity: parseFloat(e.target.value)
      });
    }
  }, [data]);

  // 处理分块大小变更
  const handleChunkSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        chunkSize: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理分块重叠变更
  const handleChunkOverlapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        chunkOverlap: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.documentQuery.querySettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.query')}</label>
          <textarea
            value={data.query || ''}
            onChange={handleQueryChange}
            className="node-textarea"
            rows={3}
            placeholder={t('nodes.documentQuery.queryPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.path')}</label>
          <input
            type="text"
            value={data.path || ''}
            onChange={handlePathChange}
            className="node-input"
            placeholder={t('nodes.documentQuery.pathPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.maxResults')}</label>
          <input
            type="number"
            value={data.maxResults || 5}
            onChange={handleMaxResultsChange}
            className="node-input"
            min={1}
            max={20}
            step={1}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.similarity')}</label>
          <input
            type="range"
            value={data.similarity || 0.7}
            onChange={handleSimilarityChange}
            className="node-slider"
            min={0}
            max={1}
            step={0.1}
          />
          <span className="node-slider-value">{data.similarity || 0.7}</span>
        </div>
        
        <div className="node-section-header">
          <h3>{t('nodes.documentQuery.advancedSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.chunkSize')}</label>
          <input
            type="number"
            value={data.chunkSize || 1024}
            onChange={handleChunkSizeChange}
            className="node-input"
            min={256}
            max={4096}
            step={256}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.documentQuery.chunkOverlap')}</label>
          <input
            type="number"
            value={data.chunkOverlap || 128}
            onChange={handleChunkOverlapChange}
            className="node-input"
            min={0}
            max={1024}
            step={64}
          />
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.documentQuery.title'),
    inputs: {
      query: {
        type: 'string',
        label: t('nodes.documentQuery.query'),
        description: t('nodes.documentQuery.queryDesc')
      },
      document: {
        type: 'file',
        label: t('nodes.documentQuery.document'),
        description: t('nodes.documentQuery.documentDesc')
      }
    },
    outputs: {
      results: {
        type: 'array',
        label: t('nodes.documentQuery.results'),
        description: t('nodes.documentQuery.resultsDesc')
      },
      metadata: {
        type: 'object',
        label: t('nodes.documentQuery.metadata'),
        description: t('nodes.documentQuery.metadataDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="DOCUMENT_QUERY"
      isConnectable={isConnectable}
    />
  );
});

DocumentQueryNode.displayName = 'DocumentQueryNode';

export default DocumentQueryNode;
