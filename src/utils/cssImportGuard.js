/**
 * CSS 导入防护工具
 * 
 * 这个脚本在开发模式下运行，用于捕获和警告不正确的 CSS 导入
 * 在 Next.js 中，全局 CSS 文件只能从 _app.tsx 导入
 */

(function() {
  // 仅在开发环境中运行
  if (process.env.NODE_ENV !== 'development') return;
  
  // 监听模块加载
  const originalRequire = window.__webpack_require__;
  
  if (originalRequire) {
    window.__webpack_require__ = function(moduleId) {
      const modulePath = originalRequire.m[moduleId]?.toString() || '';
      
      // 检测全局 CSS 导入错误
      if (
        modulePath.includes('.css') && 
        !modulePath.includes('.module.css') && 
        !modulePath.includes('_app') &&
        !modulePath.includes('node_modules')
      ) {
        const match = modulePath.match(/\/([^\/]+\.css)/);
        const cssFile = match ? match[1] : '未知CSS文件';
        
        console.warn(
          `%c全局CSS导入警告%c: "${cssFile}" 被从非 _app 文件导入。` +
          `在 Next.js 中，全局CSS只能从 _app.tsx 导入。` +
          `请转换为 CSS Modules (.module.css) 或移至 _app.tsx 中导入。`,
          'background: #FFA000; color: #000; font-weight: bold; padding: 2px 4px; border-radius: 2px;',
          'font-weight: normal;'
        );
      }
      
      // 调用原始require方法
      return originalRequire.apply(this, arguments);
    };
    
    // 复制原始require的所有属性
    Object.assign(window.__webpack_require__, originalRequire);
  }
})();