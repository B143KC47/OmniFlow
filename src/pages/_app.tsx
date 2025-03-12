import React from 'react';
import type { AppProps } from 'next/app';
import { ReactFlowProvider } from 'reactflow';
import { IntlProvider } from 'next-intl';
import '@/styles/globals.css';
import '@/styles/nodes.css';
import 'reactflow/dist/style.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IntlProvider messages={pageProps.messages} locale={pageProps.locale || 'zh'}>
      <ReactFlowProvider>
        <Component {...pageProps} />
      </ReactFlowProvider>
    </IntlProvider>
  );
}

export default MyApp;