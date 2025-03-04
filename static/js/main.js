document.addEventListener('DOMContentLoaded', function() {
    // 初始化DrawFlow
    const id = document.getElementById("drawflow");
    const editor = new Drawflow(id);
    editor.reroute = true;
    
    // 编辑器配置
    const editorConfig = {
        zoom: 1,
        zoomMax: 1.5,
        zoomMin: 0.5,
        zoomStep: 0.1
    };
    
    // 全局变量
    let flowRunning = false;
    let selectedFlowName = '';
    let apiKey = localStorage.getItem('apiKey') || '';
    let selectedNode = null;
    let contextMenuNode = null;
    
    // 初始化编辑器
    editor.start();
    
    // 设置主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // 注册节点模板
    const nodeTemplates = {
        flowStart: {
            html: `
                <div class="title">Flow开始 
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">流程描述</div>
                        <div class="node-description">开始执行流程</div>
                    </div>
                    <div class="output-field">执行</div>
                </div>
            `,
            data: {
                description: "开始执行流程"
            },
            outputs: 1,
            inputs: 0,
            class: "node-flowStart"
        },
        
        flowEnd: {
            html: `
                <div class="title">Flow结束
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">流程描述</div>
                        <div class="node-description">结束流程执行</div>
                    </div>
                    <div class="input-field">输入</div>
                </div>
            `,
            data: {
                description: "结束流程执行"
            },
            outputs: 0,
            inputs: 1,
            class: "node-flowEnd"
        },
        
        llmResponse: {
            html: `
                <div class="title">大语言模型
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">系统提示词</div>
                        <div class="node-system-prompt">你是一个有用的AI助手</div>
                    </div>
                    <div class="node-property">
                        <div class="node-property-label">固定提示词</div>
                        <div class="node-prompt">请回答用户的问题</div>
                    </div>
                    <div class="input-field">用户输入</div>
                    <div class="output-field">LLM输出</div>
                </div>
            `,
            data: {
                systemPrompt: "你是一个有用的AI助手",
                prompt: "请回答用户的问题",
                model: "gpt-3.5-turbo",
                temperature: 0.7
            },
            outputs: 1,
            inputs: 1,
            class: "node-llmResponse"
        },
        
        webSearch: {
            html: `
                <div class="title">上网搜索
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">搜索引擎</div>
                        <div class="node-search-engine">Google</div>
                    </div>
                    <div class="input-field">搜索关键词</div>
                    <div class="output-field">搜索结果</div>
                </div>
            `,
            data: {
                searchEngine: "Google",
                resultCount: 3
            },
            outputs: 1,
            inputs: 1,
            class: "node-webSearch"
        },
        
        userInput: {
            html: `
                <div class="title">用户输入
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">提示信息</div>
                        <div class="node-prompt-message">请输入内容</div>
                    </div>
                    <div class="input-field">触发</div>
                    <div class="output-field">用户输入</div>
                </div>
            `,
            data: {
                promptMessage: "请输入内容"
            },
            outputs: 1,
            inputs: 1,
            class: "node-userInput"
        },
        
        textOutput: {
            html: `
                <div class="title">文本输出
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">固定文本</div>
                        <div class="node-static-text"></div>
                    </div>
                    <div class="input-field">输入文本</div>
                    <div class="output-field">流程继续</div>
                </div>
            `,
            data: {
                staticText: ""
            },
            outputs: 1,
            inputs: 1,
            class: "node-textOutput"
        },
        
        thinkOutput: {
            html: `
                <div class="title">思考输出
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">思考内容</div>
                        <div class="node-think-content"></div>
                    </div>
                    <div class="input-field">输入</div>
                    <div class="output-field">输出</div>
                </div>
            `,
            data: {
                thinkContent: ""
            },
            outputs: 1,
            inputs: 1,
            class: "node-thinkOutput"
        },
        
        condition: {
            html: `
                <div class="title">条件判断
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">条件表达式</div>
                        <div class="node-condition-expr">输入 == "是"</div>
                    </div>
                    <div class="input-field">输入</div>
                    <div class="output-field">满足条件</div>
                    <div class="output-field">不满足条件</div>
                </div>
            `,
            data: {
                conditionExpr: "输入 == \"是\""
            },
            outputs: 2,
            inputs: 1,
            class: "node-condition"
        },
        
        switch: {
            html: `
                <div class="title">多路选择
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">选项</div>
                        <div class="node-switch-cases">选项1,选项2,默认</div>
                    </div>
                    <div class="input-field">选择值</div>
                    <div class="output-field">选项1</div>
                    <div class="output-field">选项2</div>
                    <div class="output-field">默认</div>
                </div>
            `,
            data: {
                cases: ["选项1", "选项2", "默认"]
            },
            outputs: 3,
            inputs: 1,
            class: "node-switch"
        },
        
        textProcess: {
            html: `
                <div class="title">文本处理
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">操作类型</div>
                        <div class="node-text-op">提取关键词</div>
                    </div>
                    <div class="input-field">输入文本</div>
                    <div class="output-field">处理结果</div>
                </div>
            `,
            data: {
                operation: "提取关键词",
                params: {}
            },
            outputs: 1,
            inputs: 1,
            class: "node-textProcess"
        },
        
        variable: {
            html: `
                <div class="title">变量设置
                    <div class="node-actions">
                        <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                    </div>
                </div>
                <div class="node-content">
                    <div class="node-property">
                        <div class="node-property-label">变量名</div>
                        <div class="node-var-name">myVar</div>
                    </div>
                    <div class="input-field">输入值</div>
                    <div class="output-field">继续</div>
                </div>
            `,
            data: {
                variableName: "myVar",
                defaultValue: ""
            },
            outputs: 1,
            inputs: 1,
            class: "node-variable"
        }
    };

    // 拖拽初始化
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.addEventListener('dragstart', drag);
    });
    
    const editorContainer = document.getElementById('drawflow');
    editorContainer.addEventListener('dragover', allowDrop);
    editorContainer.addEventListener('drop', drop);
    
    // 添加鼠标位置跟踪
    editorContainer.addEventListener('mousemove', function(e) {
        const rect = editorContainer.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / editorConfig.zoom);
        const y = Math.round((e.clientY - rect.top) / editorConfig.zoom);
        document.getElementById('position-info').textContent = `位置: ${x}, ${y}`;
    });

    // 拖拽相关函数
    function drag(event) {
        event.dataTransfer.setData('node-type', event.target.getAttribute('data-node-type'));
    }

    function allowDrop(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData('node-type');
        if (nodeType && nodeTemplates[nodeType]) {
            const template = nodeTemplates[nodeType];
            const rect = document.getElementById('drawflow').getBoundingClientRect();
            const posX = (event.clientX - rect.left) / editorConfig.zoom;
            const posY = (event.clientY - rect.top) / editorConfig.zoom;
            
            // 添加节点
            const nodeId = editor.addNode(
                nodeType,
                template.inputs,
                template.outputs,
                posX,
                posY,
                nodeType,
                template.data,
                template.html,
                false,
                template.class
            );
            
            // 添加节点后自动初始化节点事件
            setTimeout(() => {
                initNodeEvents(nodeId);
            }, 100);
        }
    }
    
    // 按钮事件绑定
    document.getElementById('btn-new').addEventListener('click', function() {
        if (confirm('确定要创建新流程吗？当前流程将丢失！')) {
            editor.clear();
        }
    });

    document.getElementById('btn-save').addEventListener('click', function() {
        document.getElementById('save-dialog').style.display = 'block';
    });

    document.getElementById('save-confirm').addEventListener('click', function() {
        const flowName = document.getElementById('flow-name').value.trim();
        if (!flowName) {
            alert('请输入流程名称');
            return;
        }
        
        const flowData = editor.export();
        fetch('/save_flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: flowName,
                data: flowData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                document.getElementById('save-dialog').style.display = 'none';
                document.getElementById('flow-name').value = '';
                selectedFlowName = flowName;
            } else {
                alert('保存失败: ' + data.message);
            }
        })
        .catch(error => {
            alert('保存出错: ' + error);
        });
    });

    document.getElementById('save-cancel').addEventListener('click', function() {
        document.getElementById('save-dialog').style.display = 'none';
    });
    
    if (document.getElementById('save-close')) {
        document.getElementById('save-close').addEventListener('click', function() {
            document.getElementById('save-dialog').style.display = 'none';
        });
    }

    document.getElementById('btn-load').addEventListener('click', function() {
        fetch('/list_flows')
            .then(response => response.json())
            .then(data => {
                const flowList = document.getElementById('flow-list');
                flowList.innerHTML = '';
                if (data.flows.length === 0) {
                    flowList.innerHTML = '<div>没有保存的流程</div>';
                } else {
                    data.flows.forEach(flow => {
                        const div = document.createElement('div');
                        div.textContent = flow;
                        div.addEventListener('click', function() {
                            // 清除之前选择
                            flowList.querySelectorAll('div').forEach(el => {
                                el.classList.remove('selected');
                            });
                            // 当前选择高亮
                            div.classList.add('selected');
                            
                            // 启用加载按钮
                            document.getElementById('load-confirm').disabled = false;
                            selectedFlowName = flow;
                        });
                        flowList.appendChild(div);
                    });
                }
                document.getElementById('load-dialog').style.display = 'block';
            })
            .catch(error => {
                alert('获取流程列表出错: ' + error);
            });
    });

    document.getElementById('load-cancel').addEventListener('click', function() {
        document.getElementById('load-dialog').style.display = 'none';
    });
    
    if (document.getElementById('load-close')) {
        document.getElementById('load-close').addEventListener('click', function() {
            document.getElementById('load-dialog').style.display = 'none';
        });
    }
    
    document.getElementById('load-confirm').addEventListener('click', function() {
        if (selectedFlowName) {
            loadFlow(selectedFlowName);
        } else {
            alert('请选择要加载的流程');
        }
    });

    document.getElementById('btn-export').addEventListener('click', function() {
        const flowData = editor.export();
        const jsonString = JSON.stringify(flowData, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flow.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('btn-run').addEventListener('click', runFlow);
    
    // 添加缩放控制
    document.getElementById('btn-zoom-in').addEventListener('click', function() {
        zoomIn();
    });
    
    document.getElementById('btn-zoom-out').addEventListener('click', function() {
        zoomOut();
    });
    
    document.getElementById('btn-zoom-reset').addEventListener('click', function() {
        resetZoom();
    });
    
    // 设置按钮
    document.getElementById('btn-settings').addEventListener('click', function() {
        // 设置对话框初始值
        document.getElementById('theme-select').value = localStorage.getItem('theme') || 'light';
        document.getElementById('grid-size').value = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size')) || 20;
        document.getElementById('grid-size-value').textContent = document.getElementById('grid-size').value;
        document.getElementById('api-key').value = apiKey;
        
        // 显示设置对话框
        document.getElementById('settings-dialog').style.display = 'block';
    });
    
    // 网格大小滑块实时更新
    document.getElementById('grid-size').addEventListener('input', function() {
        document.getElementById('grid-size-value').textContent = this.value;
    });
    
    document.getElementById('settings-cancel').addEventListener('click', function() {
        document.getElementById('settings-dialog').style.display = 'none';
    });
    
    document.getElementById('settings-close').addEventListener('click', function() {
        document.getElementById('settings-dialog').style.display = 'none';
    });
    
    document.getElementById('settings-confirm').addEventListener('click', function() {
        // 保存主题设置
        const themeValue = document.getElementById('theme-select').value;
        localStorage.setItem('theme', themeValue);
        
        // 应用主题
        if (themeValue === 'dark' || (themeValue === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // 更新网格大小
        const gridSize = document.getElementById('grid-size').value;
        document.documentElement.style.setProperty('--grid-size', gridSize + 'px');
        
        // 保存API密钥
        apiKey = document.getElementById('api-key').value.trim();
        localStorage.setItem('apiKey', apiKey);
        
        document.getElementById('settings-dialog').style.display = 'none';
    });
    
    // 主题切换
    document.getElementById('theme-toggle').addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            this.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            this.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // 侧边栏折叠控制
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        
        // 更改按钮图标
        if (sidebar.classList.contains('collapsed')) {
            this.innerHTML = '<i class="fas fa-chevron-right"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
    });
    
    // 聊天面板折叠控制
    const chatPanel = document.getElementById('chat-panel');
    document.getElementById('chat-toggle').addEventListener('click', function() {
        chatPanel.classList.toggle('collapsed');
    });
    
    // 聊天输入处理
    document.getElementById('chat-send').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // 加载流程函数
    function loadFlow(flowName) {
        fetch('/load_flow/' + flowName)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    editor.import(data.data);
                    document.getElementById('load-dialog').style.display = 'none';
                    
                    // 重新初始化所有节点事件
                    setTimeout(() => {
                        for (const nodeId in editor.drawflow.drawflow.Home.data) {
                            initNodeEvents(nodeId);
                        }
                    }, 100);
                    
                    alert('流程加载成功');
                } else {
                    alert('加载流程失败: ' + data.message);
                }
            })
            .catch(error => {
                alert('加载出错: ' + error);
            });
    }
    
    // 初始化节点事件
    function initNodeEvents(nodeId) {
        // 获取当前节点的编辑按钮
        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (nodeElement) {
            const editBtn = nodeElement.querySelector('.edit-node');
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    editNode(nodeId);
                });
            }
        }
    }
    
    // 编辑节点
    function editNode(nodeId) {
        const node = editor.getNodeFromId(nodeId);
        if (!node) return;
        
        selectedNode = node;
        const nodeType = node.name;
        const nodeData = node.data;
        
        // 设置对话框标题
        document.getElementById('node-edit-title').textContent = `编辑${getNodeTypeName(nodeType)}节点`;
        
        // 根据节点类型创建不同的表单
        let formContent = '';
        
        switch (nodeType) {
            case 'flowStart':
            case 'flowEnd':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">流程描述</label>
                        <input type="text" id="node-description" class="form-control" value="${nodeData.description || ''}">
                    </div>
                `;
                break;
                
            case 'llmResponse':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">系统提示词</label>
                        <textarea id="node-system-prompt" class="form-control">${nodeData.systemPrompt || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="node-property-label">固定提示词</label>
                        <textarea id="node-prompt" class="form-control">${nodeData.prompt || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="node-property-label">模型</label>
                        <select id="node-model" class="form-control">
                            <option value="gpt-3.5-turbo" ${nodeData.model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5-Turbo</option>
                            <option value="gpt-4" ${nodeData.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="node-property-label">温度 (0-1)</label>
                        <input type="range" id="node-temperature" min="0" max="1" step="0.1" value="${nodeData.temperature || 0.7}" class="form-control">
                        <div id="temperature-value">${nodeData.temperature || 0.7}</div>
                    </div>
                `;
                break;
                
            case 'webSearch':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">搜索引擎</label>
                        <select id="node-search-engine" class="form-control">
                            <option value="Google" ${nodeData.searchEngine === 'Google' ? 'selected' : ''}>Google</option>
                            <option value="Bing" ${nodeData.searchEngine === 'Bing' ? 'selected' : ''}>Bing</option>
                            <option value="DuckDuckGo" ${nodeData.searchEngine === 'DuckDuckGo' ? 'selected' : ''}>DuckDuckGo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="node-property-label">结果数量</label>
                        <input type="number" id="node-result-count" min="1" max="10" value="${nodeData.resultCount || 3}" class="form-control">
                    </div>
                `;
                break;
                
            case 'userInput':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">提示信息</label>
                        <input type="text" id="node-prompt-message" class="form-control" value="${nodeData.promptMessage || ''}">
                    </div>
                `;
                break;
                
            case 'textOutput':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">固定文本 (可选，为空时使用输入)</label>
                        <textarea id="node-static-text" class="form-control">${nodeData.staticText || ''}</textarea>
                    </div>
                `;
                break;
                
            case 'thinkOutput':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">思考内容 (可选，为空时使用输入)</label>
                        <textarea id="node-think-content" class="form-control">${nodeData.thinkContent || ''}</textarea>
                    </div>
                `;
                break;
                
            case 'condition':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">条件表达式</label>
                        <input type="text" id="node-condition-expr" class="form-control" value="${nodeData.conditionExpr || ''}">
                        <small>示例: 输入.includes("关键词") 或 输入 == "值"</small>
                    </div>
                `;
                break;
                
            case 'variable':
                formContent = `
                    <div class="form-group">
                        <label class="node-property-label">变量名</label>
                        <input type="text" id="node-var-name" class="form-control" value="${nodeData.variableName || ''}">
                    </div>
                    <div class="form-group">
                        <label class="node-property-label">默认值 (可选)</label>
                        <input type="text" id="node-default-value" class="form-control" value="${nodeData.defaultValue || ''}">
                    </div>
                `;
                break;
        }
        
        // 更新表单内容
        document.getElementById('node-edit-content').innerHTML = formContent;
        
        // 添加温度范围的实时更新
        const tempRange = document.getElementById('node-temperature');
        if (tempRange) {
            tempRange.addEventListener('input', function() {
                document.getElementById('temperature-value').textContent = this.value;
            });
        }
    }
});
