import React, { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import BaseNodeComponent, { BaseNodeComponentProps } from '../BaseNodeComponent';
import { NodeComponentProps } from '../../../core/nodes/NodeFactory';
import { useTranslation } from '../../../utils/i18n';
import { DEFAULT_NODE_CONFIG } from '../../../styles/nodeConstants';
import { NodeData } from '../../../types';

/**
 * 文本输入节点组件
 * 演示如何基于BaseNodeComponent创建特定功能的节点
 */
const TextInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  type,
  onDataChange,
  ...restProps  // 捕获其余的ReactFlow节点属性
}: NodeProps<NodeData>) => {
  const { t } = useTranslation();

  // 处理文本变化
  const handleTextChange = useCallback((value: string) => {
    // 确保data.inputs和data.outputs存在
    const currentInputs = data.inputs || {};
    const currentOutputs = data.outputs || {};

    // 更新输入和输出
    if (data.onChange) {
      data.onChange(id, {
        inputs: {
          ...currentInputs,
          text: {
            ...currentInputs.text,
            value
          }
        },
        // 同时更新输出，以便传递给后续节点
        outputs: {
          ...currentOutputs,
          text: {
            ...currentOutputs.text,
            value
          }
        }
      });
    }
  }, [id, data]);

  // 准备数据，确保包含所有必要字段
  const nodeData = {
    ...data,
    label: data.label || t('nodes.textInput.name', { defaultValue: '文本输入' }),
    // 确保有正确的输入定义
    inputs: {
      ...DEFAULT_NODE_CONFIG.TEXT_INPUT.inputs,
      ...data.inputs,
      // 确保text输入有onChange处理器
      text: {
        ...DEFAULT_NODE_CONFIG.TEXT_INPUT.inputs.text,
        ...(data.inputs?.text || {}),
        onChange: handleTextChange,
        label: t('nodes.textInput.text', { defaultValue: '文本' })
      }
    },
    // 确保有正确的输出定义
    outputs: {
      ...DEFAULT_NODE_CONFIG.TEXT_INPUT.outputs,
      ...data.outputs,
      text: {
        ...DEFAULT_NODE_CONFIG.TEXT_INPUT.outputs.text,
        ...(data.outputs?.text || {}),
        label: t('nodes.textInput.output', { defaultValue: '输出文本' })
      }
    }
  };

  // 将准备好的数据传递给基础节点组件渲染
  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      type={type || "TEXT_INPUT"}
      selected={selected}
      isConnectable={isConnectable}
      {...restProps}  // 传递所有剩余属性，确保类型兼容性
    />
  );
});

TextInputNode.displayName = 'TextInputNode';

export default TextInputNode;

// 节点定义（用于注册）
export const TextInputNodeDefinition = {
  type: 'TEXT_INPUT',
  category: 'INPUT',
  name: '文本输入',
  description: '创建文本输入节点，允许用户输入文本或接收来自其他节点的文本数据',
  icon: '📝',
  component: TextInputNode,
  defaultConfig: DEFAULT_NODE_CONFIG.TEXT_INPUT
};