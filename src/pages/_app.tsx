import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ReactFlowProvider } from 'reactflow';
import { IntlProvider } from 'next-intl';
import Head from 'next/head';
import '@/styles/globals.css';
import '@/styles/nodes.css';
import 'reactflow/dist/style.css';

function MyApp({ Component, pageProps }: AppProps) {
  // 在客户端加载按钮效果脚本
  useEffect(() => {
    // 确保只在客户端执行
    const buttonEffectsScript = document.createElement('script');
    buttonEffectsScript.src = '/js/button-effects.js';
    buttonEffectsScript.async = true;
    document.body.appendChild(buttonEffectsScript);

    // 清理函数，在组件卸载时移除脚本
    return () => {
      const script = document.querySelector('script[src="/js/button-effects.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>OmniFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <IntlProvider messages={pageProps.messages} locale={pageProps.locale || 'zh'}>
        <ReactFlowProvider>
          <Component {...pageProps} />
        </ReactFlowProvider>
      </IntlProvider>
    </>
  );
}

export default MyApp;