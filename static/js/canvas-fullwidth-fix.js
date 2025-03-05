/**
 * 画布全宽度修复脚本 - 确保画布占满整个屏幕宽度
 */

(function() {
    // 页面加载后执行
    document.addEventListener('DOMContentLoaded', function() {
        // 应用初始修复
        setTimeout(applyFullWidthFix, 100);
        
        // 添加窗口大小变化监听
        window.addEventListener('resize', function() {
            setTimeout(applyFullWidthFix, 50);
        });
    });
    
    // 全宽度修复函数
    function applyFullWidthFix() {
        // 获取相关元素
        const root = document.getElementById('editor-root');
        const container = document.querySelector('.editor-container');
        const workspace = document.getElementById('editorWorkspace');
        const toolbar = document.querySelector('.editor-toolbar');
        const footer = document.getElementById('editorFooter');
        
        if (!root || !container || !workspace) return;
        
        // 获取视窗宽度
        const viewportWidth = window.innerWidth;
        
        // 设置元素宽度
        setFullWidth(root);
        setFullWidth(container);
        setFullWidth(workspace);
        if (toolbar) setFullWidth(toolbar);
        if (footer) setFullWidth(footer);
        
        // 处理滚动条问题
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        // 修复可能的边距问题
        removeHorizontalMargins(root);
        removeHorizontalMargins(container);
        removeHorizontalMargins(workspace);
        
        // 如果有滚动条出现，调整宽度以补偿滚动条
        if (document.body.offsetWidth > window.innerWidth) {
            const scrollbarWidth = document.body.offsetWidth - window.innerWidth;
            setElementWidth(root, viewportWidth - scrollbarWidth);
            setElementWidth(container, viewportWidth - scrollbarWidth);
            setElementWidth(workspace, viewportWidth - scrollbarWidth);
        }
        
        // 检查JSPlumb实例并重绘连接线
        if (window.jsPlumb && window.jsPlumb.repaintEverything) {
            window.jsPlumb.repaintEverything();
        }
    }
    
    // 设置元素宽度为视窗宽度
    function setFullWidth(element) {
        if (!element) return;
        
        // 应用多种样式以确保宽度
        element.style.width = '100vw';
        element.style.maxWidth = '100vw';
        element.style.boxSizing = 'border-box';
        element.style.overflowX = 'hidden';
    }
    
    // 移除水平边距
    function removeHorizontalMargins(element) {
        if (!element) return;
        
        element.style.marginLeft = '0';
        element.style.marginRight = '0';
        element.style.paddingLeft = '0';
        element.style.paddingRight = '0';
    }
    
    // 设置精确像素宽度
    function setElementWidth(element, width) {
        if (!element) return;
        element.style.width = width + 'px';
        element.style.maxWidth = width + 'px';
    }
})();
