/**
 * OmniFlow 聊天界面脚本
 * 处理消息发送和接收、界面交互
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化聊天界面
    initChatInterface();
    
    // 加载模型设置
    loadModelSettings();
});

/**
 * 初始化聊天界面
 */
function initChatInterface() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatButton = document.getElementById('clearChat');
    const messageTypeButtons = document.querySelectorAll('.message-type-selector .btn');
    const useFlowCheckbox = document.getElementById('useFlowCheckbox');
    const flowSelect = document.getElementById('flowSelect');
    const flowInfo = document.getElementById('flowInfo');
    
    // 当前消息类型
    let currentMessageType = 'text';
    
    // 聊天上下文
    let chatContext = {};
    
    // 设置消息类型按钮事件
    messageTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            messageTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentMessageType = this.getAttribute('data-message-type');
            
            // 更新输入框提示
            if (messageInput) {
                messageInput.placeholder = currentMessageType === 'question' ? 
                    '输入问题...' : 
                    currentMessageType === 'command' ? 
                        '输入命令...' : 
                        '输入消息...';
            }
        });
    });
    
    // 发送按钮事件
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', () => {
            sendMessage(messageInput, currentMessageType, chatContext, useFlowCheckbox?.checked);
        });
        
        // 回车键发送消息
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(messageInput, currentMessageType, chatContext, useFlowCheckbox?.checked);
            }
        });
    }
    
    // 清空聊天记录
    if (clearChatButton) {
        clearChatButton.addEventListener('click', () => {
            if (confirm('确定要清除所有对话记录吗？')) {
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    chatMessages.innerHTML = `
                        <div class="message system-message">
                            <div>对话已重置，请输入新消息。</div>
                            <span class="message-time">${getCurrentTime()}</span>
                        </div>
                    `;
                }
                
                // 重置上下文
                chatContext = {};
            }
        });
    }
    
    // 流程选择变更
    if (flowSelect && flowInfo && useFlowCheckbox) {
        flowSelect.addEventListener('change', function() {
            if (this.value !== 'none') {
                flowInfo.classList.remove('d-none');
                useFlowCheckbox.checked = true;
                
                // 更新流程描述
                updateFlowDescription(this.value);
            } else {
                flowInfo.classList.add('d-none');
                useFlowCheckbox.checked = false;
            }
        });
    }
    
    // 查看流程图按钮
    const viewFlowButton = document.getElementById('viewFlow');
    if (viewFlowButton) {
        viewFlowButton.addEventListener('click', (e) => {
            e.preventDefault();
            const flowId = flowSelect?.value;
            if (flowId && flowId !== 'none') {
                window.open(`/node-editor?flowId=${flowId}`, '_blank');
            }
        });
    }
    
    // 温度滑块
    const temperatureRange = document.getElementById('temperatureRange');
    if (temperatureRange) {
        const rangeLabels = temperatureRange.nextElementSibling;
        const valueLabel = rangeLabels.querySelector('small:nth-child(2)');
        
        temperatureRange.addEventListener('input', function() {
            if (valueLabel) {
                valueLabel.textContent = this.value;
            }
        });
    }
}

/**
 * 发送消息
 */
function sendMessage(messageInput, messageType, context, useFlow) {
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    // 添加用户消息到聊天界面
    addMessage(messageText, 'user');
    
    // 清空输入框
    messageInput.value = '';
    
    // 显示输入指示器
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
    }
    
    // 发送消息到后端
    fetch('/api/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: messageText,
            type: messageType,
            useFlow: useFlow,
            context: context
        })
    })
    .then(response => response.json())
    .then(data => {
        // 隐藏输入指示器
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        // 添加系统回复到聊天界面
        addMessage(data.reply, 'system');
        
        // 更新上下文
        Object.assign(context, data.context || {});
    })
    .catch(error => {
        console.error('发送消息时出错:', error);
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        addMessage('<strong>错误:</strong> 消息发送失败，请稍后重试。', 'system');
    });
}

/**
 * 添加消息到聊天界面
 */
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div>${text}</div>
        <span class="message-time">${getCurrentTime()}</span>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * 获取当前时间字符串
 */
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 更新流程描述
 */
