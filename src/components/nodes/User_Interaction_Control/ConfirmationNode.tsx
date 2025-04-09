import React, { memo, useCallback, useState } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface ConfirmationNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 确认节点 - 用于获取用户确认
 * 
 * 功能：
 * - 支持多种确认类型（是/否、确认/取消等）
 * - 提供自定义确认消息
 * - 可配置确认按钮文本
 */
const ConfirmationNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: ConfirmationNodeProps) => {
  const { t } = useTranslation();
  const [confirmationType, setConfirmationType] = useState(data.confirmationType || 'yesNo');
  const [message, setMessage] = useState(data.message || t('nodes.confirmation.defaultMessage'));
  const [title, setTitle] = useState(data.title || t('nodes.confirmation.defaultTitle'));
  const [confirmText, setConfirmText] = useState(data.confirmText || t('nodes.confirmation.confirm'));
  const [cancelText, setCancelText] = useState(data.cancelText || t('nodes.confirmation.cancel'));
  const [showPreview, setShowPreview] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<boolean | null>(null);

  // 处理确认类型变更
  const handleConfirmationTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setConfirmationType(newType);
    if (data.onChange) {
      data.onChange({
        ...data,
        confirmationType: newType
      });
    }
  }, [data]);

  // 处理消息变更
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    if (data.onChange) {
      data.onChange({
        ...data,
        message: newMessage
      });
    }
  }, [data]);

  // 处理标题变更
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (data.onChange) {
      data.onChange({
        ...data,
        title: newTitle
      });
    }
  }, [data]);

  // 处理确认按钮文本变更
  const handleConfirmTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setConfirmText(newText);
    if (data.onChange) {
      data.onChange({
        ...data,
        confirmText: newText
      });
    }
  }, [data]);

  // 处理取消按钮文本变更
  const handleCancelTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setCancelText(newText);
    if (data.onChange) {
      data.onChange({
        ...data,
        cancelText: newText
      });
    }
  }, [data]);

  // 显示预览
  const handleShowPreview = useCallback(() => {
    setShowPreview(true);
    setConfirmationResult(null);
  }, []);

  // 处理确认
  const handleConfirm = useCallback(() => {
    setConfirmationResult(true);
    setShowPreview(false);
    if (data.onChange) {
      data.onChange({
        ...data,
        result: true
      });
    }
  }, [data]);

  // 处理取消
  const handleCancel = useCallback(() => {
    setConfirmationResult(false);
    setShowPreview(false);
    if (data.onChange) {
      data.onChange({
        ...data,
        result: false
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.confirmation.confirmationSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.confirmation.confirmationType')}</label>
          <select
            value={confirmationType}
            onChange={handleConfirmationTypeChange}
            className="node-select"
          >
            <option value="yesNo">{t('nodes.confirmation.yesNo')}</option>
            <option value="okCancel">{t('nodes.confirmation.okCancel')}</option>
            <option value="confirmCancel">{t('nodes.confirmation.confirmCancel')}</option>
            <option value="custom">{t('nodes.confirmation.custom')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.confirmation.title')}</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="node-input"
            placeholder={t('nodes.confirmation.titlePlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.confirmation.message')}</label>
          <textarea
            value={message}
            onChange={handleMessageChange}
            className="node-textarea"
            rows={3}
            placeholder={t('nodes.confirmation.messagePlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.confirmation.confirmButtonText')}</label>
          <input
            type="text"
            value={confirmText}
            onChange={handleConfirmTextChange}
            className="node-input"
            placeholder={t('nodes.confirmation.confirmButtonPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.confirmation.cancelButtonText')}</label>
          <input
            type="text"
            value={cancelText}
            onChange={handleCancelTextChange}
            className="node-input"
            placeholder={t('nodes.confirmation.cancelButtonPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <button 
            onClick={handleShowPreview}
            className="node-button"
          >
            {t('nodes.confirmation.showPreview')}
          </button>
        </div>
        
        {confirmationResult !== null && (
          <div className="node-row">
            <div className={`node-confirmation-result ${confirmationResult ? 'confirmed' : 'cancelled'}`}>
              {confirmationResult 
                ? t('nodes.confirmation.userConfirmed') 
                : t('nodes.confirmation.userCancelled')}
            </div>
          </div>
        )}
        
        {showPreview && (
          <div className="node-confirmation-preview">
            <div className="confirmation-dialog">
              <div className="confirmation-title">{title}</div>
              <div className="confirmation-message">{message}</div>
              <div className="confirmation-buttons">
                <button 
                  className="confirmation-button confirm"
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
                <button 
                  className="confirmation-button cancel"
                  onClick={handleCancel}
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.confirmation.title'),
    inputs: {
      message: {
        type: 'string',
        label: t('nodes.confirmation.message'),
        description: t('nodes.confirmation.messageDesc')
      },
      title: {
        type: 'string',
        label: t('nodes.confirmation.title'),
        description: t('nodes.confirmation.titleDesc')
      }
    },
    outputs: {
      confirmed: {
        type: 'boolean',
        label: t('nodes.confirmation.confirmed'),
        description: t('nodes.confirmation.confirmedDesc')
      },
      result: {
        type: 'string',
        label: t('nodes.confirmation.result'),
        description: t('nodes.confirmation.resultDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="CONFIRMATION"
      isConnectable={isConnectable}
    />
  );
});

ConfirmationNode.displayName = 'ConfirmationNode';

export default ConfirmationNode;
