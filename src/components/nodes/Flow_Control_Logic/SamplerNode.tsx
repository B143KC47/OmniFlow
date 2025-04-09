import React, { memo, useCallback } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface SamplerNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 采样器节点 - 用于从选项集合中采样
 * 
 * 功能：
 * - 支持多种采样方法（随机、top-k、top-p等）
 * - 可配置采样参数（温度、数量等）
 * - 提供采样结果预览
 */
const SamplerNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: SamplerNodeProps) => {
  const { t } = useTranslation();

  // 处理选项变更
  const handleOptionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        options: e.target.value
      });
    }
  }, [data]);

  // 处理采样方法变更
  const handleSamplingMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        samplingMethod: e.target.value
      });
    }
  }, [data]);

  // 处理采样数量变更
  const handleCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        count: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理温度变更
  const handleTemperatureChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        temperature: parseFloat(e.target.value)
      });
    }
  }, [data]);

  // 执行采样预览
  const handlePreviewSampling = useCallback(() => {
    if (data.onChange) {
      const options = (data.options || '').split('\n').filter(line => line.trim() !== '');
      const count = data.count || 1;
      
      let sampledOptions = [];
      if (options.length > 0) {
        if (count >= options.length) {
          sampledOptions = [...options];
        } else {
          // 简单随机采样
          const shuffled = [...options].sort(() => 0.5 - Math.random());
          sampledOptions = shuffled.slice(0, count);
        }
      }
      
      data.onChange({
        ...data,
        sampled: sampledOptions.join('\n')
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.sampler.samplingSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.sampler.options')}</label>
          <textarea
            value={data.options || ''}
            onChange={handleOptionsChange}
            className="node-textarea"
            rows={5}
            placeholder={t('nodes.sampler.optionsPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.sampler.method')}</label>
          <select
            value={data.samplingMethod || 'random'}
            onChange={handleSamplingMethodChange}
            className="node-select"
          >
            <option value="random">{t('nodes.sampler.random')}</option>
            <option value="top-p">{t('nodes.sampler.topP')}</option>
            <option value="top-k">{t('nodes.sampler.topK')}</option>
            <option value="temperature">{t('nodes.sampler.temperatureBased')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.sampler.count')}</label>
          <input
            type="number"
            value={data.count || 1}
            onChange={handleCountChange}
            className="node-input"
            min={1}
            max={100}
            step={1}
          />
        </div>
        
        {(data.samplingMethod === 'temperature' || data.samplingMethod === 'top-p') && (
          <div className="node-row">
            <label>{t('nodes.sampler.temperature')}</label>
            <input
              type="range"
              value={data.temperature || 1.0}
              onChange={handleTemperatureChange}
              className="node-slider"
              min={0.1}
              max={2.0}
              step={0.1}
            />
            <span className="node-slider-value">{data.temperature || 1.0}</span>
          </div>
        )}
        
        <div className="node-row">
          <button 
            onClick={handlePreviewSampling}
            className="node-button"
          >
            {t('nodes.sampler.preview')}
          </button>
        </div>
        
        {data.sampled && (
          <div className="node-row">
            <label>{t('nodes.sampler.sampledResult')}</label>
            <div className="node-sampled-result">
              <pre>{data.sampled}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.sampler.title'),
    inputs: {
      options: {
        type: 'string',
        label: t('nodes.sampler.options'),
        description: t('nodes.sampler.optionsDesc')
      },
      count: {
        type: 'number',
        label: t('nodes.sampler.count'),
        description: t('nodes.sampler.countDesc')
      }
    },
    outputs: {
      sampled: {
        type: 'array',
        label: t('nodes.sampler.sampled'),
        description: t('nodes.sampler.sampledDesc')
      },
      metadata: {
        type: 'object',
        label: t('nodes.sampler.metadata'),
        description: t('nodes.sampler.metadataDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="SAMPLER"
      isConnectable={isConnectable}
    />
  );
});

SamplerNode.displayName = 'SamplerNode';

export default SamplerNode;
