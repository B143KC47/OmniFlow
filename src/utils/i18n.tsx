import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

// 导入语言文件
import zhMessages from '../messages/zh.json';
import enMessages from '../messages/en.json';

// 检查是否在客户端环境
const isClient = typeof window !== 'undefined';

// 语言资源类型
interface Messages {
  [key: string]: any;
}

// 支持的语言
export type SupportedLanguage = 'zh-CN' | 'en-US';

// 语言映射
const languageResources: Record<SupportedLanguage, Messages> = {
  'zh-CN': zhMessages,
  'en-US': enMessages
};

// 语言名称映射
export const languageNames: Record<SupportedLanguage, string> = {
  'zh-CN': '中文',
  'en-US': 'English'
};

// 翻译参数类型，允许字符串或数字类型的值
export type TranslationParams = Record<string, string | number>;

// 语言上下文类型
interface I18nContextType {
  language: SupportedLanguage;
  t: (key: string, params?: TranslationParams) => string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
  supportedLanguages: typeof languageNames;
}

// 创建语言上下文
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 从本地存储获取备用语言
const getStoredLanguage = (): SupportedLanguage | null => {
  if (!isClient) return null;
  
  try {
    const storedLang = localStorage.getItem('omniflow-language');
    if (storedLang && (storedLang === 'zh-CN' || storedLang === 'en-US')) {
      return storedLang;
    }
  } catch (e) {
    console.error('读取本地存储的语言设置失败:', e);
  }
  
  return null;
};

// 获取浏览器首选语言
const getBrowserLanguage = (): SupportedLanguage => {
  if (!isClient) return 'zh-CN';
  
  const userLanguage = navigator.language;
  
  if (userLanguage.startsWith('zh')) {
    return 'zh-CN';
  }
  
  return 'en-US'; // 默认返回英文
};

// 获取默认语言
export const getDefaultLanguage = (): SupportedLanguage => {
  // 优先从本地存储获取
  const storedLanguage = getStoredLanguage();
  if (storedLanguage) return storedLanguage;
  
  // 其次从浏览器设置获取
  return getBrowserLanguage();
};

// 获取嵌套键值的函数
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return path; // 如果找不到对应路径，返回原始键
    }
    current = current[key];
  }
  
  return typeof current === 'string' ? current : path;
};

// 参数替换函数 - 支持数字类型参数
const replaceParams = (text: string, params?: TranslationParams): string => {
  if (!params) return text;
  
  let result = text;
  for (const [key, value] of Object.entries(params)) {
    // 将所有值转换为字符串
    const stringValue = String(value);
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), stringValue);
  }
  
  return result;
};

// 语言提供者组件
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateCategorySettings } = useSettings();
  
  // 使用useState的惰性初始化，避免在SSR期间尝试访问settings.appearance.language
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    // 在SSR期间使用默认语言，避免水合不匹配
    if (!isClient) return 'zh-CN';
    return settings.appearance.language;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // 客户端挂载后更新状态
  useEffect(() => {
    setIsClientMounted(true);
    
    // 当客户端挂载后，尝试与localStorage同步
    if (isClient) {
      const storedLanguage = getStoredLanguage();
      if (storedLanguage && storedLanguage !== settings.appearance.language) {
        // 静默更新设置里的语言与localStorage保持一致
        updateCategorySettings('appearance', { language: storedLanguage });
      }
    }
  }, []);

  // 当设置中的语言更改时，更新当前语言
  useEffect(() => {
    if (isClient && isClientMounted && settings.appearance.language !== language) {
      setLanguage(settings.appearance.language);
      
      // 更新HTML的lang属性
      document.documentElement.lang = settings.appearance.language;
      document.documentElement.setAttribute('data-language', settings.appearance.language);
    }
  }, [settings.appearance.language, language, isClientMounted]);

  // 翻译函数
  const t = useCallback((key: string, params?: TranslationParams): string => {
    // 服务器渲染时使用key最后一部分作为默认值，而不是使用'...'
    // 这样可以确保服务器端和客户端渲染一致
    if (!isClient || !isClientMounted) {
      const keyParts = key.split('.');
      return keyParts[keyParts.length - 1];
    }
    const messages = languageResources[language];
    const value = getNestedValue(messages, key);
    return replaceParams(value, params);
  }, [language, isClientMounted]);

  // 切换语言函数 - 异步以支持加载状态
  const changeLanguage = useCallback(async (newLanguage: SupportedLanguage) => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      // 模拟网络延迟，实际项目中这里可能是加载语言包的异步操作
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 更新React状态
      setLanguage(newLanguage);
      
      // 更新应用设置
      updateCategorySettings('appearance', { language: newLanguage });
      
      // 在localStorage中保存用户的语言偏好
      localStorage.setItem('omniflow-language', newLanguage);
      
      // 触发语言变更事件，供客户端脚本感知
      const event = new CustomEvent('language-changed', { 
        detail: { language: newLanguage } 
      });
      window.dispatchEvent(event);
      
      // 更新HTML的lang属性
      document.documentElement.lang = newLanguage;
      document.documentElement.setAttribute('data-language', newLanguage);
      
      // 如果有其他需要触发的回调，可以在这里添加
      
    } catch (error) {
      console.error('切换语言失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateCategorySettings]);

  // 提供的上下文值
  const contextValue = {
    language,
    t,
    changeLanguage,
    isLoading,
    supportedLanguages: languageNames
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {isClient && isClientMounted && isLoading ? (
        <div className="language-loading-overlay">
          <div className="language-loading-spinner"></div>
        </div>
      ) : null}
      {children}
      <style jsx global>{`
        .language-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .language-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--accent-color);
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        /* 添加国际化辅助类 */
        [data-i18n]:empty:before {
          content: attr(data-i18n);
          opacity: 0.7;
        }
      `}</style>
    </I18nContext.Provider>
  );
};

// 使用国际化的钩子
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// 便捷的翻译组件
interface TransProps {
  id: string;
  params?: TranslationParams;
  className?: string;
}

export const Trans: React.FC<TransProps> = ({ id, params, className }) => {
  const { t } = useTranslation();
  return <span className={className} data-i18n={id}>{t(id, params)}</span>;
};