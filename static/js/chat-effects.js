/**
 * OmniFlow聊天界面动态效果
 * 为聊天界面添加各种动画和视觉增强效果
 */

// 语言资源
let translations = {
    'zh-CN': {
        notificationTitle: '接收消息通知',
        notificationQuestion: '允许接收新消息和重要更新的通知？',
        later: '稍后再说',
        allow: '允许',
        scrollToTop: '滚动到顶部',
        loading: '加载中...',
        newMessage: '新消息',
        codeBlockCopied: '代码已复制',
        codeBlockCopy: '复制代码',
        expandMessage: '展开消息',
        collapseMessage: '收起消息',
        messageFrom: '来自',
        retryButton: '重试',
        cancelButton: '取消'
    },
    'en-US': {
        notificationTitle: 'Receive Notifications',
        notificationQuestion: 'Allow notifications for new messages and important updates?',
        later: 'Later',
        allow: 'Allow',
        scrollToTop: 'Scroll to Top',
        loading: 'Loading...',
        newMessage: 'New Message',
        codeBlockCopied: 'Code copied',
        codeBlockCopy: 'Copy code',
        expandMessage: 'Expand message',
        collapseMessage: 'Collapse message',
        messageFrom: 'From',
        retryButton: 'Retry',
        cancelButton: 'Cancel'
    }
};

// 获取当前语言
function getCurrentLanguage() {
    // 优先从HTML的data-language属性获取设置
    if (typeof document !== 'undefined') {
        const htmlLang = document.documentElement.getAttribute('data-language');
        if (htmlLang) {
            return htmlLang;
        }
    }
    
    // 如果属性不存在，尝试从localStorage获取语言设置
    let lang = localStorage.getItem('app-settings');
    if (lang) {
        try {
            const settings = JSON.parse(lang);
            if (settings.appearance && settings.appearance.language) {
                return settings.appearance.language;
            }
        } catch (e) {
            console.error('解析存储的语言设置失败:', e);
        }
    }
    
    // 回退到navigator.language
    return navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US';
}

// 翻译辅助函数
function t(key) {
    const lang = getCurrentLanguage();
    const langResources = translations[lang] || translations['en-US'];
    return langResources[key] || key;
}

document.addEventListener('DOMContentLoaded', function() {
    // 页面淡入效果
    document.body.classList.add('fade-in');
    
    // 欢迎消息动画
    animateWelcomeElements();
    
    // 滚动检测
    setupScrollEffects();
    
    // 消息动画
    setupMessageAnimations();
    
    // 生成背景图案
    if (shouldCreatePattern()) {
        createBackgroundPattern();
    }
    
    // 初始化消息悬停效果
    initializeMessageHoverEffects();
    
    // 添加滚动指示器的样式
    addScrollIndicatorStyle();
    
    // 添加滚动到顶部功能
    addScrollToTopButton();
    
    // 为代码块添加特殊效果
    enhanceCodeBlocks();
    
    // 添加浏览器通知支持
    setupNotifications();

    // 监听语言变化事件
    window.addEventListener('language-changed', function(e) {
        if (e.detail && e.detail.language) {
            updateUILanguage(e.detail.language);
        }
    });
    
    // 初始化时更新UI语言
    updateUILanguage(getCurrentLanguage());
});

// 更新UI语言
function updateUILanguage(language) {
    // 保存语言设置到localStorage (用于脚本内部，React应用会使用app-settings)
    localStorage.setItem('omniflow-language', language);
    
    // 更新可翻译的UI元素
    const notifTitle = document.querySelector('.notification-content .notification-text h4');
    if (notifTitle) {
        notifTitle.textContent = t('notificationTitle');
    }
    
    const notifQuestion = document.querySelector('.notification-content .notification-text p');
    if (notifQuestion) {
        notifQuestion.textContent = t('notificationQuestion');
    }
    
    const notifDeny = document.querySelector('.notification-content .notification-deny');
    if (notifDeny) {
        notifDeny.textContent = t('later');
    }
    
    const notifAllow = document.querySelector('.notification-content .notification-allow');
    if (notifAllow) {
        notifAllow.textContent = t('allow');
    }
    
    const scrollTopBtn = document.querySelector('.scroll-to-top');
    if (scrollTopBtn) {
        scrollTopBtn.title = t('scrollToTop');
    }
    
    // 更新代码块按钮文本
    const copyButtons = document.querySelectorAll('.code-copy-button');
    copyButtons.forEach(btn => {
        btn.textContent = t('codeBlockCopy');
    });
    
    // 更新加载提示文本
    const loadingElements = document.querySelectorAll('.loading-text');
    loadingElements.forEach(el => {
        el.textContent = t('loading');
    });
}

