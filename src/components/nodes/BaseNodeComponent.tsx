import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';
import {
  NODE_SIZE,
  Z_INDEX,
  NODE_THEME,
  PORT_TYPE_COLORS
} from '../../styles/nodeConstants';
import styles from './BaseNodeComponent.module.css';

export interface BaseNodeComponentProps extends NodeProps<NodeData> {
  onDataChange?: (nodeId: string, data: any) => void;
}

/**
 * 基础节点组件 - 所有节点类型的统一基础
 * 提供一致的节点渲染逻辑和样式，可被特定节点类型扩展
 */
const BaseNodeComponent = memo(({
  id,
  data,
  selected,
  type,
  isConnectable
}: BaseNodeComponentProps) => {
  const { t } = useTranslation();
  const nodeRef = useRef<HTMLDivElement>(null);

  // 解构获取节点数据
  const { inputs = {}, outputs = {}, label, status, onChange, customContent } = data;

  // 折叠状态
  const [collapsed, setCollapsed] = useState(false);

  // 输出展开状态
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});

  // 调整大小相关状态
  const [resizing, setResizing] = useState(false);
  const [nodeSize, setNodeSize] = useState({
    width: NODE_SIZE.DEFAULT_WIDTH,
    height: NODE_SIZE.MIN_HEIGHT
  });
  const initialSize = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // 内容区域引用
  const contentRef = useRef<HTMLDivElement>(null);

  // 是否已经自动调整过大小
  const [autoSized, setAutoSized] = useState(false);

  // 获取节点类型对应的主题
  const getNodeTheme = () => {
    const nodeCategory = type?.split('_')[0] || '';
    switch (nodeCategory) {
      case 'INPUT': return NODE_THEME.INPUT;
      case 'PROCESSING': return NODE_THEME.PROCESSING;
      case 'OUTPUT': return NODE_THEME.OUTPUT;
      case 'AI': return NODE_THEME.AI_MODEL;
      case 'FLOW': return NODE_THEME.FLOW_CONTROL;
      case 'UTILITY': return NODE_THEME.UTILITY;
      case 'CUSTOM': return NODE_THEME.CUSTOM;
      default: return NODE_THEME.DEFAULT;
    }
  };

  // 获取节点状态对应的样式
  const getStatusStyle = () => {
    if (!status) return { borderColor: undefined, boxShadow: undefined };

    // 确保使用有效的状态类型
    const validStatus = status === 'running' || status === 'completed' || status === 'error'
      ? status
      : 'idle';

    // 为每种状态返回相应的样式，包括idle状态
    switch(validStatus) {
      case 'running':
        return {
          borderColor: 'var(--primary-color, #10a37f)',
          boxShadow: '0 0 0 2px var(--primary-color, #10a37f), 0 0 10px rgba(16, 163, 127, 0.4)'
        };
      case 'completed':
        return {
          borderColor: 'var(--success-color, #2ecc71)',
          boxShadow: '0 0 0 2px var(--success-color, #2ecc71), 0 0 10px rgba(46, 204, 113, 0.4)'
        };
      case 'error':
        return {
          borderColor: 'var(--error-color, #e74c3c)',
          boxShadow: '0 0 0 2px var(--error-color, #e74c3c), 0 0 10px rgba(231, 76, 60, 0.4)'
        };
      case 'idle':
      default:
        return { borderColor: undefined, boxShadow: undefined };
    }
  };

  // 获取连接点颜色
  const getPortColor = (portType: string | undefined) => {
    if (!portType) return PORT_TYPE_COLORS.default;

    // 使用 PORT_TYPE_COLORS 常量获取颜色
    const type = portType.toLowerCase();
    return PORT_TYPE_COLORS[type as keyof typeof PORT_TYPE_COLORS] || PORT_TYPE_COLORS.default;
  };

  // 处理节点折叠 - 增强版
  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 添加折叠/展开动画
    if (nodeRef.current) {
      const node = nodeRef.current;
      if (!collapsed) {
        // 正在折叠
        node.style.animation = 'nodeCollapse 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        // 稍微延迟设置状态，等动画开始
        setTimeout(() => setCollapsed(true), 50);
      } else {
        // 正在展开
        node.style.animation = 'nodeExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        // 立即设置状态，使内容可见
        setCollapsed(false);
        // 展开后触发自动调整大小
        setTimeout(() => autoAdjustNodeSize(), 100);
      }
    } else {
      setCollapsed(!collapsed);
    }
  };

  // 处理输出展开
  const toggleOutputExpanded = (key: string) => {
    setExpandedOutputs(prev => {
      const newState = {
        ...prev,
        [key]: !prev[key]
      };

      // 当展开输出时，触发自动调整大小
      if (newState[key]) {
        // 给内容一点时间展开，然后再调整大小
        setTimeout(() => {
          setAutoSized(false);
          autoAdjustNodeSize();
        }, 50);
      }

      return newState;
    });
  };

  // 开始调整大小
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nodeRef.current) return;

    const rect = nodeRef.current.getBoundingClientRect();
    initialSize.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    };
    setResizing(true);
  };

  // 处理调整大小
  const handleResize = useCallback((e: MouseEvent) => {
    if (resizing) {
      const dx = e.clientX - initialSize.current.x;
      const dy = e.clientY - initialSize.current.y;

      setNodeSize({
        width: Math.max(NODE_SIZE.MIN_WIDTH, initialSize.current.width + dx),
        height: Math.max(NODE_SIZE.MIN_HEIGHT, initialSize.current.height + dy)
      });
    }
  }, [resizing]);

  // 结束调整大小
  const stopResize = useCallback(() => {
    setResizing(false);
    setAutoSized(true); // 标记为已经手动调整过大小
  }, []);

  // 添加全局事件监听器
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [resizing, handleResize, stopResize]);

  // 自动计算并调整节点大小
  const autoAdjustNodeSize = useCallback(() => {
    if (collapsed || !contentRef.current || !nodeRef.current) return;

    // 获取内容区域的实际高度
    const contentHeight = contentRef.current.scrollHeight;
    const headerHeight = NODE_SIZE.HEADER_HEIGHT;

    // 计算节点应该的高度，添加一些额外空间
    const idealHeight = contentHeight + headerHeight + 10; // 添加额外的内边距

    // 计算节点应该的宽度
    const contentWidth = contentRef.current.scrollWidth;
    const idealWidth = Math.max(NODE_SIZE.DEFAULT_WIDTH, contentWidth + 30); // 添加左右内边距

    // 设置最大高度和宽度限制
    const maxHeight = window.innerHeight * 0.7; // 最大高度为窗口高度的70%
    const maxWidth = window.innerWidth * 0.4;  // 最大宽度为窗口宽度的40%

    // 调整节点大小，确保在最小和最大限制范围内
    setNodeSize({
      width: Math.min(maxWidth, Math.max(NODE_SIZE.MIN_WIDTH, idealWidth)),
      height: Math.min(maxHeight, Math.max(NODE_SIZE.MIN_HEIGHT, idealHeight))
    });

    setAutoSized(true);
  }, [collapsed]);

  // 在节点内容变化时触发自动调整
  useEffect(() => {
    if (!autoSized && !collapsed && !resizing) {
      // 使用延迟确保内容已经渲染
      const timer = setTimeout(() => autoAdjustNodeSize(), 200);
      return () => clearTimeout(timer);
    }
  }, [inputs, outputs, customContent, collapsed, autoAdjustNodeSize, autoSized, resizing]);

  // 当窗口大小变化时重新计算
  useEffect(() => {
    const handleResize = () => {
      if (!collapsed) {
        setAutoSized(false); // 重置自动调整状态
        autoAdjustNodeSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, autoAdjustNodeSize]);

  // 处理输入值变化
  const handleInputChange = (key: string, value: any) => {
    if (!onChange) return;

    onChange(id, {
      inputs: {
        ...inputs,
        [key]: { ...inputs[key], value }
      }
    });
  };

  // 获取节点的主题和状态样式
  const theme = getNodeTheme();
  const statusStyle = getStatusStyle();

  // 获取节点类型对应的分类
  const getNodeCategory = () => {
    if (!type) return '';

    // 尝试从类型名称中提取分类
    const parts = type.split('_');
    if (parts.length > 1) {
      // 如果类型名称包含下划线，使用第一部分作为分类
      return parts[0];
    }

    // 默认分类
    return 'UTILITY';
  };

  // 获取节点类型对应的图标 - 增强版
  const getNodeTypeIcon = (nodeType: string | undefined) => {
    if (!nodeType) return '•'; // 默认圆点

    const category = getNodeCategory();

    // 根据节点类型返回更现代的图标
    switch (category) {
      case 'INPUT': return '📥'; // 输入节点用收件箱图标
      case 'OUTPUT': return '📤'; // 输出节点用发件箱图标
      case 'PROCESSING': return '⚙️'; // 处理节点用齿轮图标
      case 'AI_MODEL': return '🤖'; // AI模型节点用机器人图标
      case 'FLOW_CONTROL': return '🔄'; // 流程控制节点用循环箭头
      case 'UTILITY': return '🛠️'; // 工具节点用扳手图标
      case 'CUSTOM': return '📝'; // 自定义节点用记事本图标
      default: return '💡'; // 默认用灯泡图标
    }
  };

  // 获取状态文本
  const getStatusText = (statusType: string) => {
    switch (statusType) {
      case 'running': return t('nodes.status.running', '正在运行');
      case 'completed': return t('nodes.status.completed', '已完成');
      case 'error': return t('nodes.status.error', '出错了');
      default: return statusType;
    }
  };

  // 添加节点出现动画
  useEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.animation = 'nodeAppear 0.3s ease-out forwards';
    }
  }, []);

  return (
    <div
      ref={nodeRef}
      className={`${styles.baseNode} ${selected ? 'selected' : ''} ${status || ''} ${collapsed ? styles.collapsed : ''}`}
      data-category={getNodeCategory()}
      data-type={type}
      style={{
        width: collapsed ? 'auto' : nodeSize.width,
        height: collapsed ? NODE_SIZE.HEADER_HEIGHT : nodeSize.height,
        zIndex: selected ? Z_INDEX.NODE_SELECTED : Z_INDEX.NODE,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* 节点头部 */}
      <div
        className={styles.nodeHeader}
        style={{
          background: theme.headerColor || NODE_THEME.DEFAULT.headerColor,
          color: theme.titleColor || NODE_THEME.DEFAULT.titleColor
        }}
      >
        <div className={styles.nodeTitle}>
          {/* 添加节点图标 */}
          <span className={styles.nodeIcon}>
            {getNodeTypeIcon(type)}
          </span>
          <span className={styles.nodeTitleText}>{label || id}</span>
          {status && (
            <span className={`${styles.nodeStatus} ${status}`} title={getStatusText(status)}>
              {status === 'running' && '⏳'} {/* 沙漏计时器 */}
              {status === 'completed' && '✅'} {/* 绿色勾选标记 */}
              {status === 'error' && '❌'} {/* 红色取消标记 */}
            </span>
          )}
        </div>
        <div className={styles.nodeControls}>
          {!collapsed && (
            <button
              onClick={() => {
                setAutoSized(false);
                autoAdjustNodeSize();
              }}
              className={styles.nodeActionButton}
              title={t('nodes.common.autoSize', { defaultValue: '自动调整大小' })}
            >
              <span style={{
                fontSize: '14px',
                opacity: '0.9',
                color: '#ffffff'
              }}>
                ↕
              </span>
            </button>
          )}
          <button
            onClick={toggleCollapsed}
            className={styles.nodeActionButton}
            title={collapsed ? t('nodes.common.expand') : t('nodes.common.collapse')}
          >
            <span style={{
              transition: 'transform 0.3s ease, opacity 0.3s ease',
              display: 'inline-block',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              fontSize: '12px',
              opacity: collapsed ? '1' : '0.9',
              color: '#ffffff'
            }}>
              {collapsed ? '▶' : '▼'}
            </span>
          </button>
        </div>
      </div>

      {/* 节点内容 */}
      <div ref={contentRef} className={`${styles.nodeContent} ${collapsed ? styles.collapsed : ''}`}>
        {/* 自定义内容渲染 */}
        {customContent && (
          <div className={styles.customContent}>
            {customContent}
          </div>
        )}

        {/* 输入部分 - 增强可读性 */}
        {Object.keys(inputs).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              {t('nodes.common.inputs')}
              <span className={styles.sectionCount}>{Object.keys(inputs).filter(k => !inputs[k].hidden).length}</span>
            </div>
            {Object.entries(inputs).map(([key, input]: [string, any], index) => {
              if (input.hidden) return null;

              const isExpanded = !!expandedOutputs[key];
              const isConnected = input.isConnected;
              const tooltipText = `${input.label || key} (${input.type})${input.description ? `\n${input.description}` : ''}`;

              return (
                <div
                  key={`input-${id}-${key}`}
                  className={`${styles.nodeRow} ${isConnected ? styles.connected : ''}`}
                  data-input-type={input.type}
                >
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`input-${key}`}
                    isConnectable={isConnectable}
                    className={`${styles.handle} ${styles.inputHandle} ${isConnected ? styles.connected : ''}`}
                    style={{
                      backgroundColor: getPortColor(input.type),
                      border: '2px solid var(--node-bg, #1a1a1a)',
                      width: '12px',
                      height: '12px',
                      zIndex: Z_INDEX.HANDLE
                    }}
                    data-tooltip={tooltipText}
                  />

                  <div className={styles.nodeLabel} title={tooltipText}>
                    {input.label || key}
                    {input.required && <span className={styles.requiredBadge}>*</span>}
                  </div>

                  <div className={styles.nodeInputWrapper}>
                    {/* 不同类型的输入渲染 */}
                    {input.type === 'text' && (
                      <input
                        type="text"
                        value={input.value || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={styles.nodeInput}
                        placeholder={input.placeholder || ''}
                        disabled={input.isConnected}
                        autoComplete="off"
                      />
                    )}

                    {input.type === 'number' && (
                      <input
                        type="number"
                        value={input.value || 0}
                        min={input.min}
                        max={input.max}
                        step={input.step || 1}
                        onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                        className={styles.nodeInput}
                        disabled={input.isConnected}
                      />
                    )}

                    {input.type === 'select' && (
                      <select
                        value={input.value || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={styles.nodeSelect}
                        disabled={input.isConnected}
                      >
                        {input.options?.map((option: string) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {input.type === 'boolean' && (
                      <input
                        type="checkbox"
                        checked={!!input.value}
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                        className={styles.nodeCheckbox}
                        disabled={input.isConnected}
                      />
                    )}

                    {input.type === 'textarea' && (
                      <textarea
                        value={input.value || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={styles.nodeTextarea}
                        rows={input.rows || 3}
                        placeholder={input.placeholder || ''}
                        disabled={input.isConnected}
                        spellCheck="false"
                      />
                    )}

                    {/* 文件上传输入 */}
                    {input.type === 'file' && (
                      <div className={styles.fileInput}>
                        <label className={styles.fileInputLabel}>
                          {input.value ? input.value.name || t('nodes.common.fileSelected') : t('nodes.common.chooseFile')}
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleInputChange(key, file);
                            }}
                            accept={input.accept || '*'}
                            disabled={input.isConnected}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {input.value && (
                          <button
                            className={styles.fileRemoveBtn}
                            onClick={() => handleInputChange(key, null)}
                            title={t('nodes.common.removeFile')}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}

                    {/* 颜色选择器 */}
                    {input.type === 'color' && (
                      <input
                        type="color"
                        value={input.value || '#000000'}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className={styles.colorInput}
                        disabled={input.isConnected}
                      />
                    )}

                    {/* 滑块控件 */}
                    {input.type === 'slider' && (
                      <div className={styles.sliderContainer}>
                        <input
                          type="range"
                          min={input.min || 0}
                          max={input.max || 100}
                          step={input.step || 1}
                          value={input.value || 0}
                          onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                          className={styles.sliderInput}
                          disabled={input.isConnected}
                        />
                        <span className={styles.sliderValue}>{input.value || 0}</span>
                      </div>
                    )}

                    {/* 其他输入类型可在此处添加 */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 输出部分 - 增强可读性 */}
        {Object.keys(outputs).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              {t('nodes.common.outputs')}
              <span className={styles.sectionCount}>{Object.keys(outputs).filter(k => !outputs[k].hidden).length}</span>
            </div>
            {Object.entries(outputs).map(([key, output]: [string, any], index) => {
              if (output.hidden) return null;

              const isExpanded = !!expandedOutputs[key];
              const isConnected = output.isConnected;
              const outputValue = output.value || '';
              const needsExpand = typeof outputValue === 'string' && outputValue.length > 50;
              const tooltipText = `${output.label || key} (${output.type})${output.description ? `\n${output.description}` : ''}`;

              return (
                <div
                  key={`output-${id}-${key}`}
                  className={`${styles.nodeRow} ${isConnected ? styles.connected : ''}`}
                  data-output-type={output.type}
                >
                  <div className={styles.nodeLabel} title={tooltipText}>
                    {output.label || key}
                    {output.type && <span className={styles.typeBadge}>{output.type}</span>}
                  </div>

                  <div className={`${styles.nodeOutput} ${needsExpand ? styles.expandable : ''}`}>
                    {outputValue ? (
                      <div
                        className={`${styles.nodeOutputContent} ${isExpanded ? styles.expanded : ''}`}
                        onClick={needsExpand ? () => toggleOutputExpanded(key) : undefined}
                        title={needsExpand && !isExpanded ? t('nodes.common.clickToExpand') : undefined}
                      >
                        {output.type === 'image' && output.value ? (
                          <img
                            src={output.value}
                            alt={output.label || key}
                            style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                          />
                        ) : isExpanded || !needsExpand
                          ? outputValue.toString()
                          : `${outputValue.toString().substring(0, 50)}...`}

                        {needsExpand && (
                          <span className={styles.expandToggle}>
                            {isExpanded ? t('nodes.common.collapse') : t('nodes.common.expand')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.nodeOutputEmpty}>{t('nodes.common.noData')}</span>
                    )}
                  </div>

                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`output-${key}`}
                    isConnectable={isConnectable}
                    className={`${styles.handle} ${styles.outputHandle} ${isConnected ? styles.connected : ''}`}
                    style={{
                      backgroundColor: getPortColor(output.type),
                      border: '2px solid var(--node-bg, #1a1a1a)',
                      width: '12px',
                      height: '12px',
                      zIndex: Z_INDEX.HANDLE
                    }}
                    data-tooltip={tooltipText}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 大小调整手柄 */}
        <div
          className={styles.resizeHandle}
          onMouseDown={startResize}
        />
      </div>
    </div>
  );
});

BaseNodeComponent.displayName = 'BaseNodeComponent';

export default BaseNodeComponent;