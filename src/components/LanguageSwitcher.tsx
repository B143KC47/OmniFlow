import React from 'react';
import { useTranslation, SupportedLanguage } from '../utils/i18n';

interface LanguageSwitcherProps {
  minimal?: boolean; // 是否使用最小化版本
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ minimal = false, className = '' }) => {
  const { language, changeLanguage, supportedLanguages, isLoading } = useTranslation();

  const toggleLanguage = () => {
    // 简单地在中英文间切换
    const newLanguage: SupportedLanguage = language === 'zh-CN' ? 'en-US' : 'zh-CN';
    changeLanguage(newLanguage);
  };

  if (minimal) {
    // 最小化版本，只显示一个切换按钮
    return (
      <button
        onClick={toggleLanguage}
        disabled={isLoading}
        className={`language-switcher-minimal ${className} ${isLoading ? 'loading' : ''}`}
        title={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
      >
        {language === 'zh-CN' ? 'EN' : '中'}
        {isLoading && <span className="language-loading-dot"></span>}
        
        <style jsx>{`
          .language-switcher-minimal {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.25rem 0.5rem;
            border: 1px solid var(--border-color, #333);
            background-color: transparent;
            color: var(--text-primary, #e0e0e0);
            border-radius: 4px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            min-width: 30px;
            height: 24px;
          }
          
          .language-switcher-minimal:hover {
            background-color: rgba(255, 255, 255, 0.05);
            border-color: var(--accent-color, #6b57ff);
          }
          
          .language-switcher-minimal:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .language-switcher-minimal.loading {
            pointer-events: none;
          }
          
          .language-loading-dot {
            position: absolute;
            top: -3px;
            right: -3px;
            width: 6px;
            height: 6px;
            background-color: var(--accent-color, #6b57ff);
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.2);
              opacity: 1;
            }
            100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
          }
        `}</style>
      </button>
    );
  }

  // 完整版本，下拉选择
  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
        disabled={isLoading}
        className={isLoading ? 'loading' : ''}
      >
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      {isLoading && <div className="language-loading-indicator"></div>}
      
      <style jsx>{`
        .language-switcher {
          position: relative;
          display: inline-block;
        }
        
        .language-switcher select {
          padding: 0.375rem 1.75rem 0.375rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25;
          color: var(--text-primary, #e0e0e0);
          background-color: transparent;
          border: 1px solid var(--border-color, #333);
          border-radius: 0.25rem;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 16px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .language-switcher select:hover {
          border-color: var(--accent-color, #6b57ff);
        }
        
        .language-switcher select:focus {
          border-color: var(--accent-color, #6b57ff);
          outline: none;
          box-shadow: 0 0 0 1px var(--accent-color, #6b57ff);
        }
        
        .language-switcher select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .language-switcher select.loading {
          padding-right: 2.5rem;
        }
        
        .language-loading-indicator {
          position: absolute;
          right: 2rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0.875rem;
          height: 0.875rem;
          border: 2px solid var(--accent-color, #6b57ff);
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: translateY(-50%) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;