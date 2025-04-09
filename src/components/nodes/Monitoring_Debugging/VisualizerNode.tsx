import React, { memo, useCallback, useState } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface VisualizerNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 可视化节点 - 用于可视化工作流中的数据
 * 
 * 功能：
 * - 支持多种可视化类型（表格、图表、JSON等）
 * - 提供数据过滤和转换
 * - 可配置可视化参数
 */
const VisualizerNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: VisualizerNodeProps) => {
  const { t } = useTranslation();
  const [visualizationType, setVisualizationType] = useState(data.visualizationType || 'table');
  const [sampleData, setSampleData] = useState<any>(data.sampleData || null);

  // 处理可视化类型变更
  const handleVisualizationTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setVisualizationType(newType);
    if (data.onChange) {
      data.onChange({
        ...data,
        visualizationType: newType
      });
    }
  }, [data]);

  // 生成示例数据
  const generateSampleData = useCallback(() => {
    let newData;
    
    switch (visualizationType) {
      case 'table':
        newData = [
          { id: 1, name: 'Item 1', value: 100 },
          { id: 2, name: 'Item 2', value: 200 },
          { id: 3, name: 'Item 3', value: 150 }
        ];
        break;
      case 'chart':
        newData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          values: [65, 59, 80, 81, 56]
        };
        break;
      case 'json':
        newData = {
          user: {
            id: 123,
            name: 'John Doe',
            email: 'john@example.com',
            preferences: {
              theme: 'dark',
              notifications: true
            }
          },
          stats: {
            visits: 45,
            actions: 12
          }
        };
        break;
      case 'text':
        newData = "This is a sample text visualization.\nIt can display multiple lines of text.\nUseful for showing logs or formatted output.";
        break;
      default:
        newData = null;
    }
    
    setSampleData(newData);
    if (data.onChange) {
      data.onChange({
        ...data,
        sampleData: newData
      });
    }
  }, [visualizationType, data]);

  // 清除示例数据
  const handleClearData = useCallback(() => {
    setSampleData(null);
    if (data.onChange) {
      data.onChange({
        ...data,
        sampleData: null
      });
    }
  }, [data]);

  // 渲染可视化内容
  const renderVisualization = () => {
    if (!sampleData) {
      return (
        <div className="node-visualization-empty">
          {t('nodes.visualizer.noData')}
        </div>
      );
    }
    
    switch (visualizationType) {
      case 'table':
        return (
          <div className="node-table-visualization">
            <table className="node-table">
              <thead>
                <tr>
                  {Object.keys(sampleData[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row: any, index: number) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, i: number) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'chart':
        return (
          <div className="node-chart-visualization">
            <div className="node-chart">
              <div className="chart-container">
                {/* 简单的柱状图可视化 */}
                <div className="chart-bars">
                  {sampleData.values.map((value: number, index: number) => (
                    <div key={index} className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${value}%` }}
                      />
                      <div className="chart-label">{sampleData.labels[index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'json':
        return (
          <div className="node-json-visualization">
            <pre className="node-json">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </div>
        );
      
      case 'text':
        return (
          <div className="node-text-visualization">
            <pre className="node-text">
              {sampleData}
            </pre>
          </div>
        );
      
      default:
        return (
          <div className="node-visualization-empty">
            {t('nodes.visualizer.unsupportedType')}
          </div>
        );
    }
  };

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.visualizer.visualizationSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.visualizer.visualizationType')}</label>
          <select
            value={visualizationType}
            onChange={handleVisualizationTypeChange}
            className="node-select"
          >
            <option value="table">{t('nodes.visualizer.table')}</option>
            <option value="chart">{t('nodes.visualizer.chart')}</option>
            <option value="json">{t('nodes.visualizer.json')}</option>
            <option value="text">{t('nodes.visualizer.text')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <div className="node-button-group">
            <button 
              onClick={generateSampleData}
              className="node-button"
            >
              {t('nodes.visualizer.generateSample')}
            </button>
            <button 
              onClick={handleClearData}
              className="node-button"
            >
              {t('nodes.visualizer.clearData')}
            </button>
          </div>
        </div>
        
        <div className="node-section-header">
          <h3>{t('nodes.visualizer.preview')}</h3>
        </div>
        
        <div className="node-visualization-container">
          {renderVisualization()}
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.visualizer.title'),
    inputs: {
      data: {
        type: 'any',
        label: t('nodes.visualizer.data'),
        description: t('nodes.visualizer.dataDesc')
      },
      options: {
        type: 'object',
        label: t('nodes.visualizer.options'),
        description: t('nodes.visualizer.optionsDesc')
      }
    },
    outputs: {
      visualization: {
        type: 'object',
        label: t('nodes.visualizer.visualization'),
        description: t('nodes.visualizer.visualizationDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="VISUALIZER"
      isConnectable={isConnectable}
    />
  );
});

VisualizerNode.displayName = 'VisualizerNode';

export default VisualizerNode;
