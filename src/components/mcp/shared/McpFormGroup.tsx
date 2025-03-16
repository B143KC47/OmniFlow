import React from 'react';

interface McpFormGroupProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const McpFormGroup: React.FC<McpFormGroupProps> = ({ 
  label, 
  error,
  required,
  className = '',
  children
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="form-error">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// 导出表单控件通用样式
export const formControlStyles = `
  width: 100%;
  background: #282828;
  border: 1px solid #333;
  color: #e0e0e0;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10a37f;
    box-shadow: 0 0 0 1px rgba(16, 163, 127, 0.2);
  }

  &.has-error {
    border-color: #e91e63;
  }

  &.has-error:focus {
    box-shadow: 0 0 0 1px rgba(233, 30, 99, 0.2);
  }
`;

// 导出按钮通用样式
export const buttonStyles = {
  primary: `
    background: #10a37f;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 80px;

    &:hover {
      background: #0c8c6a;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  secondary: `
    background: #282828;
    border: 1px solid #333;
    color: #e0e0e0;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
    min-width: 80px;
    transition: all 0.2s ease;

    &:hover {
      background: #333;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
};

// 导出配置编辑器样式
export const configEditorStyles = `
  width: 100%;
  height: 300px;
  background: #282828;
  border: 1px solid #333;
  color: #e0e0e0;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #10a37f;
    box-shadow: 0 0 0 1px rgba(16, 163, 127, 0.2);
  }

  &.has-error {
    border-color: #e91e63;
  }

  &.has-error:focus {
    box-shadow: 0 0 0 1px rgba(233, 30, 99, 0.2);
  }
`;

// 导出配置帮助样式
export const configHelpStyles = `
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(16, 163, 127, 0.1);
  border: 1px solid rgba(16, 163, 127, 0.2);
  border-radius: 4px;
  font-size: 13px;

  p {
    margin: 0 0 8px 0;
    color: #10a37f;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: #888;
  }

  code {
    background: rgba(16, 163, 127, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    color: #10a37f;
  }
`;

// 导出帮助文本样式
export const helpTextStyles = `
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

// 添加配置编辑器组件
interface ConfigEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hasError?: boolean;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({
  value,
  onChange,
  error,
  hasError
}) => {
  return (
    <div className="config-section">
      <div className="config-help">
        <p>支持的配置项:</p>
        <ul>
          <li><code>apiKey</code>: API密钥</li>
          <li><code>endpoint</code>: 服务端点URL</li>
          <li><code>options</code>: 其他配置选项</li>
        </ul>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`config-editor ${hasError ? 'has-error' : ''}`}
        placeholder='例如:
{
  "apiKey": "your-api-key",
  "endpoint": "https://api.example.com",
  "options": {
    "timeout": 30000,
    "maxRetries": 3
  }
}'
      />

      <style jsx>{`
        .config-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .config-help {
          padding: 12px;
          background: rgba(16, 163, 127, 0.1);
          border: 1px solid rgba(16, 163, 127, 0.2);
          border-radius: 4px;
          font-size: 13px;
        }

        .config-help p {
          margin: 0 0 8px 0;
          color: #10a37f;
        }

        .config-help ul {
          margin: 0;
          padding-left: 20px;
          color: #888;
        }

        .config-help code {
          background: rgba(16, 163, 127, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          color: #10a37f;
        }

        .config-editor {
          ${formControlStyles}
          height: 200px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          resize: vertical;
        }

        .config-editor.has-error {
          border-color: #e91e63;
        }

        .config-editor.has-error:focus {
          box-shadow: 0 0 0 1px rgba(233, 30, 99, 0.2);
        }
      `}</style>
    </div>
  );
};

export default McpFormGroup;