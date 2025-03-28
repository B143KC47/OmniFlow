import React, { memo, useCallback } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface EncoderNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const EncoderNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: EncoderNodeProps) => {
  const { t } = useTranslation();

  // 使用useCallback优化onChange回调函数的性能
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    // 特殊处理：当输入改变时，同步更新输出
    const updatedInputs = newData.inputs || data.inputs || {};
    
    // 获取输入文本
    const inputText = updatedInputs.text?.value || data.inputs?.text?.value || '';
    
    // 创建编码配置对象
    const config = {
      text: inputText,
      model: updatedInputs.model?.value || data.inputs?.model?.value || 'text-embedding-ada-002',
      dimensions: Number(updatedInputs.dimensions?.value || data.inputs?.dimensions?.value || 1536),
    };

    // 更新节点数据，确保输出包含编码后的文本表示
    onDataChange({
      ...data,
      ...newData,
      outputs: {
        ...data.outputs,
        embedding: {
          type: 'vector',
          value: `Embedding of "${inputText.substring(0, 20)}${inputText.length > 20 ? '...' : ''}" (${config.dimensions} dimensions)`,
        },
        model: {
          type: 'text',
          value: config.model,
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
    label: data.label || t('nodes.encoder.name'),
    inputs: {
      ...data.inputs,
      text: {
        type: 'text',
        value: data.inputs?.text?.value || '',
        placeholder: t('nodes.encoder.textPlaceholder', { default: '要编码的文本' }),
      },
      model: {
        type: 'select',
        value: data.inputs?.model?.value || 'text-embedding-ada-002',
        options: [
          'text-embedding-ada-002',
          'multilingual-e5-large',
          'bge-large-en-v1.5',
        ],
        label: t('nodes.encoder.modelName', { default: '编码模型' })
      },
      dimensions: {
        type: 'number',
        value: data.inputs?.dimensions?.value || 1536,
        min: 256,
        max: 4096,
        step: 128,
        label: t('nodes.encoder.dimensions', { default: '向量维度' })
      },
    },
    outputs: {
      ...data.outputs,
      embedding: {
        type: 'vector',
        value: data.outputs?.embedding?.value || '(未编码)',
      },
      model: {
        type: 'text',
        value: data.inputs?.model?.value || 'text-embedding-ada-002',
      },
      config: {
        type: 'text',
        value: JSON.stringify({
          text: data.inputs?.text?.value || '',
          model: data.inputs?.model?.value || 'text-embedding-ada-002',
          dimensions: Number(data.inputs?.dimensions?.value || 1536),
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

EncoderNode.displayName = 'EncoderNode';

export default EncoderNode;