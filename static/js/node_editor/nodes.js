/**
 * OmniFlow流程编辑器节点模块
 * 负责节点创建和管理
 */

import { FlowCore } from './core.js';
import { FlowConnections } from './connections.js';

// 节点类型配置
export const nodeTypes = {
    'input': {
        color: '#3498db',
        inputs: 0,
        outputs: 1,
        defaultName: '输入节点',
        icon: 'bi-box-arrow-in-down',
        description: '流程的起始节点，用于接收输入数据',
        configFields: [
            { name: 'inputType', label: '输入类型', type: 'select', options: ['文本', '数字', '布尔', 'JSON', '文件'], default: '文本' },
            { name: 'defaultValue', label: '默认值', type: 'input', default: '' }
        ]
    },
    'process': {
        color: '#2ecc71',
        inputs: 1,
        outputs: 1,
        defaultName: '处理节点',
        icon: 'bi-gear',
        description: '执行数据处理和转换操作',
        configFields: [
            { name: 'processType', label: '处理类型', type: 'select', options: ['基础处理', '筛选', '映射', '转换'], default: '基础处理' },
            { name: 'expression', label: '处理表达式', type: 'textarea', default: '' }
        ]
    },
    'decision': {
        color: '#f39c12',
        inputs: 1,
        outputs: 2,
        defaultName: '决策节点',
        icon: 'bi-shuffle',
        description: '基于条件执行不同分支',
        configFields: [
            { name: 'condition', label: '条件表达式', type: 'textarea', default: '' },
            { name: 'trueLabel', label: '成功分支标签', type: 'input', default: '是' },
            { name: 'falseLabel', label: '失败分支标签', type: 'input', default: '否' }
        ]
    },
    'output': {
        color: '#e74c3c',
        inputs: 1,
        outputs: 0,
        defaultName: '输出节点',
        icon: 'bi-box-arrow-up',
        description: '流程的终止节点，产生输出结果',
        configFields: [
            { name: 'outputType', label: '输出类型', type: 'select', options: ['文本', '数字', 'JSON', '文件'], default: '文本' },
            { name: 'format', label: '输出格式', type: 'textarea', default: '' }
        ]
    },
    'api': {
        color: '#9b59b6',
        inputs: 1,
        outputs: 1,
        defaultName: 'API调用节点',
        icon: 'bi-cloud',
        description: '调用外部API服务',
        configFields: [
            { name: 'url', label: 'API URL', type: 'input', default: 'https://' },
            { name: 'method', label: '请求方法', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
            { name: 'headers', label: '请求头', type: 'textarea', default: '{\n  "Content-Type": "application/json"\n}' },
            { name: 'body', label: '请求体', type: 'textarea', default: '' }
        ]
    },
    'llm': {
        color: '#1abc9c',
        inputs: 1,
        outputs: 1,
        defaultName: 'LLM节点',
        icon: 'bi-cpu',
        description: '调用大语言模型进行文本处理',
        configFields: [
            { name: 'model', label: '模型', type: 'select', options: ['deepseek-chat', 'gpt-3.5-turbo', 'gpt-4'], default: 'deepseek-chat' },
            { name: 'system', label: '系统提示', type: 'textarea', default: '你是一个有帮助的助手' },
            { name: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 2, step: 0.1, default: 0.7 }
        ]
    }
};

export const FlowNodes = {
    // 节点拖动状态
    dragState: {
        isDragging: false,
        startX: 0,
        startY: 0
    },
    
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
        const container = document.createElement('div');
        container.id = 'nodesContainer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.transformOrigin = '0 0';
        FlowCore.state.canvas.appendChild(container);
        return container;
    },
    
    /**
     * 创建新节点
     */
    createNode(nodeType) {
        const nodeConfig = nodeTypes[nodeType];
        const nodeId = FlowCore.state.nextNodeId++;
        const nodeName = `${nodeConfig.defaultName} ${nodeId}`;
        
        // 创建节点DOM元素
        const node = document.createElement('div');
        node.className = 'node';
        node.setAttribute('data-node-id', nodeId);
        node.setAttribute('data-node-type', nodeType);
        
        // 设置初始位置
        node.style.left = '50px';
        node.style.top = '50px';
        
        // 设置节点边框颜色
        node.style.borderColor = nodeConfig.color;
        
        // 创建节点内容
        node.innerHTML = `
            <div class="node-header" style="background-color: ${nodeConfig.color}">
                <i class="bi ${nodeConfig.icon}"></i>
                <span class="node-title">${nodeName}</span>
                <div class="node-controls">
                    <i class="bi bi-pencil edit-node"></i>
                </div>
            </div>
            <div class="node-body">
                <div class="node-type">${nodeType}</div>
                <div class="node-description">${nodeConfig.description}</div>
            </div>
        `;
        
        // 添加输入连接点
        for (let i = 0; i < nodeConfig.inputs; i++) {
            const input = document.createElement('div');
            input.className = 'node-handle handle-input';
            input.setAttribute('data-handle-type', 'input');
            input.setAttribute('data-handle-index', i);
            input.style.top = `${30 + (i * 20)}px`;
            node.appendChild(input);
            
            // 设置连接点事件
            FlowConnections.setupHandleEvents(input);
        }
        
        // 添加输出连接点
        for (let i = 0; i < nodeConfig.outputs; i++) {
            const output = document.createElement('div');
            output.className = 'node-handle handle-output';
            output.setAttribute('data-handle-type', 'output');
            output.setAttribute('data-handle-index', i);
            output.style.top = `${30 + (i * 20)}px`;
            node.appendChild(output);
            
            // 设置连接点事件
            FlowConnections.setupHandleEvents(output);
        }
        
        // 设置节点选择事件
        node.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('node-handle')) {
                this.selectNode(node);
                
                // 设置拖拽状态
                FlowCore.state.draggedNode = node;
                
                // 计算拖拽偏移
                const rect = node.getBoundingClientRect();
                FlowCore.state.dragOffset.x = e.clientX - rect.left;
                FlowCore.state.dragOffset.y = e.clientY - rect.top;
                
                // 阻止事件冒泡
                e.stopPropagation();
            }
        });
        
        // 节点编辑按钮事件
        const editBtn = node.querySelector('.edit-node');
        editBtn.addEventListener('click', (e) => {
            this.selectNode(node);
            this.showNodeEditDialog(node);
            e.stopPropagation();
        });
        
        // 将节点添加到画布
        const nodesContainer = document.getElementById('nodesContainer') || this.createNodesContainer();
        nodesContainer.appendChild(node);
        
        // 将节点数据添加到状态中
        FlowCore.state.nodes.push({
            id: nodeId,
            type: nodeType,
            name: nodeName,
            position: { x: 50, y: 50 },
            data: {},
            inputs: nodeConfig.inputs,
            outputs: nodeConfig.outputs
        });
        
        // 更新节点计数
        this.updateNodeCount();
        
        return node;
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
     * 更新节点元素
     */
    updateNodeElement(nodeData) {
        const nodeElement = document.querySelector(`.node[data-node-id="${nodeData.id}"]`);
        if (nodeElement) {
            nodeElement.querySelector('.node-title').textContent = nodeData.name;
        }
    },
    
    /**
     * 更新属性面板
     */
    updatePropertiesPanel() {
        const propertiesPanel = document.getElementById('propertiesPanel');
        
        // 清空面板
        propertiesPanel.innerHTML = '';
        
        if (FlowCore.state.selectedNode) {
            // 显示节点属性
            const nodeId = parseInt(FlowCore.state.selectedNode.getAttribute('data-node-id'));
            const nodeType = FlowCore.state.selectedNode.getAttribute('data-node-type');
            const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
            
            if (nodeData) {
                // 创建节点属性表单
                const form = document.createElement('form');
                
                // 节点名称
                const nameGroup = document.createElement('div');
                nameGroup.className = 'mb-3';
                nameGroup.innerHTML = `
                    <label for="nodeName" class="form-label">节点名称</label>
                    <input type="text" class="form-control" id="nodeName" value="${nodeData.name}">
                `;
                form.appendChild(nameGroup);
                
                // 节点类型 (只读)
                const typeGroup = document.createElement('div');
                typeGroup.className = 'mb-3';
                typeGroup.innerHTML = `
                    <label class="form-label">节点类型</label>
                    <input type="text" class="form-control" value="${nodeType}" readonly>
                `;
                form.appendChild(typeGroup);
                
                // 节点描述
                const descriptionGroup = document.createElement('div');
                descriptionGroup.className = 'mb-3';
                descriptionGroup.innerHTML = `
                    <label for="nodeDescription" class="form-label">节点描述</label>
                    <textarea class="form-control" id="nodeDescription">${nodeData.description || ''}</textarea>
                `;
                form.appendChild(descriptionGroup);
                
                // 保存按钮
                const saveButton = document.createElement('button');
                saveButton.type = 'button';
                saveButton.className = 'btn btn-primary';
                saveButton.textContent = '保存';
                saveButton.addEventListener('click', () => {
                    nodeData.name = form.querySelector('#nodeName').value;
                    nodeData.description = form.querySelector('#nodeDescription').value;
                    this.updateNodeElement(nodeData);
                });
                form.appendChild(saveButton);
                
                propertiesPanel.appendChild(form);
            }
        } else if (FlowCore.state.selectedConnection) {
            // 显示连接属性
            const connectionId = FlowCore.state.selectedConnection.id;
            const connectionData = FlowCore.state.connections.find(conn => conn.id === connectionId);
            
            if (connectionData) {
                // 创建连接属性表单
                const form = document.createElement('form');
                
                // 起始节点
                const fromNode = FlowCore.state.nodes.find(n => n.id === connectionData.fromNodeId);
                const fromNodeGroup = document.createElement('div');
                fromNodeGroup.className = 'mb-3';
                fromNodeGroup.innerHTML = `
                    <label class="form-label">起始节点</label>
                    <input type="text" class="form-control" value="${fromNode.name}" readonly>
                `;
                form.appendChild(fromNodeGroup);
                
                // 目标节点
                const toNode = FlowCore.state.nodes.find(n => n.id === connectionData.toNodeId);
                const toNodeGroup = document.createElement('div');
                toNodeGroup.className = 'mb-3';
                toNodeGroup.innerHTML = `
                    <label class="form-label">目标节点</label>
                    <input type="text" class="form-control" value="${toNode.name}" readonly>
                `;
                form.appendChild(toNodeGroup);
                
                // 删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = 'btn btn-danger';
                deleteButton.textContent = '删除';
                deleteButton.addEventListener('click', () => {
                    FlowConnections.removeConnection(connectionId);
                });
                form.appendChild(deleteButton);
                
                propertiesPanel.appendChild(form);
            }
        }
    },
    
    /**
     * 删除选中节点
     */
    deleteSelected() {
        if (FlowCore.state.selectedNode) {
            const nodeId = parseInt(FlowCore.state.selectedNode.getAttribute('data-node-id'));
            FlowCore.state.nodes = FlowCore.state.nodes.filter(n => n.id !== nodeId);
            FlowCore.state.connections = FlowCore.state.connections.filter(conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId);
            FlowCore.state.selectedNode.remove();
            FlowCore.state.selectedNode = null;
            this.updateNodeCount();
            FlowConnections.updateConnectionCount();
            this.updatePropertiesPanel();
        }
    },
    
    /**
     * 复制选中节点
     */
    duplicateSelected() {
        if (FlowCore.state.selectedNode) {
            const nodeId = parseInt(FlowCore.state.selectedNode.getAttribute('data-node-id'));
            const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
            if (nodeData) {
                const newNode = this.createNode(nodeData.type);
                newNode.style.left = `${parseInt(FlowCore.state.selectedNode.style.left) + 20}px`;
                newNode.style.top = `${parseInt(FlowCore.state.selectedNode.style.top) + 20}px`;
                newNode.querySelector('.node-title').textContent = `${nodeData.name} (复制)`;
                
                const newNodeData = FlowCore.state.nodes.find(n => n.id === parseInt(newNode.getAttribute('data-node-id')));
                if (newNodeData) {
                    newNodeData.position = {
                        x: parseInt(newNode.style.left),
                        y: parseInt(newNode.style.top)
                    };
                    newNodeData.name = `${nodeData.name} (复制)`;
                    newNodeData.data = { ...nodeData.data };
                }
                
                this.updateNodeCount();
                this.updatePropertiesPanel();
            }
        }
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
     * 显示节点编辑对话框
     */
    showNodeEditDialog(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeType = node.getAttribute('data-node-type');
        const nodeData = FlowCore.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        // 获取该节点类型的配置字段
        const nodeConfig = nodeTypes[nodeType];
        
        // 设置模态框标题
        document.getElementById('nodeEditModalLabel').textContent = `编辑 ${nodeData.name}`;
        
        // 填充通用字段
        document.getElementById('editNodeName').value = nodeData.name;
        document.getElementById('editNodeDescription').value = nodeData.description || '';
        
        // 填充特定类型的字段
        const typeSpecificFields = document.getElementById('nodeTypeSpecificFields');
        typeSpecificFields.innerHTML = '';
        
        if (nodeConfig && nodeConfig.configFields) {
            nodeConfig.configFields.forEach(field => {
                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'mb-3';
                
                // 获取字段当前值，如果没有则使用默认值
                const fieldValue = nodeData.data && nodeData.data[field.name] !== undefined 
                    ? nodeData.data[field.name] 
                    : field.default;
                
                switch (field.type) {
                    case 'input':
                        fieldGroup.innerHTML = `
                            <label for="field_${field.name}" class="form-label">${field.label}</label>
                            <input type="text" class="form-control" id="field_${field.name}" name="${field.name}" value="${fieldValue}">
                        `;
                        break;
                    
                    case 'textarea':
                        fieldGroup.innerHTML = `
                            <label for="field_${field.name}" class="form-label">${field.label}</label>
                            <textarea class="form-control" id="field_${field.name}" name="${field.name}" rows="3">${fieldValue}</textarea>
                        `;
                        break;
                    
                    case 'select':
                        const options = field.options.map(option => {
                            const selected = option === fieldValue ? 'selected' : '';
                            return `<option value="${option}" ${selected}>${option}</option>`;
                        }).join('');
                        
                        fieldGroup.innerHTML = `
                            <label for="field_${field.name}" class="form-label">${field.label}</label>
                            <select class="form-select" id="field_${field.name}" name="${field.name}">
                                ${options}
                            </select>
                        `;
                        break;
                    
                    case 'range':
                        fieldGroup.innerHTML = `
                            <label for="field_${field.name}" class="form-label">${field.label}</label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range" id="field_${field.name}" name="${field.name}" 
                                min="${field.min || 0}" max="${field.max || 1}" step="${field.step || 0.1}" value="${fieldValue}">
                                <span class="ms-2" id="value_${field.name}">${fieldValue}</span>
                            </div>
                        `;
                        
                        // 添加实时显示值的事件
                        setTimeout(() => {
                            const rangeInput = document.getElementById(`field_${field.name}`);
                            const valueDisplay = document.getElementById(`value_${field.name}`);
                            if (rangeInput && valueDisplay) {
                                rangeInput.addEventListener('input', () => {
                                    valueDisplay.textContent = rangeInput.value;
                                });
                            }
                        }, 100);
                        break;
                }
                
                typeSpecificFields.appendChild(fieldGroup);
            });
        }
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('nodeEditModal'));
        modal.show();
        
        // 设置保存按钮事件
        document.getElementById('confirmNodeEdit').onclick = () => {
            // 更新节点名称和描述
            nodeData.name = document.getElementById('editNodeName').value;
            nodeData.description = document.getElementById('editNodeDescription').value;
            
            // 更新节点特定字段
            if (!nodeData.data) nodeData.data = {};
            
            if (nodeConfig && nodeConfig.configFields) {
                nodeConfig.configFields.forEach(field => {
                    const fieldElement = document.getElementById(`field_${field.name}`);
                    if (fieldElement) {
                        // 根据字段类型获取值
                        let value;
                        switch (field.type) {
                            case 'input':
                            case 'textarea':
                            case 'select':
                                value = fieldElement.value;
                                break;
                                
                            case 'range':
                                value = parseFloat(fieldElement.value);
                                break;
                        }
                        
                        nodeData.data[field.name] = value;
                    }
                });
            }
            
            // 更新节点DOM元素
            this.updateNodeElement(nodeData);
            
            // 隐藏模态框
            modal.hide();
        };
    }
};
