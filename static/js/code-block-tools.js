/**
 * OmniFlow代码块增强工具
 * 为聊天界面中的代码块添加工具栏和交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    function initCodeBlockTools() {
        // 监视DOM变化，为新添加的代码块添加工具栏
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 为消息内容中的代码块添加工具
                        if (node.classList && node.classList.contains('message')) {
                            addToolsToCodeBlocks(node);
                        }
                        
                        // 处理消息内容中的子元素
                        const codeBlocks = node.querySelectorAll('pre code');
                        if (codeBlocks.length > 0) {
                            codeBlocks.forEach(block => {
                                addToolsToCodeBlock(block.parentElement);
                            });
                        }
                    }
                });
            });
        });
        
        // 启动观察器，监视整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 初始化时处理已有的代码块
        addToolsToAllCodeBlocks();
    }
    
    // 为所有已存在的代码块添加工具栏
    function addToolsToAllCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            addToolsToCodeBlock(block.parentElement);
        });
    }
    
    // 为消息中的所有代码块添加工具栏
    function addToolsToCodeBlocks(messageEl) {
        const codeBlocks = messageEl.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            addToolsToCodeBlock(block.parentElement);
        });
    }
    
    // 为单个代码块添加工具栏
    function addToolsToCodeBlock(preElement) {
        // 检查是否已经添加过工具栏
        if (preElement.querySelector('.code-block-actions')) return;
        
        // 从模板创建工具栏
        const template = document.getElementById('codeBlockTemplate');
        if (!template) return;
        
        const toolbarClone = template.content.cloneNode(true);
        preElement.appendChild(toolbarClone);
        
        // 设置代码语言标识（从class提取）
        const codeElement = preElement.querySelector('code');
        if (codeElement && codeElement.className) {
            const classes = codeElement.className.split(' ');
            const languageClass = classes.find(c => c.startsWith