/**
 * OmniFlow增强版聊天界面交互脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const chatHistory = document.getElementById('chatHistory');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const newChatBtn = document.getElementById('newChatBtn');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const chatTitle = document.getElementById('chatTitle');
    const editTitleBtn = document.getElementById('editTitleBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    const shareChatBtn = document.getElementById('shareChatBtn');
    const chatSidebar = document.querySelector('.chat-sidebar');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const exampleButtons = document.querySelectorAll('.example-button');
    const typingStatus = document.querySelector('.typing-status');
    
    // 配置
    const config = {
        typingAnimation: true,     // 打字动画效果
        codeHighlighting: true,    // 代码高亮
        markdownSupport: true,     // Markdown支持
        soundEffects: false,       // 音效
        autoScroll: true,          // 自动滚动
        saveHistory: true          // 保存历史
    };
    
    // 状态
    const state = {
        currentChatId: null,
        chats: [],
        isTyping: false,
        isDarkTheme: localStorage.getItem('theme') !== 'light',
        pendingMessages: [],
        messageQueue: [],
        isProcessingQueue: false,
        typingTimeout: null
    };

    // 初始化
    function init() {
        applyTheme();
        setupEventListeners();
        autoResizeTextarea();
        setupExampleButtons();
        loadChats();
        initCodeHighlighting();
        initMarkdownParser();
        
        // 淡入动画
        document.body.classList.add('loaded');
        
        // 检查URL参数是否需要加载特定对话
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('id');
        if (chatId) {
            loadChat(chatId);
        }
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 消息发送
        messageInput.addEventListener('input', function() {
            autoResizeTextarea();
            updateSendButtonState();
        });
        
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && !isMobile()) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        sendButton.addEventListener('click', sendMessage);
        
        // 侧边栏控制
        newChatBtn.addEventListener('click', startNewChat);
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
        mobileMenuBtn.addEventListener('click', showSidebar);
        
        // 对话操作
        editTitleBtn.addEventListener('click', () => editChatTitle(state.currentChatId));
        deleteChatBtn.addEventListener('click', () => confirmDeleteChat(state.currentChatId));
        shareChatBtn.addEventListener('click', () => shareChat(state.currentChatId));
        
        // 主题切换
        themeToggleBtn.addEventListener('click', toggleTheme);
        
        // 点击侧边栏外关闭（移动设备）
        document.addEventListener('click', function(e) {
            if (isMobile() && 
                chatSidebar.classList.contains('show') && 
                !chatSidebar.contains(e.target) && 
                e.target !== mobileMenuBtn) {
                hideSidebar();
            }
        });
        
        // 滚动事件
        chatHistory.addEventListener('scroll', function() {
            const scrollTop = chatHistory.scrollTop;
            const scrollHeight = chatHistory.scrollHeight;
            const clientHeight = chatHistory.clientHeight;
            
            // 当滚动到顶部时，可以加载更多历史消息
            if (scrollTop === 0 && state.currentChatId) {
                // loadMoreMessages(state.currentChatId);
            }
            
            // 检查是否滚动到底部
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
            if (isAtBottom) {
                chatHistory.classList.remove('not-at-bottom');
            } else {
                chatHistory.classList.add('not-at-bottom');
            }
        });
        
        // 窗口大小变化时调整布局
        window.addEventListener('resize', function() {
            adjustLayout();
        });
        
        // 初始状态
        updateSendButtonState();
    }
    
    // 自动调整文本区域高度
    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    }
    
    // 更新发送按钮状态
    function updateSendButtonState() {
        const isEmpty = messageInput.value.trim() === '';
        sendButton.disabled = isEmpty;
        sendButton.classList.toggle('disabled', isEmpty);
    }
    
    // 发送消息
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || state.isTyping) return;
        
        // 清空输入框
        messageInput.value = '';
        messageInput.style.height = 'auto';
        updateSendButtonState();
        messageInput.focus();
        
        // 在UI上显示用户消息
        appendMessage('user', message);
        
        // 设置AI正在输入状态
        setTypingStatus(true);
        
        // 发送到后端API
        const chatId = state.currentChatId;
        const requestData = { message };
        if (chatId) {
            requestData.chat_id = chatId;
        }
        
        fetch('/api/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                throw new Error(data.message || '发送消息失败');
            }
            
            // 更新当前对话ID
            if (!state.currentChatId && data.chat_id) {
                state.currentChatId = data.chat_id;
                
                // 更新URL
                updateUrlWithChatId(data.chat_id);
                
                // 更新对话标题
                const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
                chatTitle.textContent = title;
                
                // 按钮可用
                editTitleBtn.classList.remove('disabled');
                deleteChatBtn.classList.remove('disabled');
                shareChatBtn.classList.remove('disabled');
                
                // 重新加载对话列表
                loadChats();
            }
            
            // 显示回复（带打字效果）
            if (config.typingAnimation && data.reply.length < 500) {
                typeMessage('assistant', data.reply);
            } else {
                appendMessage('assistant', data.reply);
                setTypingStatus(false);
            }
            
            if (config.soundEffects) {
                playSound('message-received');
            }
        })
        .catch(error => {
            console.error('发送消息失败:', error);
            appendMessage('system', `错误: ${error.message || '发送失败，请重试'}`);
            setTypingStatus(false);
        });
    }
    
    // 添加消息到聊天记录
    function appendMessage(role, content) {
        // 检查是否是欢迎消息，如果是则清空
        if (isWelcomeMessageVisible()) {
            chatHistory.innerHTML = '';
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        if (role === 'system') {
            messageEl.classList.add('system-message');
        }
        
        let avatar = '';
        if (role === 'user') {
            avatar = '<div class="message-avatar user">U</div>';
        } else if (role === 'assistant') {
            avatar = '<div class="message-avatar assistant">A</div>';
        } else {
            avatar = '<div class="message-avatar system"><i class="fas fa-exclamation-triangle"></i></div>';
        }
        
        // 处理内容
        let processedContent = escapeHtml(content);
        
        if (config.markdownSupport && role !== 'user') {
            processedContent = marked.parse(processedContent);
        }
        
        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content">${processedContent}</div>
            <div class="message-actions">
                <button class="message-action" title="复制" data-action="copy">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        chatHistory.appendChild(messageEl);
        
        // 添加消息操作事件
        const copyBtn = messageEl.querySelector('[data-action="copy"]');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                copyToClipboard(content);
                showToast('已复制到剪贴板');
            });
        }
        
        // 代码高亮
        if (config.codeHighlighting && role !== 'user') {
            highlightCodeBlocks(messageEl);
        }
        
        // 滚动到底部
        if (config.autoScroll) {
            scrollToBottom();
        }
    }
    
    // 带打字效果的消息显示
    function typeMessage(role, content) {
        // 创建消息容器
        const messageEl = document.createElement('div');
        messageEl.className = 'message typing';
        
        let avatar = '';
        if (role === 'assistant') {
            avatar = '<div class="message-avatar assistant">A</div>';
        }
        
        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content"></div>
            <div class="message-actions">
                <button class="message-action" title="复制" data-action="copy" style="visibility: hidden">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        chatHistory.appendChild(messageEl);
        scrollToBottom();
        
        // 处理内容
        let processedContent = escapeHtml(content);
        
        if (config.markdownSupport) {
            processedContent = marked.parse(processedContent);
        }
        
        // 分词
        const contentEl = messageEl.querySelector('.message-content');
        const copyBtn = messageEl.querySelector('[data-action="copy"]');
        
        // 动态打字效果
        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < processedContent.length) {
                const curChar = processedContent.charAt(charIndex);
                if (curChar === '<') {
                    // 找到HTML标签的结束位置
                    const tagEndIndex = processedContent.indexOf('>', charIndex);
                    if (tagEndIndex !== -1) {
                        contentEl.innerHTML += processedContent.substring(charIndex, tagEndIndex + 1);
                        charIndex = tagEndIndex + 1;
                    } else {
                        contentEl.innerHTML += curChar;
                        charIndex++;
                    }
                } else {
                    contentEl.innerHTML += curChar;
                    charIndex++;
                }
                
                scrollToBottom();
            } else {
                clearInterval(typeInterval);
                messageEl.classList.remove('typing');
                setTypingStatus(false);
                
                // 代码高亮
                if (config.codeHighlighting) {
                    highlightCodeBlocks(messageEl);
                }
                
                // 显示复制按钮
                copyBtn.style.visibility = 'visible';
                copyBtn.addEventListener('click', function() {
                    copyToClipboard(content);
                    showToast('已复制到剪贴板');
                });
            }
        }, 10);
    }
    
    // 设置正在输入状态
    function setTypingStatus(isTyping) {
        state.isTyping = isTyping;
        
        if (isTyping) {
            typingStatus.classList.add('active');
        } else {
            typingStatus.classList.remove('active');
        }
        
        sendButton.disabled = isTyping || messageInput.value.trim() === '';
    }
    
    // 加载聊天列表
    function loadChats() {
        fetch('/api/chats')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    state.chats = data.chats;
                    renderChatList();
                }
            })
            .catch(error => {
                console.error('获取聊天列表失败:', error);
                showToast('获取聊天历史失败', 'error');
            });
    }
    
    // 渲染聊天列表
    function renderChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        if (state.chats.length === 0) {
            chatList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>暂无聊天记录</p>
                </div>
            `;
            return;
        }
        
        state.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = chat.id;
            
            if (chat.id === state.currentChatId) {
                chatItem.classList.add('active');
            }
            
            const timestamp = formatTime(chat.timestamp);
            
            chatItem.innerHTML = `
                <div class="chat-item-icon">
                    <i class="fas fa-comment-alt"></i>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                    <div class="chat-item-time">${timestamp}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-item-action" data-action="edit" title="编辑标题">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-item-action" data-action="delete" title="删除对话">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            // 点击事件
            chatItem.addEventListener('click', function(e) {
                const action = e.target.closest('.chat-item-action');
                if (action) {
                    e.stopPropagation();
                    const actionType = action.dataset.action;
                    
                    if (actionType === 'edit') {
                        editChatTitle(chat.id, chat.title);
                    } else if (actionType === 'delete') {
                        confirmDeleteChat(chat.id);
                    }
                } else {
                    loadChat(chat.id);
                }
            });
            
            chatList.appendChild(chatItem);
        });
    }
    
    // 加载特定聊天记录
    function loadChat(chatId) {
        if (state.isTyping) return;
        
        // 更新当前选择
        state.currentChatId = chatId;
        
        // 更新URL
        updateUrlWithChatId(chatId);
        
        // 更新选中状态
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === chatId);
        });
        
        // 获取聊天信息
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
            chatTitle.textContent = chat.title;
            
            // 更新按钮状态
            editTitleBtn.classList.remove('disabled');
            deleteChatBtn.classList.remove('disabled');
            shareChatBtn.classList.remove('disabled');
        }
        
        // 显示加载动画
        chatHistory.innerHTML = `
            <div class="loading-message">
                <div class="loading-spinner"></div>
                <div>加载消息中...</div>
            </div>
        `;
        
        // 获取聊天记录
        fetch(`/api/chat/${chatId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    renderChatMessages(data.messages);
                } else {
                    throw new Error(data.message || '无法加载聊天记录');
                }
            })
            .catch(error => {
                console.error('获取聊天记录失败:', error);
                chatHistory.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>加载聊天记录失败: ${error.message}</p>
                    </div>
                `;
            });
            
        // 在移动视图中加载聊天后关闭侧边栏
        if (isMobile()) {
            hideSidebar();
        }
    }
    
    // 渲染聊天消息记录
    function renderChatMessages(messages) {
        chatHistory.innerHTML = '';
        
        if (messages.length === 0) {
            chatHistory.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comment-dots"></i>
                    <p>没有消息记录</p>
                </div>
            `;
            return;
        }
        
        messages.forEach(message => {
            appendMessage(message.role, message.content);
        });
        
        // 滚动到底部
        scrollToBottom();
        
        // 代码高亮
        if (config.codeHighlighting) {
            document.querySelectorAll('.message pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }
    
    // 开始新对话
    function startNewChat() {
        if (state.isTyping) return;
        
        // 清除当前对话ID
        state.currentChatId = null;
        
        // 更新URL
        history.pushState({}, '', window.location.pathname);
        
        // 清除聊天历史
        showWelcomeMessage();
        
        // 更新标题
        chatTitle.textContent = '新对话';
        
        // 更新按钮状态
        editTitleBtn.classList.add('disabled');
        deleteChatBtn.classList.add('disabled');
        shareChatBtn.classList.add('disabled');
        
        // 更新活跃状态
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 聚焦到输入框
        messageInput.focus();
        
        // 在移动视图中关闭侧边栏
        if (isMobile()) {
            hideSidebar();
        }
    }
    
    // 显示欢迎消息
    function showWelcomeMessage() {
        chatHistory.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-title">
                    <div class="welcome-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h2>欢迎使用 OmniFlow</h2>
                </div>
                <p>开始一个新对话，或从左侧选择历史记录</p>
                <div class="welcome-examples">
                    <h3>示例问题</h3>
                    <div class="example-grid">
                        <button class="example-button">如何使用OmniFlow的流程编辑器？</button>
                        <button class="example-button">能否帮我分析一段Python代码？</button>
                        <button class="example-button">请推荐一些提高工作效率的方法</button>
                        <button class="example-button">什么是机器学习？请用通俗的语言解释</button>
                    </div>
                </div>
            </div>
        `;
        
        // 重新绑定示例按钮事件
        setupExampleButtons();
    }
    
    // 检查是否显示欢迎消息
    function isWelcomeMessageVisible() {
        return document.querySelector('.welcome-message') !== null;
    }
    
    // 设置示例按钮
    function setupExampleButtons() {
        document.querySelectorAll('.example-button').forEach(button => {
            button.addEventListener('click', function() {
                messageInput.value = this.textContent;
                messageInput.focus();
                autoResizeTextarea();
                updateSendButtonState();
            });
        });
    }
    
    // 编辑聊天标题
    function editChatTitle(chatId, currentTitle) {
        if (!chatId) return;
        
        // 获取当前标题
        if (!currentTitle && chatId) {
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                currentTitle = chat.title;
            }
        }
        
        // 显示对话框
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="edit-title-dialog">
                <div class="dialog-header">编辑对话标题</div>
                <div class="dialog-content">
                    <input type="text" id="titleInput" value="${escapeHtml(currentTitle || '')}" 
                           placeholder="输入新标题..." maxlength="50">
                    <div class="char-counter">
                        <span id="charCount">0</span>/50
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-button cancel">取消</button>
                    <button class="dialog-button save">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 聚焦输入框
        const titleInput = dialog.querySelector('#titleInput');
        titleInput.focus();
        titleInput.select();
        
        // 更新字符计数
        const charCount = dialog.querySelector('#charCount');
        charCount.textContent = titleInput.value.length;
        
        titleInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
        
        // 按钮事件
        const cancelBtn = dialog.querySelector('.cancel');
        const saveBtn = dialog.querySelector('.save');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        saveBtn.addEventListener('click', () => {
            const newTitle = titleInput.value.trim();
            if (!newTitle) {
                showToast('标题不能为空', 'warning');
                return;
            }
            
            // 更新标题
            updateChatTitle(chatId, newTitle);
            document.body.removeChild(dialog);
        });
        
        // ESC键关闭
        function handleDialogKeydown(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleDialogKeydown);
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveBtn.click();
            }
        }
        document.addEventListener('keydown', handleDialogKeydown);
    }
    
    // 更新聊天标题
    function updateChatTitle(chatId, newTitle) {
        fetch(`/api/chat/${chatId}/title`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 更新本地数据
                const chatIndex = state.chats.findIndex(c => c.id === chatId);
                if (chatIndex !== -1) {
                    state.chats[chatIndex].title = newTitle;
                    renderChatList();
                }
                
                // 如果是当前对话，更新标题
                if (chatId === state.currentChatId) {
                    chatTitle.textContent = newTitle;
                }
                
                showToast('标题已更新');
            } else {
                throw new Error(data.message || '更新标题失败');
            }
        })
        .catch(error => {
            console.error('更新标题失败:', error);
            showToast('更新标题失败: ' + error.message, 'error');
        });
    }
    
    // 确认删除对话
    function confirmDeleteChat(chatId) {
        if (!chatId) return;
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <div class="dialog-header">
                    <i class="fas fa-exclamation-triangle warning-icon"></i>
                    确认删除
                </div>
                <div class="dialog-content">
                    <p>确定要删除这个对话吗？此操作无法撤销。</p>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-button cancel">取消</button>
                    <button class="dialog-button delete danger">删除</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 按钮事件
        const cancelBtn = dialog.querySelector('.cancel');
        const deleteBtn = dialog.querySelector('.delete');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        deleteBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            deleteChat(chatId);
        });
        
        // ESC键关闭
        function handleDialogKeydown(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleDialogKeydown);
            }
        }
        document.addEventListener('keydown', handleDialogKeydown);
    }
    
    // 删除聊天记录
    function deleteChat(chatId) {
        fetch(`/api/chat/${chatId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 更新本地数据
                state.chats = state.chats.filter(c => c.id !== chatId);
                
                // 如果删除的是当前对话，返回到新对话状态
                if (chatId === state.currentChatId) {
                    startNewChat();
                }
                
                // 重新渲染聊天列表
                renderChatList();
                showToast('对话已删除');
            } else {
                throw new Error(data.message || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除对话失败:', error);
            showToast('删除失败: ' + error.message, 'error');
        });
    }
    
    // 分享聊天记录
    function shareChat(chatId) {
        if (!chatId) return;
        
        // 生成分享URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?id=${chatId}`;
        
        // 显示分享对话框
        const dialog = document.createElement('div');
        dialog.className = 'dialog-overlay';
        dialog.innerHTML = `
            <div class="share-dialog">
                <div class="dialog-header">分享对话</div>
                <div class="dialog-content">
                    <div class="share-url-container">
                        <input type="text" id="shareUrlInput" value="${shareUrl}" readonly>
                        <button id="copyShareUrl" class="icon-button" title="复制链接">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="share-options">
                        <button class="share-option" data-platform="copy">
                            <i class="fas fa-link"></i>
                            <span>复制链接</span>
                        </button>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="dialog-button cancel">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 复制按钮事件
        const copyBtn = dialog.querySelector('#copyShareUrl');
        const urlInput = dialog.querySelector('#shareUrlInput');
        
        copyBtn.addEventListener('click', () => {
            urlInput.select();
            document.execCommand('copy');
            showToast('链接已复制到剪贴板');
        });
        
        // 分享选项
        const shareOptions = dialog.querySelectorAll('.share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', function() {
                const platform = this.dataset.platform;
                
                if (platform === 'copy') {
                    copyToClipboard(shareUrl);
                    showToast('链接已复制到剪贴板');
                }
            });
        });
        
        // 关闭按钮
        const closeBtn = dialog.querySelector('.cancel');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        // ESC键关闭
        function handleDialogKeydown(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', handleDialogKeydown);
            }
        }
        document.addEventListener('keydown', handleDialogKeydown);
    }
    
    // 更新URL中的聊天ID
    function updateUrlWithChatId(chatId) {
        const url = new URL(window.location);
        url.searchParams.set('id', chatId);
        history.pushState({}, '', url);
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // 显示消息提示
    function showToast(message, type = 'success') {
        // 移除现有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 
                               type === 'warning' ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                <span>${escapeHtml(message)}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 显示toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // 格式化时间
    function formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 7) {
            return date.toLocaleDateString();
        } else if (diffDays > 0) {
            return `${diffDays}天前`;
        } else if (diffHours > 0) {
            return `${diffHours}小时前`;
        } else if (diffMin > 0) {
            return `${diffMin}分钟前`;
        } else {
            return '刚刚';
        }
    }
    
    // 转义HTML
    function escapeHtml(unsafe) {
        return (unsafe || '')
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 复制内容到剪贴板
    function copyToClipboard(text) {
        // 使用现代API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            // 兼容旧版本浏览器
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('无法复制文本', err);
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    // 应用主题
    function applyTheme() {
        if (state.isDarkTheme) {
            document.body.classList.remove('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.title = '切换到亮色主题';
        } else {
            document.body.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = '切换到暗色主题';
        }
    }
    
    // 切换主题
    function toggleTheme() {
        state.isDarkTheme = !state.isDarkTheme;
        localStorage.setItem('theme', state.isDarkTheme ? 'dark' : 'light');
        applyTheme();
    }
    
    // 显示侧边栏
    function showSidebar() {
        chatSidebar.classList.add('show');
    }
    
    // 隐藏侧边栏
    function hideSidebar() {
        chatSidebar.classList.remove('show');
    }
    
    // 切换侧边栏
    function toggleSidebar() {
        chatSidebar.classList.toggle('show');
    }
    
    // 调整布局
    function adjustLayout() {
        // 动态调整输入框高度
        autoResizeTextarea();
        
        // 在移动设备上自动隐藏侧边栏
        if (isMobile() && chatSidebar.classList.contains('show')) {
            hideSidebar();
        }
    }
    
    // 检查是否是移动设备
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // 初始化代码高亮
    function initCodeHighlighting() {
        if (!window.hljs) {
            // 懒加载highlight.js
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
            script.onload = () => {
                // 加载后自动高亮现有代码块
                highlightAllCodeBlocks();
            };
            document.head.appendChild(script);
            
            // 加载样式
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css';
            document.head.appendChild(style);
        }
    }
    
    // 高亮代码块
    function highlightCodeBlocks(container) {
        if (!window.hljs) return;
        
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });
    }
    
    // 高亮所有代码块
    function highlightAllCodeBlocks() {
        if (!window.hljs) return;
        
        document.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }
    
    // 初始化Markdown解析器
    function initMarkdownParser() {
        if (!window.marked) {
            // 懒加载marked.js
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js';
            document.head.appendChild(script);
        }
    }
    
    // 启动应用
    init();