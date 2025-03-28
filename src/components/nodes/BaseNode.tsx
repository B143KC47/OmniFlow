import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData } from '../../types';
import { useTranslation } from '../../utils/i18n';

interface BaseNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

// 添加 getStatusClass 函数
function getStatusClass(status?: string): string {
  switch (status) {
    case 'running':
      return 'status-running';
    case 'error':
      return 'status-error';
    case 'completed':
      return 'status-completed';
    default:
      return '';
  }
}

const BaseNode = memo(({ id, data, isConnectable, selected }: BaseNodeProps) => {
  const { t } = useTranslation();
  const { label, inputs = {}, outputs = {}, onChange, connectStatus } = data;
  
  // 节点折叠状态
  const [collapsed, setCollapsed] = useState(false);
  
  // 输出内容展开状态
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});
  
  // 记录节点大小
  const [nodeSize, setNodeSize] = useState<{ width: number, height: string | number }>({ width: 280, height: 'auto' });
  
  // 记录是否在调整大小
  const [resizing, setResizing] = useState(false);
  const initialSize = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  // 优化连接状态处理，解决连接过程中节点消失的问题
  useEffect(() => {
    const node = document.getElementById(`node-${id}`);
    if (node) {
      // 确保所有节点始终有基本的可见性，不论状态如何
      node.style.visibility = 'visible';
      node.style.display = 'block'; // 确保节点可见
      
      if (connectStatus) {
        // 连接状态处理 - 确保节点在连接过程中始终可见
        if (connectStatus === 'compatible') {
          node.style.zIndex = '1000'; // 更高的z-index值
          node.style.opacity = '1';
          node.classList.add('connectable');
          node.classList.remove('not-connectable');
          // 高亮显示兼容节点
          node.style.boxShadow = '0 0 0 2px var(--primary-color), 0 0 15px rgba(16, 163, 127, 0.7)';
        } else if (connectStatus === 'incompatible') {
          // 修改: 即使不兼容，也确保节点仍然可见
          node.style.zIndex = '500'; // 仍然保持较高的z-index，确保可见
          node.style.opacity = '0.7'; // 适度降低透明度，但仍然清晰可见
          node.classList.add('not-connectable');
          node.classList.remove('connectable');
          // 添加红色边框，清晰表示不兼容但保持可见
          node.style.boxShadow = '0 0 0 2px var(--error-color), 0 0 10px rgba(244, 67, 54, 0.3)';
        }
      } else {
        // 重置状态，确保节点在正常状态下可见
        node.classList.remove('connectable', 'not-connectable');
        node.style.zIndex = selected ? '100' : '10'; // 确保即使普通状态下节点也高于连接线
        node.style.opacity = '1';
        // 恢复默认样式 - 根据节点状态
        node.style.boxShadow = selected ? 
          '0 0 0 2px var(--primary-color), 0 0 10px rgba(16, 163, 127, 0.5)' : 
          data.status === 'running' ? 
            '0 0 0 2px var(--primary-color), 0 0 10px rgba(16, 163, 127, 0.4)' :
          data.status === 'error' ? 
            '0 0 0 2px var(--error-color), 0 0 10px rgba(244, 67, 54, 0.5)' :
          data.status === 'completed' ?
            '0 0 0 2px var(--success-color), 0 0 10px rgba(46, 204, 113, 0.5)' :
            'var(--shadow-md)'; // 默认阴影
      }
    }
  }, [connectStatus, selected, id, data.status]);
  
  // 处理输入值变化
  const handleInputChange = (key: string, value: any) => {
    if (onChange) {
      onChange(id, {
        inputs: {
          ...inputs,
          [key]: { ...inputs[key], value },
        },
      });
    }
  };
  
  // 处理节点折叠/展开
  const toggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsed(!collapsed);
  };
  
  // 切换输出展开状态
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
    
    const nodeElement = (e.currentTarget as HTMLElement).parentElement;
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      initialSize.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      };
      setResizing(true);
    }
  };
  
  // 处理调整大小
  const handleResize = useCallback((e: MouseEvent) => {
    if (resizing) {
      const dx = e.clientX - initialSize.current.x;
      const dy = e.clientY - initialSize.current.y;
      
      setNodeSize({
        width: Math.max(260, initialSize.current.width + dx), // 最小宽度增加到260
        height: initialSize.current.height + dy > 100 ? initialSize.current.height + dy : 'auto'
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
  
  // 为节点类型添加特定的类名
  const getTypeClass = () => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes(t('nodes.categories.input').toLowerCase()) || 
        lowerLabel.includes('input') || 
        lowerLabel.includes('文本')) return 'node-type-input';
    if (lowerLabel.includes('llm') || 
        lowerLabel.includes(t('nodes.llmQuery.name').toLowerCase()) || 
        lowerLabel.includes('查询')) return 'node-type-llm';
    if (lowerLabel.includes(t('nodes.documentQuery.name').toLowerCase()) || 
        lowerLabel.includes('document') || 
        lowerLabel.includes('文档')) return 'node-type-document';
    if (lowerLabel.includes(t('nodes.webSearch.name').toLowerCase()) || 
        lowerLabel.includes('search') || 
        lowerLabel.includes('搜索')) return 'node-type-search';
    if (lowerLabel.includes(t('nodes.modelSelector.name').toLowerCase()) || 
        lowerLabel.includes('model') || 
        lowerLabel.includes('模型')) return 'node-type-model';
    return 'node-type-utility';
  };
  
  // 获取节点图标
  const getNodeIcon = () => {
    // 让我们保留原有的图标逻辑，不使用emoji，因为我们已经在CSS中添加了SVG图标
    return '';
  };
  
  // 获取节点类名
  const getNodeClasses = () => {
    // 基础类名
    let classes = `comfy-node ${getTypeClass()} ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''}`;
    
    // 添加连接状态相关的类名
    if (connectStatus === 'compatible') {
      classes += ' connectable';
    } else if (connectStatus === 'incompatible') {
      classes += ' not-connectable';
    }
    
    // 添加节点执行状态相关的类名
    if (data.status === 'running') {
      classes += ' running';
    } else if (data.status === 'completed') {
      classes += ' completed';
    } else if (data.status === 'error') {
      classes += ' error';
    } else if (data.status === 'connected') {
      classes += ' connected';
    }
    
    return classes;
  };
  
  return (
    <div
      id={`node-${id}`}
      className={`comfy-node ${getTypeClass()} ${getStatusClass(data.status)}`}
      style={{
        width: nodeSize.width,
        height: nodeSize.height,
        position: 'relative',
        zIndex: 10, // 默认Z-index确保可见
        visibility: 'visible', // 显式设置可见性
      }}
    >
      {/* 节点内容 */}
      <div className="comfy-node-content-wrapper">
        {/* 节点头部 */}
        <div className="comfy-node-header">
          <div className="comfy-node-title">
            {label}
            {data.status && (
              <span className={`comfy-node-status ${data.status}`}>
                {data.status === 'running' && '⚙️'}
                {data.status === 'completed' && '✅'}
                {data.status === 'error' && '❌'}
              </span>
            )}
          </div>
          <div className="comfy-node-controls">
            <button 
              onClick={toggleCollapsed}
              className="comfy-node-collapse-btn"
              title={collapsed ? t('nodes.common.expand') : t('nodes.common.collapse')}
            >
              {collapsed ? "+" : "-"}
            </button>
          </div>
        </div>
        
        <div className={`comfy-node-content ${collapsed ? 'collapsed' : ''}`}>
          {/* 输入部分 */}
          {Object.entries(inputs).length > 0 && (
            <div className="comfy-section">
              <div className="comfy-section-title">{t('nodes.common.inputs')}</div>
              {Object.entries(inputs).map(([key, input]: [string, any], index) => {
                // 如果输入字段有hidden属性且为true，则不显示它
                if (input.hidden) return null;
                
                return (
                  <div key={key} className="comfy-node-row">
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`input-${key}`}
                      isConnectable={isConnectable}
                      className={`comfy-node-handle comfy-node-handle-input ${input.isConnected ? 'connected' : ''} ${connectStatus === 'compatible' ? 'connectable' : ''}`}
                      style={{
                        top: `${40 + index * 32}px`,
                        background: input.type === 'boolean' ? '#ff9800' :
                                input.type === 'number' ? '#2196f3' :
                                input.type === 'string' ? '#4caf50' : '#9c27b0',
                        zIndex: 2000 // 确保连接点始终在最顶层
                      }}
                      data-tooltip={`${input.label || key} (${input.type})`}
                    />
                    <div className="comfy-node-label" title={key}>{input.label || key}</div>
                    <div className="comfy-node-input-wrapper">
                      {input.type === 'text' ? (
                        <input
                          type="text"
                          value={input.value || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="comfy-node-input"
                          placeholder={input.placeholder || t('nodes.common.inputPlaceholder', { field: key })}
                          disabled={input.isConnected}
                        />
                      ) : input.type === 'number' ? (
                        <div className="comfy-node-number-wrapper">
                          <input
                            type="number"
                            value={input.value || ''}
                            onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                            className="comfy-node-input comfy-node-number"
                            placeholder={input.placeholder}
                            min={input.min}
                            max={input.max}
                            step={input.step}
                            disabled={input.isConnected}
                          />
                          <div className="comfy-node-slider-wrapper">
                            <input
                              type="range"
                              min={input.min || 0}
                              max={input.max || 100}
                              step={input.step || 1}
                              value={input.value || 0}
                              onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                              className="comfy-node-slider"
                              disabled={input.isConnected}
                            />
                          </div>
                        </div>
                      ) : input.type === 'select' ? (
                        <select
                          value={input.value || ''}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                          className="comfy-node-select"
                          disabled={input.isConnected}
                        >
                          {input.options?.map((option: string) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* 输出部分 */}
          {Object.entries(outputs).length > 0 && (
            <div className="comfy-section">
              <div className="comfy-section-title">{t('nodes.common.outputs')}</div>
              {Object.entries(outputs).map(([key, output]: [string, any], index) => {
                const isExpanded = expandedOutputs[key];
                const outputValue = output.value || '';
                // 判断输出是否需要展开/折叠功能（当内容较长时）
                const needsExpand = outputValue.length > 50;
                
                return (
                  <div key={key} className="comfy-node-row comfy-node-output-row" style={{ paddingTop: `${index * 4}px` }}>
                    <div className="comfy-node-label" title={key}>{output.label || key}</div>
                    <div className="comfy-node-output">
                      {outputValue ? (
                        <div 
                          className={`comfy-node-expandable-content ${isExpanded ? 'expanded' : ''}`}
                          onClick={needsExpand ? () => toggleOutputExpanded(key) : undefined}
                          style={{ cursor: needsExpand ? 'pointer' : 'default' }}
                        >
                          <span className="comfy-node-output-value">
                            {isExpanded || !needsExpand ? outputValue : `${outputValue.substring(0, 50)}...`}
                          </span>
                          {needsExpand && (
                            <span className="comfy-expand-toggle">
                              {isExpanded ? t('nodes.common.collapse') : t('nodes.common.expand')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="comfy-node-output-empty">{t('nodes.common.noData')}</span>
                      )}
                    </div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`output-${key}`}
                      isConnectable={isConnectable}
                      className={`comfy-node-handle comfy-node-handle-output ${output.isConnected ? 'connected' : ''}`}
                      style={{
                        top: `${40 + index * 32}px`,
                        background: output.type === 'boolean' ? '#ff9800' :
                                  output.type === 'number' ? '#2196f3' :
                                  output.type === 'string' ? '#4caf50' : '#9c27b0',
                        zIndex: 2000 // 确保连接点始终在顶层
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
            className="comfy-node-resize-handle"
            onMouseDown={startResize}
          />
        </div>
      </div>

      {/* 节点背景 - 添加一个半透明遮罩层，确保内容不被遮挡 */}
      <div 
        className="comfy-node-background" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // 放在内容下面
          borderRadius: '6px',
          pointerEvents: 'none', // 不阻止鼠标事件
        }}
      />
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;