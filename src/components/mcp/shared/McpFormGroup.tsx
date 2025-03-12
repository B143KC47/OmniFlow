import React from 'react';

interface McpFormGroupProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const McpFormGroup: React.FC<McpFormGroupProps> = ({
  label,
  error,
  required,
  children
}) => {
  return (
    <div className="mcp-form-group">
      <label className="form-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {children}
      {error && (
        <div className="error-message">
          <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <style jsx>{`
        .mcp-form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #e0e0e0;
        }

        .required-mark {
          color: #e91e63;
          margin-left: 4px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e91e63;
          font-size: 12px;
          margin-top: 4px;
          animation: fadeIn 0.2s ease-out;
        }

        .error-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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