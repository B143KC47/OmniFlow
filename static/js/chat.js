document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const chatList = document.getElementById('chatList');
    const chatHistory = document.getElementById('chatHistory');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const newChatBtn = document.getElementById('newChatBtn');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const chatTitle = document.getElementById('chatTitle');
    const editTitleBtn = document.getElementById('editTitleBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    const chatSidebar = document.querySelector('.chat-sidebar');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const exampleButtons = document.querySelectorAll('.example-button');
    
    // 聊天状态
    let currentChatId = '';
    let chats = [];
    let isDarkTheme = true; // 默认暗色主题
    
    // 初始化
    function init() {
        loadChatList();
        setupEventListeners();
        loadThemePreference();
        autoResizeTextarea();
        setupExampleButtons();
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // 发送消息
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 新对话
        newChatBtn.addEventListener('click', startNewChat);
        
        // 切换侧边栏
        toggleSidebarBtn.addEventListener('click', toggleSidebar);
        mobileMenuBtn.addEventListener('click', function() {
            chatSidebar.classList.add('show');
        });
        
        // 编辑标题
        editTitleBtn.addEventListener('click', function() {
            showEditTitleDialog(currentChatId);
        });
        
        // 删除对话
        deleteChatBtn.addEventListener('click', function() {
            confirmDeleteChat(currentChatId);
        });
        
        // 处理移动端点击侧边栏外区域关闭侧边栏
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                chatSidebar.classList.contains('show') && 
                !chatSidebar.contains(e.target) && 
                e.target !== mobileMenuBtn) {
                chatSidebar.classList.remove('show');
            }
        });

        // 初始状态下禁用发送按钮
        updateSendButtonState();
        
        // 监听输入框变化，动态调整高度和发送按钮状态
        messageInput.addEventListener('input', function() {
            updateSendButtonState();
            autoResizeTextarea();
        });
        
        // 主题切换
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // 加载聊天列表
    function loadChatList() {
        fetch('/api/chats')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    chats = data.chats;
                    renderChatList(chats);
                }
            })
            .catch(error => {
                console.error('获取聊天列表失败:', error);
            });
    }
    
    // 渲染聊天列表
    function renderChatList(chats) {
        chatList.innerHTML = '';
        
        if (chats.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-comments"></i>
                <p>暂无聊天记录</p>
            `;
            chatList.appendChild(emptyState);
            return;
        }
        
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = chat.id;
            if (chat.id === currentChatId) {
                chatItem.classList.add('active');
            }
            
            chatItem.innerHTML = `
                <span class="chat-item-icon"><i class="fas fa-comment"></i></span>
                <span class="chat-item-title">${escapeHtml(chat.title)}</span>
                <div class="chat-item-actions">
                    <button class="chat-item-action" data-action="edit" title="编辑标题">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-item-action" data-action="delete" title="删除对话">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            chatItem.addEventListener('click', function(e) {
                if (e.target.closest('.chat-item-action')) {
                    const action = e.target.closest('.chat-item-action').dataset.action;
                    if (action === 'edit') {
                        e.stopPropagation();
                        showEditTitleDialog(chat.id, chat.title);
                    } else if (action === 'delete') {
                        e.stopPropagation();
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
        currentChatId = chatId;
        
        // 更新活跃状态
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === chatId) {
                item.classList.add('active');
            }
        });
        
        // 获取聊天信息
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            chatTitle.textContent = chat.title;
        }
        
        // 获取聊天记录
        fetch(`/api/chat/${chatId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    renderChatMessages(data.messages);
                }
            })
            .catch(error => {
                console.error('获取聊天记录失败:', error);
            });
            
        // 在移动视图中加载聊天后关闭侧边栏
        if (window.innerWidth <= 768) {
            chatSidebar.classList.remove('show');
        }
    }
    
    // 渲染聊天消息
    function renderChatMessages(messages) {
        chatHistory.innerHTML = '';
        
        messages.forEach(message => {
            const messageEl = createMessageElement(message.role, message.content);
            chatHistory.appendChild(messageEl);
        });
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    // 创建消息元素
    function createMessageElement(role, content) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        
        let avatar = '';
        if (role === 'user') {
            avatar = '<div class="message-avatar user">U</div>';
        } else {
            avatar = '<div class="message-avatar">A</div>';
        }
        
        messageEl.innerHTML = `
            ${avatar}
            <div class="message-content">${escapeHtml(content)}</div>
        `;
        
        return messageEl;
    }
    
    // 发送消息
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // 清空输入框
        messageInput.value = '';
        
        // 如果这是一个新对话
        if (!currentChatId) {
            // 先在UI上显示用户消息
            const userMessageEl = createMessageElement('user', message);
            chatHistory.appendChild(userMessageEl);
            
            // 设置loading状态
            const loadingEl = document.createElement('div');
            loadingEl.className = 'message';
            loadingEl.innerHTML = `
                <div class="message-avatar">A</div>
                <div class="message-content">正在思考...</div>
            `;
            chatHistory.appendChild(loadingEl);
            
            // 滚动到底部
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            // 发送消息到服务器
            fetch('/api/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            })
            .then(response => response.json())
            .then(data => {
                // 移除loading消息
                chatHistory.removeChild(loadingEl);
                
                // 显示回复
                const replyMessageEl = createMessageElement('assistant', data.reply);
                chatHistory.appendChild(replyMessageEl);
                
                // 滚动到底部
                chatHistory.scrollTop = chatHistory.scrollHeight;
                
                // 更新当前对话ID
                currentChatId = data.chat_id;
                
                // 更新标题
                chatTitle.textContent = message.length > 20 ? message.substring(0, 20) + '...' : message;
                
                // 重新加载聊天列表以显示新对话
                loadChatList();
            })
            .catch(error => {
                console.error('发送消息失败:', error);
                
                // 移除loading消息
                chatHistory.removeChild(loadingEl);
                
                // 显示错误消息
                const errorMessageEl = createMessageElement('assistant', '发送失败，请重试');
                chatHistory.appendChild(errorMessageEl);
                
                // 滚动到底部
                chatHistory.scrollTop = chatHistory.scrollHeight;
            });
        } else {
            // 这是一个现有对话
            // 先在UI上显示用户消息
            const userMessageEl = createMessageElement('user', message);
            chatHistory.appendChild(userMessageEl);
            
            // 设置loading状态
            const loadingEl = document.createElement('div');
            loadingEl.className = 'message';
            loadingEl.innerHTML = `
                <div class="message-avatar">A</div>
                <div class="message-content">正在思考...</div>
            `;
            chatHistory.appendChild(loadingEl);
            
            // 滚动到底部
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            // 发送消息到服务器
            fetch('/api/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message, chat_id: currentChatId })
            })
            .then(response => response.json())
            .then(data => {
                // 移除loading消息
                chatHistory.removeChild(loadingEl);
                
                // 显示回复
                const replyMessageEl = createMessageElement('assistant', data.reply);
                chatHistory.appendChild(replyMessageEl);
                
                // 滚动到底部
                chatHistory.scrollTop = chatHistory.scrollHeight;
            })
            .catch(error => {
                console.error('发送消息失败:', error);
                
                // 移除loading消息
                chatHistory.removeChild(loadingEl);
                
                // 显示错误消息
                const errorMessageEl = createMessageElement('assistant', '发送失败，请重试');
                chatHistory.appendChild(errorMessageEl);
                
                // 滋动到底部
                chatHistory.scrollTop = chatHistory.scrollHeight;
            });
        }
    }
    
    // 开始新对话
    function startNewChat() {
        // 清除当前对话ID
        currentChatId = '';
        
        // 清除聊天历史
        chatHistory.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-title">
                    <i class="fas fa-robot welcome-icon"></i>
                    <h2>欢迎使用 OmniFlow 聊天</h2>
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
        
        // 更新标题
        chatTitle.textContent = '新对话';
        
        // 更新活跃状态
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 聚焦到输入框
        messageInput.focus();
        
        // 在移动视图中关闭侧边栏
        if (window.innerWidth <= 768) {
            chatSidebar.classList.remove('show');
        }
        
        // 重新绑定示例按钮事件
        setupExampleButtons();
    }
    
    // 切换侧边栏
    function toggleSidebar() {
        chatSidebar.classList.toggle('show');
    }
    
    // 显示编辑标题对话框
    function showEditTitleDialog(chatId, currentTitle) {
        // 如果没有提供当前标题，查找它
        if (!currentTitle && chatId) {
            const chat = chats.find(c => c.id === chatId);
            if (chat) {
                currentTitle = chat.title;
            }
        }
        
        // 创建对话框
        const dialogOverlay = document.createElement('div');
        dialogOverlay.className = 'dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'edit-title-dialog';
        dialog.innerHTML = `
            <div class="dialog-header">编辑对话标题</div>
            <div class="dialog-content">
                <input type="text" id="titleInput" value="${currentTitle || ''}">
            </div>
            <div class="dialog-actions">
                <button class="dialog-button cancel">取消</button>
                <button class="dialog-button save">保存</button>
            </div>
        `;
        
        // 添加到DOM
        document.body.appendChild(dialogOverlay);
        document.body.appendChild(dialog);
        
        // 聚焦到输入框
        const titleInput = document.getElementById('titleInput');
        titleInput.focus();
        titleInput.select();
        
        // 添加事件监听
        const cancelButton = dialog.querySelector('.cancel');
        const saveButton = dialog.querySelector('.save');
        
        // 取消按钮
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(dialogOverlay);
            document.body.removeChild(dialog);
        });
        
        // 保存按钮
        saveButton.addEventListener('click', function() {
            const newTitle = titleInput.value.trim();
            if (!newTitle) {
                alert('标题不能为空');
                return;
            }
            
            // 更新标题
            updateChatTitle(chatId, newTitle);
            
            // 关闭对话框
            document.body.removeChild(dialogOverlay);
            document.body.removeChild(dialog);
        });
        
        // ESC键关闭对话框
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialogOverlay);
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
    
    // 更新对话标题
    function updateChatTitle(chatId, newTitle) {
        if (!chatId) return;
        
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
                // 更新本地聊天列表
                const chatIndex = chats.findIndex(c => c.id === chatId);
                if (chatIndex !== -1) {
                    chats[chatIndex].title = newTitle;
                    // 重新渲染聊天列表
                    renderChatList(chats);
                }
                
                // 如果是当前对话，更新标题
                if (chatId === currentChatId) {
                    chatTitle.textContent = newTitle;
                }
            } else {
                alert('更新标题失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('更新标题失败:', error);
            alert('更新标题失败，请重试');
        });
    }
    
    // 确认删除对话
    function confirmDeleteChat(chatId) {
        if (!chatId) return;
        
        if (confirm('确定要删除这个对话吗？这个操作不能撤销。')) {
            deleteChat(chatId);
        }
    }
    
    // 删除对话
    function deleteChat(chatId) {
        fetch(`/api/chat/${chatId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 从本地聊天列表中移除
                chats = chats.filter(c => c.id !== chatId);
                
                // 如果删除的是当前对话，开始一个新对话
                if (chatId === currentChatId) {
                    startNewChat();
                }
                
                // 重新渲染聊天列表
                renderChatList(chats);
            } else {
                alert('删除对话失败: ' + data.message);
            }
        })
        .catch(error => {
            console.error('删除对话失败:', error);
            alert('删除对话失败，请重试');
        });
    }
    
    // 转义HTML特殊字符
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 格式化时间
    function formatTime(dateString) {
        const date = new Date(dateString);
        
        // 如果是今天，只显示时间
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // 如果是今年，显示月份和日期
        if (date.getFullYear() === today.getFullYear()) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        
        // 否则显示完整日期
        return date.toLocaleDateString();
    }

    // 更新发送按钮状态
    function updateSendButtonState() {
        if (messageInput.value.trim() === '') {
            sendButton.disabled = true;
        } else {
            sendButton.disabled = false;
        }
    }

    // 自动调整文本框高度
    function autoResizeTextarea() {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }

    // 加载主题偏好
    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDarkTheme = savedTheme === 'dark';
            applyTheme();
        }
    }

    // 切换主题
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        applyTheme();
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }

    // 应用主题
    function applyTheme() {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    // 设置示例问题按钮
    function setupExampleButtons() {
        exampleButtons.forEach(button => {
            button.addEventListener('click', function() {
                messageInput.value = button.textContent;
                updateSendButtonState();
                autoResizeTextarea();
            });
        });
    }
    
    // 启动应用
    init();
});