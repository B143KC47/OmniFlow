/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    // 添加 .js 文件支持 ES 模块语法
    config.module.rules.push({
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // 获取 CSS 规则
    const cssRules = config.module.rules.find(
      rule => rule.oneOf && Array.isArray(rule.oneOf)
    ).oneOf;

    // 确保 CSS 模块得到正确处理
    for (const rule of cssRules) {
      if (rule.test && rule.test.test && rule.test.test('.module.css')) {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(loader => {
            if (typeof loader === 'object' && loader.options) {
              // 确保 CSS 模块正确生成唯一类名
              if (loader.options.modules) {
                loader.options.modules.exportLocalsConvention = 'camelCase';
              }
            }
          });
        }
      }
    }

    // 特殊处理组件目录下的全局 CSS 文件，避免被误认为是从组件导入的全局 CSS
    cssRules.unshift({
      test: /\/components\/(Node|NodeLibrary|NodePalette|NodeSystem)\.css$/,
      use: ['ignore-loader'], // 使用 ignore-loader 忽略这些文件的内容，因为内容已经移至 globals.css
      issuer(issuer) {
        if (!issuer || typeof issuer !== 'string') return true;
        // 只允许这些文件在 _app.tsx 中被导入
        return !issuer.match(/pages\/_app\.(js|ts|jsx|tsx)$/);
      }
    });

    // 添加特殊规则，确保组件中的 CSS 文件被视为 CSS 模块，除非是在 _app.tsx 中导入
    cssRules.unshift({
      test: /\/components\/.*\.css$/,
      exclude: [/\.module\.css$/, /Node\.css$/, /NodeLibrary\.css$/, /NodePalette\.css$/, /NodeSystem\.css$/],
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: {
              auto: true,
              localIdentName: '[local]__[hash:base64:5]',
            },
          },
        },
      ],
      issuer(issuer) {
        if (!issuer || typeof issuer !== 'string') return false;
        // 排除 _app.tsx，因为它是全局 CSS 的入口点
        return issuer.match(/\.(js|ts|jsx|tsx)$/) && !issuer.match(/pages\/_app/);
      },
      layer: 'components-css'
    });
    
    // 添加特殊入口处理，用于注入 CSS 导入检测工具
    if (!isServer && dev) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // 在客户端开发模式下注入 CSS 导入检测工具
        if (entries['main.js']) {
          entries['main.js'].unshift('./src/utils/cssImportGuard.js');
        }
        
        return entries;
      };
    }

    return config;
  },
  // 明确指定可以全局导入 CSS 的页面组件
  experimental: {
    // 这个设置允许在 _app 之外导入 CSS 模块 (.module.css)
    esmExternals: true,
  },
};

module.exports = nextConfig;