import React, { memo, useCallback, useState } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface ImageGenerationNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 图像生成节点 - 用于生成图像
 * 
 * 功能：
 * - 支持多种图像生成模型
 * - 提供图像生成参数配置
 * - 可预览生成的图像
 */
const ImageGenerationNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: ImageGenerationNodeProps) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [negativePrompt, setNegativePrompt] = useState(data.negativePrompt || '');
  const [model, setModel] = useState(data.model || 'stable-diffusion-xl');
  const [width, setWidth] = useState(data.width || 512);
  const [height, setHeight] = useState(data.height || 512);
  const [steps, setSteps] = useState(data.steps || 30);
  const [guidanceScale, setGuidanceScale] = useState(data.guidanceScale || 7.5);
  const [seed, setSeed] = useState(data.seed || -1);
  const [generatedImage, setGeneratedImage] = useState<string | null>(data.generatedImage || null);

  // 处理提示词变更
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    if (data.onChange) {
      data.onChange({
        ...data,
        prompt: newPrompt
      });
    }
  }, [data]);

  // 处理负面提示词变更
  const handleNegativePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNegativePrompt = e.target.value;
    setNegativePrompt(newNegativePrompt);
    if (data.onChange) {
      data.onChange({
        ...data,
        negativePrompt: newNegativePrompt
      });
    }
  }, [data]);

  // 处理模型变更
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setModel(newModel);
    if (data.onChange) {
      data.onChange({
        ...data,
        model: newModel
      });
    }
  }, [data]);

  // 处理宽度变更
  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    setWidth(newWidth);
    if (data.onChange) {
      data.onChange({
        ...data,
        width: newWidth
      });
    }
  }, [data]);

  // 处理高度变更
  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10);
    setHeight(newHeight);
    if (data.onChange) {
      data.onChange({
        ...data,
        height: newHeight
      });
    }
  }, [data]);

  // 处理步数变更
  const handleStepsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSteps = parseInt(e.target.value, 10);
    setSteps(newSteps);
    if (data.onChange) {
      data.onChange({
        ...data,
        steps: newSteps
      });
    }
  }, [data]);

  // 处理引导比例变更
  const handleGuidanceScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newGuidanceScale = parseFloat(e.target.value);
    setGuidanceScale(newGuidanceScale);
    if (data.onChange) {
      data.onChange({
        ...data,
        guidanceScale: newGuidanceScale
      });
    }
  }, [data]);

  // 处理种子变更
  const handleSeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeed = parseInt(e.target.value, 10);
    setSeed(newSeed);
    if (data.onChange) {
      data.onChange({
        ...data,
        seed: newSeed
      });
    }
  }, [data]);

  // 随机种子
  const handleRandomSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 2147483647);
    setSeed(newSeed);
    if (data.onChange) {
      data.onChange({
        ...data,
        seed: newSeed
      });
    }
  }, [data]);

  // 生成图像预览
  const handleGeneratePreview = useCallback(() => {
    // 这里只是一个模拟，实际应用中应该调用真实的图像生成API
    const placeholderImage = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
    setGeneratedImage(placeholderImage);
    if (data.onChange) {
      data.onChange({
        ...data,
        generatedImage: placeholderImage
      });
    }
  }, [width, height, data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.imageGeneration.generationSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.prompt')}</label>
          <textarea
            value={prompt}
            onChange={handlePromptChange}
            className="node-textarea"
            rows={3}
            placeholder={t('nodes.imageGeneration.promptPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.negativePrompt')}</label>
          <textarea
            value={negativePrompt}
            onChange={handleNegativePromptChange}
            className="node-textarea"
            rows={2}
            placeholder={t('nodes.imageGeneration.negativePromptPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.model')}</label>
          <select
            value={model}
            onChange={handleModelChange}
            className="node-select"
          >
            <option value="stable-diffusion-xl">Stable Diffusion XL</option>
            <option value="stable-diffusion-v1.5">Stable Diffusion v1.5</option>
            <option value="midjourney">Midjourney</option>
            <option value="dalle-3">DALL-E 3</option>
          </select>
        </div>
        
        <div className="node-row node-row-split">
          <div className="node-col">
            <label>{t('nodes.imageGeneration.width')}</label>
            <input
              type="number"
              value={width}
              onChange={handleWidthChange}
              className="node-input"
              min={64}
              max={2048}
              step={64}
            />
          </div>
          <div className="node-col">
            <label>{t('nodes.imageGeneration.height')}</label>
            <input
              type="number"
              value={height}
              onChange={handleHeightChange}
              className="node-input"
              min={64}
              max={2048}
              step={64}
            />
          </div>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.steps')}</label>
          <input
            type="range"
            value={steps}
            onChange={handleStepsChange}
            className="node-slider"
            min={10}
            max={150}
            step={1}
          />
          <span className="node-slider-value">{steps}</span>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.guidanceScale')}</label>
          <input
            type="range"
            value={guidanceScale}
            onChange={handleGuidanceScaleChange}
            className="node-slider"
            min={1}
            max={20}
            step={0.1}
          />
          <span className="node-slider-value">{guidanceScale}</span>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.imageGeneration.seed')}</label>
          <div className="node-input-with-button">
            <input
              type="number"
              value={seed}
              onChange={handleSeedChange}
              className="node-input"
              min={-1}
              max={2147483647}
            />
            <button 
              onClick={handleRandomSeed}
              className="node-button-small"
              title={t('nodes.imageGeneration.randomizeSeed')}
            >
              🎲
            </button>
          </div>
        </div>
        
        <div className="node-row">
          <button 
            onClick={handleGeneratePreview}
            className="node-button"
          >
            {t('nodes.imageGeneration.generatePreview')}
          </button>
        </div>
        
        {generatedImage && (
          <div className="node-row">
            <div className="node-image-preview">
              <img 
                src={generatedImage} 
                alt={t('nodes.imageGeneration.generatedImage')}
                className="node-generated-image"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.imageGeneration.title'),
    inputs: {
      prompt: {
        type: 'string',
        label: t('nodes.imageGeneration.prompt'),
        description: t('nodes.imageGeneration.promptDesc')
      },
      negativePrompt: {
        type: 'string',
        label: t('nodes.imageGeneration.negativePrompt'),
        description: t('nodes.imageGeneration.negativePromptDesc')
      },
      seed: {
        type: 'number',
        label: t('nodes.imageGeneration.seed'),
        description: t('nodes.imageGeneration.seedDesc')
      }
    },
    outputs: {
      image: {
        type: 'image',
        label: t('nodes.imageGeneration.image'),
        description: t('nodes.imageGeneration.imageDesc')
      },
      metadata: {
        type: 'object',
        label: t('nodes.imageGeneration.metadata'),
        description: t('nodes.imageGeneration.metadataDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="IMAGE_GENERATION"
      isConnectable={isConnectable}
    />
  );
});

ImageGenerationNode.displayName = 'ImageGenerationNode';

export default ImageGenerationNode;
