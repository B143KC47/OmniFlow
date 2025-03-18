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
        scrollToTop: '滚动到顶部'
    },
    'en': {
        notificationTitle: 'Receive Notifications',
        notificationQuestion: 'Allow notifications for new messages and important updates?',
        later: 'Later',
        allow: 'Allow',
        scrollToTop: 'Scroll to Top'
    }
};

// 获取当前语言
function getCurrentLanguage() {
    // 尝试从localStorage获取语言设置
    let lang = localStorage.getItem('omniflow-language');
    // 如果没有设置，检查navigator.language
    if (!lang) {
        lang = navigator.language.startsWith('zh') ? 'zh-CN' : 'en';
    }
    return lang;
}

// 翻译辅助函数
function t(key) {
    const lang = getCurrentLanguage();
    const langResources = translations[lang] || translations['en'];
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
});

// 更新UI语言
function updateUILanguage(language) {
    // 保存语言设置
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
    `;
    document.head.appendChild(style);
}

// 添加滚动到顶部功能
function addScrollToTopButton() {
    const button = document.createElement('button');
    button.className = 'scroll-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.title = t('scrollToTop');
    
    document.body.appendChild(button);
    
    // 根据滚动位置显示/隐藏按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
    
    // 点击滚动到顶部
    button.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
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
            background-color: var(--primary-color);
            color: white;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            opacity: 0;
            visibility: hidden;
            transform: scale(0.8);
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: scale(1);
        }
        
        .scroll-to-top:hover {
            background-color: var(--primary-dark);
        }
    `;
    document.head.appendChild(style);
}

// 为代码块添加特殊效果
function enhanceCodeBlocks() {
    // 观察器：观察DOM变化以处理新添加的代码块
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const codeBlocks = node.querySelectorAll('pre code');
                        codeBlocks.forEach(addCodeBlockEnhancements);
                    }
                });
            }
        });
    });
    
    // 观察整个文档的变化
    observer.observe(document.body, { childList: true, subtree: true });
    
    // 处理已存在的代码块
    document.querySelectorAll('pre code').forEach(addCodeBlockEnhancements);
}

// 为代码块添加增强效果
function addCodeBlockEnhancements(codeBlock) {
    // 检查是否已添加增强效果
    if (codeBlock.dataset.enhanced) return;
    codeBlock.dataset.enhanced = 'true';
    
    // 添加行号
    addLineNumbers(codeBlock);
    
    // 添加悬停高亮效果
    addHoverHighlight(codeBlock);
}

// 为代码块添加行号
function addLineNumbers(codeBlock) {
    const code = codeBlock.textContent;
    const lines = code.split('\n');
    
    // 创建行号容器
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    
    // 为每行添加行号
    for (let i = 0; i < lines.length; i++) {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'line-number';
        lineNumber.textContent = i + 1;
        lineNumbers.appendChild(lineNumber);
    }
    
    // 插入行号
    codeBlock.parentElement.classList.add('with-line-numbers');
    codeBlock.parentElement.insertBefore(lineNumbers, codeBlock);
    
    // 添加必要的样式
    if (!document.getElementById('code-enhancements-style')) {
        const style = document.createElement('style');
        style.id = 'code-enhancements-style';
        style.textContent = `
            .with-line-numbers {
                display: flex;
                position: relative;
            }
            
            .line-numbers {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: var(--spacing-md) 0;
                background-color: rgba(0, 0, 0, 0.2);
                user-select: none;
                min-width: 30px;
                text-align: right;
            }
            
            .line-number {
                font-size: 0.85rem;
                color: var(--text-secondary);
                opacity: 0.8;
                padding: 0 8px;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
}

// 为代码行添加悬停高亮效果
function addHoverHighlight(codeBlock) {
    // 将代码分割成行，并为每行添加一个行元素
    const code = codeBlock.innerHTML;
    const lines = code.split('\n');
    let newHtml = '';
    
    for (let i = 0; i < lines.length; i++) {
        newHtml += `<div class="code-line">${lines[i]}</div>`;
    }
    
    codeBlock.innerHTML = newHtml;
    
    // 添加必要的样式
    if (!document.getElementById('code-hover-style')) {
        const style = document.createElement('style');
        style.id = 'code-hover-style';
        style.textContent = `
            .code-line {
                transition: background-color 0.15s ease;
                padding: 0 4px;
                margin: 0 -4px;
                border-radius: 2px;
            }
            
            .code-line:hover {
                background-color: rgba(255, 255, 255, 0.05);
            }
        `;
        document.head.appendChild(style);
    }
}

// 添加浏览器通知支持
function setupNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        // 稍微延迟请求通知权限
        setTimeout(() => {
            // 创建一个温和的通知请求对话框
            const notifDialog = document.createElement('div');
            notifDialog.className = 'notification-dialog';
            notifDialog.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">
                        <i class="fas fa-bell"></i>
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
            
            document.body.appendChild(notifDialog);
            
            // 添加必要的样式
            const style = document.createElement('style');
            style.textContent = `
                .notification-dialog {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--background-medium);
                    border-radius: var(--border-radius-md);
                    box-shadow: var(--shadow-lg);
                    padding: var(--spacing-md);
                    z-index: 9999;
                    width: 300px;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    animation: slideIn 0.3s forwards;
                }
                
                @keyframes slideIn {
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .notification-content {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-md);
                }
                
                .notification-icon {
                    font-size: 1.5rem;
                    color: var(--accent-color);
                    text-align: center;
                }
                
                .notification-text h4 {
                    margin: 0 0 var(--spacing-xs);
                    color: var(--text-primary);
                }
                
                .notification-text p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .notification-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-sm);
                }
                
                .notification-deny {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--border-radius-sm);
                    color: var(--text-primary);
                    cursor: pointer;
                }
                
                .notification-allow {
                    background-color: var(--accent-color);
                    border: none;
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--border-radius-sm);
                    color: white;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            
            // 添加按钮事件
            const denyBtn = notifDialog.querySelector('.notification-deny');
            const allowBtn = notifDialog.querySelector('.notification-allow');
            
            denyBtn.addEventListener('click', () => {
                notifDialog.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => {
                    document.body.removeChild(notifDialog);
                }, 300);
            });
            
            allowBtn.addEventListener('click', () => {
                Notification.requestPermission();
                notifDialog.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => {
                    document.body.removeChild(notifDialog);
                }, 300);
            });

            // 为通知对话框添加关键帧动画
            const animationStyle = document.createElement('style');
            animationStyle.textContent = `
                @keyframes slideOut {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(20px); opacity: 0; }
                }
            `;
            document.head.appendChild(animationStyle);
        }, 5000);
    }
}