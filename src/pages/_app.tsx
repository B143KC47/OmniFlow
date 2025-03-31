import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ReactFlowProvider } from 'reactflow';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/nodes.css';
import '../styles/components/button.css';
import '../styles/components/input.css';
import '../components/NodeSystem.css';
import '../components/NodeLibrary.css'; // 保留 NodeLibrary.css 导入
import '../components/Node.css'; // 添加 Node.css 导入
import '../components/NodePalette.css'; // 添加 NodePalette.css 导入
import 'reactflow/dist/style.css';
import { SettingsProvider } from '../contexts/SettingsContext';
import { I18nProvider } from '../utils/i18n';

function MyApp({ Component, pageProps }: AppProps) {
  // 在客户端加载按钮效果脚本
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      // 尝试获取保存的语言设置
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          // 设置HTML的lang属性
          document.documentElement.lang = settings.appearance.language || 'zh-CN';
        } catch (error) {
          console.error('解析设置失败:', error);
          document.documentElement.lang = 'zh-CN'; // 默认使用中文
        }
      } else {
        document.documentElement.lang = 'zh-CN'; // 默认使用中文
      }

      // 加载按钮效果脚本
      const buttonEffectsScript = document.createElement('script');
      buttonEffectsScript.src = '/js/button-effects.js';
      buttonEffectsScript.async = true;
      document.body.appendChild(buttonEffectsScript);
      
      // 监听语言变化事件
      const handleLanguageChange = (event: CustomEvent<{ language: string }>) => {
        document.documentElement.lang = event.detail.language;
      };
      
      window.addEventListener('language-changed', handleLanguageChange as EventListener);

      // 清理函数
      return () => {
        const script = document.querySelector('script[src="/js/button-effects.js"]');
        if (script) {
          document.body.removeChild(script);
        }
        window.removeEventListener('language-changed', handleLanguageChange as EventListener);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>OmniFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SettingsProvider>
        <I18nProvider>
          <ReactFlowProvider>
            <Component {...pageProps} />
          </ReactFlowProvider>
        </I18nProvider>
      </SettingsProvider>
    </>
  );
}

export default MyApp;