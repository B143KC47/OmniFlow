/**
 * OmniFlow流程编辑器节点模块
 * 负责节点创建、编辑和管理
 */

import { FlowCore } from './core.js';
import { FlowConnections } from './connections.js';
import { FlowUtils } from './utils.js';

// 节点类型定义
export const nodeTypes = {
    'input': {
        name: '输入节点',
        icon: 'bi-box-arrow-in-down',
        color: '#3498db',
        description: '接收流程输入数据的起始节点',
        inputs: 0,
        outputs: 1,
        properties: [
            { name: 'inputType', label: '输入类型', type: 'select', options: ['文本', '数字', 'JSON', '布尔'] },
            { name: 'defaultValue', label: '默认值', type: 'text' }
        ]
    },
    'process': {
        name: '处理节点',
        icon: 'bi-gear',
        color: '#2ecc71',
        description: '处理数据的中间节点',
        inputs: 1,
        outputs: 1,
        properties: [
            { name: 'operation', label: '操作', type: 'select', options: ['转换', '过滤', '合并', '自定义'] },
            { name: 'script', label: '处理脚本', type: 'code' }
        ]
    },
    'decision': {
        name: '决策节点',
        icon: 'bi-shuffle',
        color: '#f39c12',
        description: '根据条件决定流程走向',
        inputs: 1,
        outputs: 2,
        properties: [
            { name: 'condition', label: '条件表达式', type: 'code' },
            { name: 'truePath', label: '条件为真路径', type: 'text' },
            { name: 'falsePath', label: '条件为假路径', type: 'text' }
        ]
    },
    'output': {
        name: '输出节点',
        icon: 'bi-box-arrow-up',
        color: '#e74c3c',
        description: '流程的结束节点，输出最终结果',
        inputs: 1,
        outputs: 0,
        properties: [
            { name: 'outputType', label: '输出类型', type: 'select', options: ['文本', 'JSON', '数字', '布尔'] },
            { name: 'formatOutput', label: '格式化输出', type: 'checkbox' }
        ]
    },
    'api': {
        name: 'API调用节点',
        icon: 'bi-cloud',
        color: '#9b59b6',
        description: '调用外部API服务',
        inputs: 1,
        outputs: 1,
        properties: [
            { name: 'url', label: 'API地址', type: 'text' },
            { name: 'method', label: '请求方法', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'headers', label: '请求头', type: 'json' },
            { name: 'body', label: '请求体', type: 'code' }
        ]
    },
    'llm': {
        name: 'LLM节点',
        icon: 'bi-cpu',
        color: '#1abc9c',
        description: '调用大语言模型进行处理',
        inputs: 1,
        outputs: 1,
        properties: [
            { name: 'model', label: '模型选择', type: 'select', options: ['deepseek-chat', 'gpt-3.5-turbo', 'gpt-4'] },
            { name: 'prompt', label: '提示词模板', type: 'textarea' },
            { name: 'temperature', label: '温度', type: 'range', min: 0, max: 1, step: 0.01, default: 0.7 }
        ]
    }
};

