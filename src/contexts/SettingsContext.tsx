import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * 应用程序设置类型定义
 */
export interface AppSettings {
  appearance: {
    reduceAnimations: boolean;
    showBackgroundPattern: boolean;
    theme: 'system' | 'dark' | 'light';
  };
  workflow: {
    autoSave: boolean;
    autoSaveInterval: number; // 分钟
    showNodeTooltips: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
  mcp: {
    autoConnect: boolean;
    retryOnError: boolean;
    retryAttempts: number;
    timeoutSeconds: number;
  };
}

/**
 * 默认设置值
 */
export const defaultSettings: AppSettings = {
  appearance: {
    reduceAnimations: false,
    showBackgroundPattern: true,
    theme: 'system',
  },
  workflow: {
    autoSave: true,
    autoSaveInterval: 5,
    showNodeTooltips: true,
    snapToGrid: true,
    gridSize: 20,
  },
  mcp: {
    autoConnect: true,
    retryOnError: true,
    retryAttempts: 3,
    timeoutSeconds: 30,
  },
};

/**
 * 设置上下文值类型定义
 */
interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateCategorySettings: <T extends keyof AppSettings>(
    category: T,
    settings: Partial<AppSettings[T]>
  ) => void;
  resetSettings: () => void;
}

// 创建上下文
const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/**
 * 使用设置的钩子
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings 必须在 SettingsProvider 内部使用');
  }
  return context;
}

/**
 * 设置提供者组件
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // 从localStorage加载或使用默认设置
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        // 深度合并默认设置和保存的设置，确保新添加的设置属性也能正常工作
        const parsedSettings = JSON.parse(savedSettings);
        return {
          appearance: { ...defaultSettings.appearance, ...parsedSettings.appearance },
          workflow: { ...defaultSettings.workflow, ...parsedSettings.workflow },
          mcp: { ...defaultSettings.mcp, ...parsedSettings.mcp },
        };
      }
      return defaultSettings;
    } catch (error) {
      console.error('加载设置失败:', error);
      return defaultSettings;
    }
  });

  // 当设置改变时保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }, [settings]);

  // 更新整个设置对象
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  // 更新特定类别的设置
  const updateCategorySettings = <T extends keyof AppSettings>(
    category: T,
    categorySettings: Partial<AppSettings[T]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...categorySettings,
      },
    }));
  };

  // 重置所有设置到默认值
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        updateCategorySettings,
        resetSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}