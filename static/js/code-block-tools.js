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
        const codeBlocks = document.querySelectorAll('.message-content pre');
        codeBlocks.forEach(block => {
            addToolsToCodeBlock(block);
        });
    }
    
    // 为消息中的所有代码块添加工具栏
    function addToolsToCodeBlocks(messageEl) {
        const codeBlocks = messageEl.querySelectorAll('.message-content pre');
        codeBlocks.forEach(block => {
            addToolsToCodeBlock(block);
        });
    }
    
    // 为单个代码块添加工具栏
    function addToolsToCodeBlock(preElement) {
        // 检查是否已经添加过工具栏
        if (preElement.querySelector('.code-block-actions')) return;
        
        // 从模板创建工具栏
        const template = document.getElementById('codeBlockTemplate');
        if (!template) {
            // 如果没有模板，创建一个工具栏
            createDefaultToolbar(preElement);
            return;
        }
        
        const toolbarClone = template.content.cloneNode(true);
        preElement.appendChild(toolbarClone);
        
        // 设置代码语言标识（从class提取）
        const codeElement = preElement.querySelector('code');
        if (codeElement && codeElement.className) {
            const classes = codeElement.className.split(' ');
            const languageClass = classes.find(c => c.startsWith('language-'));
            
            if (languageClass) {
                const language = languageClass.replace('language-', '');
                
                // 显示语言标签
                const languageTag = document.createElement('div');
                languageTag.className = 'code-language';
                languageTag.textContent = language;
                preElement.appendChild(languageTag);
                
                // 设置数据属性
                preElement.dataset.language = language;
            }
        }
        
        // 添加复制功能
        const copyBtn = preElement.querySelector('.copy-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const code = preElement.querySelector('code').textContent;
                copyToClipboard(code);
                showCopySuccess(copyBtn);
            });
        }
        
        // 添加运行功能（如果适用）
        const runBtn = preElement.querySelector('.run-code');
        if (runBtn) {
            const language = preElement.dataset.language;
            if (isRunnableLanguage(language)) {
                runBtn.addEventListener('click', () => {
                    runCodeBlock(preElement);
                });
            } else {
                // 如果不是可运行的语言，隐藏运行按钮
                runBtn.style.display = 'none';
            }
        }
    }
    
    // 创建默认工具栏
    function createDefaultToolbar(preElement) {
        const toolbar = document.createElement('div');
        toolbar.className = 'code-block-actions';
        
        // 添加复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-action copy-code';
        copyBtn.title = '复制代码';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        toolbar.appendChild(copyBtn);
        
        // 添加运行按钮（仅为可运行的语言添加）
        const codeElement = preElement.querySelector('code');
        if (codeElement && codeElement.className) {
            const classes = codeElement.className.split(' ');
            const languageClass = classes.find(c => c.startsWith('language-'));
            
            if (languageClass) {
                const language = languageClass.replace('language-', '');
                preElement.dataset.language = language;
                
                if (isRunnableLanguage(language)) {
                    const runBtn = document.createElement('button');
                    runBtn.className = 'code-action run-code';
                    runBtn.title = '运行代码';
                    runBtn.innerHTML = '<i class="fas fa-play"></i>';
                    toolbar.appendChild(runBtn);
                    
                    runBtn.addEventListener('click', () => {
                        runCodeBlock(preElement);
                    });
                }
                
                // 添加语言标签
                const languageTag = document.createElement('div');
                languageTag.className = 'code-language';
                languageTag.textContent = language;
                preElement.appendChild(languageTag);
            }
        }
        
        // 添加复制功能
        copyBtn.addEventListener('click', () => {
            const code = preElement.querySelector('code').textContent;
            copyToClipboard(code);
            showCopySuccess(copyBtn);
        });
        
        preElement.appendChild(toolbar);
    }
    
    // 显示复制成功反馈
    function showCopySuccess(button) {
        // 保存原始图标
        const originalHTML = button.innerHTML;
        
        // 更改为成功图标
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('success');
        
        // 2秒后恢复
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('success');
        }, 2000);
    }
    
    // 复制到剪贴板
    function copyToClipboard(text) {
        // 现代API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .catch(err => {
                    console.error('复制失败:', err);
                    fallbackCopyToClipboard(text);
                });
        } else {
            // 降级方案
            fallbackCopyToClipboard(text);
        }
    }
    
    // 降级复制方法
    function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        try {
            textarea.select();
            document.execCommand('copy');
        } catch (err) {
            console.error('复制失败:', err);
            
            // 如果支持创建通知，显示错误通知
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('复制失败', {
                    body: '无法复制代码到剪贴板。'
                });
            }
        }
        
        document.body.removeChild(textarea);
    }
    
    // 检查语言是否可运行
    function isRunnableLanguage(language) {
        if (!language) return false;
        
        const runnableLanguages = [
            'javascript', 'js', 
            'python', 'py', 
            'html',
            'typescript', 'ts'
        ];
        
        return runnableLanguages.includes(language.toLowerCase());
    }
    
    // 运行代码块
    function runCodeBlock(preElement) {
        const code = preElement.querySelector('code').textContent;
        const language = preElement.dataset.language;
        
        // 创建或获取输出容器
        let outputContainer = preElement.nextElementSibling;
        if (!outputContainer || !outputContainer.classList.contains('code-output')) {
            outputContainer = document.createElement('div');
            outputContainer.className = 'code-output';
            insertAfter(outputContainer, preElement);
        }
        
        // 清空之前的输出
        outputContainer.innerHTML = '<div class="output-header"><span>输出:</span></div><div class="output-content"></div>';
        const outputContent = outputContainer.querySelector('.output-content');
        
        // 根据语言运行代码
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'js':
                runJavaScript(code, outputContent);
                break;
            case 'python':
            case 'py':
                showPythonExecution(code, outputContent);
                break;
            case 'html':
                runHTML(code, outputContent);
                break;
            case 'typescript':
            case 'ts':
                showTypeScriptMessage(outputContent);
                break;
            default:
                outputContent.textContent = `不支持运行 ${language} 代码`;
        }
    }
    
    // 运行JavaScript代码
    function runJavaScript(code, outputEl) {
        // 创建一个安全的运行环境
        const sandboxFrame = document.createElement('iframe');
        sandboxFrame.style.display = 'none';
        document.body.appendChild(sandboxFrame);
        
        // 准备捕获控制台输出
        let consoleOutput = [];
        
        try {
            // 在iframe中创建控制台捕获
            const sandboxWindow = sandboxFrame.contentWindow;
            const originalConsole = Object.assign({}, sandboxWindow.console);
            
            // 重写console方法以捕获输出
            ['log', 'info', 'warn', 'error'].forEach(method => {
                sandboxWindow.console[method] = function(...args) {
                    consoleOutput.push({
                        type: method,
                        content: args.map(arg => {
                            try {
                                if (typeof arg === 'object') {
                                    return JSON.stringify(arg);
                                }
                                return String(arg);
                            } catch (e) {
                                return '[复杂对象]';
                            }
                        }).join(' ')
                    });
                    
                    // 调用原始console方法
                    originalConsole[method].apply(originalConsole, args);
                };
            });
            
            // 添加超时保护
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('执行超时（3秒）')), 3000);
            });
            
            // 执行代码
            const execPromise = new Promise((resolve) => {
                try {
                    // 使用Function构造函数执行代码
                    const result = sandboxWindow.Function(code)();
                    resolve(result);
                } catch (error) {
                    consoleOutput.push({
                        type: 'error',
                        content: error.toString()
                    });
                    resolve(null);
                }
            });
            
            // 竞争超时
            Promise.race([execPromise, timeoutPromise])
                .then(result => {
                    if (result !== undefined && result !== null) {
                        consoleOutput.push({
                            type: 'result',
                            content: typeof result === 'object' ? 
                                     JSON.stringify(result, null, 2) : String(result)
                        });
                    }
                    displayConsoleOutput(consoleOutput, outputEl);
                })
                .catch(error => {
                    consoleOutput.push({
                        type: 'error',
                        content: error.toString()
                    });
                    displayConsoleOutput(consoleOutput, outputEl);
                })
                .finally(() => {
                    // 清理iframe
                    document.body.removeChild(sandboxFrame);
                });
                
        } catch (error) {
            outputEl.innerHTML = `<div class="output-error">无法执行代码: ${error.message}</div>`;
            // 清理iframe
            document.body.removeChild(sandboxFrame);
        }
    }
    
    // 显示Python无法在浏览器中执行的消息
    function showPythonExecution(code, outputEl) {
        // 模拟Python REPL
        outputEl.innerHTML = `
            <div class="python-repl-info">
                Python 代码不能在浏览器中直接运行。请使用本地Python环境执行此代码。
                <div class="python-command">
                    <pre><code>python -c "${escapeHtml(code.replace(/"/g, '\\"'))}"</code></pre>
                </div>
                <div class="python-repl-links">
                    <a href="https://replit.com/languages/python3" target="_blank">
                        <i class="fas fa-external-link-alt"></i> 在Replit中运行
                    </a>
                    <a href="https://www.python.org/shell/" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Python Shell
                    </a>
                </div>
            </div>
        `;
    }
    
    // 运行HTML代码
    function runHTML(code, outputEl) {
        // 创建预览iframe
        const iframe = document.createElement('iframe');
        iframe.className = 'html-preview';
        iframe.sandbox = 'allow-scripts';
        
        outputEl.innerHTML = '';
        outputEl.appendChild(iframe);
        
        // 设置iframe内容
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(code);
        iframe.contentWindow.document.close();
        
        // 调整iframe高度
        setTimeout(() => {
            const height = iframe.contentWindow.document.documentElement.scrollHeight;
            iframe.style.height = (height + 20) + 'px';
        }, 100);
    }
    
    // 显示TypeScript编译消息
    function showTypeScriptMessage(outputEl) {
        outputEl.innerHTML = `
            <div class="typescript-info">
                TypeScript 需要先编译成 JavaScript 才能运行。
                <div class="typescript-links">
                    <a href="https://www.typescriptlang.org/play" target="_blank">
                        <i class="fas fa-external-link-alt"></i> 在TypeScript Playground中运行
                    </a>
                </div>
            </div>
        `;
    }
    
    // 显示控制台输出
    function displayConsoleOutput(outputs, outputEl) {
        if (outputs.length === 0) {
            outputEl.innerHTML = '<div class="output-empty">（无输出）</div>';
            return;
        }
        
        const outputHTML = outputs.map(item => {
            let className = 'console-' + item.type;
            let icon = '';
            
            switch (item.type) {
                case 'log':
                    icon = '<i class="fas fa-angle-right"></i>';
                    break;
                case 'info':
                    icon = '<i class="fas fa-info-circle"></i>';
                    break;
                case 'warn':
                    icon = '<i class="fas fa-exclamation-triangle"></i>';
                    break;
                case 'error':
                    icon = '<i class="fas fa-times-circle"></i>';
                    break;
                case 'result':
                    icon = '<i class="fas fa-arrow-right"></i>';
                    break;
            }
            
            return `<div class="${className}">${icon} ${escapeHtml(item.content)}</div>`;
        }).join('');
        
        outputEl.innerHTML = outputHTML;
    }
    
    // 插入元素到指定元素之后
    function insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    
    // HTML转义
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 初始化代码块工具
    initCodeBlockTools();
});