export const FlowNodes = {
    /**
     * 初始化节点模块
     */
    init() {
        console.log('初始化流程编辑器节点模块');
        return this;
    },
    
    /**
     * 创建节点容器
     */
    createNodesContainer() {
        // 创建容器
        const container = document.createElement('div');
        container.id = 'nodesContainer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.transformOrigin = '0 0';
        
        // 添加到画布
        FlowCore.state.canvas.appendChild(container);
    },
    
    /**
     * 创建节点
     */
    createNode(nodeType) {
        const typeConfig = nodeTypes[nodeType];
        if (!typeConfig) {
            console.error(`未知的节点类型: ${nodeType}`);
            return;
        }
        
        // 创建节点元素
        const node = document.createElement('div');
        node.className = 'node';
        node.setAttribute('data-node-type', nodeType);
        
        // 分配节点ID
        const nodeId = FlowCore.state.nextNodeId++;
        node.setAttribute('data-node-id', nodeId);
        
        // 设置节点默认位置
        node.style.left = `${Math.random() * 200 + 100}px`;
        node.style.top = `${Math.random() * 200 + 100}px`;
        
        // 创建节点内容
        node.innerHTML = `
            <div class="node-header" style="background-color: ${typeConfig.color}">
                <i class="bi ${typeConfig.icon}"></i>
                <div class="node-title">${typeConfig.name}</div>
                <div class="node-controls">
                    <i class="bi bi-pencil edit-node" title="编辑节点"></i>
                    <i class="bi bi-trash delete-node" title="删除节点"></i>
                </div>
            </div>
            <div class="node-body">
                <div class="node-description">${typeConfig.description}</div>
            </div>
        `;
        
        // 创建输入连接点
        for (let i = 0; i < typeConfig.inputs; i++) {
            const input = document.createElement('div');
            input.className = 'node-handle handle-input';
            input.setAttribute('data-handle-type', 'input');
            input.setAttribute('data-handle-index', i);
            input.style.top = `${50 + i * 20}px`;
            node.appendChild(input);
            
            // 设置连接点事件
            FlowConnections.setupHandleEvents(input);
        }
        
        // 创建输出连接点
        for (let i = 0; i < typeConfig.outputs; i++) {
            const output = document.createElement('div');
            output.className = 'node-handle handle-output';
            output.setAttribute('data-handle-type', 'output');
            output.setAttribute('data-handle-index', i);
            output.style.top = `${50 + i * 20}px`;
            node.appendChild(output);
            
            // 设置连接点事件
            FlowConnections.setupHandleEvents(output);
        }
        
        // 设置节点拖拽事件
        this.setupNodeEvents(node);
        
        // 将节点添加到容器
        document.getElementById('nodesContainer').appendChild(node);
        
        // 添加节点数据到状态
        FlowCore.state.nodes.push({
            id: nodeId,
            type: nodeType,
            name: typeConfig.name,
            position: {
                x: parseInt(node.style.left),
                y: parseInt(node.style.top)
            },
            data: {}
        });
        
        // 更新节点计数
        this.updateNodeCount();
        
        return node;
    },
    
    /**
     * 设置节点交互事件
     */
    setupNodeEvents(node) {
        // 节点点击事件 - 选择节点
        node.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            
            // 检查是否是连接点
            if (e.target.classList.contains('node-handle')) {
                return;
            }
            
            // 检查是否是操作按钮
            if (e.target.classList.contains('edit-node')) {
                this.showNodeEditModal(node);
                return;
            }
            
            if (e.target.classList.contains('delete-node')) {
                this.deleteNode(node);
                return;
            }
            
            // 选择节点
            this.selectNode(node);
            
            // 开始拖拽
            FlowCore.state.draggedNode = node;
            const rect = node.getBoundingClientRect();
            FlowCore.state.dragOffset.x = e.clientX - rect.left;
            FlowCore.state.dragOffset.y = e.clientY - rect.top;
        });
        
        // 右键菜单
        node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 选择节点
            this.selectNode(node);
            
            // 显示上下文菜单
            const nodeType = node.getAttribute('data-node-type');
            const nodeTypeConfig = nodeTypes[nodeType];
            
            const menuItems = [
                { label: '编辑节点', icon: 'bi-pencil', action: () => this.showNodeEditModal(node) },
                { label: '复制节点', icon: 'bi-files', action: () => this.duplicateNode(node) },
                { divider: true },
                { label: '删除节点', icon: 'bi-trash', action: () => this.deleteNode(node) }
            ];
            
            // 添加特定节点类型的操作
            if (nodeType === 'api') {
                menuItems.splice(2, 0, { label: '测试API', icon: 'bi-lightning', action: () => this.testApiNode(node) });
            } else if (nodeType === 'llm') {
                menuItems.splice(2, 0, { label: '测试LLM', icon: 'bi-lightning', action: () => this.testLlmNode(node) });
            }
            
            // 导入模块并显示菜单
            import('./ui.js').then(ui => {
                ui.FlowUI.showContextMenu(e, menuItems);
            });
        });
    },
    
    /**
     * 选择节点
     */
    selectNode(node) {
        // 取消之前的选择
        FlowCore.deselectAll();
        
        // 设置新选择的节点
        node.classList.add('selected');
        FlowCore.state.selectedNode = node;
        
        // 更新属性面板
        this.updatePropertiesPanel();
    },
    
    /**
     * 更新属性面板
     */
    updatePropertiesPanel() {
        const propertiesPanel = document.getElementById('propertiesPanel');
        if (!propertiesPanel) return;
        
        if (!FlowCore.state.selectedNode) {
            propertiesPanel.innerHTML = '<div class="text-muted text-center"><small>选择节点或连接以查看属性</small></div>';
            return;
        }
        
        const node = FlowCore.state.selectedNode;
        const nodeType = node.getAttribute('data-node-type');
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        const typeConfig = nodeTypes[nodeType];
        
        // 创建属性面板内容
        let content = `
            <div class="mb-3">
                <label class="form-label">节点ID</label>
                <input type="text" class="form-control form-control-sm" value="${nodeId}" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">节点名称</label>
                <input type="text" class="form-control form-control-sm" id="nodeName" value="${nodeData.name || typeConfig.name}">
            </div>
            <hr>
        `;
        
        // 添加节点类型特定属性
        if (typeConfig.properties && typeConfig.properties.length > 0) {
            content += '<div class="node-properties">';
            
            typeConfig.properties.forEach(prop => {
                const propValue = nodeData.data?.[prop.name] || '';
                
                content += `<div class="mb-3">
                    <label class="form-label">${prop.label}</label>`;
                
                switch (prop.type) {
                    case 'text':
                        content += `<input type="text" class="form-control form-control-sm node-property" 
                                    data-property="${prop.name}" value="${propValue}">`;
                        break;
                    case 'textarea':
                        content += `<textarea class="form-control form-control-sm node-property" 
                                    data-property="${prop.name}" rows="3">${propValue}</textarea>`;
                        break;
                    case 'select':
                        content += `<select class="form-select form-select-sm node-property" data-property="${prop.name}">`;
                        prop.options.forEach(option => {
                            const selected = option === propValue ? 'selected' : '';
                            content += `<option value="${option}" ${selected}>${option}</option>`;
                        });
                        content += `</select>`;
                        break;
                    case 'checkbox':
                        const checked = propValue === true ? 'checked' : '';
                        content += `
                            <div class="form-check">
                                <input class="form-check-input node-property" type="checkbox" 
                                    data-property="${prop.name}" id="prop_${prop.name}" ${checked}>
                                <label class="form-check-label" for="prop_${prop.name}">启用</label>
                            </div>`;
                        break;
                    case 'code':
                        content += `<textarea class="form-control form-control-sm node-property code-editor" 
                                    data-property="${prop.name}" rows="5">${propValue}</textarea>`;
                        break;
                    case 'json':
                        const jsonValue = typeof propValue === 'object' ? JSON.stringify(propValue, null, 2) : propValue;
                        content += `<textarea class="form-control form-control-sm node-property json-editor" 
                                    data-property="${prop.name}" rows="5">${jsonValue}</textarea>`;
                        break;
                    case 'range':
                        const min = prop.min || 0;
                        const max = prop.max || 1;
                        const step = prop.step || 0.1;
                        const value = propValue || prop.default || min;
                        content += `
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range node-property" min="${min}" max="${max}" 
                                    step="${step}" data-property="${prop.name}" value="${value}">
                                <span class="ms-2" id="range_${prop.name}_value">${value}</span>
                            </div>`;
                        break;
                }
                
                content += '</div>';
            });
            
            content += '</div>';
        }
        
        // 添加位置信息
        content += `
            <hr>
            <div class="row g-2">
                <div class="col-6">
                    <label class="form-label">X位置</label>
                    <input type="number" class="form-control form-control-sm" id="nodePositionX" value="${nodeData.position.x}">
                </div>
                <div class="col-6">
                    <label class="form-label">Y位置</label>
                    <input type="number" class="form-control form-control-sm" id="nodePositionY" value="${nodeData.position.y}">
                </div>
            </div>
            <div class="mt-3">
                <button class="btn btn-sm btn-primary w-100" id="applyNodeProperties">应用更改</button>
            </div>
        `;
        
        propertiesPanel.innerHTML = content;
        
        // 添加更改事件监听
        document.getElementById('applyNodeProperties').addEventListener('click', () => {
            this.applyNodeProperties();
        });
        
        // 添加range滑块值更新
        document.querySelectorAll('.form-range').forEach(range => {
            const propName = range.getAttribute('data-property');
            const valueDisplay = document.getElementById(`range_${propName}_value`);
            
            if (valueDisplay) {
                range.addEventListener('input', () => {
                    valueDisplay.textContent = range.value;
                });
            }
        });
    },
    
    /**
     * 应用节点属性更改
     */
    applyNodeProperties() {
        if (!FlowCore.state.selectedNode) return;
        
        const node = FlowCore.state.selectedNode;
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeIndex = FlowCore.state.nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex === -1) return;
        
        // 更新名称
        const newName = document.getElementById('nodeName').value;
        FlowCore.state.nodes[nodeIndex].name = newName;
        node.querySelector('.node-title').textContent = newName;
        
        // 更新位置
        const x = parseInt(document.getElementById('nodePositionX').value);
        const y = parseInt(document.getElementById('nodePositionY').value);
        
        FlowCore.state.nodes[nodeIndex].position = { x, y };
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        // 更新所有连接线
        FlowConnections.updateNodeConnections(node);
        
        // 更新属性
        if (!FlowCore.state.nodes[nodeIndex].data) {
            FlowCore.state.nodes[nodeIndex].data = {};
        }
        
        document.querySelectorAll('.node-property').forEach(prop => {
            const propName = prop.getAttribute('data-property');
            
            if (prop.type === 'checkbox') {
                FlowCore.state.nodes[nodeIndex].data[propName] = prop.checked;
            } else if (prop.classList.contains('json-editor')) {
                try {
                    FlowCore.state.nodes[nodeIndex].data[propName] = JSON.parse(prop.value);
                } catch (e) {
                    // 如果不是有效的JSON，保存为字符串
                    FlowCore.state.nodes[nodeIndex].data[propName] = prop.value;
                }
            } else {
                FlowCore.state.nodes[nodeIndex].data[propName] = prop.value;
            }
        });
        
        // 显示提示
        import('./ui.js').then(ui => {
            ui.FlowUI.showStatusMessage('节点属性已更新', 'success');
        });
    },
    
    /**
     * 显示节点编辑模态框
     */
    showNodeEditModal(node) {
        const modal = document.getElementById('nodeEditModal');
        if (!modal) return;
        
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeType = node.getAttribute('data-node-type');
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        const typeConfig = nodeTypes[nodeType];
        
        if (!nodeData) return;
        
        // 设置模态框标题
        document.getElementById('nodeEditModalLabel').textContent = `编辑 ${typeConfig.name}`;
        
        // 设置节点名称
        document.getElementById('editNodeName').value = nodeData.name || typeConfig.name;
        
        // 设置节点描述
        const descField = document.getElementById('editNodeDescription');
        if (descField) {
            descField.value = nodeData.description || typeConfig.description;
        }
        
        // 添加特定属性字段
        const typeSpecificFields = document.getElementById('nodeTypeSpecificFields');
        if (typeSpecificFields) {
            let fieldsHTML = '';
            
            if (typeConfig.properties && typeConfig.properties.length > 0) {
                typeConfig.properties.forEach(prop => {
                    const propValue = nodeData.data?.[prop.name] || '';
                    
                    fieldsHTML += `<div class="mb-3">
                        <label for="edit_${prop.name}" class="form-label">${prop.label}</label>`;
                    
                    switch (prop.type) {
                        case 'text':
                            fieldsHTML += `<input type="text" class="form-control" id="edit_${prop.name}" 
                                        data-property="${prop.name}" value="${propValue}">`;
                            break;
                        case 'textarea':
                            fieldsHTML += `<textarea class="form-control" id="edit_${prop.name}" 
                                        data-property="${prop.name}" rows="3">${propValue}</textarea>`;
                            break;
                        case 'select':
                            fieldsHTML += `<select class="form-select" id="edit_${prop.name}" data-property="${prop.name}">`;
                            prop.options.forEach(option => {
                                const selected = option === propValue ? 'selected' : '';
                                fieldsHTML += `<option value="${option}" ${selected}>${option}</option>`;
                            });
                            fieldsHTML += `</select>`;
                            break;
                        case 'checkbox':
                            const checked = propValue === true ? 'checked' : '';
                            fieldsHTML += `
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" 
                                        id="edit_${prop.name}" data-property="${prop.name}" ${checked}>
                                    <label class="form-check-label" for="edit_${prop.name}">启用</label>
                                </div>`;
                            break;
                        case 'code':
                            fieldsHTML += `<textarea class="form-control code-editor" id="edit_${prop.name}" 
                                        data-property="${prop.name}" rows="5">${propValue}</textarea>`;
                            break;
                        case 'json':
                            const jsonValue = typeof propValue === 'object' ? JSON.stringify(propValue, null, 2) : propValue;
                            fieldsHTML += `<textarea class="form-control json-editor" id="edit_${prop.name}" 
                                        data-property="${prop.name}" rows="5">${jsonValue}</textarea>`;
                            break;
                        case 'range':
                            const min = prop.min || 0;
                            const max = prop.max || 1;
                            const step = prop.step || 0.1;
                            const value = propValue || prop.default || min;
                            fieldsHTML += `
                                <div class="d-flex align-items-center">
                                    <input type="range" class="form-range" min="${min}" max="${max}" 
                                        step="${step}" id="edit_${prop.name}" data-property="${prop.name}" value="${value}">
                                    <span class="ms-2" id="edit_range_${prop.name}_value">${value}</span>
                                </div>`;
                            break;
                    }
                    
                    fieldsHTML += '</div>';
                });
            }
            
            typeSpecificFields.innerHTML = fieldsHTML;
            
            // 添加range滑块值更新
            document.querySelectorAll('input[type="range"]').forEach(range => {
                const propName = range.getAttribute('data-property');
                const valueDisplay = document.getElementById(`edit_range_${propName}_value`);
                
                if (valueDisplay) {
                    range.addEventListener('input', () => {
                        valueDisplay.textContent = range.value;
                    });
                }
            });
        }
        
        // 添加确认按钮事件
        const confirmBtn = document.getElementById('confirmNodeEdit');
        if (confirmBtn) {
            // 移除旧的事件监听器
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            
            newBtn.addEventListener('click', () => {
                this.saveNodeEdit(nodeId);
            });
        }
        
        // 显示模态框
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },
    
    /**
     * 保存节点编辑
     */
    saveNodeEdit(nodeId) {
        const nodeIndex = FlowCore.state.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        
        const node = document.querySelector(`.node[data-node-id="${nodeId}"]`);
        if (!node) return;
        
        // 更新名称
        const newName = document.getElementById('editNodeName').value;
        FlowCore.state.nodes[nodeIndex].name = newName;
        node.querySelector('.node-title').textContent = newName;
        
        // 更新描述
        const descField = document.getElementById('editNodeDescription');
        if (descField) {
            FlowCore.state.nodes[nodeIndex].description = descField.value;
        }
        
        // 更新属性
        if (!FlowCore.state.nodes[nodeIndex].data) {
            FlowCore.state.nodes[nodeIndex].data = {};
        }
        
        document.querySelectorAll('[data-property]').forEach(prop => {
            const propName = prop.getAttribute('data-property');
            
            if (prop.type === 'checkbox') {
                FlowCore.state.nodes[nodeIndex].data[propName] = prop.checked;
            } else if (prop.classList.contains('json-editor')) {
                try {
                    FlowCore.state.nodes[nodeIndex].data[propName] = JSON.parse(prop.value);
                } catch (e) {
                    // 如果不是有效的JSON，保存为字符串
                    FlowCore.state.nodes[nodeIndex].data[propName] = prop.value;
                }
            } else {
                FlowCore.state.nodes[nodeIndex].data[propName] = prop.value;
            }
        });
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('nodeEditModal'));
        modal.hide();
        
        // 如果节点当前被选中，更新属性面板
        if (FlowCore.state.selectedNode === node) {
            this.updatePropertiesPanel();
        }
        
        // 显示提示
        import('./ui.js').then(ui => {
            ui.FlowUI.showStatusMessage('节点已更新', 'success');
        });
    },
    
    /**
     * 删除节点
     */
    deleteNode(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        
        // 确认删除
        if (!confirm('确定要删除此节点吗？所有关联连接也将被删除。')) {
            return;
        }
        
        // 删除与节点相关的连接
        const connectionsToDelete = FlowCore.state.connections.filter(
            conn => conn.fromNodeId === nodeId || conn.toNodeId === nodeId
        );
        
        connectionsToDelete.forEach(conn => {
            const connectionElement = document.getElementById(conn.id);
            if (connectionElement) {
                connectionElement.remove();
            }
        });
        
        // 从状态中删除连接
        FlowCore.state.connections = FlowCore.state.connections.filter(
            conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
        );
        
        // 从DOM中删除节点
        node.remove();
        
        // 从状态中删除节点
        FlowCore.state.nodes = FlowCore.state.nodes.filter(n => n.id !== nodeId);
        
        // 取消当前选择，如果被删除的节点是当前选中的
        if (FlowCore.state.selectedNode === node) {
            FlowCore.state.selectedNode = null;
            this.updatePropertiesPanel();
        }
        
        // 更新统计数据
        this.updateNodeCount();
        FlowConnections.updateConnectionCount();
        
        // 显示提示
        import('./ui.js').then(ui => {
            ui.FlowUI.showStatusMessage('节点已删除', 'success');
        });
    },
    
    /**
     * 复制节点
     */
    duplicateNode(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeType = node.getAttribute('data-node-type');
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        // 创建新节点
        const newNode = this.createNode(nodeType);
        
        // 获取新节点ID
        const newNodeId = parseInt(newNode.getAttribute('data-node-id'));
        const newNodeIndex = FlowCore.state.nodes.findIndex(n => n.id === newNodeId);
        
        // 复制属性
        FlowCore.state.nodes[newNodeIndex].name = `${nodeData.name} 副本`;
        FlowCore.state.nodes[newNodeIndex].description = nodeData.description;
        FlowCore.state.nodes[newNodeIndex].data = FlowUtils.deepClone(nodeData.data) || {};
        
        // 设置位置 - 偏移一点
        const x = nodeData.position.x + 30;
        const y = nodeData.position.y + 30;
        FlowCore.state.nodes[newNodeIndex].position = { x, y };
        newNode.style.left = `${x}px`;
        newNode.style.top = `${y}px`;
        
        // 更新节点计数
        this.updateNodeCount();
        
        // 更新属性面板
        this.updatePropertiesPanel();
    },
    
    /**
     * 更新节点计数
     */
    updateNodeCount() {
        const countElement = document.getElementById('nodeCount');
        if (countElement) {
            countElement.textContent = FlowCore.state.nodes.length;
        }
    },
    
    /**
     * 测试API节点
     */
    testApiNode(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        // 获取API节点配置
        const { url, method, headers, body } = nodeData.data;
        
        // 发送请求
        fetch(url, {
            method,
            headers: JSON.parse(headers),
            body: method !== 'GET' ? body : undefined
        })
        .then(response => response.json())
        .then(data => {
            console.log('API响应:', data);
            import('./ui.js').then(ui => {
                ui.FlowUI.showStatusMessage('API测试成功', 'success');
            });
        })
        .catch(error => {
            console.error('API请求失败:', error);
            import('./ui.js').then(ui => {
                ui.FlowUI.showStatusMessage('API测试失败', 'danger');
            });
        });
    },
    
    /**
     * 测试LLM节点
     */
    testLlmNode(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        // 获取LLM节点配置
        const { model, prompt, temperature } = nodeData.data;
        
        // 模拟调用LLM
        console.log('调用LLM:', { model, prompt, temperature });
        import('./ui.js').then(ui => {
            ui.FlowUI.showStatusMessage('LLM测试成功', 'success');
        });
    }
};