// 欢迎页面元素动画
function animateWelcomeElements() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (!welcomeMessage) return;
    
    // 获取所有子元素
    const elements = [
        welcomeMessage.querySelector('.welcome-title'),
        welcomeMessage.querySelector('p'),
        welcomeMessage.querySelector('.welcome-examples')
    ].filter(el => el); // 过滤掉不存在的元素
    
    // 设置初始状态
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // 依次显示元素
    let delay = 100;
    elements.forEach(el => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, delay);
        delay += 200;
    });
    
    // 示例按钮弹出动画
    const exampleBtns = welcomeMessage.querySelectorAll('.example-button');
    if (exampleBtns.length) {
        exampleBtns.forEach((btn, i) => {
            btn.style.opacity = '0';
            btn.style.transform = 'scale(0.8)';
            btn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1)';
            }, delay + (i * 100));
        });
    }
}

// 设置滚动效果
function setupScrollEffects() {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) return;
    
    // 添加滚动指示器
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
    
    // 为滚动指示器添加波纹效果支持
    scrollIndicator.setAttribute('role', 'button');
    scrollIndicator.dataset.buttonType = 'action';
    
    const chatMain = document.querySelector('.chat-main');
    if (chatMain) {
        chatMain.appendChild(scrollIndicator);
    } else {
        document.body.appendChild(scrollIndicator);
    }
    
    // 监听滚动事件
    chatHistory.addEventListener('scroll', function() {
        // 检查是否滚动到底部
        const isAtBottom = chatHistory.scrollTop + chatHistory.clientHeight >= chatHistory.scrollHeight - 20;
        
        if (isAtBottom) {
            scrollIndicator.classList.remove('visible');
        } else {
            scrollIndicator.classList.add('visible');
        }
    });
    
    // 点击滚动到底部
    scrollIndicator.addEventListener('click', function() {
        chatHistory.scrollTo({
            top: chatHistory.scrollHeight,
            behavior: 'smooth'
        });
    });
}

// 设置消息动画
function setupMessageAnimations() {
    // 创建一个观察器来监听新添加的消息
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('message')) {
                        // 添加入场动画
                        animateNewMessage(node);
                    }
                });
            }
        });
    });
    
    // 观察聊天历史区域的子元素变化
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) {
        observer.observe(chatHistory, { childList: true });
    }
}

// 新消息入场动画
function animateNewMessage(messageEl) {
    messageEl.style.opacity = '0';
    messageEl.style.transform = 'translateY(15px)';
    
    // 使用requestAnimationFrame确保浏览器正确处理过渡
    requestAnimationFrame(() => {
        messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        });
    });
    
    // 突出显示代码块
    setTimeout(() => {
        const codeBlocks = messageEl.querySelectorAll('pre');
        codeBlocks.forEach((block, index) => {
            setTimeout(() => {
                block.classList.add('highlight-pulse');
                setTimeout(() => {
                    block.classList.remove('highlight-pulse');
                }, 1000);
            }, index * 200);
        });
    }, 500);
}

