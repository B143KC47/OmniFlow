import React, { memo, useCallback } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface SamplerNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const SamplerNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: SamplerNodeProps) => {
  const { t } = useTranslation();

  // 使用useCallback优化onChange回调函数的性能
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    // 特殊处理：当输入改变时，同步更新输出
    const updatedInputs = newData.inputs || data.inputs || {};
    
    // 获取输入选项
    const inputOptions = updatedInputs.options?.value || data.inputs?.options?.value || '';
    const options = inputOptions.split('\n').filter((line: string) => line.trim() !== '');
    
    // 获取采样方法和数量
    const samplingMethod = updatedInputs.samplingMethod?.value || data.inputs?.samplingMethod?.value || 'random';
    const count = Number(updatedInputs.count?.value || data.inputs?.count?.value || 1);
    
    // 创建采样配置
    const config = {
      options,
      samplingMethod,
      count,
      temperature: Number(updatedInputs.temperature?.value || data.inputs?.temperature?.value || 1.0),
    };

    // 模拟采样结果
    let sampledOptions = [];
    if (options.length > 0) {
      // 在真实场景中，这里会根据采样方法执行实际的采样
      // 但现在我们只做一个简单的模拟
      if (count >= options.length) {
        sampledOptions = [...options];
      } else {
        // 简单随机采样
        const shuffled = [...options].sort(() => 0.5 - Math.random());
        sampledOptions = shuffled.slice(0, count);
      }
    }

    // 更新节点数据
    onDataChange({
      ...data,
      ...newData,
      outputs: {
        ...data.outputs,
        sampled: {
          type: 'text',
          value: sampledOptions.join('\n'),
        },
        count: {
          type: 'number',
          value: count,
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
    label: data.label || t('nodes.sampler.name'),
    inputs: {
      ...data.inputs,
      options: {
        type: 'textarea',
        value: data.inputs?.options?.value || '',
        placeholder: t('nodes.sampler.optionsPlaceholder', { default: '每行输入一个选项' }),
        rows: 5,
        label: t('nodes.sampler.options', { default: '选项' })
      },
      samplingMethod: {
        type: 'select',
        value: data.inputs?.samplingMethod?.value || 'random',
        options: [
          'random',
          'top-p',
          'top-k',
          'temperature',
        ],
        label: t('nodes.sampler.method', { default: '采样方法' })
      },
      count: {
        type: 'number',
        value: data.inputs?.count?.value || 1,
        min: 1,
        max: 100,
        step: 1,
        label: t('nodes.sampler.count', { default: '采样数量' })
      },
      temperature: {
        type: 'number',
        value: data.inputs?.temperature?.value || 1.0,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: t('nodes.sampler.temperature', { default: '温度' })
      }
    },
    outputs: {
      ...data.outputs,
      sampled: {
        type: 'text',
        value: data.outputs?.sampled?.value || '',
      },
      count: {
        type: 'number',
        value: data.inputs?.count?.value || 1,
      },
      config: {
        type: 'text',
        value: JSON.stringify({
          options: (data.inputs?.options?.value || '').split('\n').filter((line: string) => line.trim() !== ''),
          samplingMethod: data.inputs?.samplingMethod?.value || 'random',
          count: Number(data.inputs?.count?.value || 1),
          temperature: Number(data.inputs?.temperature?.value || 1.0),
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

SamplerNode.displayName = 'SamplerNode';

export default SamplerNode;