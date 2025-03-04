/**
 * OmniFlow 系统设置页面功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化加载配置
    loadConfiguration();

    // 设置事件监听
    setupEventListeners();
});

// 全局配置对象
let currentConfig = {
    models: [],
    apiKeys: {},
    defaultModel: '',
    parameters: {
        temperature: 0.7,
        maxTokens: 2048
    }
};

/**
 * 加载配置
 */
async function loadConfiguration() {
    try {
        const response = await fetch('/api/get-config');
        if (!response.ok) throw new Error('无法加载配置');
        
        const config = await response.json();
        currentConfig = {
            ...config,
            parameters: {
                temperature: config.parameters?.temperature || 0.7,
                maxTokens: config.parameters?.maxTokens || 2048
            }
        };
        
        // 填充表单
        populateForm(currentConfig);
        
        showAlert('配置加载成功', 'success');
    } catch (error) {
        console.error('加载配置出错:', error);
        showAlert('加载配置失败: ' + error.message, 'danger');
    }
}

/**
 * 填充表单数据
 */
function populateForm(config) {
    // 填充API密钥
    document.getElementById('deepseekApiKey').value = config.apiKeys.deepseek || '';
    document.getElementById('openaiApiKey').value = config.apiKeys.openai || '';
    
    // 填充模型选项
    const modelOptionsContainer = document.getElementById('modelOptions');
    modelOptionsContainer.innerHTML = '';
    
    if (config.models && Array.isArray(config.models)) {
        config.models.forEach(model => {
            const modelCard = document.createElement('div');
            modelCard.className = 'card model-card mb-2';
            if (model.id === config.defaultModel) {
                modelCard.classList.add('selected');
            }
            
            modelCard.innerHTML = `
                <div class="card-body">
                    <div class="form-check">
                        <input class="form-check-input model-select" type="radio" 
                            name="defaultModel" id="model_${model.id}" 
                            value="${model.id}" ${model.id === config.defaultModel ? 'checked' : ''}>
                        <label class="form-check-label" for="model_${model.id}">
                            <strong>${model.name}</strong>
                            <div class="model-status">
                                <span class="badge ${model.enabled ? 'bg-success' : 'bg-secondary'}">
                                    ${model.enabled ? '已启用' : '已禁用'}
                                </span>
                            </div>
                        </label>
                    </div>
                    <div class="form-check form-switch mt-2">
                        <input class="form-check-input model-toggle" type="checkbox" 
                            id="toggle_${model.id}" ${model.enabled ? 'checked' : ''}>
                        <label class="form-check-label" for="toggle_${model.id}">启用模型</label>
                    </div>
                </div>
            `;
            modelOptionsContainer.appendChild(modelCard);
            
            // 为新添加的元素添加事件监听
            modelCard.querySelector('.model-select').addEventListener('change', function() {
                updateSelectedModel(this.value);
            });
            
            modelCard.querySelector('.model-toggle').addEventListener('change', function() {
                toggleModelEnabled(model.id, this.checked);
            });
        });
    }
    
    // 填充参数设置
    document.getElementById('temperature').value = config.parameters?.temperature || 0.7;
    document.getElementById('temperatureValue').textContent = config.parameters?.temperature || 0.7;
    document.getElementById('maxTokens').value = config.parameters?.maxTokens || 2048;
}

/**
 * 更新选中的默认模型
 */
function updateSelectedModel(modelId) {
    // 更新当前配置
    currentConfig.defaultModel = modelId;
    
    // 更新UI
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`#model_${modelId}`).closest('.model-card');
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
}

/**
 * 切换模型启用状态
 */
