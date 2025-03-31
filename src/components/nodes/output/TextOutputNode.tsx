import React, { memo, useCallback, useState, useRef } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';

interface TextOutputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: Partial<NodeData>) => void;
}

const TextOutputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: TextOutputNodeProps) => {
  const { t } = useTranslation();
  const textContent = data.inputs?.text?.value || '';
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // 切换展开状态
  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // 复制到剪贴板
  const copyToClipboard = useCallback(() => {
    if (textContent) {
      navigator.clipboard.writeText(textContent).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [textContent]);
  
  // 导出文本到文件
  const exportToFile = useCallback(() => {
    if (!textContent) return;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [textContent]);
  
  // 清除输出
  const clearOutput = useCallback(() => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        text: {
          ...data.inputs?.text,
          value: ''
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 构建节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.textOutput.name'),
    inputs: {
      ...data.inputs,
      text: {
        type: 'text',
        value: textContent,
        label: t('nodes.textOutput.input')
      },
      wordWrap: {
        type: 'boolean',
        value: data.inputs?.wordWrap?.value ?? true,
        label: t('nodes.textOutput.wordWrap')
      },
      fontSize: {
        type: 'select',
        value: data.inputs?.fontSize?.value || 'medium',
        options: ['small', 'medium', 'large'],
        label: t('nodes.textOutput.fontSize')
      }
    },
    outputs: {
      ...data.outputs,
      // 文本输出节点通常不提供输出端口，因为它是工作流的终点
    },
    onChange: (nodeId, data) => onDataChange(nodeId, data)
  };
  
  // 处理字体大小变更
  const handleFontSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        fontSize: {
          ...data.inputs?.fontSize,
          value: e.target.value
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理自动换行选项变更
  const handleWordWrapChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        wordWrap: {
          ...data.inputs?.wordWrap,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 计算字体大小样式
  const getFontSize = () => {
    switch (data.inputs?.fontSize?.value) {
      case 'small': return '12px';
      case 'large': return '16px';
      case 'medium':
      default: return '14px';
    }
  };

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义文本输出区域 */}
      <div className="comfy-text-output-container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="comfy-text-output-tools">
          <button 
            className={`comfy-text-output-expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpand}
            title={isExpanded ? t('nodes.textOutput.collapse') : t('nodes.textOutput.expand')}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
          
          <button 
            className={`comfy-text-output-copy-btn ${isCopied ? 'copied' : ''}`}
            onClick={copyToClipboard}
            title={t('nodes.textOutput.copy')}
            disabled={!textContent}
          >
            {isCopied ? '✓' : '📋'}
          </button>
          
          <button 
            className="comfy-text-output-export-btn"
            onClick={exportToFile}
            title={t('nodes.textOutput.export')}
            disabled={!textContent}
          >
            💾
          </button>
          
          <button 
            className="comfy-text-output-clear-btn"
            onClick={clearOutput}
            title={t('nodes.textOutput.clear')}
            disabled={!textContent}
          >
            🗑
          </button>
          
          <div className="comfy-text-output-options">
            <label className="comfy-text-output-option">
              <span>{t('nodes.textOutput.wordWrap')}</span>
              <input
                type="checkbox"
                checked={data.inputs?.wordWrap?.value ?? true}
                onChange={handleWordWrapChange}
              />
            </label>
            
            <label className="comfy-text-output-option">
              <span>{t('nodes.textOutput.fontSize')}</span>
              <select
                value={data.inputs?.fontSize?.value || 'medium'}
                onChange={handleFontSizeChange}
              >
                <option value="small">{t('nodes.textOutput.small')}</option>
                <option value="medium">{t('nodes.textOutput.medium')}</option>
                <option value="large">{t('nodes.textOutput.large')}</option>
              </select>
            </label>
          </div>
        </div>
        
        <div 
          className={`comfy-text-output-content ${isExpanded ? 'expanded' : ''}`}
          style={{ 
            maxHeight: isExpanded ? '500px' : '200px',
            overflowY: 'auto'
          }}
        >
          <textarea
            ref={textRef}
            className="comfy-text-output-textarea"
            value={textContent}
            readOnly
            style={{ 
              whiteSpace: data.inputs?.wordWrap?.value ? 'pre-wrap' : 'pre',
              fontSize: getFontSize(),
              overflow: 'auto'
            }}
            placeholder={t('nodes.textOutput.placeholder')}
          />
        </div>
        
        {textContent && (
          <div className="comfy-text-output-stats">
            {t('nodes.textOutput.characters')}: {textContent.length} | 
            {t('nodes.textOutput.words')}: {textContent.trim().split(/\s+/).filter(Boolean).length}
          </div>
        )}
      </div>
    </>
  );
});

TextOutputNode.displayName = 'TextOutputNode';

export default TextOutputNode;