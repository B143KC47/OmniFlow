import React, { useState, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Modal from './shared/Modal';
import { useTranslation } from '../utils/i18n';
import { AppSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { t, changeLanguage, isLoading } = useTranslation();
  const { settings, updateCategorySettings, isUpdating } = useSettings();
  const [error, setError] = useState<string | null>(null);
  
  // 本地设置状态，用于表单 - 使用扁平化的结构方便UI操作
  const [localSettings, setLocalSettings] = useState({
    theme: settings.appearance.theme,
    language: settings.appearance.language,
    reduceAnimations: settings.appearance.reduceAnimations,
    showBackgroundPattern: settings.appearance.showBackgroundPattern,
    autoSave: settings.workflow.autoSave,
    autoSaveInterval: settings.workflow.autoSaveInterval,
    showNodeTooltips: settings.workflow.showNodeTooltips,
    snapToGrid: settings.workflow.snapToGrid,
    gridSize: settings.workflow.gridSize
  });
  
  // 处理设置更改
  const handleChange = (key: string, value: any) => {
    setLocalSettings({
      ...localSettings,
      [key]: value
    });
  };
  
  // 保存设置
  const handleSave = useCallback(async () => {
    try {
      setError(null);
      
      // 如果语言发生变化，需要更新语言
      if (settings.appearance.language !== localSettings.language) {
        await changeLanguage(localSettings.language);
      }
      
      // 更新外观相关的设置
      updateCategorySettings('appearance', {
        theme: localSettings.theme,
        language: localSettings.language,
        reduceAnimations: localSettings.reduceAnimations,
        showBackgroundPattern: localSettings.showBackgroundPattern
      });
      
      // 更新工作流相关的设置
      updateCategorySettings('workflow', {
        autoSave: localSettings.autoSave,
        autoSaveInterval: localSettings.autoSaveInterval,
        showNodeTooltips: localSettings.showNodeTooltips,
        snapToGrid: localSettings.snapToGrid,
        gridSize: localSettings.gridSize
      });
      
      // 等待所有更新完成
      await Promise.resolve();
      onClose();
    } catch (error) {
      console.error('保存设置失败:', error);
      setError(t('settings.errors.saveFailed'));
    }
  }, [localSettings, settings.appearance.language, updateCategorySettings, changeLanguage, onClose, t]);
  
  // 语言选项
  const languageOptions = [
    { value: 'en-US', label: 'English' },
    { value: 'zh-CN', label: '中文' }
  ];
  
  // 主题选项
  const themeOptions = [
    { value: 'dark', label: t('settings.theme.dark') },
    { value: 'light', label: t('settings.theme.light') },
    { value: 'system', label: t('settings.theme.system') }
  ];
  
  // 连接样式选项
  const connectionStyleOptions = [
    { value: 'bezier', label: t('settings.connectionStyle.bezier') },
    { value: 'straight', label: t('settings.connectionStyle.straight') },
    { value: 'step', label: t('settings.connectionStyle.step') },
    { value: 'smoothstep', label: t('settings.connectionStyle.smoothstep') }
  ];

  return (
    <Modal
      title={t('settings.title')}
      onClose={onClose}
      onSave={handleSave}
      saveLabel={t('common.save')}
      cancelLabel={t('common.cancel')}
      disabled={isLoading || isUpdating}
    >
      <div className="settings-modal">
        {(isLoading || isUpdating) && (
          <div className="settings-loading-overlay">
            <div className="settings-loading-spinner"></div>
            <div className="settings-loading-text">{t('settings.updating')}</div>
          </div>
        )}
        
        {error && (
          <div className="settings-error-message">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.appearance')}</h3>
          
          <div className="settings-field">
            <label htmlFor="theme">{t('settings.theme.label')}:</label>
            <div className="settings-field-control">
              <select 
                id="theme"
                value={localSettings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                {themeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="settings-field">
            <label htmlFor="language">{t('settings.language.label')}:</label>
            <div className="settings-field-control">
              <select 
                id="language"
                value={localSettings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="settings-field">
            <label htmlFor="reduceAnimations">
              {t('settings.animations.label')}:
            </label>
            <div className="settings-field-control">
              <input 
                id="reduceAnimations"
                type="checkbox"
                checked={localSettings.reduceAnimations}
                onChange={(e) => handleChange('reduceAnimations', e.target.checked)}
              />
              <span className="checkbox-label">
                {t('settings.animations.reduce')}
              </span>
            </div>
          </div>
          
          <div className="settings-field">
            <label htmlFor="showBackgroundPattern">
              {t('settings.background.label')}:
            </label>
            <div className="settings-field-control">
              <input 
                id="showBackgroundPattern"
                type="checkbox"
                checked={localSettings.showBackgroundPattern}
                onChange={(e) => handleChange('showBackgroundPattern', e.target.checked)}
              />
              <span className="checkbox-label">
                {t('settings.background.show')}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.workflow')}</h3>
          
          <div className="settings-field">
            <label htmlFor="snapToGrid">
              {t('settings.nodeSnapToGrid.label')}:
            </label>
            <div className="settings-field-control">
              <input 
                id="snapToGrid"
                type="checkbox"
                checked={localSettings.snapToGrid}
                onChange={(e) => handleChange('snapToGrid', e.target.checked)}
              />
              <span className="checkbox-label">
                {t('settings.nodeSnapToGrid.enable')}
              </span>
            </div>
          </div>
          
          {localSettings.snapToGrid && (
            <div className="settings-field">
              <label htmlFor="gridSize">
                {t('settings.gridSize.label')}:
              </label>
              <div className="settings-field-control">
                <input 
                  id="gridSize"
                  type="number"
                  min="5"
                  max="50"
                  value={localSettings.gridSize}
                  onChange={(e) => handleChange('gridSize', parseInt(e.target.value, 10))}
                  className="grid-size-input"
                />
                <span className="unit">px</span>
              </div>
            </div>
          )}
          
          <div className="settings-field">
            <label htmlFor="showNodeTooltips">
              {t('settings.nodeTooltips.label')}:
            </label>
            <div className="settings-field-control">
              <input 
                id="showNodeTooltips"
                type="checkbox"
                checked={localSettings.showNodeTooltips}
                onChange={(e) => handleChange('showNodeTooltips', e.target.checked)}
              />
              <span className="checkbox-label">
                {t('settings.nodeTooltips.show')}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.other')}</h3>
          
          <div className="settings-field">
            <label htmlFor="autoSave">
              {t('settings.autoSave.label')}:
            </label>
            <div className="settings-field-control">
              <input 
                id="autoSave"
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
              <span className="checkbox-label">
                {t('settings.autoSave.enable')}
              </span>
            </div>
          </div>
          
          {localSettings.autoSave && (
            <div className="settings-field">
              <label htmlFor="autoSaveInterval">
                {t('settings.autoSaveInterval.label')}:
              </label>
              <div className="settings-field-control">
                <input 
                  id="autoSaveInterval"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.autoSaveInterval}
                  onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value, 10))}
                  className="interval-input"
                />
                <span className="unit">{t('settings.autoSaveInterval.minutes')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="settings-section settings-section-about">
          <h3 className="settings-section-title">{t('settings.about.title')}</h3>
          <div className="about-info">
            <div>OmniFlow</div>
            <div className="version">v0.1.0-alpha</div>
            <div className="copyright">© 2023 OmniFlow Team</div>
          </div>
        </div>

        <style jsx>{`
          .settings-modal {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 1rem;
          }
          
          .settings-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
          }
          
          .settings-section:last-child {
            border-bottom: none;
          }
          
          .settings-section-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }
          
          .settings-field {
            display: flex;
            align-items: center;
          }
          
          .settings-field label {
            flex: 1;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
          
          .settings-field-control {
            flex: 2;
            display: flex;
            align-items: center;
          }
          
          .settings-field-control select {
            padding: 0.5rem;
            border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            width: 100%;
          }
          
          .settings-field-control input[type="checkbox"] {
            margin-right: 0.5rem;
          }
          
          .settings-field-control input[type="number"] {
            padding: 0.5rem;
            border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            width: 80px;
          }
          
          .unit {
            margin-left: 0.5rem;
            color: var(--text-secondary);
          }
          
          .checkbox-label {
            font-size: 0.9rem;
            color: var(--text-primary);
          }
          
          .settings-section-about {
            text-align: center;
          }
          
          .about-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
          }
          
          .version {
            color: var(--accent-color);
          }
          
          .copyright {
            font-size: 0.8rem;
          }

          .settings-loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }
          
          .settings-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--accent-color);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
          }
          
          .settings-loading-text {
            color: #fff;
            font-size: 0.9rem;
          }
          
          .settings-error-message {
            background-color: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 0.75rem 1rem;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
          }
          
          .settings-error-message svg {
            margin-right: 0.5rem;
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default SettingsModal;