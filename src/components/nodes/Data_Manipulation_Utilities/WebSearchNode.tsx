import React, { memo, useCallback } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface WebSearchNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 网络搜索节点 - 用于执行网络搜索并返回结果
 * 
 * 功能：
 * - 支持多种搜索引擎
 * - 可配置搜索参数（结果数量、过滤器等）
 * - 返回结构化的搜索结果
 */
const WebSearchNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: WebSearchNodeProps) => {
  const { t } = useTranslation();
  
  // 处理查询变更
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        query: e.target.value
      });
    }
  }, [data]);

  // 处理最大结果数变更
  const handleMaxResultsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        maxResults: parseInt(e.target.value, 10)
      });
    }
  }, [data]);

  // 处理搜索引擎变更
  const handleSearchEngineChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    if (data.onChange) {
      data.onChange({
        ...data,
        searchEngine: e.target.value
      });
    }
  }, [data]);

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.webSearch.searchSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.webSearch.query')}</label>
          <input
            type="text"
            value={data.query || ''}
            onChange={handleQueryChange}
            className="node-input"
            placeholder={t('nodes.webSearch.queryPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.webSearch.resultCount')}</label>
          <input
            type="number"
            value={data.maxResults || 5}
            onChange={handleMaxResultsChange}
            className="node-input"
            min={1}
            max={20}
            step={1}
          />
        </div>
        
        <div className="node-row">
          <label>{t('nodes.webSearch.provider')}</label>
          <select
            value={data.searchEngine || 'google'}
            onChange={handleSearchEngineChange}
            className="node-select"
          >
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.webSearch.title'),
    inputs: {
      query: {
        type: 'string',
        label: t('nodes.webSearch.query'),
        description: t('nodes.webSearch.queryDesc')
      }
    },
    outputs: {
      results: {
        type: 'object',
        label: t('nodes.webSearch.results'),
        description: t('nodes.webSearch.resultsDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="WEB_SEARCH"
      isConnectable={isConnectable}
    />
  );
});

WebSearchNode.displayName = 'WebSearchNode';

export default WebSearchNode;
