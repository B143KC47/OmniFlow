/**
 * OmniFlow打字助手
 * 为聊天输入框提供代码补全、提示、快速命令等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取输入框元素
    const messageInput = document.getElementById('messageInput');
    if (!messageInput) return;
    
    // 配置
    const config = {
        enableAutoComplete: true,      // 启用自动补全
        enableCommands: true,          // 启用快捷命令
        enableMarkdownAssist: true,    // 启用Markdown辅助
        enableEmoji: true              // 启用表情符号
    };
    
    // 代码语言列表
    const codeLanguages = [
        'javascript', 'js', 'python', 'py', 'java', 'cpp', 'c++', 'c',
        'html', 'css', 'php', 'ruby', 'go', 'rust', 'typescript', 'ts',
        'sql', 'swift', 'kotlin', 'bash', 'shell', 'powershell', 'json', 'xml'
    ];
    
    // 常用Markdown语法
    const markdownShortcuts = {
        '# ': '标题1',
        '## ': '标题2',
        '### ': '标题3',
        '- ': '列表项',
        '1. ': '有序列表',
        '> ': '引用',
        '```': '代码块',
        '**': '粗体',
        '_': '斜体',
        '~~': '删除线',
        '[](': '链接',
        '![](': '图片'
    };
    
    // 表情符号
    const emojis = {
        ':)': '😊',
        ':(': '😢',
        ':D': '😃',
        ':P': '😛',
        ':O': '😲',
        ';)': '😉',
        '<3': '❤️',
        ':/': '😕',
        ':+1:': '👍',
        ':-1:': '👎',
        ':check:': '✅',
        ':x:': '❌',
        ':star:': '⭐',
        ':idea:': '💡',
        ':warning:': '⚠️',
        ':fire:': '🔥'
    };
    
    // 快捷命令
    const commands = {
        '/help': '显示帮助信息',
        '/clear': '清空对话',
        '/code': '插入代码块',
        '/table': '创建表格',
        '/math': '插入数学公式',
        '/date': '插入当前日期',
        '/time': '插入当前时间',
        '/shrug': '插入耸肩表情 ¯\\_(ツ)_/¯',
        '/quote': '引用上一条消息'
    };
    
    // 建议面板DOM元素
    let suggestionsPanel = null;
    let activeSuggestionIndex = -1;
    let suggestions = [];
    
    // 创建建议面板
    function createSuggestionsPanel() {
        // 如果已存在，则返回
        if (suggestionsPanel) return suggestionsPanel;
        
        // 创建面板
        suggestionsPanel = document.createElement('div');
        suggestionsPanel.className = 'suggestions-panel';
        suggestionsPanel.style.display = 'none';
        
        document.body.appendChild(suggestionsPanel);
        return suggestionsPanel;
    }
    
    // 初始化
    function init() {
        // 创建建议面板
        suggestionsPanel = createSuggestionsPanel();
        
        // 输入事件
        messageInput.addEventListener('input', handleInput);
        
        // 键盘事件
        messageInput.addEventListener('keydown', handleKeyDown);
        
        // 窗口大小改变时重新定位建议面板
        window.addEventListener('resize', positionSuggestionsPanel);
        
        // 点击页面其他区域时关闭建议面板
        document.addEventListener('click', function(e) {
            if (e.target !== messageInput && e.target !== suggestionsPanel) {
                hideSuggestions();
            }
        });
        
        // 添加 Tab 键处理来自动完成 Markdown 语法
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // 获取光标位置
                const cursorPos = messageInput.selectionStart;
                const text = messageInput.value;
                
                // 特殊处理代码块
                if (text.substring(cursorPos - 3, cursorPos) === '```') {
                    // 代码块自动补全
                    const languages = ['javascript', 'python', 'html', 'css', 'java', 'sql', 'bash'];
                    showCodeLanguageSuggestions(languages);
                    return;
                }
                
                // 判断是否在行首
                const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
                const currentLine = text.substring(lineStart, cursorPos);
                
                if (currentLine === '') {
                    // 行首缩进
                    insertTextAtCursor('  ');
                } else if (currentLine.match(/^(\s*)\d+\.\s$/)) {
                    // 自动有序列表
                    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s$/);
                    const spaces = numMatch[1];
                    const nextNum = parseInt(numMatch[2]) + 1;
                    insertTextAtCursor(`\n${spaces}${nextNum}. `);
                } else if (currentLine.match(/^(\s*)-\s$/)) {
                    // 自动无序列表
                    const match = currentLine.match(/^(\s*)-\s$/);
                    const spaces = match[1];
                    insertTextAtCursor(`\n${spaces}- `);
                } else {
                    // 普通缩进
                    insertTextAtCursor('  ');
                }
            }
        });
    }
    
    // 处理输入事件
    function handleInput() {
        const text = messageInput.value;
        const cursorPos = messageInput.selectionStart;
        
        // 提取当前单词
        const beforeCursor = text.substring(0, cursorPos);
        
        // 检查命令
        if (config.enableCommands) {
            const commandMatch = beforeCursor.match(/\/(\w*)$/);
            if (commandMatch) {
                const partialCommand = commandMatch[1];
                showCommandSuggestions(partialCommand);
                return;
            }
        }
        
        // 检查表情符号
        if (config.enableEmoji) {
            const emojiMatch = beforeCursor.match(/:([a-z0-9+\-_]*)$/i);
            if (emojiMatch) {
                const partialEmoji = emojiMatch[1];
                showEmojiSuggestions(partialEmoji);
                return;
            }
        }
        
        // 检查代码块
        if (config.enableMarkdownAssist) {
            const codeBlockMatch = beforeCursor.match(/```([a-z]*)$/i);
            if (codeBlockMatch) {
                const partialLang = codeBlockMatch[1];
                showCodeLanguageSuggestions(partialLang);
                return;
            }
        }
        
        // 关闭建议面板（如果没有匹配项）
        hideSuggestions();
    }
    
    // 处理键盘事件
    function handleKeyDown(e) {
        // 如果建议面板不可见，跳过
        if (suggestionsPanel.style.display === 'none') return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateSuggestion(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateSuggestion(-1);
                break;
            case 'Enter':
                // 如果有活跃的建议，选择它
                if (activeSuggestionIndex >= 0) {
                    e.preventDefault();
                    selectActiveSuggestion();
                } else {
                    hideSuggestions();
                }
                break;
            case 'Escape':
                e.preventDefault();
                hideSuggestions();
                break;
            case 'Tab':
                // Tab键处理（如果有建议）
                if (suggestionsPanel.style.display !== 'none') {
                    e.preventDefault();
                    selectActiveSuggestion();
                }
                break;
        }
    }
    
    // 显示命令建议
    function showCommandSuggestions(partialCommand) {
        const matches = [];
        
        for (const cmd in commands) {
            if (cmd.startsWith('/' + partialCommand)) {
                matches.push({
                    text: cmd,
                    description: commands[cmd],
                    type: 'command'
                });
            }
        }
        
        if (matches.length) {
            suggestions = matches;
            renderSuggestions(suggestions);
            showSuggestions();
        } else {
            hideSuggestions();
        }
    }
    
    // 显示表情符号建议
    function showEmojiSuggestions(partialEmoji) {
        const matches = [];
        
        for (const emoji in emojis) {
            const key = emoji.replace(/:/g, '');
            if (key.toLowerCase().includes(partialEmoji.toLowerCase())) {
                matches.push({
                    text: emoji,
                    description: emojis[emoji],
                    type: 'emoji'
                });
            }
        }
        
        if (matches.length) {
            suggestions = matches;
            renderSuggestions(suggestions);
            showSuggestions();
        } else {
            hideSuggestions();
        }
    }
    
    // 显示代码语言建议
    function showCodeLanguageSuggestions(partialLang) {
        const filteredLangs = codeLanguages.filter(lang => 
            lang.toLowerCase().startsWith(partialLang.toLowerCase())
        );
        
        if (filteredLangs.length) {
            suggestions = filteredLangs.map(lang => ({
                text: lang,
                description: null,
                type: 'language'
            }));
            renderSuggestions(suggestions);
            showSuggestions();
        } else {
            hideSuggestions();
        }
    }
    
    // 显示建议面板
    function showSuggestions() {
        positionSuggestionsPanel();
        suggestionsPanel.style.display = 'block';
        
        // 默认选择第一个建议
        activeSuggestionIndex = 0;
        updateActiveSuggestion();
    }
    
    // 隐藏建议面板
    function hideSuggestions() {
        suggestionsPanel.style.display = 'none';
        activeSuggestionIndex = -1;
        suggestions = [];
    }
    
    // 定位建议面板
    function positionSuggestionsPanel() {
        if (!messageInput || suggestionsPanel.style.display === 'none') return;
        
        const inputRect = messageInput.getBoundingClientRect();
        
        suggestionsPanel.style.width = inputRect.width + 'px';
        suggestionsPanel.style.left = inputRect.left + 'px';
        suggestionsPanel.style.bottom = (window.innerHeight - inputRect.top) + 'px';
    }
    
    // 渲染建议
    function renderSuggestions(items) {
        suggestionsPanel.innerHTML = '';
        
        if (items.length === 0) {
            hideSuggestions();
            return;
        }
        
        // 创建建议列表
        const ul = document.createElement('ul');
        ul.className = 'suggestions-list';
        
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.dataset.index = index;
            
            // 根据类型创建不同样式
            if (item.type === 'emoji') {
                li.innerHTML = `
                    <div class="suggestion-emoji">${item.description}</div>
                    <div class="suggestion-text">${item.text}</div>
                `;
            } else if (item.type === 'command') {
                li.innerHTML = `
                    <div class="suggestion-command">${item.text}</div>
                    <div class="suggestion-description">${item.description}</div>
                `;
            } else if (item.type === 'language') {
                li.innerHTML = `
                    <div class="suggestion-language">${item.text}</div>
                `;
            }
            
            // 点击选择建议
            li.addEventListener('click', () => {
                activeSuggestionIndex = index;
                selectActiveSuggestion();
            });
            
            // 鼠标悬停更新活跃的建议
            li.addEventListener('mouseover', () => {
                activeSuggestionIndex = index;
                updateActiveSuggestion();
            });
            
            ul.appendChild(li);
        });
        
        suggestionsPanel.appendChild(ul);
    }
    
    // 导航建议列表
    function navigateSuggestion(direction) {
        const newIndex = activeSuggestionIndex + direction;
        
        if (newIndex >= 0 && newIndex < suggestions.length) {
            activeSuggestionIndex = newIndex;
            updateActiveSuggestion();
        }
    }
    
    // 更新当前活跃的建议
    function updateActiveSuggestion() {
        const items = suggestionsPanel.querySelectorAll('.suggestion-item');
        
        items.forEach((item, index) => {
            if (index === activeSuggestionIndex) {
                item.classList.add('active');
                item.scrollIntoView({block: "nearest", behavior: "smooth"});
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // 选择当前活跃的建议
    function selectActiveSuggestion() {
        if (activeSuggestionIndex < 0 || !suggestions[activeSuggestionIndex]) {
            hideSuggestions();
            return;
        }
        
        const suggestion = suggestions[activeSuggestionIndex];
        
        // 获取输入框文本和光标位置
        const text = messageInput.value;
        const cursorPos = messageInput.selectionStart;
        
        let prefixLength = 0;
        let replacement = '';
        
        // 根据建议类型处理替换文本
        if (suggestion.type === 'command') {
            // 命令
            const commandMatch = text.substring(0, cursorPos).match(/\/(\w*)$/);
            if (commandMatch) {
                prefixLength = commandMatch[0].length;
                replacement = executeCommand(suggestion.text);
            }
        } else if (suggestion.type === 'emoji') {
            // 表情符号
            const emojiMatch = text.substring(0, cursorPos).match(/:([a-z0-9+\-_]*)$/i);
            if (emojiMatch) {
                prefixLength = emojiMatch[0].length;
                replacement = suggestion.description;
            }
        } else if (suggestion.type === 'language') {
            // 代码语言
            const langMatch = text.substring(0, cursorPos).match(/```([a-z]*)$/i);
            if (langMatch) {
                prefixLength = langMatch[0].length;
                replacement = '```' + suggestion.text + '\n\n```';
                
                // 设置光标位置到代码块中间
                const newCursorPos = cursorPos - prefixLength + replacement.indexOf('\n\n') + 1;
                setTimeout(() => {
                    messageInput.selectionStart = messageInput.selectionEnd = newCursorPos;
                }, 0);
            }
        }
        
        // 替换文本
        if (prefixLength > 0) {
            const newText = text.substring(0, cursorPos - prefixLength) + 
                          replacement + 
                          text.substring(cursorPos);
            
            messageInput.value = newText;
            
            // 设置光标位置
            const newPos = cursorPos - prefixLength + replacement.length;
            messageInput.selectionStart = messageInput.selectionEnd = newPos;
            
            // 处理自动调整高度
            messageInput.dispatchEvent(new Event('input'));
        }
        
        // 隐藏建议
        hideSuggestions();
    }
    
    // 执行命令
    function executeCommand(cmd) {
        switch(cmd) {
            case '/help':
                showHelpDialog();
                return '';
            case '/clear':
                clearChat();
                return '';
            case '/code':
                return '```\n\n```';
            case '/table':
                return '| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n';
            case '/math':
                return '$$ e = mc^2 $$';
            case '/date':
                return new Date().toLocaleDateString();
            case '/time':
                return new Date().toLocaleTimeString();
            case '/shrug':
                return '¯\\_(ツ)_/¯';
            case '/quote':
                return getLastMessageForQuote();
            default:
                return cmd + ' ';
        }
    }
    
    // 显示帮助对话框
    function showHelpDialog() {
        // 创建帮助对话框
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="help-dialog">
                <div class="dialog-header">可用命令</div>
                <div class="dialog-content">
                    <div class="commands-list">
                        ${Object.entries(commands).map(([cmd, desc]) => 
                            `<div class="command-item">
                                <div class="command-name">${cmd}</div>
                                <div class="command-desc">${desc}</div>
                            </div>`
                        ).join('')}
                    </div>
                    <div class="help-section">
                        <h3>Markdown 语法</h3>
                        <div class="markdown-help">
                            ${Object.entries(markdownShortcuts).map(([syntax, desc]) => 
                                `<div class="markdown-item">
                                    <code>${syntax}</code>
                                    <span>${desc}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-button" id="helpCloseBtn">关闭</button>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(dialog);
        
        // 添加关闭按钮事件
        document.getElementById('helpCloseBtn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // ESC键关闭
        function handleEsc(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleEsc);
            }
        }
        
        document.addEventListener('keydown', handleEsc);
    }
    
    // 清空聊天
    function clearChat() {
        if (typeof window.startNewChat === 'function') {
            window.startNewChat();
        }
    }
    
    // 获取上一条消息用于引用
    function getLastMessageForQuote() {
        const messages = document.querySelectorAll('.message');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const content = lastMessage.querySelector('.message-content');
            const text = content ? content.textContent.trim() : '';
            
            // 限制长度
            const maxLength = 50;
            const quote = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
            
            return `> ${quote}\n\n`;
        }
        
        return '> ';
    }
    
    // 在光标位置插入文本
    function insertTextAtCursor(text) {
        const cursorPos = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPos);
        const textAfter = messageInput.value.substring(messageInput.selectionEnd);
        
        messageInput.value = textBefore + text + textAfter;
        
        // 设置新的光标位置
        const newPos = cursorPos + text.length;
        messageInput.selectionStart = messageInput.selectionEnd = newPos;
        
        // 触发input事件以更新高度等
        messageInput.dispatchEvent(new Event('input'));
    }
    
    // 在加载时初始化
    if (config.enableAutoComplete) {
        init();
    }
});