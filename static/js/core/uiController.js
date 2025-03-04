/**
 * UI控制器类
 * 负责处理所有用户界面交互
 */
class UIController {
    constructor(editor) {
        this.editor = editor;
        this.flowEngine = null;
        this.selectedNode = null;
        this.selectedFlowName = '';
        this.isDragging = false;
        this.pendingInputRequest = null;
        
        // DOM元素缓存
        this.elements = {
            chatPanel: document.getElementById('chat-panel'),
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            runLog: document.getElementById('run-log'),
            positionInfo: document.getElementById('position-info'),
            zoomInfo: document.getElementById('zoom-info'),
            selectedInfo: document.getElementById('selected-info'),
            runResult: document.getElementById('run-result-content')
        };
        
        // 绑定事件处理器
        this.bindEvents();
    }
    
    /**
     * 连接流程引擎
     * @param {FlowEngine} flowEngine - 流程引擎实例
     */
    connectFlowEngine(flowEngine) {
        this.flowEngine = flowEngine;
        this.bindFlowEngineEvents();
    }
    
    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 订阅事件总线事件
        window.event
        // 绑定节点选择变化事件
        this.editor.on('node:selected', (node) => {
            this.selectedNode = node;
            this.updateSelectedInfo();
        });
        
        this.editor.on('node:unselected', () => {
            this.selectedNode = null;
            this.updateSelectedInfo();
        });
        
        // 缩放事件
        this.editor.on('zoom:change', (zoom) => {
            this.updateZoomInfo(zoom);
        });
        
        // 拖拽节点库节点事件
        const nodes = document.querySelectorAll('.node');
        nodes.forEach(node => {
            node.addEventListener('dragstart', this.handleDragStart.bind(this));
        });
        
        const editorContainer = document.getElementById('drawflow');
        editorContainer.addEventListener('dragover', this.handleDragOver.bind(this));
        editorContainer.addEventListener('drop', this.handleDrop.bind(this));
        
        // 鼠标位置跟踪
        editorContainer.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 绑定按钮事件
        this.bindButtonEvents();
        
        // 绑定对话框事件
        this.bindDialogEvents();
        
        // 绑定聊天面板事件
        this.bindChatEvents();
        
