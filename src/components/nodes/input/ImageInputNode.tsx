import React, { memo, useCallback, useState } from 'react';
import { NodeProps } from 'reactflow';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';
import { DEFAULT_NODE_CONFIG } from '../../../styles/nodeConstants';

/**
 * 图像输入节点组件
 * 允许用户上传和处理图像
 */

const ImageInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  type,
  ...restProps
}: NodeProps<NodeData>) => {
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
      if (data.onChange) {
        data.onChange(id, {
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
      }
    };
    reader.readAsDataURL(file);
  }, [data, id, t]);

  // 处理图像尺寸变更
  const handleResizeOptions = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const resizeOption = e.target.value;

    if (data.onChange) {
      data.onChange(id, {
      inputs: {
        ...data.inputs,
        resizeOption: {
          ...data.inputs?.resizeOption,
          value: resizeOption
        }
      }
    });
    }
  }, [data, id]);

  // 处理图像移除
  const handleRemoveImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);

    if (data.onChange) {
      data.onChange(id, {
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
    }
  }, [data, preview, id]);

  // 准备数据，确保包含所有必要字段
  const nodeData = {
    ...data,
    label: data.label || t('nodes.imageInput.name', { defaultValue: '图像输入' }),
    // 确保有正确的输入定义
    inputs: {
      ...DEFAULT_NODE_CONFIG.IMAGE_INPUT.inputs,
      ...data.inputs,
      // 添加自定义图像上传组件
      image: {
        ...DEFAULT_NODE_CONFIG.IMAGE_INPUT.inputs.image,
        ...(data.inputs?.image || {}),
        preview: preview,
        label: t('nodes.imageInput.image', { defaultValue: '图像' }),
        component: 'imageUpload',
        onUpload: handleImageUpload,
        onRemove: handleRemoveImage
      },
      // 添加调整大小选项
      resizeOption: {
        type: 'select',
        label: t('nodes.imageInput.resizeOption', { defaultValue: '调整大小' }),
        value: data.inputs?.resizeOption?.value || 'none',
        options: ['none', '256x256', '512x512', '768x768', '1024x1024']
      }
    },
    // 确保有正确的输出定义
    outputs: {
      ...DEFAULT_NODE_CONFIG.IMAGE_INPUT.outputs,
      ...data.outputs,
      image: {
        ...DEFAULT_NODE_CONFIG.IMAGE_INPUT.outputs.image,
        ...(data.outputs?.image || {}),
        label: t('nodes.imageInput.output', { defaultValue: '输出图像' }),
        value: preview
      }
    }
  };

  // 添加自定义内容渲染
  const renderCustomContent = () => {
    return (
      <div style={{ padding: '10px', textAlign: 'center' }}>
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt={data.inputs?.image?.filename || t('nodes.imageInput.preview', { defaultValue: '预览' })}
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
            />
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--node-text-color-secondary, #aaa)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {data.inputs?.image?.filename || ''}
              </span>
              <button
                onClick={handleRemoveImage}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--error-color, #e74c3c)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px 8px'
                }}
                title={t('nodes.imageInput.remove', { defaultValue: '移除' })}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '2px dashed var(--node-border-color, #444)',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById(`image-upload-${id}`)?.click()}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼</div>
            <div>{t('nodes.imageInput.dropHint', { defaultValue: '点击或拖放图像到这里' })}</div>
            <input
              id={`image-upload-${id}`}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
          </div>
        )}
      </div>
    );
  };

  // 将准备好的数据传递给基础节点组件渲染
  return (
    <BaseNodeComponent
      id={id}
      data={{
        ...nodeData,
        customContent: renderCustomContent()
      }}
      type={type || "IMAGE_INPUT"}
      selected={selected}
      isConnectable={isConnectable}
      {...restProps}
    />
  );
});

ImageInputNode.displayName = 'ImageInputNode';

export default ImageInputNode;

// 节点定义（用于注册）
export const ImageInputNodeDefinition = {
  type: 'IMAGE_INPUT',
  category: 'INPUT',
  name: '图像输入',
  description: '创建图像输入节点，允许用户上传图像或接收来自其他节点的图像数据',
  icon: '🖼',
  component: ImageInputNode,
  defaultConfig: DEFAULT_NODE_CONFIG.IMAGE_INPUT
};