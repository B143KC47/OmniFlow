import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * 应用程序设置类型定义
 */
export interface AppSettings {
  appearance: {
    reduceAnimations: boolean;
    showBackgroundPattern: boolean;
    theme: 'system' | 'dark' | 'light';
    language: 'zh-CN' | 'en-US'; // 添加语言设置
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
    language: 'zh-CN', // 默认语言为中文
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
  isUpdating: boolean;
}

// 创建上下文
export const SettingsContext = createContext<SettingsContextValue>({
  settings: defaultSettings,
  updateSettings: () => {},
  updateCategorySettings: () => {},
  resetSettings: () => {},
  isUpdating: false
});

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

// 深度合并函数
const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        result[key] = deepMerge(targetValue as object, sourceValue as object) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return result;
};

/**
 * 设置提供者组件
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return deepMerge(defaultSettings, parsedSettings);
      }
      return defaultSettings;
    } catch (error) {
      console.error('加载设置失败:', error);
      return defaultSettings;
    }
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  // 保存设置到localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(newSettings));
      
      // 更新HTML的数据属性
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newSettings.appearance.theme);
        document.documentElement.setAttribute('data-reduce-animations', 
          String(newSettings.appearance.reduceAnimations));
        document.documentElement.setAttribute('data-language', 
          newSettings.appearance.language);
      }
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }, []);

  // 更新整个设置对象
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setIsUpdating(true);
    setSettings(prev => {
      const updated = deepMerge(prev, newSettings);
      saveSettings(updated);
      return updated;
    });
    // 使用requestAnimationFrame确保DOM更新后再清除更新状态
    requestAnimationFrame(() => setIsUpdating(false));
  }, [saveSettings]);

  // 更新特定类别的设置
  const updateCategorySettings = useCallback(<T extends keyof AppSettings>(
    category: T,
    categorySettings: Partial<AppSettings[T]>
  ) => {
    setIsUpdating(true);
    setSettings(prev => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          ...categorySettings,
        },
      };
      saveSettings(updated);
      return updated;
    });
    requestAnimationFrame(() => setIsUpdating(false));
  }, [saveSettings]);

  // 重置所有设置到默认值
  const resetSettings = useCallback(() => {
    setIsUpdating(true);
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    requestAnimationFrame(() => setIsUpdating(false));
  }, [saveSettings]);

  // 当设置变化时保存到localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  const value = {
    settings,
    updateSettings,
    updateCategorySettings,
    resetSettings,
    isUpdating
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}