// 判断是否应该创建背景图案
function shouldCreatePattern() {
    // 检查用户偏好或系统设置
    return !localStorage.getItem('disable-bg-pattern') && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 创建动态背景图案
function createBackgroundPattern() {
    const patternContainer = document.createElement('div');
    patternContainer.className = 'background-pattern';
    document.body.appendChild(patternContainer);
    
    // 创建随机形状
    for (let i = 0; i < 15; i++) {
        createRandomShape(patternContainer);
    }
    
    // 定期创建新形状
    setInterval(() => {
        if (document.visibilityState === 'visible' && Math.random() > 0.7) {
            const oldShape = patternContainer.firstChild;
            if (oldShape) {
                oldShape.classList.add('fade-out');
                setTimeout(() => {
                    if (patternContainer.contains(oldShape)) {
                        patternContainer.removeChild(oldShape);
                    }
                }, 1000);
            }
            createRandomShape(patternContainer);
        }
    }, 3000);
}

// 创建随机形状
function createRandomShape(container) {
    const shape = document.createElement('div');
    shape.className = 'bg-shape';
    
    // 随机形状和颜色
    const shapes = ['circle', 'square', 'triangle', 'diamond'];
    const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
    shape.classList.add(shapeType);
    
    // 随机位置
    const xPos = Math.random() * 100;
    const yPos = Math.random() * 100;
    shape.style.left = `${xPos}%`;
    shape.style.top = `${yPos}%`;
    
    // 随机大小
    const size = 20 + Math.random() * 60;
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    
    // 随机透明度
    shape.style.opacity = 0.03 + Math.random() * 0.06;
    
    // 随机旋转
    const rotation = Math.random() * 360;
    shape.style.transform = `rotate(${rotation}deg)`;
    
    // 添加到容器
    container.appendChild(shape);
    
    // 淡入效果
    setTimeout(() => {
        shape.classList.add('visible');
    }, 10);
}

// 初始化消息悬停效果
function initializeMessageHoverEffects() {
    // 为所有消息添加悬停效果
    document.addEventListener('mouseover', function(e) {
        const message = e.target.closest('.message');
        if (message && !message.classList.contains('system-message')) {
            addMessageHoverEffect(message);
        }
    }, false);
}

// 添加消息悬停效果
function addMessageHoverEffect(messageEl) {
    // 检查是否已经添加了效果
    if (messageEl.dataset.hoverEffectAdded) return;
    messageEl.dataset.hoverEffectAdded = true;
    
    // 添加微妙的阴影增强
    messageEl.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        this.style.transform = 'translateY(-1px)';
        
        // 找到消息内容，添加微妙的边框颜色变化
        const content = this.querySelector('.message-content');
        if (content) {
            content.style.transition = 'border-color 0.2s ease';
            const isUser = this.querySelector('.message-avatar.user');
            content.style.borderColor = isUser ? 
                'var(--primary-light)' : 'var(--accent-light)';
        }
    });
    
    messageEl.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
        this.style.transform = '';
        
        const content = this.querySelector('.message-content');
        if (content) {
            content.style.borderColor = '';
        }
    });
}

