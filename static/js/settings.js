/**
 * OmniFlow 系统设置脚本
 * 处理API密钥配置、模型选择和参数设置
 */

document.addEventListener('DOMContentLoaded', function() {
    // 加载当前配置
    loadCurrentConfig();
    
    // 设置事件处理程序
    setupEventHandlers();
    
    // 初始化表单组件
    initFormComponents();
});

/**
 * 加载当前配置
 */
function loadCurrentConfig() {
    fetch('/api/get-config')
        .then(response => response.json())
        .then(data => {
            // 填充API密钥
            if (data.apiKeys) {
                const deepseekKey = document.getElementById('deepseekApiKey');
                const openaiKey = document.getElementById('openaiApiKey');
                
                if (deepseekKey && data.apiKeys.deepseek) {
                    deepseekKey.value = data.apiKeys.deepseek;
                }
                
                if (openaiKey && data.apiKeys.openai) {
                    openaiKey.value = data.apiKeys.openai;
                }
            }
            
            // 加载模型选项
            loadModelOptions(data.models || []);
            
            // 设置默认模型
            const defaultModel = data.defaultModel || 'deepseek-chat';
            const modelRadios = document.querySelectorAll('input[name="defaultModel"]');
            modelRadios.forEach(radio => {
                if (radio.value === defaultModel) {
                    radio.checked = true;
                }
            });
            
            // 设置其他参数
            if (data.parameters) {
                if (data.parameters.temperature !== undefined) {
                    const temperatureSlider = document.getElementById('temperature');
                    const temperatureValue = document.getElementById('temperatureValue');
                    if (temperatureSlider && temperatureValue) {
                        temperatureSlider.value = data.parameters.temperature;
                        temperatureValue.textContent = data.parameters.temperature;
                    }
                }
                
                if (data.parameters.maxTokens !== undefined) {
                    const maxTokensInput = document.getElementById('maxTokens');
                    if (maxTokensInput) {
                        maxTokensInput.value = data.parameters.maxTokens;
                    }
                }
            }
        })
        .catch(error => {
            console.error('加载配置时出错:', error);
            showAlert('danger', '加载配置失败，请刷新页面重试。');
        });
}

/**
 * 加载模型选项
 */
function loadModelOptions(models) {
    const modelOptionsContainer = document.getElementById('modelOptions');
    if (!modelOptionsContainer) return;
    
    // 如果没有模型数据，提供默认选项
    if (!models || models.length === 0) {
        models = [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', enabled: true },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', enabled: true },
            { id: 'gpt-4', name: 'GPT-4', enabled: true }
        ];
    }
    
    // 创建模型选项
    const modelOptionsHTML = models.map(model => `
        <div class="form-check">
            <input class="form-check-input" type="radio" name="defaultModel" 
                id="model_${model.id}" value="${model.id}" ${model.enabled ? '' : 'disabled'}>
            <label class="form-check-label" for="model_${model.id}">
                ${model.name} ${!model.enabled ? '<span class="badge bg-warning">需配置API</span>' : ''}
            </label>
        </div>
    `).join('');
    
    modelOptionsContainer.innerHTML = modelOptionsHTML;
}

/**
 * 设置事件处理程序
 */
function setupEventHandlers() {
    // API密钥显示切换
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            }
        });
    });
    
    // API测试按钮
    document.getElementById('testDeepseekApi')?.addEventListener('click', function() {
        testApiConnection('deepseek');
    });
    
    document.getElementById('testOpenaiApi')?.addEventListener('click', function() {
        testApiConnection('openai');
    });
    
    // 保存设置按钮
    document.getElementById('saveSettings')?.addEventListener('click', function() {
        saveSettings();
    });
    
    // 重置设置按钮
    document.getElementById('resetSettings')?.addEventListener('click', function() {
        if (confirm('确定要重置所有设置吗？这将恢复到默认配置。')) {
            resetSettings();
        }
    });
    
    // Temperature滑块更新值显示
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
        });
    }
}

