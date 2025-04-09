import React, { memo, useCallback } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface ConditionNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 条件判断节点 - 用于根据条件控制工作流程
 * 
 * 功能：
 * - 支持多种条件表达式
 * - 提供真/假两个输出路径
 * - 可配置条件逻辑
 */
const ConditionNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: ConditionNodeProps) => {
  const { t } = useTranslation();

  // 处理条件类型变更
  const handleConditionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        conditionType: e.target.value
      });
    }
  }, [data]);

  // 处理条件表达式变更
  const handleExpressionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        expression: e.target.value
      });
    }
  }, [data]);

  // 处理值A变更
  const handleValueAChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        valueA: e.target.value
      });
    }
  }, [data]);

  // 处理操作符变更
  const handleOperatorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        operator: e.target.value
      });
    }
  }, [data]);

  // 处理值B变更
  const handleValueBChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        valueB: e.target.value
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.condition.conditionSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.condition.conditionType')}</label>
          <select
            value={data.conditionType || 'comparison'}
            onChange={handleConditionTypeChange}
            className="node-select"
          >
            <option value="comparison">{t('nodes.condition.comparison')}</option>
            <option value="expression">{t('nodes.condition.expression')}</option>
            <option value="exists">{t('nodes.condition.exists')}</option>
          </select>
        </div>
        
        {data.conditionType === 'expression' ? (
          <div className="node-row">
            <label>{t('nodes.condition.expression')}</label>
            <input
              type="text"
              value={data.expression || ''}
              onChange={handleExpressionChange}
              className="node-input"
              placeholder={t('nodes.condition.expressionPlaceholder')}
            />
          </div>
        ) : data.conditionType === 'comparison' ? (
          <>
            <div className="node-row">
              <label>{t('nodes.condition.valueA')}</label>
              <input
                type="text"
                value={data.valueA || ''}
                onChange={handleValueAChange}
                className="node-input"
                placeholder={t('nodes.condition.valueAPlaceholder')}
              />
            </div>
            
            <div className="node-row">
              <label>{t('nodes.condition.operator')}</label>
              <select
                value={data.operator || '=='}
                onChange={handleOperatorChange}
                className="node-select"
              >
                <option value="==">{t('nodes.condition.equals')}</option>
                <option value="!=">{t('nodes.condition.notEquals')}</option>
                <option value=">">{t('nodes.condition.greaterThan')}</option>
                <option value=">=">{t('nodes.condition.greaterThanOrEqual')}</option>
                <option value="<">{t('nodes.condition.lessThan')}</option>
                <option value="<=">{t('nodes.condition.lessThanOrEqual')}</option>
                <option value="contains">{t('nodes.condition.contains')}</option>
                <option value="startsWith">{t('nodes.condition.startsWith')}</option>
                <option value="endsWith">{t('nodes.condition.endsWith')}</option>
              </select>
            </div>
            
            <div className="node-row">
              <label>{t('nodes.condition.valueB')}</label>
              <input
                type="text"
                value={data.valueB || ''}
                onChange={handleValueBChange}
                className="node-input"
                placeholder={t('nodes.condition.valueBPlaceholder')}
              />
            </div>
          </>
        ) : (
          <div className="node-row">
            <label>{t('nodes.condition.checkValue')}</label>
            <input
              type="text"
              value={data.valueA || ''}
              onChange={handleValueAChange}
              className="node-input"
              placeholder={t('nodes.condition.checkValuePlaceholder')}
            />
          </div>
        )}
        
        <div className="node-row node-condition-preview">
          <div className="condition-branches">
            <div className="condition-branch true">
              <div className="branch-label">{t('nodes.condition.ifTrue')}</div>
              <div className="branch-arrow">↓</div>
            </div>
            <div className="condition-branch false">
              <div className="branch-label">{t('nodes.condition.ifFalse')}</div>
              <div className="branch-arrow">↓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.condition.title'),
    inputs: {
      condition: {
        type: 'any',
        label: t('nodes.condition.condition'),
        description: t('nodes.condition.conditionDesc')
      }
    },
    outputs: {
      true: {
        type: 'boolean',
        label: t('nodes.condition.true'),
        description: t('nodes.condition.trueDesc')
      },
      false: {
        type: 'boolean',
        label: t('nodes.condition.false'),
        description: t('nodes.condition.falseDesc')
      },
      result: {
        type: 'boolean',
        label: t('nodes.condition.result'),
        description: t('nodes.condition.resultDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="CONDITION"
      isConnectable={isConnectable}
    />
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;
