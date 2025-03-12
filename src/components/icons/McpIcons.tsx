import React from 'react';
import { ProviderIconProps, StatusIconProps } from './types/IconTypes';
import { getProviderIcon, getStatusIcon } from './registry/IconRegistry';

// Provider Icon组件
export const ProviderIcon: React.FC<ProviderIconProps> = ({ 
  provider, 
  size = 16,
  className = '',
  color 
}) => {
  // SVG字符串直接渲染
  if (typeof provider === 'string' && provider.startsWith('<svg')) {
    return (
      <div 
        className={className} 
        dangerouslySetInnerHTML={{ __html: provider }} 
      />
    );
  }

  const IconComponent = getProviderIcon(provider);
  return <IconComponent />;
};

// Status Icon组件
export const StatusIcon: React.FC<StatusIconProps> = ({ 
  status, 
  size = 12,
  className = '',
  color 
}) => {
  const IconComponent = getStatusIcon(status);
  return <IconComponent />;
};

// 重新导出所有图标相关类型
export * from './types/IconTypes';