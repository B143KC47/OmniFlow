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
  const { inputs = {}, outputs = {}, label, status, onChange } = data;
  
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
  const getPortColor = (portType: string) => {
    return PORT_TYPE_COLORS[portType as keyof typeof PORT_TYPE_COLORS] || PORT_TYPE_COLORS.default;
  };

  // 处理节点折叠
  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };

  // 处理输出展开
  const toggleOutputExpanded = (key: string) => {
    setExpandedOutputs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  return (
    <div
      ref={nodeRef}
      className={`${styles.baseNode} ${selected ? styles.selected : ''} ${status ? styles[status] : ''}`}
      style={{
        width: nodeSize.width,
        height: collapsed ? 'auto' : nodeSize.height,
        backgroundColor: theme.backgroundColor || NODE_THEME.DEFAULT.backgroundColor,
        borderColor: statusStyle.borderColor || theme.borderColor || NODE_THEME.DEFAULT.borderColor,
        boxShadow: statusStyle.boxShadow,
        zIndex: selected ? Z_INDEX.NODE_SELECTED : Z_INDEX.NODE
      }}
    >
      {/* 节点头部 */}
      <div 
        className={styles.nodeHeader}
        style={{
          backgroundColor: theme.headerColor || NODE_THEME.DEFAULT.headerColor,
          color: theme.titleColor || NODE_THEME.DEFAULT.titleColor
        }}
      >
        <div className={styles.nodeTitle}>
          {label || id}
          {status && (
            <span className={`${styles.nodeStatus} ${styles[status]}`}>
              {status === 'running' && '⚙️'}
              {status === 'completed' && '✅'}
              {status === 'error' && '❌'}
            </span>
          )}
        </div>
        <div className={styles.nodeControls}>
          <button 
            onClick={toggleCollapsed}
            className={styles.nodeCollapseBtn}
            title={collapsed ? t('nodes.common.expand') : t('nodes.common.collapse')}
          >
            {collapsed ? '+' : '-'}
          </button>
        </div>
      </div>
      
      {/* 节点内容 */}
      <div className={`${styles.nodeContent} ${collapsed ? styles.collapsed : ''}`}>
        {/* 输入部分 */}
        {Object.keys(inputs).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('nodes.common.inputs')}</div>
            {Object.entries(inputs).map(([key, input]: [string, any], index) => {
              if (input.hidden) return null;
              
              const isExpanded = !!expandedOutputs[key];
              
              return (
                <div key={`input-${id}-${key}`} className={styles.nodeRow}>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`input-${key}`}
                    isConnectable={isConnectable}
                    className={`${styles.handle} ${styles.inputHandle} ${input.isConnected ? styles.connected : ''}`}
                    style={{
                      backgroundColor: getPortColor(input.type),
                      zIndex: Z_INDEX.HANDLE
                    }}
                    data-tooltip={`${input.label || key} (${input.type})`}
                  />
                  
                  <div className={styles.nodeLabel} title={input.label || key}>
                    {input.label || key}
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
                      />
                    )}
                    
                    {/* 其他输入类型可在此处添加 */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* 输出部分 */}
        {Object.keys(outputs).length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>{t('nodes.common.outputs')}</div>
            {Object.entries(outputs).map(([key, output]: [string, any], index) => {
              if (output.hidden) return null;
              
              const isExpanded = !!expandedOutputs[key];
              const outputValue = output.value || '';
              const needsExpand = typeof outputValue === 'string' && outputValue.length > 50;
              
              return (
                <div key={`output-${id}-${key}`} className={styles.nodeRow}>
                  <div className={styles.nodeLabel} title={output.label || key}>
                    {output.label || key}
                  </div>
                  
                  <div className={styles.nodeOutput}>
                    {outputValue ? (
                      <div 
                        className={`${styles.nodeOutputContent} ${isExpanded ? styles.expanded : ''}`}
                        onClick={needsExpand ? () => toggleOutputExpanded(key) : undefined}
                      >
                        {isExpanded || !needsExpand 
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
                    className={`${styles.handle} ${styles.outputHandle} ${output.isConnected ? styles.connected : ''}`}
                    style={{
                      backgroundColor: getPortColor(output.type),
                      zIndex: Z_INDEX.HANDLE
                    }}
                    data-tooltip={`${output.label || key} (${output.type})`}
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