function updateFlowDescription(flowId) {
    const descElement = document.getElementById('flowDescription');
    if (!descElement) return;
    
    // 根据流程ID更新描述
    const descriptions = {
        'general': '通用对话流程，适用于大多数会话场景。包含意图识别、信息抽取和回复生成等步骤。',
        'customer': '客服对话流程，专为客户服务场景设计。包含问题分类、解决方案查询和满意度评估等节点。',
        'technical': '技术支持流程，包含技术问题诊断、解决方案推荐和知识库查询等功能。'
    };
    
    descElement.textContent = descriptions[flowId] || '选择的流程';
}

/**
 * 加载模型设置
 */
function loadModelSettings() {
    // 从系统设置加载模型配置
    fetch('/api/get-config')
        .then(response => response.json())
        .then(data => {
            const modelSelect = document.getElementById('modelSelect');
            
            // 更新模型选项
            if (modelSelect) {
                // 首先保持默认选择
                const currentSelected = modelSelect.value;
                
                // 清空现有选项
                while (modelSelect.options.length > 1) {  // 保留默认选项
                    modelSelect.remove(1);
                }
                
                // 添加可用模型
                if (data.models) {
                    data.models.forEach(model => {
                        if (model.enabled) {
                            const option = document.createElement('option');
                            option.value = model.id;
                            option.textContent = model.name;
                            modelSelect.appendChild(option);
                        }
                    });
                } else {
                    // 如果没有配置模型，添加默认选项
                    const deepseekOption = document.createElement('option');
                    deepseekOption.value = 'deepseek';
                    deepseekOption.textContent = 'DeepSeek Chat';
                    modelSelect.appendChild(deepseekOption);
                    
                    const gpt3Option = document.createElement('option');
                    gpt3Option.value = 'gpt3';
                    gpt3Option.textContent = 'GPT-3.5 Turbo';
                    modelSelect.appendChild(gpt3Option);
                    
                    const gpt4Option = document.createElement('option');
                    gpt4Option.value = 'gpt4';
                    gpt4Option.textContent = 'GPT-4';
                    modelSelect.appendChild(gpt4Option);
                }
                
                // 恢复之前的选择，如果可能
                if (Array.from(modelSelect.options).some(opt => opt.value === currentSelected)) {
                    modelSelect.value = currentSelected;
                } else {
                    // 如果之前的选择不可用，使用默认模型
                    modelSelect.value = data.defaultModel || 'default';
                }
            }
            
            // 设置温度参数
            const temperatureRange = document.getElementById('temperatureRange');
            if (temperatureRange && data.parameters && data.parameters.temperature !== undefined) {
                temperatureRange.value = data.parameters.temperature;
                
                // 更新显示值
                const valueLabel = temperatureRange.nextElementSibling?.querySelector('small:nth-child(2)');
                if (valueLabel) {
                    valueLabel.textContent = data.parameters.temperature;
                }
            }
            
            // 更新流程选择
            updateFlowsList();
        })
        .catch(error => {
            console.error('加载模型配置失败:', error);
        });
}

/**
 * 更新可用流程列表
 */
function updateFlowsList() {
    // 获取流程列表
    fetch('/api/list-flows')
        .then(response => response.json())
        .then(data => {
            const flowSelect = document.getElementById('flowSelect');
            if (!flowSelect) return;
            
            // 保留 "none" 选项
            while (flowSelect.options.length > 1) {
                flowSelect.remove(1);
            }
            
            if (data.status === 'success' && Array.isArray(data.flows)) {
                // 将流程按类型分组
                const commonFlows = [
                    { id: 'general', name: '通用对话流程' },
                    { id: 'customer', name: '客服对话流程' },
                    { id: 'technical', name: '技术支持流程' }
                ];
                
                // 添加内置流程
                const commonGroup = document.createElement('optgroup');
                commonGroup.label = '内置流程';
                
                commonFlows.forEach(flow => {
                    const option = document.createElement('option');
                    option.value = flow.id;
                    option.textContent = flow.name;
                    commonGroup.appendChild(option);
                });
                
                flowSelect.appendChild(commonGroup);
                
                // 添加自定义流程
                if (data.flows.length > 0) {
                    const customGroup = document.createElement('optgroup');
                    customGroup.label = '自定义流程';
                    
                    data.flows.forEach(flow => {
                        const option = document.createElement('option');
                        option.value = flow.filename;
                        option.textContent = flow.name;
                        customGroup.appendChild(option);
                    });
                    
                    flowSelect.appendChild(customGroup);
                }
            }
        })
        .catch(error => {
            console.error('加载流程列表失败:', error);
        });
}
