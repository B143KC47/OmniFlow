// 错误类型枚举
export enum ErrorType {
  JSON_PARSE = 'JSON_PARSE',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  OPERATION_FAILED = 'OPERATION_FAILED'
}

// 错误信息映射
const errorMessages: Record<ErrorType, string> = {
  [ErrorType.JSON_PARSE]: '配置JSON格式不正确',
  [ErrorType.PROVIDER_NOT_FOUND]: '找不到指定的服务提供商',
  [ErrorType.CONNECTION_FAILED]: '连接测试失败',
  [ErrorType.INVALID_CONFIG]: '无效的配置信息',
  [ErrorType.OPERATION_FAILED]: '操作失败'
};

// MCP操作错误类
export class McpError extends Error {
  constructor(
    public type: ErrorType,
    public originalError?: Error
  ) {
    super(errorMessages[type]);
    this.name = 'McpError';
  }
}

// 错误处理工具函数
export const handleMcpError = (error: unknown): string => {
  if (error instanceof McpError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '未知错误';
};

// JSON解析错误处理
export const handleJsonParseError = (error: unknown): McpError => {
  return new McpError(
    ErrorType.JSON_PARSE,
    error instanceof Error ? error : undefined
  );
};

// 连接测试错误处理
export const handleConnectionError = (error: unknown): McpError => {
  return new McpError(
    ErrorType.CONNECTION_FAILED,
    error instanceof Error ? error : undefined
  );
};

// 配置验证错误处理
export const handleConfigValidationError = (error: unknown): McpError => {
  return new McpError(
    ErrorType.INVALID_CONFIG,
    error instanceof Error ? error : undefined
  );
};

// 显示错误提示
export const showErrorMessage = (error: unknown): void => {
  const message = handleMcpError(error);
  alert(message);
};