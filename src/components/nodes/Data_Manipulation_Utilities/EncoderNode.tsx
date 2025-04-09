import React, { memo, useCallback } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface EncoderNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 编码器节点 - 用于将文本转换为向量嵌入
 * 
 * 功能：
 * - 支持多种嵌入模型
 * - 可配置嵌入维度
 * - 提供向量可视化
 */
const EncoderNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: EncoderNodeProps) => {
  const { t } = useTranslation();

  // 处理文本变更
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        text: e.target.value
      });
    }
  }, [data]);

  // 处理模型变更
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        model: e.target.value
      });
    }
  }, [data]);

  // 处理维度变更
  const handleDimensionsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        dimensions: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.encoder.encodingSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.encoder.text')}</label>
          <textarea
            value={data.text || ''}
            onChange={handleTextChange}
            className="node-textarea"
            rows={3}
            placeholder={t('nodes.encoder.textPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.encoder.model')}</label>
          <select
            value={data.model || 'text-embedding-ada-002'}
            onChange={handleModelChange}
            className="node-select"
          >
            <option value="text-embedding-ada-002">text-embedding-ada-002</option>
            <option value="multilingual-e5-large">multilingual-e5-large</option>
            <option value="bge-large-en-v1.5">bge-large-en-v1.5</option>
            <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.encoder.dimensions')}</label>
          <input
            type="number"
            value={data.dimensions || 1536}
            onChange={handleDimensionsChange}
            className="node-input"
            min={256}
            max={4096}
            step={128}
          />
        </div>
        
        {data.embedding && (
          <div className="node-row">
            <label>{t('nodes.encoder.preview')}</label>
            <div className="node-embedding-preview">
              <div className="node-embedding-visualization">
                {/* 简单的向量可视化 */}
                <div className="vector-bars">
                  {Array(10).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className="vector-bar" 
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        backgroundColor: `hsl(${i * 36}, 70%, 50%)`
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="node-embedding-info">
                {t('nodes.encoder.dimensions')}: {data.dimensions || 1536}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.encoder.title'),
    inputs: {
      text: {
        type: 'string',
        label: t('nodes.encoder.text'),
        description: t('nodes.encoder.textDesc')
      }
    },
    outputs: {
      embedding: {
        type: 'vector',
        label: t('nodes.encoder.embedding'),
        description: t('nodes.encoder.embeddingDesc')
      },
      metadata: {
        type: 'object',
        label: t('nodes.encoder.metadata'),
        description: t('nodes.encoder.metadataDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="ENCODER"
      isConnectable={isConnectable}
    />
  );
});

EncoderNode.displayName = 'EncoderNode';

export default EncoderNode;
