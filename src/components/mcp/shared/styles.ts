// 公共表单控件样式
export const formControlStyles = `
  width: 100%;
  background: #1a1a1a;
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

  &::placeholder {
    color: #666;
  }
`;

// 按钮样式
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
    transition: all 0.2s ease;

    &:hover {
      background: #333;
    }
  `
};

// 弹窗样式
export const modalStyles = `
  background: #0f0f0f;
  border-radius: 8px;
  border: 1px solid #282828;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: #e0e0e0;
`;

// 错误消息样式
export const errorMessageStyles = `
  color: #e91e63;
  font-size: 12px;
  margin-top: 4px;
`;

// 编辑器样式
export const codeEditorStyles = `
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 12px;
  height: 200px;
  resize: vertical;
`;

// 图标基础样式
export const iconBaseStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;