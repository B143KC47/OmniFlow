import React, { memo, useCallback, useState } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';
import { NodePropsWithIdCallback } from '../NodeInterface';

interface ImageInputNodeProps extends NodePropsWithIdCallback {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

const ImageInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: ImageInputNodeProps) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(data.inputs?.image?.preview || null);
  
  // 处理图像上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert(t('nodes.imageInput.invalidFormat'));
      return;
    }
    
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // 将图像数据更新到节点
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      onDataChange(id, {
        inputs: {
          ...data.inputs,
          image: {
            ...data.inputs?.image,
            value: base64Data,
            filename: file.name,
            type: file.type,
            preview: previewUrl
          }
        },
        outputs: {
          ...data.outputs,
          image: {
            type: 'image',
            value: base64Data,
            metadata: {
              filename: file.name,
              type: file.type,
              size: file.size
            }
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }, [data, onDataChange, t, id]);
  
  // 处理图像尺寸变更
  const handleResizeOptions = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const resizeOption = e.target.value;
    
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        resizeOption: {
          ...data.inputs?.resizeOption,
          value: resizeOption
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理图像移除
  const handleRemoveImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        image: {
          ...data.inputs?.image,
          value: null,
          filename: null,
          type: null,
          preview: null
        }
      },
      outputs: {
        ...data.outputs,
        image: {
          type: 'image',
          value: null
        }
      }
    });
  }, [data, onDataChange, preview, id]);
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.imageInput.name'),
    inputs: {
      ...data.inputs,
      imageUpload: {
        type: 'custom',
        component: 'imageUpload',
        value: null,
        hidden: true // 隐藏默认输入框，我们将使用自定义UI
      },
      resizeOption: {
        type: 'select',
        label: t('nodes.imageInput.resizeOption'),
        value: data.inputs?.resizeOption?.value || 'none',
        options: ['none', '256x256', '512x512', '768x768', '1024x1024']
      }
    },
    outputs: {
      ...data.outputs,
      image: {
        type: 'image',
        value: data.inputs?.image?.value || null,
        metadata: data.outputs?.image?.metadata || null
      }
    },
    onChange: (nodeId: string, updateData: any) => onDataChange(nodeId, updateData)
  };

  // 创建一个适配器函数，将 (nodeId, data) 转换为 (data)
  const handleNodeDataChange = useCallback((newData: NodeData) => {
    onDataChange(id, newData);
  }, [id, onDataChange]);

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
        onDataChange={handleNodeDataChange}
      />
      
      {/* 自定义图像上传区域 - 添加在BaseNode之外，以便更好地控制布局 */}
      <div className="comfy-image-upload-container" style={{ position: 'relative', zIndex: 20 }}>
        {preview ? (
          <div className="comfy-image-preview">
            <img 
              src={preview} 
              alt={data.inputs?.image?.filename || t('nodes.imageInput.preview')}
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
            <div className="comfy-image-actions">
              <span className="comfy-image-filename">
                {data.inputs?.image?.filename}
              </span>
              <button 
                className="comfy-image-remove-btn" 
                onClick={handleRemoveImage}
                title={t('nodes.imageInput.remove')}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="comfy-image-upload">
            <label htmlFor={`image-upload-${id}`} className="comfy-image-upload-label">
              {t('nodes.imageInput.upload')}
              <input
                id={`image-upload-${id}`}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="comfy-image-formats">
              {t('nodes.imageInput.formats')}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

ImageInputNode.displayName = 'ImageInputNode';

export default ImageInputNode;