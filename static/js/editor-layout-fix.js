// 这个脚本用于处理和修复编辑器布局问题，确保画布能够占满整个屏幕

(function() {
    // 在DOM加载完成后执行
    window.addEventListener('DOMContentLoaded', function() {
        // 获取关键元素
        const editorRoot = document.getElementById('editor-root');
        const editorContainer = document.querySelector('.editor-container');
        const workspace = document.getElementById('editorWorkspace');
        
        // 应用初始样式修复
        function applyInitialFixes() {
            // 确保body和html没有溢出
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            
            // 设置编辑器根元素的宽度
            editorRoot.style.width = '100vw';
            editorRoot.style.maxWidth = '100vw';
            
            // 设置编辑器容器的宽度
            editorContainer.style.width = '100vw';
            editorContainer.style.maxWidth = '100vw';
            
            // 设置工作区的宽度
            if (workspace) {
                workspace.style.width = '100%';
                workspace.style.maxWidth = '100vw';
            }
        }
        
        // 在窗口大小变化时重新应用修复
        function handleResize() {
            const windowWidth = window.innerWidth;
            
            // 重新设置宽度
            editorRoot.style.width = windowWidth + 'px';
            editorContainer.style.width = windowWidth + 'px';
            
            if (workspace) {
                workspace.style.width = windowWidth + 'px';
            }
        }
        
        // 应用初始修复
        applyInitialFixes();
        
        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);
        
        // 监听页面加载完成事件
        window.addEventListener('load', function() {
            // 再次应用修复，确保所有元素都已加载
            setTimeout(applyInitialFixes, 100);
        });
    });
})();
