import React, { memo, useCallback } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface LoopNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 循环节点 - 用于重复执行工作流的某个部分
 * 
 * 功能：
 * - 支持多种循环类型（固定次数、条件循环、遍历数组）
 * - 提供循环控制（继续、中断）
 * - 可配置循环参数
 */
const LoopNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: LoopNodeProps) => {
  const { t } = useTranslation();

  // 处理循环类型变更
  const handleLoopTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        loopType: e.target.value
      });
    }
  }, [data]);

  // 处理循环次数变更
  const handleCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        count: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理条件表达式变更
  const handleConditionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        condition: e.target.value
      });
    }
  }, [data]);

  // 处理数组变量变更
  const handleArrayVarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        arrayVar: e.target.value
      });
    }
  }, [data]);

  // 处理迭代变量变更
  const handleIterVarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        iterVar: e.target.value
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.loop.loopSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.loop.loopType')}</label>
          <select
            value={data.loopType || 'count'}
            onChange={handleLoopTypeChange}
            className="node-select"
          >
            <option value="count">{t('nodes.loop.countLoop')}</option>
            <option value="while">{t('nodes.loop.whileLoop')}</option>
            <option value="forEach">{t('nodes.loop.forEachLoop')}</option>
          </select>
        </div>
        
        {data.loopType === 'count' && (
          <div className="node-row">
            <label>{t('nodes.loop.count')}</label>
            <input
              type="number"
              value={data.count || 5}
              onChange={handleCountChange}
              className="node-input"
              min={1}
              max={1000}
              step={1}
            />
          </div>
        )}
        
        {data.loopType === 'while' && (
          <div className="node-row">
            <label>{t('nodes.loop.condition')}</label>
            <input
              type="text"
              value={data.condition || ''}
              onChange={handleConditionChange}
              className="node-input"
              placeholder={t('nodes.loop.conditionPlaceholder')}
            />
          </div>
        )}
        
        {data.loopType === 'forEach' && (
          <>
            <div className="node-row">
              <label>{t('nodes.loop.arrayVar')}</label>
              <input
                type="text"
                value={data.arrayVar || ''}
                onChange={handleArrayVarChange}
                className="node-input"
                placeholder={t('nodes.loop.arrayVarPlaceholder')}
              />
            </div>
            
            <div className="node-row">
              <label>{t('nodes.loop.iterVar')}</label>
              <input
                type="text"
                value={data.iterVar || 'item'}
                onChange={handleIterVarChange}
                className="node-input"
                placeholder={t('nodes.loop.iterVarPlaceholder')}
              />
            </div>
          </>
        )}
        
        <div className="node-row node-loop-preview">
          <div className="loop-visualization">
            <div className="loop-start">{t('nodes.loop.start')}</div>
            <div className="loop-body">
              <div className="loop-iteration">
                {data.loopType === 'count' ? (
                  <span>{t('nodes.loop.iteration')} 1 to {data.count || 5}</span>
                ) : data.loopType === 'while' ? (
                  <span>{t('nodes.loop.whileCondition')} {data.condition || '...'}</span>
                ) : (
                  <span>{t('nodes.loop.forEachItem')} {data.iterVar || 'item'} in {data.arrayVar || '...'}</span>
                )}
              </div>
            </div>
            <div className="loop-end">{t('nodes.loop.end')}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.loop.title'),
    inputs: {
      start: {
        type: 'trigger',
        label: t('nodes.loop.start'),
        description: t('nodes.loop.startDesc')
      },
      ...(data.loopType === 'count' ? {
        count: {
          type: 'number',
          label: t('nodes.loop.count'),
          description: t('nodes.loop.countDesc')
        }
      } : data.loopType === 'while' ? {
        condition: {
          type: 'boolean',
          label: t('nodes.loop.condition'),
          description: t('nodes.loop.conditionDesc')
        }
      } : {
        array: {
          type: 'array',
          label: t('nodes.loop.array'),
          description: t('nodes.loop.arrayDesc')
        }
      })
    },
    outputs: {
      body: {
        type: 'trigger',
        label: t('nodes.loop.body'),
        description: t('nodes.loop.bodyDesc')
      },
      completed: {
        type: 'trigger',
        label: t('nodes.loop.completed'),
        description: t('nodes.loop.completedDesc')
      },
      index: {
        type: 'number',
        label: t('nodes.loop.index'),
        description: t('nodes.loop.indexDesc')
      },
      ...(data.loopType === 'forEach' ? {
        item: {
          type: 'any',
          label: t('nodes.loop.item'),
          description: t('nodes.loop.itemDesc')
        }
      } : {})
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="LOOP"
      isConnectable={isConnectable}
    />
  );
});

LoopNode.displayName = 'LoopNode';

export default LoopNode;
