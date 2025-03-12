import React from 'react';
import { formControlStyles } from './McpFormGroup';

interface McpConfigEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showError?: boolean;
}

const McpConfigEditor: React.FC<McpConfigEditorProps> = ({
  value,
  onChange,
  error,
  showError = true
}) => {
  return (
    <>
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
        className={`config-editor ${error && showError ? 'has-error' : ''}`}
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
      {error && showError && (
        <div className="error-message">
          <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <style jsx>{`
        .config-help {
          margin-bottom: 12px;
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

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e91e63;
          font-size: 12px;
          margin-top: 4px;
        }

        .error-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
};

export default McpConfigEditor;