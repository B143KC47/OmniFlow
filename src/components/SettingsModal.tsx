import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  initialSettings?: any;
  onSave?: (settings: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, initialSettings = {}, onSave }) => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'zh-CN',
    autoSave: true,
    animationsEnabled: true,
    connectionStyle: 'bezier',
    nodeSnapToGrid: true,
    enableNotifications: true,
    ...initialSettings
  });

  // 处理设置更改
  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存设置
  const handleSaveSettings = () => {
    if (onSave) {
      onSave(settings);
    }
    
    // 保存到本地存储
    localStorage.setItem('omniflow-settings', JSON.stringify(settings));
    
    onClose();
  };

  // 复位到默认设置
  const handleReset = () => {
    const defaultSettings = {
      theme: 'dark',
      language: 'zh-CN',
      autoSave: true,
      animationsEnabled: true,
      connectionStyle: 'bezier',
      nodeSnapToGrid: true,
      enableNotifications: true
    };
    
    setSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-[#282828] rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#282828] bg-[#0e0e0e]">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            系统设置
          </h2>
          <button 
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors p-1 rounded-full hover:bg-[#1a1a1a]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* 主题设置 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">界面主题</label>
              <div className="flex space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    checked={settings.theme === 'dark'} 
                    onChange={() => handleChange('theme', 'dark')}
                    className="form-radio text-[#10a37f] focus:ring-[#10a37f] focus:ring-offset-transparent"
                  />
                  <span className="text-sm">暗色主题</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    checked={settings.theme === 'light'} 
                    onChange={() => handleChange('theme', 'light')}
                    className="form-radio text-[#10a37f] focus:ring-[#10a37f] focus:ring-offset-transparent"
                  />
                  <span className="text-sm">亮色主题</span>
                </label>
              </div>
            </div>
            
            {/* 语言设置 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">语言</label>
              <select 
                value={settings.language} 
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] transition-all duration-200"
              >
                <option value="zh-CN">中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
            
            {/* 自动保存 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">自动保存工作流</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.autoSave} 
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#282828] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#10a37f] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10a37f]"></div>
              </label>
            </div>
            
            {/* 动画效果 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">启用动画效果</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.animationsEnabled} 
                  onChange={(e) => handleChange('animationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#282828] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#10a37f] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10a37f]"></div>
              </label>
            </div>
            
            {/* 连接线样式 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">连接线样式</label>
              <select 
                value={settings.connectionStyle} 
                onChange={(e) => handleChange('connectionStyle', e.target.value)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] transition-all duration-200"
              >
                <option value="bezier">贝塞尔曲线</option>
                <option value="straight">直线</option>
                <option value="step">阶梯线</option>
                <option value="smoothstep">平滑阶梯线</option>
              </select>
            </div>
            
            {/* 节点对齐网格 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">节点对齐网格</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.nodeSnapToGrid} 
                  onChange={(e) => handleChange('nodeSnapToGrid', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#282828] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#10a37f] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10a37f]"></div>
              </label>
            </div>
            
            {/* 通知提醒 */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">启用通知提醒</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.enableNotifications} 
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#282828] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#10a37f] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10a37f]"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-[#282828] bg-[#0e0e0e]">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] rounded text-sm transition-all duration-200"
          >
            恢复默认
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] rounded text-sm transition-all duration-200"
            >
              取消
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded text-sm transition-all duration-200 shadow-lg shadow-[#10a37f]/20"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;