import React, { memo, useCallback, useState } from 'react';
import BaseNodeComponent from '../BaseNodeComponent';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface LoggerNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
}

/**
 * 日志节点 - 用于记录和显示工作流中的数据
 * 
 * 功能：
 * - 支持多种日志级别（信息、警告、错误等）
 * - 提供日志过滤和搜索
 * - 可配置日志格式
 */
const LoggerNode = memo(({
  id,
  data,
  selected,
  isConnectable
}: LoggerNodeProps) => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<Array<{level: string, message: string, timestamp: string}>>(
    data.logs || []
  );
  const [logLevel, setLogLevel] = useState(data.logLevel || 'info');
  const [logFormat, setLogFormat] = useState(data.logFormat || '[{timestamp}] [{level}] {message}');
  const [filterText, setFilterText] = useState('');

  // 处理日志级别变更
  const handleLogLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    setLogLevel(newLevel);
    if (data.onChange) {
      data.onChange({
        ...data,
        logLevel: newLevel
      });
    }
  }, [data]);

  // 处理日志格式变更
  const handleLogFormatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFormat = e.target.value;
    setLogFormat(newFormat);
    if (data.onChange) {
      data.onChange({
        ...data,
        logFormat: newFormat
      });
    }
  }, [data]);

  // 处理过滤文本变更
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  }, []);

  // 添加日志
  const handleAddLog = useCallback(() => {
    const newLog = {
      level: logLevel,
      message: `Test log message at ${new Date().toLocaleTimeString()}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    
    if (data.onChange) {
      data.onChange({
        ...data,
        logs: updatedLogs
      });
    }
  }, [logs, logLevel, data]);

  // 清除日志
  const handleClearLogs = useCallback(() => {
    setLogs([]);
    if (data.onChange) {
      data.onChange({
        ...data,
        logs: []
      });
    }
  }, [data]);

  // 格式化日志
  const formatLog = useCallback((log: {level: string, message: string, timestamp: string}) => {
    return logFormat
      .replace('{timestamp}', new Date(log.timestamp).toLocaleString())
      .replace('{level}', log.level.toUpperCase())
      .replace('{message}', log.message);
  }, [logFormat]);

  // 过滤日志
  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filterText.toLowerCase()) ||
    log.level.toLowerCase().includes(filterText.toLowerCase())
  );

  // 自定义内容渲染
  const renderCustomContent = () => (
    <div className="node-custom-content">
      <div className="node-section">
        <div className="node-section-header">
          <h3>{t('nodes.logger.loggerSettings')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.logger.logLevel')}</label>
          <select
            value={logLevel}
            onChange={handleLogLevelChange}
            className="node-select"
          >
            <option value="debug">{t('nodes.logger.debug')}</option>
            <option value="info">{t('nodes.logger.info')}</option>
            <option value="warning">{t('nodes.logger.warning')}</option>
            <option value="error">{t('nodes.logger.error')}</option>
          </select>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.logger.logFormat')}</label>
          <input
            type="text"
            value={logFormat}
            onChange={handleLogFormatChange}
            className="node-input"
            placeholder={t('nodes.logger.logFormatPlaceholder')}
          />
        </div>
        
        <div className="node-row">
          <div className="node-button-group">
            <button 
              onClick={handleAddLog}
              className="node-button"
            >
              {t('nodes.logger.addTestLog')}
            </button>
            <button 
              onClick={handleClearLogs}
              className="node-button"
            >
              {t('nodes.logger.clearLogs')}
            </button>
          </div>
        </div>
        
        <div className="node-section-header">
          <h3>{t('nodes.logger.logs')}</h3>
        </div>
        
        <div className="node-row">
          <label>{t('nodes.logger.filter')}</label>
          <input
            type="text"
            value={filterText}
            onChange={handleFilterChange}
            className="node-input"
            placeholder={t('nodes.logger.filterPlaceholder')}
          />
        </div>
        
        <div className="node-logs-container">
          {filteredLogs.length > 0 ? (
            <div className="node-logs">
              {filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`node-log node-log-${log.level}`}
                >
                  {formatLog(log)}
                </div>
              ))}
            </div>
          ) : (
            <div className="node-logs-empty">
              {t('nodes.logger.noLogs')}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 构建节点数据
  const nodeData = {
    ...data,
    label: data.label || t('nodes.logger.title'),
    inputs: {
      message: {
        type: 'string',
        label: t('nodes.logger.message'),
        description: t('nodes.logger.messageDesc')
      },
      level: {
        type: 'string',
        label: t('nodes.logger.level'),
        description: t('nodes.logger.levelDesc')
      }
    },
    outputs: {
      logs: {
        type: 'array',
        label: t('nodes.logger.logs'),
        description: t('nodes.logger.logsDesc')
      }
    },
    customContent: renderCustomContent()
  };

  return (
    <BaseNodeComponent
      id={id}
      data={nodeData}
      selected={selected}
      type="LOGGER"
      isConnectable={isConnectable}
    />
  );
});

LoggerNode.displayName = 'LoggerNode';

export default LoggerNode;
