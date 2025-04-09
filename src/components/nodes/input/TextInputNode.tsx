import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import BaseNodeComponent, { BaseNodeComponentProps } from '../BaseNodeComponent';
import { NodeComponentProps } from '../../../core/nodes/NodeFactory';
import { useTranslation } from '../../../utils/i18n';
import { DEFAULT_NODE_CONFIG } from '../../../styles/nodeConstants';
import { NodeData } from '../../../types';
import styles from './TextInputNode.module.css'; // 导入CSS Module样式

/**
 * 文本输入节点组件 - 无边框美化设计版
 * 演示如何基于CSS模块创建美观的无边框节点
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // 初始化角色数量
  useEffect(() => {
    setCharCount(data.inputs?.text?.value?.length || 0);
  }, [data.inputs?.text?.value]);

  // 处理文本变化
  const handleTextChange = useCallback((value: string) => {
    // 确保data.inputs和data.outputs存在
    const currentInputs = data.inputs || {};
    const currentOutputs = data.outputs || {};
    setCharCount(value.length);

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

  // 文本区自动调整高度
  const autoResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  // 监控文本变化自动调整高度
  useEffect(() => {
    autoResize();
  }, [data.inputs?.text?.value, autoResize]);

  // 处理清除文本
  const handleClearText = useCallback(() => {
    handleTextChange('');
  }, [handleTextChange]);

  // 处理文本复制
  const handleCopyText = useCallback(() => {
    const text = data.inputs?.text?.value;
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          // 显示复制成功提示
          const notification = document.createElement('div');
          notification.className = styles.copyNotification;
          notification.textContent = '✓ 已复制';
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.classList.add(styles.fadeOut);
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 500);
          }, 1500);
        });
    }
  }, [data.inputs?.text?.value]);

  // 切换折叠状态
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // 自定义无边框节点渲染
  const CustomNode = () => (
    <div 
      className={`${styles.nodeWrapper} ${selected ? styles.selected : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            {data.label || t('nodes.textInput.name', { defaultValue: '文本输入' })}
          </div>
          <div className={styles.headerActions}>
            {showControls && (
              <>
                <button 
                  className={styles.headerButton} 
                  onClick={toggleCollapse}
                  title={isCollapsed ? '展开' : '收起'}
                >
                  {isCollapsed ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <polyline points="7 13 12 18 17 13"></polyline>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                      <polyline points="7 11 12 6 17 11"></polyline>
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isCollapsed && (
          <div className={styles.content}>
            <div className={`${styles.textInputContainer} ${focused ? styles.focused : ''}`}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={data.inputs?.text?.value || ''}
                onChange={(e) => handleTextChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={t('nodes.textInput.placeholder', { defaultValue: '在此输入文本...' })}
                rows={1}
              />
              
              {showControls && data.inputs?.text?.value && (
                <div className={styles.textControls}>
                  <button
                    className={styles.textControlButton}
                    onClick={handleCopyText}
                    title={t('common.copy', { defaultValue: '复制' })}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  
                  <button
                    className={styles.textControlButton}
                    onClick={handleClearText}
                    title={t('common.clear', { defaultValue: '清除' })}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.footer}>
              <div className={styles.charCount}>
                {charCount} {t('nodes.textInput.characters', { defaultValue: '字符' })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
        label: t('nodes.textInput.text', { defaultValue: '文本' }),
        component: 'custom', // 使用自定义渲染
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
    },
    // 添加自定义渲染器
    customRenderers: {
      text: () => (
        <div className={`${styles.textInputContainer} ${focused ? styles.focused : ''}`}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={data.inputs?.text?.value || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('nodes.textInput.placeholder', { defaultValue: '在此输入文本...' })}
            rows={1}
          />
          
          <div className={styles.footer}>
            <div className={styles.charCount}>
              {charCount} {t('nodes.textInput.characters', { defaultValue: '字符' })}
            </div>
          </div>
        </div>
      )
    }
  };

  // 两种选项：
  // 1. 使用自定义的无边框节点组件
  if (data.noDefaultStyles) {
    return <CustomNode />;
  }
  
  // 2. 使用BaseNodeComponent但提供自定义渲染器
  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      type={type || "TEXT_INPUT"}
      selected={selected}
      isConnectable={isConnectable}
      className={styles.nodeWrapper}
      {...restProps}
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
  defaultConfig: {
    ...DEFAULT_NODE_CONFIG.TEXT_INPUT,
    noDefaultStyles: true, // 启用无边框样式
  }
};