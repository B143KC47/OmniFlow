/**
 * OmniFlow 系统设置页面脚本
 */

document.addEventListener('DOMContentLoaded', function() {
    // 加载当前配置
    loadCurrentConfig();
    
    // 设置密码显示/隐藏切换
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentNode.querySelector('input');
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
    
    // Temperature滑块值显示
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperatureValue');
    
    if (temperatureSlider && temperatureValue) {
        temperatureSlider.addEventListener('input', function() {
            temperatureValue.textContent = this.value;
        });
    }
    
    // 测试API连接
    document.getElementById('testDeepseekApi').addEventListener('click', function() {
        const apiKey = document.getElementById('deepseekApiKey').value;
        testApiConnection('deepseek-chat', apiKey, this);
    });
    
    document.getElementById('testOpenaiApi').addEventListener('click', function() {
        const apiKey = document.getElementById('openaiApiKey').value;
        testApiConnection('gpt-3.5-turbo', apiKey, this);
    });
    
    // 保存设置
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // 重置设置
    document.getElementById('resetSettings').addEventListener('click', function() {
        if (confirm('确定要重置所有设置吗？这将恢复默认配置。')) {
            resetSettings();
        }
    });
});

/**
 * 加载当前配置
 */
function loadCurrentConfig() {
    fetch('/api/get-config')
        .then(response => response.json())
        .then(config => {
            // 填充API密钥
            if (config.apiKeys) {
                document.getElementById('deepseekApiKey').value = config.apiKeys.deepseek || '';
                document.getElementById('openaiApiKey').value = config.apiKeys.openai || '';
            }
            
            // 创建模型选项
            if (config.models) {
                const modelOptions = document.getElementById('modelOptions');
                modelOptions.innerHTML = '';
                
                config.models.forEach(model => {
                    const isSelected = model.id === config.defaultModel;
                    const card = document.createElement('div');
                    card.className = `model-card ${isSelected ? 'selected' : ''}`;
                    card.setAttribute('data-model-id', model.id);
                    
                    let description = '';
                    switch(model.id) {
                        case 'deepseek-chat':
                            description = '中英双语大模型，擅长代码与通用问答';
                            break;
                        case 'gpt-3.5-turbo':
                            description = 'OpenAI的高效模型，平衡性能与成本';
                            break;
                        case 'gpt-4':
                            description = 'OpenAI的高级模型，推理能力更强';
                            break;
                        default:
                            description = '通用大语言模型';
                    }
                    
                    card.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="defaultModel" 
                                id="model_${model.id}" value="${model.id}" ${isSelected ? 'checked' : ''}>
                            <label class="form-check-label w-100" for="model_${model.id}">
                                <div class="model-name">${model.name}</div>
                                <div class="model-description">${description}</div>
                            </label>
                        </div>
                    `;
                    
                    modelOptions.appendChild(card);
                    
                    // 添加点击事件
                    card.addEventListener('click', function() {
                        document.querySelectorAll('.model-card').forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        this.querySelector('input[type="radio"]').checked = true;
                    });
                });
            }
            
            // 设置其他参数
            if (config.parameters) {
                document.getElementById('temperature').value = config.parameters.temperature || 0.7;
                document.getElementById('temperatureValue').textContent = config.parameters.temperature || 0.7;
                
                document.getElementById('maxTokens').value = config.parameters.maxTokens || 2048;
            }
        })
        .catch(error => {
            console.error('加载配置失败:', error);
            showAlert('加载配置失败，请刷新页面重试', 'danger');
        });
}

/**
 * 测试API连接
 */
function testApiConnection(modelId, apiKey, button) {
    if (!apiKey) {
        showAlert('请输入API密钥', 'warning');
        return;
    }
    
    // 保存原始按钮文本
    const originalText = button.innerHTML;
    
    // 显示加载状态
    button.innerHTML = '<span class="spinner-border" role="status" aria-hidden="true"></span> 测试中...';
    button.disabled = true;
    
    // 发送测试请求
    fetch('/api/test-connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            modelId: modelId,
            apiKey: apiKey
        })
    })
    .then(response => response.json())
    .then(data => {
        // 恢复按钮状态
        button.innerHTML = originalText;
        button.disabled = false;
        
        if (data.status === 'success') {
            showAlert(`连接成功: ${data.message}`, 'success');
        } else {
            showAlert(`连接失败: ${data.message}`, 'danger');
        }
    })
    .catch(error => {
        // 恢复按钮状态
        button.innerHTML = originalText;
        button.disabled = false;
        
        console.error('测试连接时出错:', error);
        showAlert('测试连接时出错，请检查网络连接', 'danger');
    });
}

/**
 * 保存设置
 */
function saveSettings() {
    // 收集表单数据
    const deepseekApiKey = document.getElementById('deepseekApiKey').value;
    const openaiApiKey = document.getElementById('openaiApiKey').value;
    const defaultModel = document.querySelector('input[name="defaultModel"]:checked')?.value || 'deepseek-chat';
    const temperature = parseFloat(document.getElementById('temperature').value);
    const maxTokens = parseInt(document.getElementById('maxTokens').value);
    
    // 构建配置对象
    const config = {
        apiKeys: {
            deepseek: deepseekApiKey,
            openai: openaiApiKey
        },
        defaultModel: defaultModel,
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
            showAlert('设置保存成功', 'success');
        } else {
            showAlert(`保存失败: ${data.message}`, 'danger');
        }
    })
    .catch(error => {
        console.error('保存设置出错:', error);
        showAlert('保存设置时出错，请重试', 'danger');
    });
}

/**
 * 重置设置
 */
function resetSettings() {
    document.getElementById('deepseekApiKey').value = '';
    document.getElementById('openaiApiKey').value = '';
    
    // 选择默认模型
    const defaultModelRadio = document.getElementById('model_deepseek-chat');
    if (defaultModelRadio) {
        defaultModelRadio.checked = true;
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('selected');
            if (card.getAttribute('data-model-id') === 'deepseek-chat') {
                card.classList.add('selected');
            }
        });
    }
    
    // 重置其他参数
    document.getElementById('temperature').value = 0.7;
    document.getElementById('temperatureValue').textContent = 0.7;
    document.getElementById('maxTokens').value = 2048;
    
    showAlert('设置已重置为默认值', 'info');
}

/**
 * 显示提示信息
 */
function showAlert(message, type) {
    // 创建提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show settings-alert`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到页面
    document.getElementById('settingsAlerts').appendChild(alertDiv);
    
    // 5秒后自动消失
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
        alert.close();
    }, 5000);
}
