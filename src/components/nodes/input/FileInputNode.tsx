import React, { memo, useCallback, useState, useRef } from 'react';
import BaseNode from '../BaseNode';
import { NodeData } from '../../../types';
import { useTranslation } from '../../../utils/i18n';

interface FileInputNodeProps {
  id: string;
  data: NodeData;
  selected: boolean;
  isConnectable: boolean;
  onDataChange: (nodeId: string, data: any) => void;
}

const FileInputNode = memo(({
  id,
  data,
  selected,
  isConnectable,
  onDataChange
}: FileInputNodeProps) => {
  const { t } = useTranslation();
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    type: string;
    preview?: string;
  } | null>(data.inputs?.file?.fileInfo || null);
  
  // 预览相关状态
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  
  // 解析参数
  const [parseOptions, setParseOptions] = useState({
    csvDelimiter: data.inputs?.csvDelimiter?.value || ',',
    encoding: data.inputs?.encoding?.value || 'UTF-8',
    jsonCompact: data.inputs?.jsonCompact?.value || false
  });
  
  // 处理文件上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 验证文件类型
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const supportedFormats = ['json', 'csv', 'txt', 'md', 'yaml', 'yml', 'xml'];
    
    if (fileExt && !supportedFormats.includes(fileExt)) {
      alert(t('nodes.fileInput.unsupportedFormat', { formats: supportedFormats.join(', ') }));
      return;
    }
    
    // 更新文件信息
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type || `application/${fileExt}` // 如果MIME类型未知，根据扩展名生成
    });
    
    // 重置预览状态
    setPreviewContent('');
    setPreviewError('');
    
    // 读取文件内容
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData: any = null;
        let previewText = '';
        
        // 根据文件类型尝试解析
        if (fileExt === 'json') {
          try {
            parsedData = JSON.parse(content);
            previewText = parseOptions.jsonCompact 
              ? JSON.stringify(parsedData)
              : JSON.stringify(parsedData, null, 2);
          } catch (e) {
            setPreviewError(t('nodes.fileInput.invalidJson'));
            previewText = content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
          }
        } else if (fileExt === 'csv') {
          // 简单CSV解析，更复杂的解析可以使用库
          try {
            const lines = content.split('\n');
            const delimiter = parseOptions.csvDelimiter;
            const headers = lines[0].split(delimiter);
            
            const rows = lines.slice(1).map(line => {
              const cells = line.split(delimiter);
              return headers.reduce((obj, header, index) => {
                obj[header.trim()] = cells[index] ? cells[index].trim() : '';
                return obj;
              }, {} as Record<string, string>);
            });
            
            parsedData = rows;
            previewText = JSON.stringify(rows.slice(0, 5), null, 2) + 
              (rows.length > 5 ? '\n// ... more rows ...' : '');
          } catch (e) {
            setPreviewError(t('nodes.fileInput.csvParseError'));
            previewText = content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
          }
        } else {
          // 文本文件，直接显示内容
          parsedData = content;
          previewText = content.substring(0, 1000) + (content.length > 1000 ? '...' : '');
        }
        
        setPreviewContent(previewText);
        
        // 更新节点数据
        onDataChange(id, {
          ...data,
          inputs: {
            ...data.inputs,
            file: {
              ...data.inputs?.file,
              value: content,
              fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type || `application/${fileExt}`
              }
            }
          },
          outputs: {
            ...data.outputs,
            fileContent: {
              type: fileExt === 'json' || fileExt === 'csv' ? 'object' : 'text',
              value: parsedData
            },
            fileName: {
              type: 'text',
              value: file.name
            },
            fileType: {
              type: 'text',
              value: fileExt
            }
          }
        });
        
      } catch (error: any) {
        setPreviewError(error.message || t('nodes.fileInput.readError'));
      }
    };
    
    reader.onerror = () => {
      setPreviewError(t('nodes.fileInput.readError'));
    };
    
    // 根据指定的编码读取文件
    reader.readAsText(file, parseOptions.encoding);
    
  }, [data, onDataChange, t, parseOptions]);
  
  // 处理CSV分隔符更改
  const handleDelimiterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDelimiter = e.target.value;
    setParseOptions(prev => ({ ...prev, csvDelimiter: newDelimiter }));
    
    // 更新输入选项
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        csvDelimiter: {
          ...data.inputs?.csvDelimiter,
          value: newDelimiter
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理编码更改
  const handleEncodingChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEncoding = e.target.value;
    setParseOptions(prev => ({ ...prev, encoding: newEncoding }));
    
    // 更新输入选项
    onDataChange(id, {
      ...data,
      inputs: {
        ...data.inputs,
        encoding: {
          ...data.inputs?.encoding,
          value: newEncoding
        }
      }
    });
  }, [data, onDataChange, id]);
  
  // 处理JSON格式选项更改
  const handleJsonFormatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isCompact = e.target.checked;
    setParseOptions(prev => ({ ...prev, jsonCompact: isCompact }));
    
    // 更新输入选项
    onDataChange({
      ...data,
      inputs: {
        ...data.inputs,
        jsonCompact: {
          ...data.inputs?.jsonCompact,
          value: isCompact
        }
      }
    });
  }, [data, onDataChange]);
  
  // 处理文件移除
  const handleRemoveFile = useCallback(() => {
    setFileInfo(null);
    setPreviewContent('');
    setPreviewError('');
    
    // 清除节点数据
    onDataChange({
      ...data,
      inputs: {
        ...data.inputs,
        file: {
          ...data.inputs?.file,
          value: null,
          fileInfo: null
        }
      },
      outputs: {
        ...data.outputs,
        fileContent: {
          type: 'null',
          value: null
        },
        fileName: {
          type: 'text',
          value: ''
        },
        fileType: {
          type: 'text',
          value: ''
        }
      }
    });
  }, [data, onDataChange]);
  
  // 切换预览的展开/折叠
  const togglePreview = useCallback(() => {
    setIsPreviewExpanded(!isPreviewExpanded);
  }, [isPreviewExpanded]);
  
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // 构建完整的节点数据
  const nodeData: NodeData = {
    ...data,
    label: data.label || t('nodes.fileInput.name'),
    inputs: {
      ...data.inputs,
      fileUpload: {
        type: 'custom',
        component: 'fileUpload',
        value: null,
        hidden: true // 隐藏默认输入框
      },
      encoding: {
        type: 'select',
        label: t('nodes.fileInput.encoding'),
        value: parseOptions.encoding,
        options: ['UTF-8', 'ASCII', 'ISO-8859-1', 'UTF-16']
      },
      csvDelimiter: {
        type: 'select',
        label: t('nodes.fileInput.delimiter'),
        value: parseOptions.csvDelimiter,
        options: [',', ';', '\\t', '|', ' ']
      },
      jsonCompact: {
        type: 'boolean',
        label: t('nodes.fileInput.compactJson'),
        value: parseOptions.jsonCompact
      }
    },
    outputs: {
      ...data.outputs,
      fileContent: {
        type: 'object',
        value: data.outputs?.fileContent?.value || null
      },
      fileName: {
        type: 'text',
        value: data.outputs?.fileName?.value || ''
      },
      fileType: {
        type: 'text',
        value: data.outputs?.fileType?.value || ''
      }
    },
    onChange: onDataChange
  };

  return (
    <>
      <BaseNode
        id={id}
        data={nodeData}
        selected={selected}
        isConnectable={isConnectable}
      />
      
      {/* 自定义文件上传区域 */}
      <div className="comfy-file-input-container" style={{ position: 'relative', zIndex: 20 }}>
        {fileInfo ? (
          <div className="comfy-file-info">
            <div className="comfy-file-header">
              <div className="comfy-file-name">{fileInfo.name}</div>
              <div className="comfy-file-meta">
                <span className="comfy-file-size">{formatFileSize(fileInfo.size)}</span>
                <span className="comfy-file-type">{fileInfo.type}</span>
              </div>
              <button 
                className="comfy-file-remove-btn" 
                onClick={handleRemoveFile}
                title={t('nodes.fileInput.remove')}
              >
                ✕
              </button>
            </div>
            
            {previewError && (
              <div className="comfy-file-error">
                {previewError}
              </div>
            )}
            
            {previewContent && (
              <div className="comfy-file-preview">
                <div 
                  className="comfy-file-preview-header"
                  onClick={togglePreview}
                >
                  <span>{t('nodes.fileInput.preview')}</span>
                  <span>{isPreviewExpanded ? '▼' : '►'}</span>
                </div>
                
                {isPreviewExpanded && (
                  <pre className="comfy-file-preview-content">
                    {previewContent}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="comfy-file-upload">
            <label htmlFor={`file-upload-${id}`} className="comfy-file-upload-label">
              {t('nodes.fileInput.upload')}
              <input
                id={`file-upload-${id}`}
                type="file"
                accept=".json,.csv,.txt,.md,.yaml,.yml,.xml"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="comfy-file-formats">
              {t('nodes.fileInput.formats')}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

FileInputNode.displayName = 'FileInputNode';

export default FileInputNode;