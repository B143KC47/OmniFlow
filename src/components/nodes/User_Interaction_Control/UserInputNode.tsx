import React, { memo, useCallback, useState } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface UserInputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 用户输入节点 - 用于收集用户输入
 * 
 * 功能：
 * - 支持多种输入类型（文本、数字、选择等）
 * - 提供输入验证
 * - 可配置输入提示和默认值
 */
const UserInputNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: UserInputNodeProps) => {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState(data.inputType || 'text');
  const [label, setLabel] = useState(data.label || t('nodes.userInput.title'));
  const [placeholder, setPlaceholder] = useState(data.placeholder || '');
  const [defaultValue, setDefaultValue] = useState(data.defaultValue || '');
  const [required, setRequired] = useState(data.required || false);
  const [options, setOptions] = useState(data.options || '');
  const [validation, setValidation] = useState(data.validation || '');
  const [inputValue, setInputValue] = useState(data.inputValue || '');

  // 处理输入类型变更
  const handleInputTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setInputType(newType);
    if (data.onChange) {
      data.onChange({
        ...data,
        inputType: newType
      });
    }
  }, [data]);

  // 处理标签变更
  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    if (data.onChange) {
      data.onChange({
        ...data,
        label: newLabel
      });
    }
  }, [data]);

  // 处理占位符变更
  const handlePlaceholderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlaceholder = e.target.value;
    setPlaceholder(newPlaceholder);
    if (data.onChange) {
      data.onChange({
        ...data,
        placeholder: newPlaceholder
      });
    }
  }, [data]);

  // 处理默认值变更
  const handleDefaultValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDefaultValue = e.target.value;
    setDefaultValue(newDefaultValue);
    if (data.onChange) {
      data.onChange({
        ...data,
        defaultValue: newDefaultValue
      });
    }
  }, [data]);

  // 处理必填变更
  const handleRequiredChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newRequired = e.target.checked;
    setRequired(newRequired);
    if (data.onChange) {
      data.onChange({
        ...data,
        required: newRequired
      });
    }
  }, [data]);

  // 处理选项变更
  const handleOptionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newOptions = e.target.value;
    setOptions(newOptions);
    if (data.onChange) {
      data.onChange({
        ...data,
        options: newOptions
      });
    }
  }, [data]);

  // 处理验证变更
  const handleValidationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValidation = e.target.value;
    setValidation(newValidation);
    if (data.onChange) {
      data.onChange({
        ...data,
        validation: newValidation
      });
    }
  }, [data]);

  // 处理输入值变更
  const handleInputValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (data.onChange) {
      data.onChange({
        ...data,
        inputValue: newValue
      });
    }
  }, [data]);

  // 渲染输入控件
  const renderInputControl = () => {
    switch (inputType) {
      case 'text':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputValueChange}
            placeholder={placeholder}
            className="node-input"
            required={required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={inputValue}
            onChange={handleInputValueChange}
            placeholder={placeholder}
            className="node-input"
            required={required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={inputValue}
            onChange={handleInputValueChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            placeholder={placeholder}
            className="node-textarea"
            rows={4}
            required={required}
          />
        );
      
      case 'select':
        return (
          <select
            value={inputValue}
            onChange={handleInputValueChange as React.ChangeEventHandler<HTMLSelectElement>}
            className="node-select"
            required={required}
          >
            <option value="">{t('nodes.userInput.selectOption')}</option>
            {options.split('\n').filter(option => option.trim() !== '').map((option, index) => (
              <option key={index} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={inputValue === 'true'}
            onChange={(e) => handleInputValueChange({
              ...e,
              target: { ...e.target, value: e.target.checked ? 'true' : 'false' }
            } as React.ChangeEvent<HTMLInputElement>)}
            className="node-checkbox"
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={inputValue}
            onChange={handleInputValueChange}
            className="node-input"
            required={required}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputValueChange}
            placeholder={placeholder}
            className="node-input"
            required={required}
          />
        );
    }
  };

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.userInput.inputSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.userInput.inputType')}</label>
          <select
            value={inputType}
            onChange={handleInputTypeChange}
            className="node-select"
          >
            <option value="text">{t('nodes.userInput.text')}</option>
            <option value="number">{t('nodes.userInput.number')}</option>
            <option value="textarea">{t('nodes.userInput.textarea')}</option>
            <option value="select">{t('nodes.userInput.select')}</option>
            <option value="checkbox">{t('nodes.userInput.checkbox')}</option>
            <option value="date">{t('nodes.userInput.date')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.userInput.label')}</label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="node-input"
            placeholder={t('nodes.userInput.labelPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.userInput.placeholder')}</label>
          <input
            type="text"
            value={placeholder}
            onChange={handlePlaceholderChange}
            className="node-input"
            placeholder={t('nodes.userInput.placeholderPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.userInput.defaultValue')}</label>
          <input
            type="text"
            value={defaultValue}
            onChange={handleDefaultValueChange}
            className="node-input"
            placeholder={t('nodes.userInput.defaultValuePlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.userInput.required')}</label>
          <input
            type="checkbox"
            checked={required}
            onChange={handleRequiredChange}
            className="node-checkbox"
          />
        </div>
        
        {inputType === 'select' && (
          <div className="node-row">
            <label>{t('nodes.userInput.options')}</label>
            <textarea
              value={options}
              onChange={handleOptionsChange}
              className="node-textarea"
              rows={4}
              placeholder={t('nodes.userInput.optionsPlaceholder')}
            />
          </div>
        )}
        
        <div className="node-row">
          <label>{t('nodes.userInput.validation')}</label>
          <input
            type="text"
            value={validation}
            onChange={handleValidationChange}
            className="node-input"
            placeholder={t('nodes.userInput.validationPlaceholder')}
          />
        </div>
        
        <div className="node-section-header">
          <h3>{t('nodes.userInput.preview')}</h3>
        </div>
        
        <div className="node-row">
          <label>{label || t('nodes.userInput.inputLabel')}</label>
          {renderInputControl()}
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: label || t('nodes.userInput.title'),
    inputs: {
      prompt: {
        type: 'string',
        label: t('nodes.userInput.prompt'),
        description: t('nodes.userInput.promptDesc')
      },
      defaultValue: {
        type: 'any',
        label: t('nodes.userInput.defaultValue'),
        description: t('nodes.userInput.defaultValueDesc')
      }
    },
    outputs: {
      value: {
        type: 'any',
        label: t('nodes.userInput.value'),
        description: t('nodes.userInput.valueDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="USER_INPUT"
      isConnectable={isConnectable}
    />
  );
});

UserInputNode.displayName = 'UserInputNode';

export default UserInputNode;
