import React, { memo, useCallback } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types/index';
import { useTranslation } from '../../../utils/i18n';

interface FileOutputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: Partial<NodeData>) => void;
}

const FileOutputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: FileOutputNodeProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [previewContent, setPreviewContent] = React.useState<string>('');
  const [fileSize, setFileSize] = React.useState<number>(0);
  
  // 获取文件数据和元数据
  const fileData = data.inputs?.file?.value || null;
  const fileMetadata = data.inputs?.file?.metadata || {};
  
  // 准备文件预览
  React.useEffect(() => {
    if (!fileData) {
      setPreviewContent('');
      setFileSize(0);
      return;
    }
    
    // 如果是字符串数据（如JSON或文本）
    if (typeof fileData === 'string') {
      setPreviewContent(fileData.length > 2000 
        ? fileData.substring(0, 2000) + '...' 
        : fileData);
      setFileSize(new Blob([fileData]).size);
    }
    // 如果是Blob或File对象
    else if (fileData instanceof Blob) {
      setFileSize(fileData.size);
      
      // 尝试读取文件内容（仅适用于文本文件）
      if (fileData.type.startsWith('text/') || 
          fileData.type === 'application/json' ||
          fileData.type === 'application/xml' ||
          fileData.type === 'application/csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setPreviewContent(content.length > 2000 
            ? content.substring(0, 2000) + '...' 
            : content);
        };
        reader.readAsText(fileData);
      } else {
        setPreviewContent(t('nodes.fileOutput.binaryFile'));
      }
    } else {
      setPreviewContent(t('nodes.fileOutput.unsupportedFormat'));
    }
  }, [fileData, t]);
  
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 切换展开状态
  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);
  
  // 保存文件
  const saveFile = useCallback(() => {
    if (!fileData) return;
    
    try {
      let downloadUrl: string;
      let filename: string = fileMetadata.filename || `file_${new Date().toISOString().replace(/[:.]/g, '-')}`;
      
      // 如果文件数据是字符串
      if (typeof fileData === 'string') {
        const mimeType = getMimeTypeFromFormat(data.inputs?.format?.value || 'txt');
        const blob = new Blob([fileData], { type: mimeType });
        downloadUrl = URL.createObjectURL(blob);
        
        // 如果没有扩展名，添加一个
        if (!filename.includes('.')) {
          filename += `.${getExtensionFromFormat(data.inputs?.format?.value || 'txt')}`;
        }
      } 
      // 如果是Blob或File对象
      else if (fileData instanceof Blob) {
        downloadUrl = URL.createObjectURL(fileData);
        
        // 如果是File对象并且有名称
        if ('name' in fileData && fileData.name) {
          filename = fileData.name;
        }
      } else {
        throw new Error('Unsupported file data format');
      }
      
      // 创建下载链接并触发下载
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL对象
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    } catch (error) {
      console.error('Failed to save file:', error);
      alert(t('nodes.fileOutput.saveError'));
    }
  }, [fileData, fileMetadata, data.inputs?.format?.value, t]);
  
  // 根据文件格式获取MIME类型
  const getMimeTypeFromFormat = (format: string): string => {
    const mimeTypes: Record<string, string> = {
      'txt': 'text/plain',
      'json': 'application/json',
      'csv': 'text/csv',
      'xml': 'application/xml',
      'html': 'text/html',
      'md': 'text/markdown',
    };
    return mimeTypes[format] || 'application/octet-stream';
  };
  
  // 根据文件格式获取文件扩展名
  const getExtensionFromFormat = (format: string): string => {
    return format || 'txt';
  };
  
  // 处理格式变更
  const handleFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        format: {
          ...data.inputs?.format,
          value: e.target.value
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理自动保存设置变更
  const handleAutoSaveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        autoSave: {
          ...data.inputs?.autoSave,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理自动保存 - 文件数据变化时触发
  React.useEffect(() => {
    if (data.inputs?.autoSave?.value && fileData) {
      saveFile();
    }
  }, [fileData, data.inputs?.autoSave?.value, saveFile]);
  
  // 美化JSON预览
  const formatJsonPreview = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  }, []);
  
  // 获取预览内容
  const getFormattedPreview = useCallback(() => {
    if (!previewContent) return '';
    
    // 如果是JSON格式且用户选择了格式化选项
    if (data.inputs?.format?.value === 'json' && data.inputs?.prettyPrint?.value) {
      return formatJsonPreview(previewContent);
    }
    
    return previewContent;
  }, [previewContent, data.inputs?.format?.value, data.inputs?.prettyPrint?.value, formatJsonPreview]);
  
  // 处理格式化选项变更
  const handlePrettyPrintChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(id, {
      inputs: {
        ...data.inputs,
        prettyPrint: {
          ...data.inputs?.prettyPrint,
          value: e.target.checked
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 构建节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.fileOutput.name'),
    inputs: {
      ...data.inputs,
      file: {
        type: 'file',
        value: fileData,
        metadata: fileMetadata,
        label: t('nodes.fileOutput.input')
      },
      format: {
        type: 'select',
        value: data.inputs?.format?.value || 'txt',
        options: ['txt', 'json', 'csv', 'xml', 'html', 'md', 'binary'],
        label: t('nodes.fileOutput.format')
      },
      prettyPrint: {
        type: 'boolean',
        value: data.inputs?.prettyPrint?.value || false,
        label: t('nodes.fileOutput.prettyPrint')
      },
      autoSave: {
        type: 'boolean',
        value: data.inputs?.autoSave?.value || false,
        label: t('nodes.fileOutput.autoSave')
      }
    },
    outputs: {
      ...data.outputs,
      // 文件输出节点通常不提供输出端口，因为它是工作流的终点
    },
    onChange: (nodeId, data) => onDataChange(nodeId, data)
  };

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义文件输出区域 */}
      <div className="comfy-file-output-container" style={{ position: 'relative', zIndex: 20 }}>
        <div className="comfy-file-output-tools">
          <button 
            className={`comfy-file-output-expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpand}
            title={isExpanded ? t('nodes.fileOutput.collapse') : t('nodes.fileOutput.expand')}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
          
          <button
            className="comfy-file-output-save-btn"
            onClick={saveFile}
            title={t('nodes.fileOutput.save')}
            disabled={!fileData}
          >
            💾
          </button>
          
          <div className="comfy-file-output-options">
            <label className="comfy-file-output-option">
              <span>{t('nodes.fileOutput.format')}</span>
              <select
                value={data.inputs?.format?.value || 'txt'}
                onChange={handleFormatChange}
                disabled={fileData instanceof File}
              >
                <option value="txt">TXT</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="html">HTML</option>
                <option value="md">Markdown</option>
                <option value="binary">Binary</option>
              </select>
            </label>
            
            {data.inputs?.format?.value === 'json' && (
              <label className="comfy-file-output-option">
                <input
                  type="checkbox"
                  checked={data.inputs?.prettyPrint?.value || false}
                  onChange={handlePrettyPrintChange}
                />
                <span>{t('nodes.fileOutput.prettyPrint')}</span>
              </label>
            )}
            
            <label className="comfy-file-output-option">
              <input
                type="checkbox"
                checked={data.inputs?.autoSave?.value || false}
                onChange={handleAutoSaveChange}
              />
              <span>{t('nodes.fileOutput.autoSave')}</span>
            </label>
          </div>
        </div>
        
        <div 
          className={`comfy-file-output-content ${isExpanded ? 'expanded' : ''}`}
          style={{ 
            maxHeight: isExpanded ? '500px' : '200px',
            overflowY: 'auto'
          }}
        >
          {fileData ? (
            <>
              <div className="comfy-file-preview">
                {previewContent ? (
                  <pre className="comfy-file-preview-content">
                    {getFormattedPreview()}
                  </pre>
                ) : (
                  <div className="comfy-file-binary-indicator">
                    {t('nodes.fileOutput.binaryFile')}
                  </div>
                )}
              </div>
              
              <div className="comfy-file-metadata">
                {fileMetadata.filename && (
                  <div className="comfy-file-name">
                    {t('nodes.fileOutput.filename')}: {fileMetadata.filename}
                  </div>
                )}
                <div className="comfy-file-size">
                  {t('nodes.fileOutput.size')}: {formatFileSize(fileSize)}
                </div>
                {fileMetadata.type && (
                  <div className="comfy-file-type">
                    {t('nodes.fileOutput.type')}: {fileMetadata.type}
                  </div>
                )}
                {fileMetadata.lastModified && (
                  <div className="comfy-file-modified">
                    {t('nodes.fileOutput.modified')}: {
                      new Date(fileMetadata.lastModified).toLocaleString()
                    }
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="comfy-file-placeholder">
              {t('nodes.fileOutput.noFile')}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

FileOutputNode.displayName = 'FileOutputNode';

export default FileOutputNode;