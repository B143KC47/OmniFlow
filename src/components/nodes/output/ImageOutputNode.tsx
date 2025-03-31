import React, { memo, useCallback, useState } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';

interface ImageOutputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: Partial<NodeData>) => void;
}

const ImageOutputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: ImageOutputNodeProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const imageRef = React.useRef<HTMLImageElement>(null);
  
  // 获取图像数据和元数据
  const imageData = data.inputs?.image?.value || '';
  const imageMetadata = data.inputs?.image?.metadata || {};
  
  // 切换展开状态
  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // 切换全屏状态
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);
  
  // 关闭全屏
  const closeFullScreen = useCallback(() => {
    setIsFullScreen(false);
  }, []);
  
  // 监听ESC键关闭全屏
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        closeFullScreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen, closeFullScreen]);
  
  // 保存图像
  const saveImage = useCallback(() => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `image_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageData]);
  
  // 复制图像到剪贴板
  const copyImageToClipboard = useCallback(async () => {
    if (!imageData) return;
    
    try {
      // 尝试从DataURL创建Blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // 使用剪贴板API复制图像
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      
      // 显示成功提示
      alert(t('nodes.imageOutput.copiedToClipboard'));
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      alert(t('nodes.imageOutput.copyFailed'));
    }
  }, [imageData, t]);
  
  // 更改图像格式
  const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        format: {
          ...data.inputs?.format,
          value: e.target.value
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 获取图像尺寸
  const getImageDimensions = useCallback(() => {
    if (imageMetadata && imageMetadata.width && imageMetadata.height) {
      return `${imageMetadata.width} × ${imageMetadata.height}`;
    }
    
    if (imageRef.current) {
      return `${imageRef.current.naturalWidth} × ${imageRef.current.naturalHeight}`;
    }
    
    return '';
  }, [imageMetadata]);
  
  // 构建节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.imageOutput.name'),
    inputs: {
      ...data.inputs,
      image: {
        type: 'image',
        value: imageData,
        metadata: imageMetadata,
        label: t('nodes.imageOutput.input')
      },
      format: {
        type: 'select',
        value: data.inputs?.format?.value || 'png',
        options: ['png', 'jpeg', 'webp'],
        label: t('nodes.imageOutput.format')
      },
      quality: {
        type: 'number',
        value: data.inputs?.quality?.value || 100,
        min: 1,
        max: 100,
        step: 1,
        label: t('nodes.imageOutput.quality')
      }
    },
    outputs: {
      ...data.outputs,
      // 图像输出节点通常不提供输出端口，因为它是工作流的终点
    },
    onChange: (nodeId, data) => onDataChange(nodeId, data)
  };

  // 处理图像质量变更
  const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseInt(e.target.value, 10);
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        quality: {
          ...data.inputs?.quality,
          value: quality
        }
      }
    });
  }, [data, onDataChange, id]);

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义图像输出区域 */}
      <div className="comfy-image-output-container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="comfy-image-output-tools">
          <button 
            className={`comfy-image-output-expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpand}
            title={isExpanded ? t('nodes.imageOutput.collapse') : t('nodes.imageOutput.expand')}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
          
          <button 
            className="comfy-image-output-fullscreen-btn"
            onClick={toggleFullScreen}
            title={t('nodes.imageOutput.fullscreen')}
            disabled={!imageData}
          >
            🔍
          </button>
          
          <button 
            className="comfy-image-output-save-btn"
            onClick={saveImage}
            title={t('nodes.imageOutput.save')}
            disabled={!imageData}
          >
            💾
          </button>
          
          <button 
            className="comfy-image-output-copy-btn"
            onClick={copyImageToClipboard}
            title={t('nodes.imageOutput.copy')}
            disabled={!imageData}
          >
            📋
          </button>
          
          <div className="comfy-image-output-options">
            <label className="comfy-image-output-option">
              <span>{t('nodes.imageOutput.format')}</span>
              <select
                value={data.inputs?.format?.value || 'png'}
                onChange={handleFormatChange}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
            
            {data.inputs?.format?.value === 'jpeg' && (
              <label className="comfy-image-output-option">
                <span>{t('nodes.imageOutput.quality')}</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={data.inputs?.quality?.value || 100}
                  onChange={handleQualityChange}
                />
                <span className="comfy-quality-value">
                  {data.inputs?.quality?.value || 100}%
                </span>
              </label>
            )}
          </div>
        </div>
        
        <div 
          className={`comfy-image-output-content ${isExpanded ? 'expanded' : ''}`}
          style={{ 
            maxHeight: isExpanded ? '500px' : '200px',
            overflowY: 'auto'
          }}
        >
          {imageData ? (
            <div className="comfy-image-wrapper">
              <img
                ref={imageRef}
                src={imageData}
                alt={t('nodes.imageOutput.result')}
                className="comfy-output-image"
                style={{
                  maxWidth: '100%',
                  maxHeight: isExpanded ? '500px' : '200px',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <div className="comfy-image-placeholder">
              {t('nodes.imageOutput.noImage')}
            </div>
          )}
        </div>
        
        {imageData && (
          <div className="comfy-image-output-info">
            <span className="comfy-image-dimensions">
              {getImageDimensions()}
            </span>
            {imageMetadata && imageMetadata.generator && (
              <span className="comfy-image-generator">
                {t('nodes.imageOutput.generator')}: {imageMetadata.generator}
              </span>
            )}
            {imageMetadata && imageMetadata.prompt && (
              <span className="comfy-image-prompt" title={imageMetadata.prompt}>
                {t('nodes.imageOutput.prompt')}: {
                  imageMetadata.prompt.length > 50 
                    ? imageMetadata.prompt.substring(0, 50) + '...' 
                    : imageMetadata.prompt
                }
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 全屏图像查看器 */}
      {isFullScreen && imageData && (
        <div 
          className="comfy-image-fullscreen-overlay"
          onClick={closeFullScreen}
        >
          <div 
            className="comfy-image-fullscreen-container"
            onClick={e => e.stopPropagation()}  
          >
            <img
              src={imageData}
              alt={t('nodes.imageOutput.result')}
              className="comfy-image-fullscreen"
            />
            <button 
              className="comfy-image-fullscreen-close"
              onClick={closeFullScreen}
              title={t('nodes.imageOutput.close')}
            >
              ✕
            </button>
            <div className="comfy-fullscreen-info">
              <div className="comfy-fullscreen-dimensions">
                {getImageDimensions()}
              </div>
              {imageMetadata && imageMetadata.generator && (
                <div className="comfy-fullscreen-generator">
                  {t('nodes.imageOutput.generator')}: {imageMetadata.generator}
                </div>
              )}
              {imageMetadata && imageMetadata.prompt && (
                <div className="comfy-fullscreen-prompt">
                  {t('nodes.imageOutput.prompt')}: {imageMetadata.prompt}
                </div>
              )}
              <div className="comfy-fullscreen-buttons">
                <button 
                  className="comfy-fullscreen-button"
                  onClick={saveImage}
                  title={t('nodes.imageOutput.save')}
                >
                  {t('nodes.imageOutput.save')}
                </button>
                <button 
                  className="comfy-fullscreen-button"
                  onClick={copyImageToClipboard}
                  title={t('nodes.imageOutput.copy')}
                >
                  {t('nodes.imageOutput.copy')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ImageOutputNode.displayName = 'ImageOutputNode';

export default ImageOutputNode;