        // 键盘快捷键
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // 绑定流程引擎事件
        this.bindFlowEngineEvents();
    }
    
    bindButtonEvents() {
        // 文件操作按钮
        document.getElementById('btn-new').addEventListener('click', this.handleNewFlow.bind(this));
        document.getElementById('btn-save').addEventListener('click', this.handleSaveFlow.bind(this));
        document.getElementById('btn-load').addEventListener('click', this.handleLoadFlowList.bind(this));
        document.getElementById('btn-export').addEventListener('click', this.handleExportFlow.bind(this));
        document.getElementById('btn-run').addEventListener('click', this.handleRunFlow.bind(this));
        
        // 缩放控制
        document.getElementById('btn-zoom-in').addEventListener('click', () => this.editor.zoomIn());
        document.getElementById('btn-zoom-out').addEventListener('click', () => this.editor.zoomOut());
        document.getElementById('btn-zoom-reset').addEventListener('click', () => this.editor.resetZoom());
        
        // 设置按钮
        document.getElementById('btn-settings').addEventListener('click', this.handleOpenSettings.bind(this));
        
        // 编辑操作按钮
        document.getElementById('btn-select-all').addEventListener('click', this.handleSelectAll.bind(this));
        document.getElementById('btn-delete').addEventListener('click', this.handleDelete.bind(this));
        document.getElementById('btn-lock').addEventListener('click', this.handleLockNodes.bind(this));
        document.getElementById('btn-undo').addEventListener('click', this.handleUndo.bind(this));
        document.getElementById('btn-redo').addEventListener('click', this.handleRedo.bind(this));
        
        // 主题切换
        document.getElementById('theme-toggle').addEventListener('click', this.handleThemeToggle.bind(this));
        
        // 侧边栏折叠控制
        document.querySelector('.sidebar-toggle').addEventListener('click', this.handleSidebarToggle.bind(this));
    }
    
    bindDialogEvents() {
        // 保存对话框
        document.getElementById('save-confirm').addEventListener('click', this.handleSaveConfirm.bind(this));
        document.getElementById('save-cancel').addEventListener('click', () => this.closeDialog('save-dialog'));
        if (document.getElementById('save-close')) {
            document.getElementById('save-close').addEventListener('click', () => this.closeDialog('save-dialog'));
        }
        
        // 加载对话框
        document.getElementById('load-confirm').addEventListener('click', this.handleLoadConfirm.bind(this));
        document.getElementById('load-cancel').addEventListener('click', () => this.closeDialog('load-dialog'));
        if (document.getElementById('load-close')) {
            document.getElementById('load-close').addEventListener('click', () => this.closeDialog('load-dialog'));
        }
        
        // 设置对话框
        document.getElementById('settings-confirm').addEventListener('click', this.handleSettingsSave.bind(this));
        document.getElementById('settings-cancel').addEventListener('click', () => this.closeDialog('settings-dialog'));
        document.getElementById('settings-close').addEventListener('click', () => this.closeDialog('settings-dialog'));
        
        // 网格大小滑块实时更新
        document.getElementById('grid-size').addEventListener('input', (e) => {
            document.getElementById('grid-size-value').textContent = e.target.value;
        });
        
        // 节点编辑对话框
        document.getElementById('node-edit-confirm').addEventListener('click', this.handleNodeEditConfirm.bind(this));
        document.getElementById('node-edit-cancel').addEventListener('click', () => this.closeDialog('node-edit-dialog'));
        document.getElementById('node-edit-close').addEventListener('click', () => this.closeDialog('node-edit-dialog'));
        
        // 运行结果对话框
        document.getElementById('run-result-close-btn').addEventListener('click', () => this.closeDialog('run-result-dialog'));
        document.getElementById('run-result-close').addEventListener('click', () => this.closeDialog('run-result-dialog'));
    }
    
    bindChatEvents() {
        // 聊天面板折叠控制
        document.getElementById('chat-toggle').addEventListener('click', this.handleChatToggle.bind(this));
        
        // 聊天输入处理
        document.getElementById('chat-send').addEventListener('click', this.handleSendChat.bind(this));
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendChat();
            }
        });
    }
    
    bindFlowEngineEvents() {
        // 流程引擎事件监听
        this.flowEngine = new FlowEngine(this.editor.editor);
        
        this.flowEngine.on('input:required', this.handleInputRequired.bind(this));
        this.flowEngine.on('output:text', this.handleOutputText.bind(this));
        this.flowEngine.on('output:think', this.handleOutputThink.bind(this));
        
        this.flowEngine.on('log:info', (message) => this.addLogEntry(message, 'info'));
        this.flowEngine.on('log:success', (message) => this.addLogEntry(message, 'success'));
        this.flowEngine.on('log:error', (message) => this.addLogEntry(message, 'error'));
        
        this.flowEngine.on('flow:completed', this.handleFlowCompleted.bind(this));
        this.flowEngine.on('flow:error', this.handleFlowError.bind(this));
    }
    
    // UI 更新方法
    updateZoomInfo(zoom) {
        this.elements.zoomInfo.textContent = `缩放: ${Math.round(zoom * 100)}%`;
    }
    
    updateSelectedInfo() {
        const selectedNodes = document.querySelectorAll('.drawflow-node.selected');
        this.elements.selectedInfo.textContent = `已选择: ${selectedNodes.length} 个节点`;
    }
    
    // 对话框操作
    openDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.style.display = 'block';
        }
    }
    
    closeDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.style.display = 'none';
        }
    }
    
    // 初始化节点编辑对话框
    initNodeEditDialog(nodeId) {
        const node = this.editor.editor.getNodeFromId(nodeId);
        if (!node) return;
        
        this.selectedNode = node;
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
                
            // ...其他节点类型的表单内容...
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
        
        this.openDialog('node-edit-dialog');
    }
    
    // 事件处理方法
    handleDragStart(event) {
        event.dataTransfer.setData('node-type', event.target.getAttribute('data-node-type'));
        this.isDragging = true;
    }
    
    handleDragOver(event) {
        event.preventDefault();
    }
    
    handleDrop(event) {
        event.preventDefault();
        this.isDragging = false;
        
        const nodeType = event.dataTransfer.getData('node-type');
        if (!nodeType) return;
        
        const rect = document.getElementById('drawflow').getBoundingClientRect();
        const posX = (event.clientX - rect.left) / this.editor.config.zoom;
        const posY = (event.clientY - rect.top) / this.editor.config.zoom;
        
        // 添加节点
        const nodeId = this.editor.addNode(nodeType, posX, posY);
        if (nodeId) {
            this.initNodeEvents(nodeId);
        }
    }
    
    handleMouseMove(event) {
        if (this.isDragging) return;
        
        const rect = document.getElementById('drawflow').getBoundingClientRect();
        const zoom = this.editor.config.zoom;
        const x = Math.round((event.clientX - rect.left) / zoom);
        const y = Math.round((event.clientY - rect.top) / zoom);
        this.elements.positionInfo.textContent = `位置: ${x}, ${y}`;
    }
    
    // 初始化节点事件
    initNodeEvents(nodeId) {
        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (!nodeElement) return;
        
        // 编辑按钮事件
        const editBtn = nodeElement.querySelector('.edit-node');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.initNodeEditDialog(nodeId);
            });
        }
    }
    
    // 按钮处理方法
    handleNewFlow() {
        if (confirm('确定要创建新流程吗？当前流程将丢失！')) {
            this.editor.clear();
        }
    }
    
    handleSaveFlow() {
        this.openDialog('save-dialog');
    }
    
    handleLoadFlowList() {
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
                        div.addEventListener('click', () => {
                            // 清除之前选择
                            flowList.querySelectorAll('div').forEach(el => {
                                el.classList.remove('selected');
                            });
                            // 当前选择高亮
                            div.classList.add('selected');
                            
                            // 启用加载按钮
                            document.getElementById('load-confirm').disabled = false;
                            this.selectedFlowName = flow;
                        });
                        flowList.appendChild(div);
                    });
                }
                this.openDialog('load-dialog');
            })
            .catch(error => {
                alert('获取流程列表出错: ' + error);
            });
    }
    
    handleExportFlow() {
        const flowData = this.editor.export();
        const jsonString = JSON.stringify(flowData, null, 2);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flow.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    
    handleRunFlow() {
        // 清空日志和结果
        document.getElementById('run-log').innerHTML = '';
        document.getElementById('run-result-content').innerHTML = '';
        
        // 开始执行流程
        this.flowEngine.start()
            .catch(error => {
                console.error('流程执行错误:', error);
                this.addLogEntry(`执行错误: ${error.message}`, 'error');
            });
    }
    
    handleOpenSettings() {
        // 设置对话框初始值
        document.getElementById('theme-select').value = localStorage.getItem('theme') || 'light';
        document.getElementById('grid-size').value = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-size')) || 20;
        document.getElementById('grid-size-value').textContent = document.getElementById('grid-size').value;
        document.getElementById('api-key').value = localStorage.getItem('apiKey') || '';
        
        this.openDialog('settings-dialog');
    }
    
    // 聊天相关方法
    handleSendChat() {
        const input = this.elements.chatInput.value.trim();
        if (!input) return;
        
        this.addChatMessage(input, 'user');
        this.elements.chatInput.value = '';
        
        // 如果有待处理的用户输入请求，则响应它
        if (this.pendingInputRequest) {
            const callback = this.pendingInputRequest.callback;
            this.pendingInputRequest = null;
            callback(input);
        }
    }
    
    handleChatToggle() {
        this.elements.chatPanel.classList.toggle('collapsed');
    }
    
    addChatMessage(text, type) {
        const message = document.createElement('div');
        message.className = `chat-message ${type}`;
        message.textContent = text;
        this.elements.chatMessages.appendChild(message);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
    
    // 流程引擎交互方法
    handleInputRequired(data) {
        this.addChatMessage(data.message, 'bot');
        this.pendingInputRequest = data;
    }
    
    handleOutputText(text) {
        this.addChatMessage(text, 'bot');
    }
    
    handleOutputThink(text) {
        this.addChatMessage(text, 'think');
    }
    
    addLogEntry(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        this.elements.runLog.appendChild(entry);
        this.elements.runLog.scrollTop = this.elements.runLog.scrollHeight;
    }
    
    handleFlowCompleted(data) {
        this.addLogEntry('流程执行完成', 'success');
        this.openDialog('run-result-dialog');
    }
    
    handleFlowError(data) {
        this.addLogEntry(`流程执行失败: ${data.error}`, 'error');
        this.openDialog('run-result-dialog');
    }
}
