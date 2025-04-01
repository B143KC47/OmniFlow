import React, { useState, useCallback, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Modal from './shared/Modal';
import { useTranslation } from '../utils/i18n';
import { AppSettings } from '../contexts/SettingsContext';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  onClose: () => void;
  onSave?: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave }) => {
  const { t, changeLanguage, isLoading, language, supportedLanguages } = useTranslation();
  const { settings, updateCategorySettings, resetSettings, isUpdating } = useSettings();
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

  // 当settings变化时更新本地状态
  useEffect(() => {
    setLocalSettings({
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
  }, [settings]);
  
  // 处理设置更改
  const handleChange = (key: string, value: any) => {
    setLocalSettings({
      ...localSettings,
      [key]: value
    });

    // 如果是语言更改，立即应用变更以提供即时反馈
    if (key === 'language' && value !== settings.appearance.language) {
      handleLanguageChange(value);
    }
  };

  // 处理语言变更
  const handleLanguageChange = async (newLanguage: string) => {
    try {
      setError(null);
      await changeLanguage(newLanguage as 'zh-CN' | 'en-US');
    } catch (error) {
      console.error('语言切换失败:', error);
      setError(t('settings.errors.updateFailed'));
    }
  };
  
  // 保存设置
  const handleSave = useCallback(async () => {
    try {
      setError(null);
      
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
      
      // 如果提供了onSave回调，则调用它
      if (onSave) {
        onSave({
          appearance: {
            ...settings.appearance,
            theme: localSettings.theme,
            language: localSettings.language,
            reduceAnimations: localSettings.reduceAnimations,
            showBackgroundPattern: localSettings.showBackgroundPattern
          },
          workflow: {
            ...settings.workflow,
            autoSave: localSettings.autoSave,
            autoSaveInterval: localSettings.autoSaveInterval,
            showNodeTooltips: localSettings.showNodeTooltips,
            snapToGrid: localSettings.snapToGrid,
            gridSize: localSettings.gridSize
          },
          mcp: { ...settings.mcp }
        });
      }
      
      // 等待所有更新完成后关闭模态框
      await Promise.resolve();
      onClose();
    } catch (error) {
      console.error('保存设置失败:', error);
      setError(t('settings.errors.saveFailed'));
    }
  }, [localSettings, settings, updateCategorySettings, onSave, onClose, t]);

  // 重置设置
  const handleReset = useCallback(async () => {
    try {
      setError(null);
      resetSettings();
      await Promise.resolve();
      // 不关闭模态框，让用户可以看到重置后的设置
    } catch (error) {
      console.error('重置设置失败:', error);
      setError(t('settings.errors.updateFailed'));
    }
  }, [resetSettings, t]);
  
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

  const isProcessing = isLoading || isUpdating;

  return (
    <Modal
      title={t('settings.title')}
      onClose={onClose}
      onSave={handleSave}
      saveLabel={t('common.save')}
      cancelLabel={t('common.cancel')}
      disabled={isProcessing}
    >
      <div className={styles.settingsModal}>
        {isProcessing && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingText}>{t('settings.updating')}</div>
          </div>
        )}
        
        {error && (
          <div className={styles.errorMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.sectionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            {t('settings.appearance.title')}
          </h3>
          
          <div className={styles.field}>
            <label htmlFor="theme">{t('settings.theme.label')}:</label>
            <div className={styles.fieldControl}>
              <select 
                id="theme"
                value={localSettings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                disabled={isProcessing}
              >
                {themeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="language">{t('settings.language.label')}:</label>
            <div className={styles.fieldControl}>
              <select 
                id="language"
                value={localSettings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                disabled={isProcessing}
              >
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="reduceAnimations">
              {t('settings.animations.label')}:
            </label>
            <div className={styles.fieldControl}>
              <input 
                id="reduceAnimations"
                type="checkbox"
                checked={localSettings.reduceAnimations}
                onChange={(e) => handleChange('reduceAnimations', e.target.checked)}
                disabled={isProcessing}
              />
              <span className={styles.checkboxLabel}>
                {t('settings.animations.reduce')}
              </span>
            </div>
          </div>
          
          <div className={styles.field}>
            <label htmlFor="showBackgroundPattern">
              {t('settings.background.label')}:
            </label>
            <div className={styles.fieldControl}>
              <input 
                id="showBackgroundPattern"
                type="checkbox"
                checked={localSettings.showBackgroundPattern}
                onChange={(e) => handleChange('showBackgroundPattern', e.target.checked)}
                disabled={isProcessing}
              />
              <span className={styles.checkboxLabel}>
                {t('settings.background.show')}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.sectionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('settings.workflow.title')}
          </h3>
          
          <div className={styles.field}>
            <label htmlFor="snapToGrid">
              {t('settings.nodeSnapToGrid.label')}:
            </label>
            <div className={styles.fieldControl}>
              <input 
                id="snapToGrid"
                type="checkbox"
                checked={localSettings.snapToGrid}
                onChange={(e) => handleChange('snapToGrid', e.target.checked)}
                disabled={isProcessing}
              />
              <span className={styles.checkboxLabel}>
                {t('settings.nodeSnapToGrid.enable')}
              </span>
            </div>
          </div>
          
          {localSettings.snapToGrid && (
            <div className={styles.field}>
              <label htmlFor="gridSize">
                {t('settings.gridSize.label')}:
              </label>
              <div className={styles.fieldControl}>
                <input 
                  id="gridSize"
                  type="number"
                  min="5"
                  max="50"
                  value={localSettings.gridSize}
                  onChange={(e) => handleChange('gridSize', parseInt(e.target.value, 10))}
                  disabled={isProcessing}
                />
                <span className={styles.unit}>px</span>
              </div>
            </div>
          )}
          
          <div className={styles.field}>
            <label htmlFor="showNodeTooltips">
              {t('settings.nodeTooltips.label')}:
            </label>
            <div className={styles.fieldControl}>
              <input 
                id="showNodeTooltips"
                type="checkbox"
                checked={localSettings.showNodeTooltips}
                onChange={(e) => handleChange('showNodeTooltips', e.target.checked)}
                disabled={isProcessing}
              />
              <span className={styles.checkboxLabel}>
                {t('settings.nodeTooltips.show')}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.sectionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {t('settings.other')}
          </h3>
          
          <div className={styles.field}>
            <label htmlFor="autoSave">
              {t('settings.autoSave.label')}:
            </label>
            <div className={styles.fieldControl}>
              <input 
                id="autoSave"
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                disabled={isProcessing}
              />
              <span className={styles.checkboxLabel}>
                {t('settings.autoSave.enable')}
              </span>
            </div>
          </div>
          
          {localSettings.autoSave && (
            <div className={styles.field}>
              <label htmlFor="autoSaveInterval">
                {t('settings.autoSaveInterval.label')}:
              </label>
              <div className={styles.fieldControl}>
                <input 
                  id="autoSaveInterval"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.autoSaveInterval}
                  onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value, 10))}
                  disabled={isProcessing}
                />
                <span className={styles.unit}>{t('settings.autoSaveInterval.minutes')}</span>
              </div>
            </div>
          )}

          <div className={`${styles.field} ${styles.resetButton}`}>
            <label></label>
            <div className={styles.fieldControl}>
              <button 
                onClick={handleReset}
                className={styles.resetButtonControl}
                disabled={isProcessing}
              >
                {t('settings.buttons.reset')}
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.sectionAbout}`}>
          <h3 className={styles.sectionTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.sectionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('settings.about.title')}
          </h3>
          <div className={styles.aboutInfo}>
            <div>OmniFlow</div>
            <div className={styles.version}>v0.1.0-alpha</div>
            <div className={styles.copyright}>© 2023 OmniFlow Team</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;