// 添加滚动指示器的样式
function addScrollIndicatorStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .scroll-indicator {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--accent-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.2s ease;
            z-index: 100;
            overflow: hidden; /* 为波纹效果添加 */
        }
        
        .scroll-indicator.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .scroll-indicator:hover {
            background-color: var(--accent-dark);
        }
        
        .background-pattern {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            pointer-events: none;
            z-index: -1;
        }
        
        .bg-shape {
            position: absolute;
            opacity: 0;
            transition: opacity 1s ease;
        }
        
        .bg-shape.visible {
            opacity: 0.05;
        }
        
        .bg-shape.fade-out {
            opacity: 0;
        }
        
        .bg-shape.circle {
            border-radius: 50%;
            background: var(--primary-color);
        }
        
        .bg-shape.square {
            background: var(--accent-color);
        }
        
        .bg-shape.triangle {
            width: 0;
            height: 0;
            background: transparent;
            border-left: 25px solid transparent;
            border-right: 25px solid transparent;
            border-bottom: 50px solid var(--primary-color);
        }
        
        .bg-shape.diamond {
            transform: rotate(45deg);
            background: var(--accent-color);
        }
        
        .highlight-pulse {
            animation: highlightPulse 1s ease-in-out;
        }
        
        @keyframes highlightPulse {
            0% { box-shadow: 0 0 0 0 rgba(var(--accent-color), 0.2); }
            70% { box-shadow: 0 0 0 10px rgba(var(--accent-color), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--accent-color), 0); }
        }
        
        .message code {
            transition: background-color 0.2s ease;
        }
        
        .message:hover code {
            background-color: var(--background-light);
        }
        
        .fade-in {
            animation: fadeInPage 0.5s ease-in-out;
        }
        
        @keyframes fadeInPage {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* 新增的全局国际化支持样式 */
        [data-i18n]:empty:before {
            content: attr(data-i18n);
            opacity: 0.7;
        }
        
        .code-copy-button {
            position: absolute;
            top: 5px;
            right: 5px;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.4);
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        pre:hover .code-copy-button {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// 添加滚动到顶部功能
function addScrollToTopButton() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.title = t('scrollToTop');
    scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    
    // 为按钮添加波纹效果支持
    scrollTopBtn.setAttribute('role', 'button');
    scrollTopBtn.dataset.buttonType = 'action';
    
    document.body.appendChild(scrollTopBtn);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary-color, #10a37f);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background-color 0.2s ease;
            z-index: 100;
            overflow: hidden; /* 为波纹效果添加 */
        }
        
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .scroll-to-top:hover {
            background-color: var(--primary-dark, #0c8c6a);
        }
    `;
    
    document.head.appendChild(style);
    
    // 添加滚动监听
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 200) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    // 添加点击事件
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 为代码块添加特殊效果
function enhanceCodeBlocks() {
    // 寻找所有代码块
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // 添加复制按钮
        const pre = block.parentElement;
        if (pre && !pre.querySelector('.code-copy-button')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-button';
            copyButton.textContent = t('codeBlockCopy');
            
            copyButton.addEventListener('click', function() {
                // 复制代码到剪贴板
                const code = block.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const originalText = this.textContent;
                    this.textContent = t('codeBlockCopied');
                    
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
        }
    });
}

// 添加浏览器通知支持
function setupNotifications() {
    // 只在浏览器支持通知且用户尚未授予权限时显示
    if (!('Notification' in window) || Notification.permission !== 'default') {
        return;
    }
    
    // 延迟显示通知请求，避免页面加载时就弹出
    setTimeout(() => {
        showNotificationRequest();
    }, 5000);
}

// 显示通知请求UI
function showNotificationRequest() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    
    notificationContainer.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div class="notification-text">
                <h4>${t('notificationTitle')}</h4>
                <p>${t('notificationQuestion')}</p>
            </div>
            <div class="notification-actions">
                <button class="notification-deny">${t('later')}</button>
                <button class="notification-allow">${t('allow')}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificationContainer);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--background-dark, #1a1a1a);
            border: 1px solid var(--border-color, #333);
            border-radius: 8px;
            padding: 16px;
            width: 320px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        .notification-content {
            display: flex;
            flex-wrap: wrap;
        }
        
        .notification-icon {
            width: 24px;
            height: 24px;
            color: var(--accent-color, #6b57ff);
            margin-right: 16px;
        }
        
        .notification-text {
            flex: 1;
            min-width: 200px;
        }
        
        .notification-text h4 {
            margin: 0 0 8px 0;
            color: var(--text-primary, #e0e0e0);
            font-size: 16px;
        }
        
        .notification-text p {
            margin: 0;
            color: var(--text-secondary, #999);
            font-size: 14px;
            line-height: 1.4;
        }
        
        .notification-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
            width: 100%;
        }
        
        .notification-deny, .notification-allow {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .notification-deny {
            background: transparent;
            border: none;
            color: var(--text-secondary, #999);
        }
        
        .notification-deny:hover {
            color: var(--text-primary, #e0e0e0);
        }
        
        .notification-allow {
            background: var(--accent-color, #6b57ff);
            color: white;
            border: none;
            margin-left: 8px;
        }
        
        .notification-allow:hover {
            background: var(--accent-dark, #5546cc);
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // 绑定按钮事件
    notificationContainer.querySelector('.notification-deny').addEventListener('click', () => {
        document.body.removeChild(notificationContainer);
    });
    
    notificationContainer.querySelector('.notification-allow').addEventListener('click', () => {
        Notification.requestPermission();
        document.body.removeChild(notificationContainer);
    });
}