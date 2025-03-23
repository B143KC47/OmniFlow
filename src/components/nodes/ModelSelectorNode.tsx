import React, { memo, useCallback } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface ModelSelectorNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const ModelSelectorNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: ModelSelectorNodeProps) => {
  const { t } = useTranslation();
  
  // 使用useCallback优化onChange回调函数的性能
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    // 特殊处理：当输入改变时，同步更新输出
    const updatedInputs = newData.inputs || data.inputs || {};
    
    // 创建配置对象
    const config = {
      model: updatedInputs.model?.value || data.inputs?.model?.value || 'deepseek-chat',
      apiKey: updatedInputs.apiKey?.value || data.inputs?.apiKey?.value || '',
      systemPrompt: updatedInputs.systemPrompt?.value || data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
      temperature: updatedInputs.temperature?.value || data.inputs?.temperature?.value || 0.7,
      maxTokens: updatedInputs.maxTokens?.value || data.inputs?.maxTokens?.value || 1000,
      stream: (updatedInputs.stream?.value || data.inputs?.stream?.value) === 'true',
    };
    
    // 更新节点数据
    onDataChange({
      ...data,
      ...newData,
      outputs: {
        ...data.outputs,
        model: {
          type: 'text',
          value: config.model,
        },
        apiKey: {
          type: 'text',
          value: config.apiKey,
        },
        systemPrompt: {
          type: 'text',
          value: config.systemPrompt,
        },
        config: {
          type: 'text',
          value: JSON.stringify(config, null, 2),
        },
      }
    });
  }, [data, onDataChange]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.modelSelector.name'),
    inputs: {
      ...data.inputs,
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'deepseek-chat',
        options: [
          'deepseek-chat',
        ],
        label: t('nodes.modelSelector.modelName', 'Model')
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
        placeholder: t('nodes.modelSelector.apiKeyPlaceholder', 'Please enter DeepSeek API Key'),
      },
      systemPrompt: {
        type: 'text',
        value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
        placeholder: t('nodes.modelSelector.systemPromptPlaceholder', 'System Prompt'),
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 0.7,
        min: 0,
        max: 1,
        step: 0.1,
        label: t('nodes.modelSelector.temperature', 'Temperature')
      },
      maxTokens: {
        type: 'number',
        value: data.inputs?.maxTokens?.value || 1000,
        min: 1,
        max: 4096,
        step: 1,
        label: t('nodes.modelSelector.maxTokens', 'Max Tokens')
      },
      stream: {
        type: 'select',
        value: data.inputs?.stream?.value || 'false',
        options: ['true', 'false'],
        label: t('nodes.modelSelector.stream', 'Stream')
      },
    },
    outputs: {
      ...data.outputs,
      model: {
        type: 'text',
        value: data.inputs?.model?.value || 'deepseek-chat',
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
      },
      systemPrompt: {
        type: 'text',
        value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
      },
      config: {
        type: 'text',
        value: JSON.stringify({
          model: data.inputs?.model?.value || 'deepseek-chat',
          apiKey: data.inputs?.apiKey?.value || '',
          systemPrompt: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
          temperature: data.inputs?.temperature?.value || 0.7,
          maxTokens: data.inputs?.maxTokens?.value || 1000,
          stream: data.inputs?.stream?.value === 'true',
        }, null, 2),
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

ModelSelectorNode.displayName = 'ModelSelectorNode';

export default ModelSelectorNode;