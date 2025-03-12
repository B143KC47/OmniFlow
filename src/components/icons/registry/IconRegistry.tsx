import { ProviderIconType, StatusType } from '../types/IconTypes';
import { 
  SearchIcon, 
  AiIcon, 
  DatabaseIcon, 
  CustomIcon, 
  DefaultIcon 
} from '../provider/ProviderIcons';
import {
  ConnectedIcon,
  ErrorIcon,
  IdleIcon
} from '../status/StatusIcons';

// Provider图标注册表
export const ProviderIconRegistry = new Map<ProviderIconType, React.FC>([
  ['search', SearchIcon],
  ['ai', AiIcon],
  ['database', DatabaseIcon],
  ['custom', CustomIcon],
  ['default', DefaultIcon]
]);

// 状态图标注册表
export const StatusIconRegistry = new Map<StatusType, React.FC>([
  ['connected', ConnectedIcon],
  ['error', ErrorIcon],
  ['idle', IdleIcon]
]);

// 获取Provider图标组件
export const getProviderIcon = (type: ProviderIconType): React.FC => {
  return ProviderIconRegistry.get(type) || DefaultIcon;
};

// 获取状态图标组件
export const getStatusIcon = (type: StatusType): React.FC => {
  return StatusIconRegistry.get(type) || IdleIcon;
};