/**
 * 初始化表单组件
 */
function initFormComponents() {
    // 这里可以添加更复杂的表单组件初始化，如日期选择器、自动完成等
}

/**
 * 测试API连接
 */
function testApiConnection(modelId) {
    const apiKeyElement = modelId === 'deepseek' 
        ? document.getElementById('deepseekApiKey')
        : document.getElementById('openaiApiKey');
    
    if (!apiKeyElement) return;
    
    const apiKey = apiKeyElement.value.trim();
    if (!apiKey) {
        showAlert('warning', `请先填写 ${modelId === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API 密钥`);
        return;
    }
    
    // 显示加载状态
    const testButton = document.getElementById(`test${modelId === 'deepseek' ? 'Deepseek' : 'Openai'}Api`);
    if (testButton) {
        const originalText = testButton.innerHTML;
        testButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 测试中...';
        testButton.disabled = true;
        
        // 发送API测试请求
        fetch('/api/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modelId: modelId === 'deepseek' ? 'deepseek-chat' : 'gpt-3.5-turbo',
                apiKey: apiKey
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showAlert('success', `${modelId === 'deepseek' ? 'DeepSeek' : 'OpenAI'} API 连接测试成功`);
            } else {
                showAlert('danger', `API 测试失败: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('API测试出错:', error);
            showAlert('danger', `API 测试出错: ${error.message || '网络错误'}`);
        })
        .finally(() => {
            // 恢复按钮状态
            testButton.innerHTML = originalText;
            testButton.disabled = false;
        });
    }
}

/**
 * 保存设置
 */
function saveSettings() {
    // 收集API密钥
    const deepseekApiKey = document.getElementById('deepseekApiKey')?.value.trim();
    const openaiApiKey = document.getElementById('openaiApiKey')?.value.trim();
    
    // 获取默认模型
    const selectedModel = document.querySelector('input[name="defaultModel"]:checked')?.value || 'deepseek-chat';
    
    // 获取模型参数
    const temperature = parseFloat(document.getElementById('temperature')?.value || 0.7);
    const maxTokens = parseInt(document.getElementById('maxTokens')?.value || 2048);
    
    // 准备配置数据
    const config = {
        apiKeys: {
            deepseek: deepseekApiKey,
            openai: openaiApiKey
        },
        defaultModel: selectedModel,
        parameters: {
            temperature: temperature,
            maxTokens: maxTokens
        }
    };
    
    // 发送保存请求
    fetch('/api/save-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showAlert('success', '设置已成功保存');
        } else {
            showAlert('danger', `保存设置失败: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('保存设置时出错:', error);
        showAlert('danger', `保存设置出错: ${error.message || '网络错误'}`);
    });
}

/**
 * 重置设置
 */
function resetSettings() {
    // 清空API密钥
    const deepseekApiKey = document.getElementById('deepseekApiKey');
    const openaiApiKey = document.getElementById('openaiApiKey');
    
    if (deepseekApiKey) deepseekApiKey.value = '';
    if (openaiApiKey) openaiApiKey.value = '';
    
    // 重置默认模型
    const defaultModelRadio = document.getElementById('model_deepseek-chat');
    if (defaultModelRadio) defaultModelRadio.checked = true;
    
    // 重置温度参数
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.value = 0.7;
        temperatureValue.textContent = '0.7';
    }
    
    // 重置最大Token数
    const maxTokensInput = document.getElementById('maxTokens');
    if (maxTokensInput) maxTokensInput.value = 2048;
    
    showAlert('info', '设置已重置为默认值，点击"保存设置"按钮以应用更改。');
}

/**
 * 显示提示消息
 */
function showAlert(type, message) {
    const alertsContainer = document.getElementById('settingsAlerts');
    if (!alertsContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // 5秒后自动关闭
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    }, 5000);
}
