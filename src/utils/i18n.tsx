import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

// 导入语言文件
import zhMessages from '../messages/zh.json';
import enMessages from '../messages/en.json';

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

// 翻译参数类型，允许字符串或数字类型的值
export type TranslationParams = Record<string, string | number>;

// 语言上下文类型
interface I18nContextType {
  language: SupportedLanguage;
  t: (key: string, params?: TranslationParams) => string;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
}

// 创建语言上下文
const I18nContext = createContext<I18nContextType | undefined>(undefined);

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

// 参数替换函数 - 更新为支持数字类型参数
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
  const { settings } = useSettings();
  const [language, setLanguage] = useState<SupportedLanguage>(settings.appearance.language);
  const [isLoading, setIsLoading] = useState(false);

  // 当设置中的语言更改时，更新当前语言
  useEffect(() => {
    if (settings.appearance.language !== language) {
      setLanguage(settings.appearance.language);
    }
  }, [settings.appearance.language]);

  // 翻译函数
  const t = (key: string, params?: TranslationParams): string => {
    const messages = languageResources[language];
    const value = getNestedValue(messages, key);
    return replaceParams(value, params);
  };

  // 切换语言函数 - 改为异步以支持加载状态
  const changeLanguage = async (newLanguage: SupportedLanguage) => {
    setIsLoading(true);
    try {
      // 模拟网络延迟，实际项目中这里可能是加载语言包的异步操作
      await new Promise(resolve => setTimeout(resolve, 300));
      setLanguage(newLanguage);
      
      // 触发语言变更事件，供客户端脚本感知
      const event = new CustomEvent('language-changed', { 
        detail: { language: newLanguage } 
      });
      window.dispatchEvent(event);
      
      // 更新HTML的lang属性
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage, isLoading }}>
      {isLoading ? (
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
}

export const Trans: React.FC<TransProps> = ({ id, params }) => {
  const { t } = useTranslation();
  return <>{t(id, params)}</>;
};