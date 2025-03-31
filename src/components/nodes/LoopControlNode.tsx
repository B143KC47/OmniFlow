import React, { memo, useCallback, useEffect } from 'react';
import BaseNode from './BaseNode';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface LoopControlNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (newData: NodeData) => void;
}

const LoopControlNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: LoopControlNodeProps) => {
  const { t } = useTranslation();
  
  // 使用useCallback优化onChange回调函数的性能，添加处理逻辑
  const handleChange = useCallback((nodeId: string, newData: Partial<NodeData>) => {
    const updatedInputs = newData.inputs || data.inputs || {};
    const conditionType = updatedInputs.condition?.value || data.inputs?.condition?.value;
    
    // 根据条件类型显示/隐藏相关输入字段
    let processedInputs = { ...updatedInputs };
    
    // 处理表达式字段的显示/隐藏
    if (processedInputs.expression) {
      processedInputs.expression = {
        ...processedInputs.expression,
        hidden: conditionType !== 'conditional'
      };
    }
    
    // 处理迭代次数字段的显示/隐藏
    if (processedInputs.iterationCount) {
      processedInputs.iterationCount = {
        ...processedInputs.iterationCount,
        hidden: conditionType !== 'count'
      };
    }
    
    // 处理确认提示字段的显示/隐藏
    if (processedInputs.confirmPrompt) {
      processedInputs.confirmPrompt = {
        ...processedInputs.confirmPrompt,
        hidden: conditionType !== 'confirm'
      };
    }
    
    // 更新节点数据，包括条件类型变化后的默认状态
    onDataChange({
      ...data,
      ...newData,
      inputs: processedInputs,
      // 重置迭代计数器，如果条件类型发生变化
      outputs: conditionType !== data.inputs?.condition?.value ? {
        ...data.outputs,
        iteration: {
          type: 'number',
          value: 0
        }
      } : data.outputs
    });
  }, [data, onDataChange]);
  
  // 监听条件类型变化，更新相关字段的可见性
  useEffect(() => {
    const conditionType = data.inputs?.condition?.value;
    const needsUpdate = (
      (data.inputs?.expression?.hidden === undefined || data.inputs?.expression?.hidden === (conditionType === 'conditional')) ||
      (data.inputs?.iterationCount?.hidden === undefined || data.inputs?.iterationCount?.hidden === (conditionType === 'count')) ||
      (data.inputs?.confirmPrompt?.hidden === undefined || data.inputs?.confirmPrompt?.hidden === (conditionType === 'confirm'))
    );
    
    if (needsUpdate) {
      // 更新字段的可见性状态
      onDataChange({
        ...data,
        inputs: {
          ...data.inputs,
          expression: {
            ...(data.inputs?.expression || {}),
            type: data.inputs?.expression?.type || 'text',
            value: data.inputs?.expression?.value || '',
            hidden: conditionType !== 'conditional'
          },
          iterationCount: {
            ...(data.inputs?.iterationCount || {}),
            type: data.inputs?.iterationCount?.type || 'number',
            value: data.inputs?.iterationCount?.value || 5,
            hidden: conditionType !== 'count'
          },
          confirmPrompt: {
            ...(data.inputs?.confirmPrompt || {}),
            type: data.inputs?.confirmPrompt?.type || 'text',
            value: data.inputs?.confirmPrompt?.value || '',
            hidden: conditionType !== 'confirm'
          }
        }
      });
    }
  }, [data.inputs?.condition?.value, data, onDataChange]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.loopControl.name'),
    inputs: {
      ...data.inputs,
      condition: {
        type: 'select',
        value: data.inputs?.condition?.value || 'always',
        options: ['always', 'conditional', 'count', 'confirm'],
        label: t('nodes.loopControl.condition')
      },
      expression: {
        type: 'text',
        value: data.inputs?.expression?.value || '',
        placeholder: t('nodes.loopControl.expressionPlaceholder'),
        hidden: data.inputs?.condition?.value !== 'conditional'
      },
      iterationCount: {
        type: 'number',
        value: data.inputs?.iterationCount?.value || 5,
        min: 1,
        max: 100,
        step: 1,
        label: t('nodes.loopControl.iterations'),
        hidden: data.inputs?.condition?.value !== 'count'
      },
      confirmPrompt: {
        type: 'text',
        value: data.inputs?.confirmPrompt?.value || t('nodes.loopControl.defaultConfirmPrompt'),
        placeholder: t('nodes.loopControl.confirmPromptPlaceholder'),
        hidden: data.inputs?.condition?.value !== 'confirm'
      },
      maxIterations: {
        type: 'number',
        value: data.inputs?.maxIterations?.value || 20,
        min: 1,
        max: 1000,
        step: 1,
        label: t('nodes.loopControl.maxIterations')
      }
    },
    outputs: {
      ...data.outputs,
      result: {
        type: 'text',
        value: data.outputs?.result?.value || '',
      },
      iteration: {
        type: 'number',
        value: data.outputs?.iteration?.value || 0,
      },
      completed: {
        type: 'boolean',
        value: data.outputs?.completed?.value || false,
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
      onDataChange={onDataChange}
    />
  );
});

LoopControlNode.displayName = 'LoopControlNode';

export default LoopControlNode;