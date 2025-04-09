import React, { memo, useCallback, useEffect } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface LoopControlNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 循环控制节点 - 用于控制循环的执行流程
 * 
 * 功能：
 * - 支持多种控制类型（继续、中断、跳过）
 * - 提供条件控制
 * - 可配置最大迭代次数
 */
const LoopControlNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: LoopControlNodeProps) => {
  const { t } = useTranslation();

  // 处理控制类型变更
  const handleControlTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        controlType: e.target.value
      });
    }
  }, [data]);

  // 处理条件类型变更
  const handleConditionTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        conditionType: e.target.value
      });
    }
  }, [data]);

  // 处理表达式变更
  const handleExpressionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        expression: e.target.value
      });
    }
  }, [data]);

  // 处理迭代次数变更
  const handleIterationCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        iterationCount: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理最大迭代次数变更
  const handleMaxIterationsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        maxIterations: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.loopControl.controlSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.loopControl.controlType')}</label>
          <select
            value={data.controlType || 'continue'}
            onChange={handleControlTypeChange}
            className="node-select"
          >
            <option value="continue">{t('nodes.loopControl.continue')}</option>
            <option value="break">{t('nodes.loopControl.break')}</option>
            <option value="skip">{t('nodes.loopControl.skip')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.loopControl.conditionType')}</label>
          <select
            value={data.conditionType || 'always'}
            onChange={handleConditionTypeChange}
            className="node-select"
          >
            <option value="always">{t('nodes.loopControl.always')}</option>
            <option value="conditional">{t('nodes.loopControl.conditional')}</option>
            <option value="count">{t('nodes.loopControl.count')}</option>
          </select>
        </div>
        
        {data.conditionType === 'conditional' && (
          <div className="node-row">
            <label>{t('nodes.loopControl.expression')}</label>
            <input
              type="text"
              value={data.expression || ''}
              onChange={handleExpressionChange}
              className="node-input"
              placeholder={t('nodes.loopControl.expressionPlaceholder')}
            />
          </div>
        )}
        
        {data.conditionType === 'count' && (
          <div className="node-row">
            <label>{t('nodes.loopControl.iterations')}</label>
            <input
              type="number"
              value={data.iterationCount || 5}
              onChange={handleIterationCountChange}
              className="node-input"
              min={1}
              max={100}
              step={1}
            />
          </div>
        )}
        
        <div className="node-row">
          <label>{t('nodes.loopControl.maxIterations')}</label>
          <input
            type="number"
            value={data.maxIterations || 20}
            onChange={handleMaxIterationsChange}
            className="node-input"
            min={1}
            max={1000}
            step={1}
          />
        </div>
        
        <div className="node-row node-loop-control-preview">
          <div className="loop-control-visualization">
            <div className="control-type">
              {data.controlType === 'continue' ? (
                <span>{t('nodes.loopControl.continueLoop')}</span>
              ) : data.controlType === 'break' ? (
                <span>{t('nodes.loopControl.breakLoop')}</span>
              ) : (
                <span>{t('nodes.loopControl.skipIteration')}</span>
              )}
            </div>
            <div className="control-condition">
              {data.conditionType === 'always' ? (
                <span>{t('nodes.loopControl.alwaysExecute')}</span>
              ) : data.conditionType === 'conditional' ? (
                <span>{t('nodes.loopControl.whenCondition')} {data.expression || '...'}</span>
              ) : (
                <span>{t('nodes.loopControl.afterIterations')} {data.iterationCount || 5}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.loopControl.title'),
    inputs: {
      trigger: {
        type: 'trigger',
        label: t('nodes.loopControl.trigger'),
        description: t('nodes.loopControl.triggerDesc')
      },
      condition: {
        type: 'boolean',
        label: t('nodes.loopControl.condition'),
        description: t('nodes.loopControl.conditionDesc')
      }
    },
    outputs: {
      result: {
        type: 'trigger',
        label: t('nodes.loopControl.result'),
        description: t('nodes.loopControl.resultDesc')
      },
      iteration: {
        type: 'number',
        label: t('nodes.loopControl.iteration'),
        description: t('nodes.loopControl.iterationDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="LOOP_CONTROL"
      isConnectable={isConnectable}
    />
  );
});

LoopControlNode.displayName = 'LoopControlNode';

export default LoopControlNode;