function toggleModelEnabled(modelId, enabled) {
    // 更新当前配置
    const modelIndex = currentConfig.models.findIndex(m => m.id === modelId);
    if (modelIndex !== -1) {
        currentConfig.models[modelIndex].enabled = enabled;
        
        // 更新UI
        const statusBadge = document.querySelector(`#toggle_${modelId}`)
            .closest('.model-card')
            .querySelector('.model-status .badge');
        
        if (statusBadge) {
            statusBadge.className = `badge ${enabled ? 'bg-success' : 'bg-secondary'}`;
            statusBadge.textContent = enabled ? '已启用' : '已禁用';
        }
    }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 显示/隐藏密码
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    });
    
    // Temperature 滑块值更新
    document.getElementById('temperature').addEventListener('input', function() {
        document.getElementById('temperatureValue').textContent = this.value;
        currentConfig.parameters.temperature = parseFloat(this.value);
    });
    
    // maxTokens 输入框值更新
    document.getElementById('maxTokens').addEventListener('change', function() {
        currentConfig.parameters.maxTokens = parseInt(this.value) || 2048;
    });
    
    // 测试 DeepSeek API 连接
    document.getElementById('testDeepseekApi').addEventListener('click', function() {
        const apiKey = document.getElementById('deepseekApiKey').value.trim();
        testApiConnection('deepseek-chat', apiKey);
    });
    
    // 测试 OpenAI API 连接
    document.getElementById('testOpenaiApi').addEventListener('click', function() {
        const apiKey = document.getElementById('openaiApiKey').value.trim();
        testApiConnection('gpt-3.5-turbo', apiKey);
    });
    
    // 保存设置
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // 重置设置
    document.getElementById('resetSettings').addEventListener('click', function() {
        if (confirm('确定要重置所有设置吗？这将恢复默认配置。')) {
            resetSettings();
        }
    });
}

/**
 * 测试API连接
 */
async function testApiConnection(modelId, apiKey) {
    if (!apiKey) {
        showAlert('请先输入API密钥', 'warning');
        return;
    }
    
    // 显示正在测试的提示
    showAlert('正在测试连接，请稍候...', 'info');
    
    try {
        const response = await fetch('/api/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ modelId, apiKey })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showAlert(`连接成功: ${result.message}`, 'success');
        } else {
            showAlert(`连接失败: ${result.message}`, 'danger');
        }
    } catch (error) {
        console.error('API连接测试失败:', error);
        showAlert('API连接测试失败: ' + error.message, 'danger');
    }
}

/**
 * 保存设置
 */
async function saveSettings() {
    try {
        // 收集当前表单数据
        const deepseekApiKey = document.getElementById('deepseekApiKey').value.trim();
        const openaiApiKey = document.getElementById('openaiApiKey').value.trim();
        
        // 更新配置对象
        currentConfig.apiKeys = {
            deepseek: deepseekApiKey,
            openai: openaiApiKey
        };
        
        // 显示保存中提示
        showAlert('正在保存配置...', 'info');
        
        // 发送保存请求
        const response = await fetch('/api/save-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentConfig)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showAlert('配置保存成功', 'success');
        } else {
            throw new Error(result.message || '保存失败');
        }
    } catch (error) {
        console.error('保存配置失败:', error);
        showAlert('保存配置失败: ' + error.message, 'danger');
    }
}

/**
 * 重置设置
 */
function resetSettings() {
    // 创建默认配置
    const defaultConfig = {
        models: [
            {id: "deepseek-chat", name: "DeepSeek Chat", enabled: true},
            {id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", enabled: false},
            {id: "gpt-4", name: "GPT-4", enabled: false}
        ],
        apiKeys: {
            deepseek: "",
            openai: ""
        },
        defaultModel: "deepseek-chat",
        parameters: {
            temperature: 0.7,
            maxTokens: 2048
        }
    };
    
    // 更新当前配置
    currentConfig = defaultConfig;
    
    // 更新表单
    populateForm(defaultConfig);
    
    showAlert('所有设置已重置为默认值', 'info');
}

/**
 * 显示提示信息
 */
function showAlert(message, type) {
    const alertsContainer = document.getElementById('settingsAlerts');
    
    // 创建提示元素
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到容器
    alertsContainer.insertBefore(alert, alertsContainer.firstChild);
    
    // 5秒后自动消失
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 150);
    }, 5000);
}
