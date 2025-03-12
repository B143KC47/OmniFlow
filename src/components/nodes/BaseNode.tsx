import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData } from '../../types';

interface BaseNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

const BaseNode = memo(({ id, data, isConnectable, selected }: BaseNodeProps) => {
  const { label, inputs = {}, outputs = {}, onChange } = data;
  
  // 节点折叠状态
  const [collapsed, setCollapsed] = useState(false);
  
  // 输出内容展开状态
  const [expandedOutputs, setExpandedOutputs] = useState<Record<string, boolean>>({});
  
  // 记录节点大小
  const [nodeSize, setNodeSize] = useState<{ width: number, height: string | number }>({ width: 280, height: 'auto' });
  
  // 记录是否在调整大小
  const [resizing, setResizing] = useState(false);
  const initialSize = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
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
    
    const nodeElement = e.currentTarget.parentElement;
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
        width: Math.max(220, initialSize.current.width + dx),
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
    if (lowerLabel.includes('文本')) return 'node-type-input';
    if (lowerLabel.includes('llm') || lowerLabel.includes('查询')) return 'node-type-llm';
    if (lowerLabel.includes('文档')) return 'node-type-document';
    if (lowerLabel.includes('搜索')) return 'node-type-search';
    if (lowerLabel.includes('模型')) return 'node-type-model';
    return 'node-type-utility';
  };
  
  return (
    <div 
      className={`comfy-node ${getTypeClass()} ${selected ? 'selected' : ''} ${collapsed ? 'collapsed' : ''}`} 
      style={{ width: nodeSize.width, height: typeof nodeSize.height === 'number' ? `${nodeSize.height}px` : nodeSize.height }}
    >
      <div className="comfy-node-header">
        <div className="comfy-node-title">{label}</div>
        <div className="comfy-node-controls">
          <button 
            onClick={toggleCollapsed}
            className="comfy-node-collapse-btn"
            title={collapsed ? "展开" : "折叠"}
          >
            {collapsed ? "+" : "-"}
          </button>
        </div>
      </div>
      
      <div className="comfy-node-content">
        {/* 输入部分 */}
        {Object.entries(inputs).length > 0 && (
          <div className="comfy-section">
            <div className="comfy-section-title">输入</div>
            {Object.entries(inputs).map(([key, input]: [string, any]) => (
              <div key={key} className="comfy-node-row">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`input-${key}`}
                  isConnectable={isConnectable}
                  className="comfy-node-handle comfy-node-handle-input"
                />
                <div className="comfy-node-label" title={key}>{key}</div>
                <div className="comfy-node-input-wrapper">
                  {input.type === 'text' ? (
                    <input
                      type="text"
                      value={input.value || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="comfy-node-input"
                      placeholder={input.placeholder || `输入${key}...`}
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
                        />
                      </div>
                    </div>
                  ) : input.type === 'select' ? (
                    <select
                      value={input.value || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="comfy-node-select"
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
            ))}
          </div>
        )}

        {/* 输出部分 */}
        {Object.entries(outputs).length > 0 && (
          <div className="comfy-section">
            <div className="comfy-section-title">输出</div>
            {Object.entries(outputs).map(([key, output]: [string, any]) => {
              const isExpanded = expandedOutputs[key];
              const outputValue = output.value || '';
              // 判断输出是否需要展开/折叠功能（当内容较长时）
              const needsExpand = outputValue.length > 50;
              
              return (
                <div key={key} className="comfy-node-row comfy-node-output-row">
                  <div className="comfy-node-label" title={key}>{key}</div>
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
                            {isExpanded ? '收起' : '展开'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="comfy-node-output-empty">未生成数据</span>
                    )}
                  </div>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`output-${key}`}
                    isConnectable={isConnectable}
                    className="comfy-node-handle comfy-node-handle-output"
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
      
      <style jsx>{`
        .comfy-node {
          border-radius: 6px;
          overflow: hidden;
          width: 100%;
        }
        
        .comfy-node-header {
          background-color: var(--node-header-color);
          padding: 8px 10px;
          border-bottom: 1px solid var(--node-border-color);
        }
        
        .comfy-node-title {
          color: var(--node-title-color);
          font-weight: 600;
          font-size: 12px;
        }
        
        .comfy-node-content {
          padding: 10px;
        }
        
        .comfy-node-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          position: relative;
        }
        
        .comfy-node-label {
          font-size: 11px;
          color: var(--node-text-color);
          margin-right: 8px;
          flex: 0 0 80px;
        }
        
        .comfy-node-input-wrapper {
          flex: 1;
        }
        
        .comfy-node-input {
          background-color: var(--node-input-bg);
          border: 1px solid var(--node-input-border);
          border-radius: 4px;
          color: var(--node-input-text);
          padding: 4px 8px;
          font-size: 11px;
          width: 100%;
        }
        
        .comfy-node-input:focus {
          border-color: var(--primary-color);
          outline: none;
        }
        
        .comfy-node-number-wrapper {
          display: flex;
          flex-direction: column;
        }
        
        .comfy-node-number {
          text-align: right;
          margin-bottom: 4px;
        }
        
        .comfy-node-slider-wrapper {
          padding: 0 2px;
        }
        
        .comfy-node-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: var(--node-input-border);
          border-radius: 2px;
          outline: none;
        }
        
        .comfy-node-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
        }
        
        .comfy-node-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--primary-color);
          cursor: pointer;
          border: none;
        }
        
        .comfy-node-select {
          background-color: var(--node-input-bg);
          border: 1px solid var(--node-input-border);
          border-radius: 4px;
          color: var(--node-input-text);
          padding: 4px 8px;
          font-size: 11px;
          width: 100%;
        }
        
        .comfy-node-select:focus {
          border-color: var(--primary-color);
          outline: none;
        }
        
        .comfy-node-output-row {
          justify-content: space-between;
        }
        
        .comfy-node-output {
          font-size: 11px;
          color: var(--node-text-color);
          background-color: var(--node-input-bg);
          border: 1px solid var(--node-input-border);
          border-radius: 4px;
          padding: 4px 8px;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        :global(.comfy-node-handle) {
          width: 8px;
          height: 8px;
          background-color: var(--handle-bg);
          border: 2px solid var(--handle-color);
        }
        
        :global(.comfy-node-handle-input) {
          left: -4px;
        }
        
        :global(.comfy-node-handle-output) {
          right: -4px;
        }
        
        :global(.comfy-node-handle:hover) {
          background-color: var(--handle-color);
        }
        
        .comfy-node-collapse-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 3px;
          padding: 0;
        }
        
        .comfy-node-collapse-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
});

BaseNode.displayName = 'BaseNode';

export default BaseNode;