import React, { memo, useCallback, useEffect, useState } from 'react';
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

// 定义模型分类
const MODEL_CATEGORIES = [
  { id: 'llm', name: 'LLM' },
  { id: 'embedding', name: 'Embedding' },
  { id: 'vision', name: 'Vision' },
  { id: 'multimodal', name: 'Multimodal' },
  { id: 'audio', name: 'Audio' }
];

// 定义模型信息，包括提供商、参数和描述
const MODELS = {
  // LLM 模型
  'deepseek-chat': {
    category: 'llm',
    provider: 'DeepSeek',
    description: '通用型大语言模型，具有出色的中文和代码理解能力',
    maxTokens: 4096,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  'gpt-4': {
    category: 'llm',
    provider: 'OpenAI',
    description: 'OpenAI 的高级智能模型，具有更强的推理和理解能力',
    maxTokens: 8192,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  'gpt-3.5-turbo': {
    category: 'llm',
    provider: 'OpenAI',
    description: '平衡性能和速度的大语言模型',
    maxTokens: 4096,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  'claude-3-opus': {
    category: 'llm',
    provider: 'Anthropic',
    description: 'Anthropic 的高级模型，擅长详细和精准的回应',
    maxTokens: 4096,
    defaultTemp: 0.5,
    supportsStreaming: true
  },
  'qwen-max': {
    category: 'llm',
    provider: 'Alibaba',
    description: '阿里通义千问的最高性能模型，具有优秀的中文理解能力',
    maxTokens: 6000,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  'gemini-pro': {
    category: 'llm',
    provider: 'Google',
    description: 'Google 的大语言模型，擅长多步骤推理',
    maxTokens: 8192,
    defaultTemp: 0.8,
    supportsStreaming: true
  },
  'llama-3-70b': {
    category: 'llm',
    provider: 'Meta',
    description: 'Llama 3 开源大语言模型',
    maxTokens: 8192,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  // Embedding 模型
  'text-embedding-ada-002': {
    category: 'embedding',
    provider: 'OpenAI',
    description: 'OpenAI 的文本嵌入模型',
    supportsStreaming: false
  },
  'deepseek-embedding': {
    category: 'embedding',
    provider: 'DeepSeek',
    description: 'DeepSeek 的文本嵌入模型',
    supportsStreaming: false
  },
  // Vision 模型
  'gpt-4-vision': {
    category: 'vision',
    provider: 'OpenAI',
    description: '可以理解和分析图像的模型',
    maxTokens: 4096,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  // Multimodal 模型
  'gemini-pro-vision': {
    category: 'multimodal',
    provider: 'Google',
    description: '支持多模态输入的 Google 模型',
    maxTokens: 4096,
    defaultTemp: 0.7,
    supportsStreaming: true
  },
  // Audio 模型
  'whisper-large': {
    category: 'audio',
    provider: 'OpenAI',
    description: 'OpenAI 的音频转文本模型',
    supportsStreaming: false
  }
};

const ModelSelectorNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: ModelSelectorNodeProps) => {
  const { t } = useTranslation();
  
  // 当前选择的模型分类和模型
  const [currentCategory, setCurrentCategory] = useState('llm');
  const [categoryModels, setCategoryModels] = useState<string[]>([]);
  
  // 从所有模型中筛选出指定分类的模型列表
  useEffect(() => {
    const filteredModels = Object.keys(MODELS).filter(
      modelName => MODELS[modelName as keyof typeof MODELS].category === currentCategory
    );
    setCategoryModels(filteredModels);
    
    // 如果当前选择的模型不在这个分类中，自动选择该分类的第一个模型
    const currentModel = data.inputs?.model?.value;
    if (currentModel && !filteredModels.includes(currentModel)) {
      if (filteredModels.length > 0) {
        handleChange(id, {
          inputs: {
            ...data.inputs,
            model: {
              ...data.inputs?.model,
              value: filteredModels[0]
            }
          }
        });
      }
    }
  }, [currentCategory, data.inputs?.model?.value, id]);
  
  // 处理模型变化
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    const updatedInputs = newData.inputs || data.inputs || {};
    const modelName = updatedInputs.model?.value || data.inputs?.model?.value;
    
    // 获取选择的模型详细信息
    const modelInfo = modelName ? MODELS[modelName as keyof typeof MODELS] : null;
    
    // 动态调整参数
    let temperature = updatedInputs.temperature?.value !== undefined ? 
      updatedInputs.temperature?.value : data.inputs?.temperature?.value;
    let maxTokens = updatedInputs.maxTokens?.value !== undefined ? 
      updatedInputs.maxTokens?.value : data.inputs?.maxTokens?.value;
    let streamEnabled = updatedInputs.stream?.value !== undefined ?
      updatedInputs.stream?.value : data.inputs?.stream?.value;
    
    // 如果模型变更，自动调整参数到模型最适合的值
    if (modelInfo && modelName !== data.inputs?.model?.value) {
      // 更新温度参数
      temperature = modelInfo.defaultTemp || 0.7;
      
      // 更新最大令牌数
      maxTokens = Math.min(
        maxTokens || 1000,
        modelInfo.maxTokens || 4096
      );
      
      // 如果模型不支持流式处理，则禁用
      if (!modelInfo.supportsStreaming && streamEnabled === 'true') {
        streamEnabled = 'false';
      }
    }
    
    // 创建完整配置对象
    const config = {
      model: modelName || 'deepseek-chat',
      provider: modelInfo?.provider || 'DeepSeek',
      apiKey: updatedInputs.apiKey?.value || data.inputs?.apiKey?.value || '',
      systemPrompt: updatedInputs.systemPrompt?.value || data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
      stream: streamEnabled === 'true',
    };
    
    // 更新节点数据
    onDataChange({
      ...data,
      ...newData,
      inputs: {
        ...updatedInputs,
        temperature: { 
          ...(updatedInputs.temperature || data.inputs?.temperature || {}), 
          value: temperature 
        },
        maxTokens: { 
          ...(updatedInputs.maxTokens || data.inputs?.maxTokens || {}), 
          value: maxTokens 
        },
        stream: { 
          ...(updatedInputs.stream || data.inputs?.stream || {}), 
          value: streamEnabled 
        },
      },
      outputs: {
        ...data.outputs,
        model: {
          type: 'text',
          value: config.model,
        },
        provider: {
          type: 'text',
          value: config.provider,
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
  }, [data, onDataChange, id]);
  
  // 当选择模型分类改变时的处理函数
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategory(e.target.value);
  };
  
  // 获取当前选择的模型信息
  const selectedModelName = data.inputs?.model?.value || 'deepseek-chat';
  const selectedModel = MODELS[selectedModelName as keyof typeof MODELS];
  
  // 动态选项：只显示适合当前模型的选项
  const showSystemPrompt = selectedModel?.category === 'llm';
  const showTemperature = selectedModel?.category === 'llm' || selectedModel?.category === 'vision';
  const showMaxTokens = !!selectedModel?.maxTokens;
  const showStreaming = !!selectedModel?.supportsStreaming;
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.modelSelector.name'),
    inputs: {
      ...data.inputs,
      modelCategory: {
        type: 'select',
        value: currentCategory,
        options: MODEL_CATEGORIES.map(category => category.id),
        label: t('nodes.modelSelector.category', { default: '模型分类' })
      },
      model: {
        type: 'select',
        value: data.inputs?.model?.value || categoryModels[0] || 'deepseek-chat',
        options: categoryModels,
        label: t('nodes.modelSelector.modelName', { default: '模型' })
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
        placeholder: t('nodes.modelSelector.apiKeyPlaceholder', { default: `请输入 ${selectedModel?.provider || 'API'} 密钥` }),
      },
      ...(showSystemPrompt && {
        systemPrompt: {
          type: 'text',
          value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
          placeholder: t('nodes.modelSelector.systemPromptPlaceholder', { default: '系统提示词' }),
        }
      }),
      ...(showTemperature && {
        temperature: {
          type: 'number',
          value: data.inputs?.temperature?.value || selectedModel?.defaultTemp || 0.7,
          min: 0,
          max: 1,
          step: 0.1,
          label: t('nodes.modelSelector.temperature', { default: '温度' })
        }
      }),
      ...(showMaxTokens && {
        maxTokens: {
          type: 'number',
          value: data.inputs?.maxTokens?.value || Math.min(1000, selectedModel?.maxTokens || 4096),
          min: 1,
          max: selectedModel?.maxTokens || 4096,
          step: 1,
          label: t('nodes.modelSelector.maxTokens', { default: '最大Token数' })
        }
      }),
      ...(showStreaming && {
        stream: {
          type: 'select',
          value: data.inputs?.stream?.value || 'false',
          options: ['true', 'false'],
          label: t('nodes.modelSelector.stream', { default: '流式输出' })
        }
      }),
    },
    outputs: {
      ...data.outputs,
      model: {
        type: 'text',
        value: selectedModelName,
      },
      provider: {
        type: 'text',
        value: selectedModel?.provider || '',
      },
      apiKey: {
        type: 'text',
        value: data.inputs?.apiKey?.value || '',
      },
      ...(showSystemPrompt && {
        systemPrompt: {
          type: 'text',
          value: data.inputs?.systemPrompt?.value || 'You are a helpful assistant',
        }
      }),
      config: {
        type: 'text',
        value: JSON.stringify({
          model: selectedModelName,
          provider: selectedModel?.provider || '',
          apiKey: data.inputs?.apiKey?.value || '',
          systemPrompt: showSystemPrompt ? (data.inputs?.systemPrompt?.value || 'You are a helpful assistant') : undefined,
          temperature: showTemperature ? (data.inputs?.temperature?.value || selectedModel?.defaultTemp || 0.7) : undefined,
          maxTokens: showMaxTokens ? (data.inputs?.maxTokens?.value || Math.min(1000, selectedModel?.maxTokens || 4096)) : undefined,
          stream: showStreaming ? (data.inputs?.stream?.value === 'true') : undefined,
        }, null, 2),
      },
    },
    onChange: handleChange
  };
  
  // 如果有模型描述，添加到头部
  if (selectedModel?.description) {
    const description = {
      type: 'text',
      value: selectedModel.description,
      hidden: true
    };
    // @ts-ignore - 添加描述信息
    nodeData.description = description;
  }

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