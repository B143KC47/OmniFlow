// 基础图标属性接口
export interface BaseIconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Provider图标类型
export type ProviderIconType = 'search' | 'ai' | 'database' | 'custom' | string;

// 状态图标类型
export type StatusType = 'connected' | 'error' | 'idle' | string;

// Provider图标属性接口
export interface ProviderIconProps extends BaseIconProps {
  provider: ProviderIconType;
}

// 状态图标属性接口
export interface StatusIconProps extends BaseIconProps {
  status: StatusType;
}