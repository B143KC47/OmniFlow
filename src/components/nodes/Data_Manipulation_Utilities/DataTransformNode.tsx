import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useTranslation } from '../../../utils/i18n';
import { NodeData } from '../../../types';
import BaseNodeComponent from '../BaseNodeComponent';

/**
 * 数据转换节点 - 用于转换数据格式和结构
 * 
 * 功能：
 * - 支持多种数据转换操作（JSON解析/序列化、类型转换、数据提取等）
 * - 提供可配置的转换规则
 * - 支持预览转换结果
 */
const DataTransformNode: React.FC<{
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}> = ({ id, data, selected, isConnectable }) => {
  const { t } = useTranslation();
  const [transformType, setTransformType] = useState(data.transformType || 'json');
  const [transformConfig, setTransformConfig] = useState(data.transformConfig || '{}');
  const [previewResult, setPreviewResult] = useState<string>('');

  // 转换类型选项
  const transformOptions = [
    { value: 'json', label: t('nodes.dataTransform.jsonTransform') },
    { value: 'typeConversion', label: t('nodes.dataTransform.typeConversion') },
    { value: 'extraction', label: t('nodes.dataTransform.extraction') },
    { value: 'formatting', label: t('nodes.dataTransform.formatting') },
    { value: 'custom', label: t('nodes.dataTransform.custom') }
  ];

  // 处理转换类型变更
  const handleTransformTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setTransformType(newType);
    
    // 更新节点数据
    if (data.onChange) {
      data.onChange({
        ...data,
        transformType: newType
      });
    }
  }, [data]);

  // 处理转换配置变更
  const handleConfigChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newConfig = e.target.value;
    setTransformConfig(newConfig);
    
    // 更新节点数据
    if (data.onChange) {
      data.onChange({
        ...data,
        transformConfig: newConfig
      });
    }
  }, [data]);

  // 预览转换结果
  const handlePreview = useCallback(() => {
    try {
      // 这里只是一个简单的模拟，实际应用中应该根据转换类型执行相应的转换逻辑
      let result = '';
      
      if (transformType === 'json') {
        // 尝试解析JSON
        const config = JSON.parse(transformConfig);
        result = JSON.stringify(config, null, 2);
      } else if (transformType === 'typeConversion') {
        result = `转换配置已应用: ${transformConfig}`;
      } else {
        result = `${transformType} 转换配置已应用`;
      }
      
      setPreviewResult(result);
    } catch (error) {
      setPreviewResult(`错误: ${(error as Error).message}`);
    }
  }, [transformType, transformConfig]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.dataTransform.transformSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.dataTransform.transformType')}</label>
          <select 
            value={transformType} 
            onChange={handleTransformTypeChange}
            className="node-select"
          >
            {transformOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.dataTransform.transformConfig')}</label>
          <textarea
            value={transformConfig}
            onChange={handleConfigChange}
            className="node-textarea"
            rows={5}
            placeholder={t('nodes.dataTransform.configPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <button 
            onClick={handlePreview}
            className="node-button"
          >
            {t('nodes.dataTransform.preview')}
          </button>
        </div>
        
        {previewResult && (
          <div className="node-row">
            <label>{t('nodes.dataTransform.previewResult')}</label>
            <div className="node-preview-result">
              <pre>{previewResult}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.dataTransform.title'),
    inputs: {
      input: {
        type: 'any',
        label: t('nodes.dataTransform.input'),
        description: t('nodes.dataTransform.inputDesc')
      }
    },
    outputs: {
      output: {
        type: 'any',
        label: t('nodes.dataTransform.output'),
        description: t('nodes.dataTransform.outputDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="DATA_TRANSFORM"
      isConnectable={isConnectable}
    />
  );
};

export default DataTransformNode;
