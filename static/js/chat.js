document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // 发送消息到服务器并显示响应
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') return;
        
        // 显示用户消息
        addMessage(message, 'user');
        messageInput.value = '';
        
        // 发送到服务器
        fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // 显示系统回复
            addMessage(data.reply, 'system');
        })
        .catch(error => {
            console.error('发送消息出错：', error);
            addMessage('发送失败，请重试。', 'system');
        });
    }
    
    // 添加消息到聊天窗口
    function addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);
    
    // 按下Enter键发送消息
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
