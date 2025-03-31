import React, { memo, useCallback, useState, useEffect } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';

interface LlmQueryNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const LlmQueryNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: LlmQueryNodeProps) => {
  const { t } = useTranslation();
  
  const modelOptions = [
    'deepseek-chat',
    'deepseek-reasoner',
    'qwen-max',
    'gpt-4'
  ];
  
  // 使用useCallback优化onChange回调函数的性能，添加智能处理逻辑
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    const updatedInputs = newData.inputs || data.inputs || {};
    const modelType = updatedInputs.model?.value || data.inputs?.model?.value;
    
    // 根据模型类型调整默认参数
    let temperature = updatedInputs.temperature?.value;
    let maxTokens = updatedInputs.maxTokens?.value;
    
    // 智能调整参数，适配不同模型
    if (modelType && modelType !== data.inputs?.model?.value) {
      if (modelType === 'deepseek-reasoner') {
        // 推理模型默认使用较低温度
        temperature = temperature === undefined ? 0.2 : temperature;
        maxTokens = maxTokens === undefined ? 2048 : maxTokens;
      } else if (modelType === 'qwen-max' || modelType === 'gpt-4') {
        // 高级模型默认使用较高的token上限
        maxTokens = maxTokens === undefined ? 4096 : maxTokens;
      }
    }
    
    // 更新节点数据
    onDataChange({
      ...data,
      ...newData,
      inputs: {
        ...updatedInputs,
        // 仅当需要智能调整参数时才更新
        ...(temperature !== undefined && temperature !== updatedInputs.temperature?.value ? {
          temperature: { ...updatedInputs.temperature, value: temperature }
        } : {}),
        ...(maxTokens !== undefined && maxTokens !== updatedInputs.maxTokens?.value ? {
          maxTokens: { ...updatedInputs.maxTokens, value: maxTokens }
        } : {})
      },
      // 更新请求状态信息
      outputs: {
        ...data.outputs,
        requestInfo: {
          type: 'text',
          value: JSON.stringify({
            model: modelType || data.inputs?.model?.value,
            tokensUsed: 0,
            lastRequest: new Date().toISOString()
          }, null, 2)
        }
      }
    });
  }, [data, onDataChange]);
  
  // 监听model变化，自动调整其他参数
  useEffect(() => {
    const modelType = data.inputs?.model?.value;
    if (modelType) {
      // 这里不直接修改，而是通过事件通知来保持一致性
      // 仅在初始化或API参数缺失时设置默认值
      if (!data.inputs?.apiKey?.value && (modelType === 'deepseek-chat' || modelType === 'deepseek-reasoner')) {
        onDataChange({
          ...data,
          inputs: {
            ...data.inputs,
            apiKey: {
              ...(data.inputs?.apiKey || {}),
              placeholder: t('nodes.llmQuery.apiKeyNeeded', { model: modelType })
            }
          }
        });
      }
    }
  }, [data.inputs?.model?.value, t, data, onDataChange]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.llmQuery.name'),
    inputs: {
      ...data.inputs,
      prompt: {
        type: 'text',
        value: data.inputs?.prompt?.value || '',
        placeholder: t('nodes.llmQuery.promptPlaceholder'),
      },
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'deepseek-chat',
        options: modelOptions,
        label: t('nodes.llmQuery.model')
      },
      systemPrompt: {
        type: 'text',
        value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
        placeholder: t('nodes.llmQuery.systemPrompt'),
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        label: t('nodes.llmQuery.temperature')
      },
      maxTokens: {
        type: 'number',
        value: data.inputs?.maxTokens?.value || 1000,
        min: 1,
        max: 8192,
        step: 1,
        label: t('nodes.llmQuery.maxTokens')
      },
      stream: {
        type: 'select',
        value: data.inputs?.stream?.value || 'false',
        options: ['true', 'false'],
        label: t('nodes.llmQuery.stream')
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
        placeholder: t('nodes.llmQuery.apiKeyPlaceholder'),
      },
    },
    outputs: {
      ...data.outputs,
      text: {
        type: 'text',
        value: data.outputs?.text?.value || '',
      },
      requestInfo: {
        type: 'text',
        value: data.outputs?.requestInfo?.value || JSON.stringify({
          model: data.inputs?.model?.value || 'deepseek-chat',
          tokensUsed: 0,
          lastRequest: null
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

LlmQueryNode.displayName = 'LlmQueryNode';

export default LlmQueryNode;