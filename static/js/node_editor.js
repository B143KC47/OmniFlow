/**
 * OmniFlow节点编辑器主文件
 * 处理流程图的创建、编辑、保存和执行
 */

// 全局变量
const FlowEditor = {
    // 编辑器状态
    state: {
        nodes: [],
        connections: [],
        nextNodeId: 1,
        selectedNode: null,
        selectedConnection: null,
        draggedNode: null,
        dragOffset: { x: 0, y: 0 },
        canvas: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        connectingFrom: null,
        connectingTo: null,
        flowName: '',
        flowId: null,
        isExecuting: false,
        miniMapEnabled: true,
        undoStack: [],
        redoStack: []
    },
    
    // 节点类型配置
    nodeTypes: {
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
    },
    
    /**
     * 初始化流程编辑器
     */
    init() {
        console.log('初始化流程编辑器');
        
        // 获取DOM元素
        this.state.canvas = document.getElementById('flowCanvas');
        const nodePalette = document.querySelectorAll('.node-template');
        
        // 设置流程画布事件
        this.setupCanvasEvents();
        
        // 设置节点模板拖拽
        nodePalette.forEach(template => {
            this.setupNodeTemplate(template);
        });
        
        // 设置工具栏事件
        this.setupToolbarEvents();
        
        // 设置缩放事件
        this.setupZoomEvents();
        
        // 创建节点容器
        this.createNodesContainer();
        
        // 创建连接线SVG层
        this.createConnectionsLayer();
        
        // 创建临时连接线
        this.createTempConnectionLine();
        
        // 初始化迷你地图
        this.initMiniMap();
        
        // 设置快捷键
        this.setupKeyboardShortcuts();
        
        // 初始化模态框事件
        this.initModalEvents();
        
        console.log('流程编辑器初始化完成');
    },
    
    /**
     * 设置流程画布事件
     */
    setupCanvasEvents() {
        const canvas = this.state.canvas;
        
        // 画布点击事件 - 取消选择
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                this.deselectAll();
                this.updatePropertiesPanel();
            }
        });
        
        // 画布鼠标移动事件 - 拖拽节点和创建连接
        canvas.addEventListener('mousemove', (e) => {
            // 处理节点拖拽
            if (this.state.draggedNode) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - this.state.dragOffset.x) / this.state.scale;
                const y = (e.clientY - rect.top - this.state.dragOffset.y) / this.state.scale;
                
                this.state.draggedNode.style.left = `${x}px`;
                this.state.draggedNode.style.top = `${y}px`;
                
                // 更新节点的所有连接
                this.updateNodeConnections(this.state.draggedNode);
            }
            
            // 处理连接创建
            if (this.state.connectingFrom) {
                const rect = canvas.getBoundingClientRect();
                const tempLine = document.getElementById('tempConnectionLine');
                const fromHandle = this.state.connectingFrom;
                const fromRect = fromHandle.getBoundingClientRect();
                
                const fromX = (fromRect.left + fromRect.width / 2 - rect.left) / this.state.scale;
                const fromY = (fromRect.top + fromRect.height / 2 - rect.top) / this.state.scale;
                const toX = (e.clientX - rect.left) / this.state.scale;
                const toY = (e.clientY - rect.top) / this.state.scale;
                
                // 使用贝塞尔曲线绘制连接
                tempLine.setAttribute('d', this.createConnectionPath(fromX, fromY, toX, toY));
                tempLine.style.display = 'block';
            }
        });
        
        // 画布鼠标抬起事件 - 完成连接创建
        canvas.addEventListener('mouseup', (e) => {
            if (this.state.connectingFrom && this.state.connectingTo) {
                this.createConnection(this.state.connectingFrom, this.state.connectingTo);
            }
            
            // 重置连接状态
            this.state.connectingFrom = null;
            this.state.connectingTo = null;
            document.getElementById('tempConnectionLine').style.display = 'none';
        });
    },
    
    /**
     * 设置节点模板拖拽
     */
    setupNodeTemplate(template) {
        template.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const nodeType = template.getAttribute('data-node-type');
            
            // 创建新节点
            const node = this.createNode(nodeType);
            
            // 设置拖拽状态
            this.state.draggedNode = node;
            
            // 计算拖拽偏移
            const rect = node.getBoundingClientRect();
            this.state.dragOffset.x = e.clientX - rect.left;
            this.state.dragOffset.y = e.clientY - rect.top;
            
            // 添加鼠标移动和抬起事件监听
            document.addEventListener('mousemove', this.handleNodeDragMove);
            document.addEventListener('mouseup', this.handleNodeDragEnd);
        });
    },
    
    /**
     * 处理节点拖动移动
     */
    handleNodeDragMove: function(e) {
        if (FlowEditor.state.draggedNode) {
            const canvas = FlowEditor.state.canvas;
            const rect = canvas.getBoundingClientRect();
            
            // 计算新位置，考虑缩放和偏移
            const x = (e.clientX - rect.left - FlowEditor.state.dragOffset.x) / FlowEditor.state.scale;
            const y = (e.clientY - rect.top - FlowEditor.state.dragOffset.y) / FlowEditor.state.scale;
            
            // 限制在画布内
            const nodeWidth = FlowEditor.state.draggedNode.offsetWidth;
            const nodeHeight = FlowEditor.state.draggedNode.offsetHeight;
            const maxX = canvas.offsetWidth / FlowEditor.state.scale - nodeWidth;
            const maxY = canvas.offsetHeight / FlowEditor.state.scale - nodeHeight;
            
            const boundedX = Math.max(0, Math.min(x, maxX));
            const boundedY = Math.max(0, Math.min(y, maxY));
            
            FlowEditor.state.draggedNode.style.left = `${boundedX}px`;
            FlowEditor.state.draggedNode.style.top = `${boundedY}px`;
            
            // 更新连接线
            FlowEditor.updateNodeConnections(FlowEditor.state.draggedNode);
        }
    },
    
    /**
     * 处理节点拖动结束
     */
    handleNodeDragEnd: function(e) {
        if (FlowEditor.state.draggedNode) {
            // 保存节点位置
            const node = FlowEditor.state.draggedNode;
            const nodeId = node.getAttribute('data-node-id');
            const nodeData = FlowEditor.state.nodes.find(n => n.id === parseInt(nodeId));
            
            if (nodeData) {
                nodeData.position = {
                    x: parseInt(node.style.left),
                    y: parseInt(node.style.top)
                };
            }
            
            // 重置拖拽状态
            FlowEditor.state.draggedNode = null;
            
            // 移除事件监听
            document.removeEventListener('mousemove', FlowEditor.handleNodeDragMove);
            document.removeEventListener('mouseup', FlowEditor.handleNodeDragEnd);
            
            // 更新节点计数
            FlowEditor.updateNodeCount();
        }
    },
    
    /**
     * 设置工具栏事件
     */
    setupToolbarEvents() {
        // 新建流程
        document.getElementById('newFlow').addEventListener('click', () => {
            if (confirm('确定要创建新流程吗？当前未保存的内容将丢失。')) {
                this.clearFlow();
            }
        });
        
        // 保存流程
        document.getElementById('saveFlow').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('saveFlowModal'));
            // 将当前流程名填入模态框
            document.getElementById('saveFlowName').value = document.getElementById('flowName').value;
            modal.show();
        });
        
        // 确认保存
        document.getElementById('confirmSave').addEventListener('click', () => {
            this.saveFlow();
        });
        
        // 加载流程
        document.getElementById('loadFlow').addEventListener('click', () => {
            this.showLoadFlowDialog();
        });
        
        // 删除选中节点
        document.getElementById('deleteSelected').addEventListener('click', () => {
            this.deleteSelected();
        });
        
        // 复制选中节点
        document.getElementById('duplicateSelected').addEventListener('click', () => {
            this.duplicateSelected();
        });
        
        // 执行流程
        document.getElementById('executeFlow').addEventListener('click', () => {
            this.executeFlow();
        });
        
        // 流程名称更改
        document.getElementById('flowName').addEventListener('change', (e) => {
            this.state.flowName = e.target.value;
        });
    },
    
    /**
     * 设置缩放事件
     */
    setupZoomEvents() {
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoom(0.1);
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoom(-0.1);
        });
        
        document.getElementById('resetView').addEventListener('click', () => {
            this.resetView();
        });
        
        // 鼠标滚轮缩放
        this.state.canvas.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                this.zoom(delta);
            }
        });
    },
    
    /**
     * 缩放流程图
     */
    zoom(delta) {
        const newScale = Math.max(0.5, Math.min(2, this.state.scale + delta));
        this.state.scale = newScale;
        
        this.applyTransform();
    },
    
    /**
     * 重置视图
     */
    resetView() {
        this.state.scale = 1;
        this.state.offsetX = 0;
        this.state.offsetY = 0;
        
        this.applyTransform();
    },
    
    /**
     * 应用变换
     */
    applyTransform() {
        const nodesContainer = document.getElementById('nodesContainer');
        const connectionsContainer = document.getElementById('connectionsContainer');
        
        nodesContainer.style.transform = `scale(${this.state.scale}) translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
        connectionsContainer.style.transform = `scale(${this.state.scale}) translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
    },
    
    /**
     * 创建新节点
     */
    createNode(nodeType) {
        const nodeConfig = this.nodeTypes[nodeType];
        const nodeId = this.state.nextNodeId++;
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
            this.setupHandleEvents(input);
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
            this.setupHandleEvents(output);
        }
        
        // 设置节点选择事件
        node.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('node-handle')) {
                this.selectNode(node);
                
                // 设置拖拽状态
                this.state.draggedNode = node;
                
                // 计算拖拽偏移
                const rect = node.getBoundingClientRect();
                this.state.dragOffset.x = e.clientX - rect.left;
                this.state.dragOffset.y = e.clientY - rect.top;
                
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
        this.state.nodes.push({
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
     * 创建节点容器
     */
    createNodesContainer() {
        const container = document.createElement('div');
        container.id = 'nodesContainer';
        container.style.position = 'absolute';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.transformOrigin = '0 0';
        this.state.canvas.appendChild(container);
        return container;
    },
    
    /**
     * 创建连接线SVG层
     */
    createConnectionsLayer() {
        // 创建SVG容器
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'connectionsContainer';
        svg.style.position = 'absolute';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.transformOrigin = '0 0';
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        
        // 添加到画布
        this.state.canvas.appendChild(svg);
    },
    
    /**
     * 创建临时连接线
     */
    createTempConnectionLine() {
        const svg = document.getElementById('connectionsContainer');
        const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempPath.id = 'tempConnectionLine';
        tempPath.setAttribute('stroke', '#3498db');
        tempPath.setAttribute('stroke-width', '2');
        tempPath.setAttribute('fill', 'none');
        tempPath.style.display = 'none';
        svg.appendChild(tempPath);
    },
    
    /**
     * 设置连接点事件
     */
    setupHandleEvents(handle) {
        // 鼠标按下 - 开始连接
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            
            // 如果是输出连接点，开始创建连接
            if (handle.getAttribute('data-handle-type') === 'output') {
                this.state.connectingFrom = handle;
            }
        });
        
        // 鼠标进入 - 准备接收连接
        handle.addEventListener('mouseenter', () => {
            // 如果正在创建连接且当前是输入连接点，设置目标
            if (this.state.connectingFrom && handle.getAttribute('data-handle-type') === 'input') {
                // 确保不是同一个节点
                const fromNode = this.state.connectingFrom.closest('.node');
                const toNode = handle.closest('.node');
                
                if (fromNode !== toNode) {
                    handle.classList.add('handle-highlight');
                    this.state.connectingTo = handle;
                }
            }
        });
        
        // 鼠标离开 - 取消目标
        handle.addEventListener('mouseleave', () => {
            handle.classList.remove('handle-highlight');
            if (this.state.connectingTo === handle) {
                this.state.connectingTo = null;
            }
        });
        
        // 鼠标抬起 - 完成连接
        handle.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            
            if (this.state.connectingFrom && handle.getAttribute('data-handle-type') === 'input') {
                // 确保不是同一个节点
                const fromNode = this.state.connectingFrom.closest('.node');
                const toNode = handle.closest('.node');
                
                if (fromNode !== toNode) {
                    this.createConnection(this.state.connectingFrom, handle);
                }
            }
            
            // 重置连接状态
            this.state.connectingFrom = null;
            this.state.connectingTo = null;
            document.getElementById('tempConnectionLine').style.display = 'none';
        });
    },
    
    /**
     * 创建连接路径
     */
    createConnectionPath(fromX, fromY, toX, toY) {
        const dx = Math.abs(toX - fromX);
        const controlPointX = dx / 2;
        
        return `M ${fromX} ${fromY} C ${fromX + controlPointX} ${fromY}, ${toX - controlPointX} ${toY}, ${toX} ${toY}`;
    },
    
    /**
     * 创建节点间连接
     */
    createConnection(fromHandle, toHandle) {
        // 获取连接点信息
        const fromNode = fromHandle.closest('.node');
        const toNode = toHandle.closest('.node');
        const fromNodeId = parseInt(fromNode.getAttribute('data-node-id'));
        const toNodeId = parseInt(toNode.getAttribute('data-node-id'));
        const fromHandleIndex = parseInt(fromHandle.getAttribute('data-handle-index'));
        const toHandleIndex = parseInt(toHandle.getAttribute('data-handle-index'));
        
        // 检查是否已经有相同的连接
        const existingConnection = this.state.connections.find(conn => {
            return conn.fromNodeId === fromNodeId && 
                   conn.toNodeId === toNodeId && 
                   conn.fromHandleIndex === fromHandleIndex && 
                   conn.toHandleIndex === toHandleIndex;
        });
        
        if (existingConnection) {
            console.log('连接已存在');
            return;
        }
        
        // 检查目标输入是否已经有连接
        const targetHasConnection = this.state.connections.find(conn => {
            return conn.toNodeId === toNodeId && conn.toHandleIndex === toHandleIndex;
        });
        
        if (targetHasConnection) {
            // 如果有，删除旧连接
            this.removeConnection(targetHasConnection.id);
        }
        
        // 创建连接ID
        const connectionId = `conn_${fromNodeId}_${fromHandleIndex}_${toNodeId}_${toHandleIndex}`;
        
        // 计算连接线位置
        const fromRect = fromHandle.getBoundingClientRect();
        const toRect = toHandle.getBoundingClientRect();
        const canvasRect = this.state.canvas.getBoundingClientRect();
        
        const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left) / this.state.scale;
        const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top) / this.state.scale;
        const toX = (toRect.left + toRect.width / 2 - canvasRect.left) / this.state.scale;
        const toY = (toRect.top + toRect.height / 2 - canvasRect.top) / this.state.scale;
        
        // 创建SVG路径
        const svg = document.getElementById('connectionsContainer');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.id = connectionId;
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('data-from-node-id', fromNodeId);
        path.setAttribute('data-to-node-id', toNodeId);
        path.setAttribute('data-from-handle-index', fromHandleIndex);
        path.setAttribute('data-to-handle-index', toHandleIndex);
        path.setAttribute('d', this.createConnectionPath(fromX, fromY, toX, toY));
        
        // 添加事件监听
        path.addEventListener('click', () => {
            this.selectConnection(path);
        });
        
        // 添加到SVG
        svg.appendChild(path);
        
        // 添加连接数据到状态
        this.state.connections.push({
            id: connectionId,
            fromNodeId: fromNodeId,
            toNodeId: toNodeId,
            fromHandleIndex: fromHandleIndex,
            toHandleIndex: toHandleIndex
        });
        
        // 更新连接计数
        this.updateConnectionCount();
    },
    
    /**
     * 更新节点的所有连接
     */
    updateNodeConnections(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        
        // 更新从该节点出发的连接
        this.state.connections.forEach(conn => {
            if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
                const connectionElement = document.getElementById(conn.id);
                if (connectionElement) {
                    // 获取起点和终点
                    let fromNode, toNode;
                    
                    if (conn.fromNodeId === nodeId) {
                        fromNode = node;
                        toNode = document.querySelector(`.node[data-node-id="${conn.toNodeId}"]`);
                    } else {
                        fromNode = document.querySelector(`.node[data-node-id="${conn.fromNodeId}"]`);
                        toNode = node;
                    }
                    
                    if (fromNode && toNode) {
                        const fromHandle = fromNode.querySelector(`.handle-output[data-handle-index="${conn.fromHandleIndex}"]`);
                        const toHandle = toNode.querySelector(`.handle-input[data-handle-index="${conn.toHandleIndex}"]`);
                        
                        if (fromHandle && toHandle) {
                            const canvasRect = this.state.canvas.getBoundingClientRect();
                            const fromRect = fromHandle.getBoundingClientRect();
                            const toRect = toHandle.getBoundingClientRect();
                            
                            const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left) / this.state.scale;
                            const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top) / this.state.scale;
                            const toX = (toRect.left + toRect.width / 2 - canvasRect.left) / this.state.scale;
                            const toY = (toRect.top + toRect.height / 2 - canvasRect.top) / this.state.scale;
                            
                            connectionElement.setAttribute('d', this.createConnectionPath(fromX, fromY, toX, toY));
                        }
                    }
                }
            }
        });
    },
    
    /**
     * 选择节点
     */
    selectNode(node) {
        // 取消之前的选择
        this.deselectAll();
        
        // 设置新选择的节点
        node.classList.add('selected');
        this.state.selectedNode = node;
        
        // 更新属性面板
        this.updatePropertiesPanel();
    },
    
    /**
     * 选择连接
     */
    selectConnection(connection) {
        // 取消之前的选择
        this.deselectAll();
        
        // 设置新选择的连接
        connection.classList.add('selected-connection');
        connection.setAttribute('stroke-width', '3');
        this.state.selectedConnection = connection;
        
        // 更新属性面板
        this.updatePropertiesPanel();
    },
    
    /**
     * 取消所有选择
     */
    deselectAll() {
        // 取消节点选择
        if (this.state.selectedNode) {
            this.state.selectedNode.classList.remove('selected');
            this.state.selectedNode = null;
        }
        
        // 取消连接选择
        if (this.state.selectedConnection) {
            this.state.selectedConnection.classList.remove('selected-connection');
            this.state.selectedConnection.setAttribute('stroke-width', '2');
            this.state.selectedConnection = null;
        }
    },
    
    /**
     * 更新属性面板
     */
    updatePropertiesPanel() {
        const propertiesPanel = document.getElementById('propertiesPanel');
        
        // 清空面板
        propertiesPanel.innerHTML = '';
        
        if (this.state.selectedNode) {
            // 显示节点属性
            const nodeId = parseInt(this.state.selectedNode.getAttribute('data-node-id'));
            const nodeType = this.state.selectedNode.getAttribute('data-node-type');
            const nodeData = this.state.nodes.find(n => n.id === nodeId);
            
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
        } else if (this.state.selectedConnection) {
            // 显示连接属性
            const connectionId = this.state.selectedConnection.id;
            const connectionData = this.state.connections.find(conn => conn.id === connectionId);
            
            if (connectionData) {
                // 创建连接属性表单
                const form = document.createElement('form');
                
                // 起始节点
                const fromNode = this.state.nodes.find(n => n.id === connectionData.fromNodeId);
                const fromNodeGroup = document.createElement('div');
                fromNodeGroup.className = 'mb-3';
                fromNodeGroup.innerHTML = `
                    <label class="form-label">起始节点</label>
                    <input type="text" class="form-control" value="${fromNode.name}" readonly>
                `;
                form.appendChild(fromNodeGroup);
                
                // 目标节点
                const toNode = this.state.nodes.find(n => n.id === connectionData.toNodeId);
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
                    this.removeConnection(connectionId);
                });
                form.appendChild(deleteButton);
                
                propertiesPanel.appendChild(form);
            }
        }
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
     * 删除连接
     */
    removeConnection(connectionId) {
        const connectionIndex = this.state.connections.findIndex(conn => conn.id === connectionId);
        if (connectionIndex !== -1) {
            this.state.connections.splice(connectionIndex, 1);
            const connectionElement = document.getElementById(connectionId);
            if (connectionElement) {
                connectionElement.remove();
            }
            this.updateConnectionCount();
        }
    },
    
    /**
     * 更新节点计数
     */
    updateNodeCount() {
        document.getElementById('nodeCount').textContent = this.state.nodes.length;
    },
    
    /**
     * 更新连接计数
     */
    updateConnectionCount() {
        document.getElementById('connectionCount').textContent = this.state.connections.length;
    },
    
    /**
     * 清空流程
     */
    clearFlow() {
        this.state.nodes = [];
        this.state.connections = [];
        this.state.nextNodeId = 1;
        this.state.selectedNode = null;
        this.state.selectedConnection = null;
        this.state.draggedNode = null;
        this.state.connectingFrom = null;
        this.state.connectingTo = null;
        this.state.flowName = '';
        
        const nodesContainer = document.getElementById('nodesContainer');
        if (nodesContainer) {
            nodesContainer.innerHTML = '';
        }
        
        const connectionsContainer = document.getElementById('connectionsContainer');
        if (connectionsContainer) {
            connectionsContainer.innerHTML = '';
        }
        
        this.updateNodeCount();
        this.updateConnectionCount();
        this.updatePropertiesPanel();
    },
    
    /**
     * 保存流程
     */
    saveFlow() {
        const flowData = {
            name: this.state.flowName,
            nodes: this.state.nodes,
            connections: this.state.connections
        };
        
        fetch('/api/save-flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flowData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('流程保存成功');
            } else {
                alert('保存失败：' + data.message);
            }
        })
        .catch(error => {
            console.error('保存出错：', error);
            alert('保存出错，请查看控制台日志');
        });
    },
    
    /**
     * 显示加载流程对话框
     */
    showLoadFlowDialog() {
        const modal = new bootstrap.Modal(document.getElementById('loadFlowModal'));
        modal.show();
    },
    
    /**
     * 加载流程
     */
    loadFlow(flowData) {
        this.clearFlow();
        
        this.state.flowName = flowData.name;
        document.getElementById('flowName').value = flowData.name;
        
        flowData.nodes.forEach(nodeData => {
            const node = this.createNode(nodeData.type);
            node.style.left = `${nodeData.position.x}px`;
            node.style.top = `${nodeData.position.y}px`;
            node.querySelector('.node-title').textContent = nodeData.name;
            
            const nodeState = this.state.nodes.find(n => n.id === nodeData.id);
            if (nodeState) {
                nodeState.position = nodeData.position;
                nodeState.name = nodeData.name;
                nodeState.data = nodeData.data;
            }
        });
        
        flowData.connections.forEach(connData => {
            const fromNode = document.querySelector(`.node[data-node-id="${connData.fromNodeId}"]`);
            const toNode = document.querySelector(`.node[data-node-id="${connData.toNodeId}"]`);
            if (fromNode && toNode) {
                const fromHandle = fromNode.querySelector(`.handle-output[data-handle-index="${connData.fromHandleIndex}"]`);
                const toHandle = toNode.querySelector(`.handle-input[data-handle-index="${connData.toHandleIndex}"]`);
                if (fromHandle && toHandle) {
                    this.createConnection(fromHandle, toHandle);
                }
            }
        });
        
        this.updateNodeCount();
        this.updateConnectionCount();
        this.updatePropertiesPanel();
    },
    
    /**
     * 删除选中节点
     */
    deleteSelected() {
        if (this.state.selectedNode) {
            const nodeId = parseInt(this.state.selectedNode.getAttribute('data-node-id'));
            this.state.nodes = this.state.nodes.filter(n => n.id !== nodeId);
            this.state.connections = this.state.connections.filter(conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId);
            this.state.selectedNode.remove();
            this.state.selectedNode = null;
            this.updateNodeCount();
            this.updateConnectionCount();
            this.updatePropertiesPanel();
        }
    },
    
    /**
     * 复制选中节点
     */
    duplicateSelected() {
        if (this.state.selectedNode) {
            const nodeId = parseInt(this.state.selectedNode.getAttribute('data-node-id'));
            const nodeData = this.state.nodes.find(n => n.id === nodeId);
            if (nodeData) {
                const newNode = this.createNode(nodeData.type);
                newNode.style.left = `${parseInt(this.state.selectedNode.style.left) + 20}px`;
                newNode.style.top = `${parseInt(this.state.selectedNode.style.top) + 20}px`;
                newNode.querySelector('.node-title').textContent = `${nodeData.name} (复制)`;
                
                const newNodeData = this.state.nodes.find(n => n.id === parseInt(newNode.getAttribute('data-node-id')));
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
     * 执行流程
     */
    executeFlow() {
        const flowData = {
            name: this.state.flowName,
            nodes: this.state.nodes,
            connections: this.state.connections
        };
        
        fetch('/api/execute-flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flowData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('流程执行成功');
            } else {
                alert('执行失败：' + data.message);
            }
        })
        .catch(error => {
            console.error('执行出错：', error);
            alert('执行出错，请查看控制台日志');
        });
    },

    /**
     * 初始化模态框事件
     */
    initModalEvents() {
        // 加载流程模态框事件
        document.getElementById('loadFlowModal').addEventListener('show.bs.modal', () => {
            this.loadFlowsList();
        });
        
        // 执行流程模态框事件
        document.getElementById('executeFlowModal').addEventListener('show.bs.modal', () => {
            this.prepareFlowExecution();
        });
        
        // 启动执行按钮
        document.getElementById('startExecution').addEventListener('click', () => {
            this.startFlowExecution();
        });
        
        // 验证流程按钮
        document.getElementById('validateFlow').addEventListener('click', () => {
            this.validateFlow();
        });
        
        // 自适应视图按钮
        document.getElementById('fitContent').addEventListener('click', () => {
            this.fitContent();
        });
    },
    
    /**
     * 初始化迷你地图
     */
    initMiniMap() {
        if (!this.state.miniMapEnabled) return;
        
        const miniMap = document.getElementById('miniMap');
        if (!miniMap) return;
        
        // 创建迷你地图视口
        const viewport = document.createElement('div');
        viewport.className = 'mini-map-viewport';
        miniMap.appendChild(viewport);
        
        // 定时更新迷你地图
        setInterval(() => {
            this.updateMiniMap();
        }, 500);
    },
    
    /**
     * 更新迷你地图
     */
    updateMiniMap() {
        if (!this.state.miniMapEnabled) return;
        
        const miniMap = document.getElementById('miniMap');
        const viewport = miniMap.querySelector('.mini-map-viewport');
        if (!miniMap || !viewport) return;
        
        // 清除旧的节点表示
        const oldNodes = miniMap.querySelectorAll('.mini-map-node');
        oldNodes.forEach(node => node.remove());
        
        // 计算适当的缩放比例
        const canvas = this.state.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const miniMapRect = miniMap.getBoundingClientRect();
        
        const scaleX = miniMapRect.width / canvasRect.width;
        const scaleY = miniMapRect.height / canvasRect.height;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 留一些边距
        
        // 更新视口位置和大小
        const visibleWidth = canvasRect.width / this.state.scale;
        const visibleHeight = canvasRect.height / this.state.scale;
        
        viewport.style.width = `${visibleWidth * scale}px`;
        viewport.style.height = `${visibleHeight * scale}px`;
        viewport.style.left = `${(-this.state.offsetX) * scale}px`;
        viewport.style.top = `${(-this.state.offsetY) * scale}px`;
        
        // 添加节点表示
        this.state.nodes.forEach(nodeData => {
            const node = document.querySelector(`.node[data-node-id="${nodeData.id}"]`);
            if (node) {
                const nodeRect = node.getBoundingClientRect();
                const miniNode = document.createElement('div');
                miniNode.className = 'mini-map-node';
                
                // 计算节点在迷你地图中的位置
                const x = nodeData.position.x * scale;
                const y = nodeData.position.y * scale;
                const width = nodeRect.width * scale;
                const height = nodeRect.height * scale;
                
                miniNode.style.left = `${x}px`;
                miniNode.style.top = `${y}px`;
                miniNode.style.width = `${width}px`;
                miniNode.style.height = `${height}px`;
                
                // 设置节点颜色
                const nodeType = node.getAttribute('data-node-type');
                const nodeConfig = this.nodeTypes[nodeType];
                if (nodeConfig) {
                    miniNode.style.backgroundColor = nodeConfig.color;
                }
                
                miniMap.appendChild(miniNode);
            }
        });
    },
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 如果焦点在输入框中，不处理快捷键
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Delete键 - 删除选中节点或连接
            if (e.key === 'Delete' || e.key === 'Backspace') {
                this.deleteSelected();
                e.preventDefault();
            }
            
            // Ctrl+D - 复制选中节点
            if (e.ctrlKey && e.key === 'd') {
                this.duplicateSelected();
                e.preventDefault();
            }
            
            // Ctrl+S - 保存流程
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const modal = new bootstrap.Modal(document.getElementById('saveFlowModal'));
                document.getElementById('saveFlowName').value = document.getElementById('flowName').value;
                modal.show();
            }
            
            // Ctrl+O - 打开流程
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                this.showLoadFlowDialog();
            }
            
            // Ctrl+N - 新建流程
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                if (confirm('确定要创建新流程吗？当前未保存的内容将丢失。')) {
                    this.clearFlow();
                }
            }
            
            // Ctrl++ 或 Ctrl+= - 放大
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                this.zoom(0.1);
                e.preventDefault();
            }
            
            // Ctrl+- - 缩小
            if (e.ctrlKey && e.key === '-') {
                this.zoom(-0.1);
                e.preventDefault();
            }
            
            // Ctrl+0 - 重置视图
            if (e.ctrlKey && e.key === '0') {
                this.resetView();
                e.preventDefault();
            }
            
            // Ctrl+F - 适应内容
            if (e.ctrlKey && e.key === 'f') {
                this.fitContent();
                e.preventDefault();
            }
            
            // Escape - 取消选择
            if (e.key === 'Escape') {
                this.deselectAll();
                this.updatePropertiesPanel();
            }
        });
    },
    
    /**
     * 适应内容
     */
    fitContent() {
        if (this.state.nodes.length === 0) {
            this.resetView();
            return;
        }
        
        // 找出所有节点的边界
        const boundaries = {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
        
        this.state.nodes.forEach(nodeData => {
            const node = document.querySelector(`.node[data-node-id="${nodeData.id}"]`);
            if (node) {
                const x = nodeData.position.x;
                const y = nodeData.position.y;
                const width = node.offsetWidth;
                const height = node.offsetHeight;
                
                boundaries.minX = Math.min(boundaries.minX, x);
                boundaries.minY = Math.min(boundaries.minY, y);
                boundaries.maxX = Math.max(boundaries.maxX, x + width);
                boundaries.maxY = Math.max(boundaries.maxY, y + height);
            }
        });
        
        // 计算边界宽度和高度
        const contentWidth = boundaries.maxX - boundaries.minX + 100; // 添加一些边距
        const contentHeight = boundaries.maxY - boundaries.minY + 100;
        
        // 计算画布尺寸
        const canvas = this.state.canvas;
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;
        
        // 计算缩放比例
        const scaleX = canvasWidth / contentWidth;
        const scaleY = canvasHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1); // 不超过1的缩放
        
        // 计算偏移量，使内容居中
        const offsetX = (canvasWidth / scale - contentWidth) / 2 - boundaries.minX + 50;
        const offsetY = (canvasHeight / scale - contentHeight) / 2 - boundaries.minY + 50;
        
        // 应用变换
        this.state.scale = scale;
        this.state.offsetX = offsetX;
        this.state.offsetY = offsetY;
        this.applyTransform();
        
        // 更新迷你地图
        this.updateMiniMap();
    },
    
    /**
     * 加载流程列表
     */
    loadFlowsList() {
        const flowsList = document.getElementById('flowsList');
        flowsList.innerHTML = '<tr><td colspan="5" class="text-center">正在加载流程列表...</td></tr>';
        
        fetch('/api/list-flows')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && Array.isArray(data.flows)) {
                    if (data.flows.length === 0) {
                        flowsList.innerHTML = '<tr><td colspan="5" class="text-center">没有找到已保存的流程</td></tr>';
                        return;
                    }
                    
                    // 按创建时间排序，最新的在前面
                    data.flows.sort((a, b) => new Date(b.created) - new Date(a.created));
                    
                    flowsList.innerHTML = '';
                    data.flows.forEach(flow => {
                        const createdDate = new Date(flow.created);
                        const formattedDate = createdDate.toLocaleString();
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${flow.name}</td>
                            <td>${formattedDate}</td>
                            <td>${flow.nodeCount}</td>
                            <td>${flow.connectionCount}</td>
                            <td>
                                <button class="btn btn-sm btn-primary load-flow-btn" data-filename="${flow.filename}">
                                    <i class="bi bi-folder-open"></i> 加载
                                </button>
                            </td>
                        `;
                        flowsList.appendChild(row);
                    });
                    
                    // 添加加载流程按钮事件
                    document.querySelectorAll('.load-flow-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const filename = btn.getAttribute('data-filename');
                            this.loadFlowFromFile(filename);
                            
                            // 关闭模态框
                            const modal = bootstrap.Modal.getInstance(document.getElementById('loadFlowModal'));
                            modal.hide();
                        });
                    });
                } else {
                    flowsList.innerHTML = `<tr><td colspan="5" class="text-center text-danger">加载失败: ${data.message || '未知错误'}</td></tr>`;
                }
            })
            .catch(error => {
                console.error('加载流程列表出错:', error);
                flowsList.innerHTML = `<tr><td colspan="5" class="text-center text-danger">加载出错: ${error.message}</td></tr>`;
            });
    },
    
    /**
     * 从文件加载流程
     */
    loadFlowFromFile(filename) {
        fetch(`/api/load-flow?filename=${encodeURIComponent(filename)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.loadFlow(data.flow);
                    alert('流程加载成功');
                } else {
                    alert('加载失败: ' + data.message);
                }
            })
            .catch(error => {
                console.error('加载流程出错:', error);
                alert('加载出错，请查看控制台日志');
            });
    },
    
    /**
     * 显示节点编辑对话框
     */
    showNodeEditDialog(node) {
        const nodeId = parseInt(node.getAttribute('data-node-id'));
        const nodeType = node.getAttribute('data-node-type');
        const nodeData = this.state.nodes.find(n => n.id === nodeId);
        
        if (!nodeData) return;
        
        // 获取该节点类型的配置字段
        const nodeConfig = this.nodeTypes[nodeType];
        
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
    },
    
    /**
     * 准备流程执行
     */
    prepareFlowExecution() {
        // 找到所有输入节点
        const inputNodes = this.state.nodes.filter(node => node.type === 'input');
        
        // 准备输入表单
        const inputFields = document.getElementById('flowInputFields');
        inputFields.innerHTML = '';
        
        if (inputNodes.length === 0) {
            inputFields.innerHTML = '<div class="alert alert-info">该流程没有输入节点</div>';
        } else {
            inputNodes.forEach(node => {
                const nodeData = node.data || {};
                const inputType = nodeData.inputType || '文本';
                
                const fieldGroup = document.createElement('div');
                fieldGroup.className = 'mb-3';
                
                switch (inputType) {
                    case '文本':
                        fieldGroup.innerHTML = `
                            <label for="input_${node.id}" class="form-label">${node.name}</label>
                            <input type="text" class="form-control" id="input_${node.id}" 
                                placeholder="请输入${node.name}" value="${nodeData.defaultValue || ''}">
                        `;
                        break;
                        
                    case '数字':
                        fieldGroup.innerHTML = `
                            <label for="input_${node.id}" class="form-label">${node.name}</label>
                            <input type="number" class="form-control" id="input_${node.id}" 
                                placeholder="请输入数字" value="${nodeData.defaultValue || 0}">
                        `;
                        break;
                        
                    case '布尔':
                        fieldGroup.innerHTML = `
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="input_${node.id}" 
                                    ${nodeData.defaultValue === 'true' ? 'checked' : ''}>
                                <label class="form-check-label" for="input_${node.id}">
                                    ${node.name}
                                </label>
                            </div>
                        `;
                        break;
                        
                    case 'JSON':
                        fieldGroup.innerHTML = `
                            <label for="input_${node.id}" class="form-label">${node.name} (JSON)</label>
                            <textarea class="form-control" id="input_${node.id}" rows="4" 
                                placeholder="请输入有效的JSON">${nodeData.defaultValue || ''}</textarea>
                        `;
                        break;
                }
                
                inputFields.appendChild(fieldGroup);
            });
        }
        
        // 重置执行结果区域
        document.getElementById('flowExecutionResult').innerHTML = 
            '<div class="text-center text-muted">请点击"执行"按钮运行流程</div>';
        
        // 隐藏进度条
        document.getElementById('executionProgress').classList.add('d-none');
    },
    
    /**
     * 开始流程执行
     */
    startFlowExecution() {
        if (this.state.isExecuting) return;
        this.state.isExecuting = true;
        
        // 显示进度条
        const progressBar = document.getElementById('executionProgress');
        progressBar.classList.remove('d-none');
        progressBar.querySelector('.progress-bar').style.width = '0%';
        
        // 收集输入数据
        const inputData = {};
        const inputNodes = this.state.nodes.filter(node => node.type === 'input');
        
        inputNodes.forEach(node => {
            const inputElement = document.getElementById(`input_${node.id}`);
            if (inputElement) {
                let value;
                
                if (inputElement.type === 'checkbox') {
                    value = inputElement.checked;
                } else if (node.data?.inputType === 'JSON') {
                    try {
                        value = JSON.parse(inputElement.value);
                    } catch (e) {
                        value = inputElement.value; // 如果解析失败，保留原始文本
                    }
                } else if (node.data?.inputType === '数字') {
                    value = parseFloat(inputElement.value) || 0;
                } else {
                    value = inputElement.value;
                }
                
                inputData[node.id] = {
                    name: node.name,
                    value: value
                };
            }
        });
        
        // 准备流程数据
        const flowData = {
            flowId: this.state.flowId,
            name: this.state.flowName,
            nodes: this.state.nodes,
            connections: this.state.connections,
            input: inputData
        };
        
        // 更新进度动画
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 90) clearInterval(progressInterval);
            progressBar.querySelector('.progress-bar').style.width = `${progress}%`;
        }, 100);
        
        // 发送执行请求
        fetch('/api/execute-flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flowData)
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            progressBar.querySelector('.progress-bar').style.width = '100%';
            
            setTimeout(() => {
                progressBar.classList.add('d-none');
                this.state.isExecuting = false;
                
                if (data.status === 'success') {
                    this.displayExecutionResult(data);
                } else {
                    document.getElementById('flowExecutionResult').innerHTML = `
                        <div class="alert alert-danger">
                            <h5>执行失败</h5>
                            <p>${data.message || '未知错误'}</p>
                        </div>
                    `;
                }
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            progressBar.classList.add('d-none');
            this.state.isExecuting = false;
            
            console.error('执行流程出错:', error);
            document.getElementById('flowExecutionResult').innerHTML = `
                <div class="alert alert-danger">
                    <h5>执行出错</h5>
                    <p>${error.message || '网络错误或服务器异常'}</p>
                </div>
            `;
        });
    },
    
    /**
     * 显示执行结果
     */
    displayExecutionResult(data) {
        const resultContainer = document.getElementById('flowExecutionResult');
        
        let resultContent = `
            <div class="alert alert-success">
                <h5>执行成功</h5>
                <p>执行时间: ${data.executionTime || 'N/A'}</p>
                <p>经过节点: ${data.nodesPassed || 0} 个</p>
            </div>
        `;
        
        if (data.result) {
            let outputContent = '';
            
            if (typeof data.result === 'object') {
                if (data.result.message) {
                    outputContent += `<p>${data.result.message}</p>`;
                }
                
                if (data.result.output) {
                    const output = data.result.output;
                    if (typeof output === 'object') {
                        outputContent += `<pre class="bg-light p-2 border">${JSON.stringify(output, null, 2)}</pre>`;
                    } else {
                        outputContent += `<div class="mt-2 p-2 border bg-light">${output}</div>`;
                    }
                }
            } else {
                outputContent = `<div class="mt-2">${data.result}</div>`;
            }
            
            resultContent += `
                <div class="mt-3">
                    <h6>输出结果:</h6>
                    ${outputContent}
                </div>
            `;
        }
        
        resultContainer.innerHTML = resultContent;
    },
    
    /**
     * 验证流程
     */
    validateFlow() {
        const issues = [];
        
        // 检查是否有节点
        if (this.state.nodes.length === 0) {
            issues.push('流程中没有任何节点');
            this.showValidationResult(issues);
            return;
        }
        
        // 检查是否有名称
        if (!this.state.flowName) {
            issues.push('流程没有命名');
        }
        
        // 检查输入节点
        const inputNodes = this.state.nodes.filter(node => node.type === 'input');
        if (inputNodes.length === 0) {
            issues.push('流程中没有输入节点，可能无法启动流程');
        }
        
        // 检查输出节点
        const outputNodes = this.state.nodes.filter(node => node.type === 'output');
        if (outputNodes.length === 0) {
            issues.push('流程中没有输出节点，可能无法产生结果');
        }
        
        // 检查未连接的节点
        this.state.nodes.forEach(node => {
            // 跳过输入节点，它们不需要输入连接
            if (node.type === 'input') return;
            
            // 检查节点是否有输入连接
            const hasInputConnection = this.state.connections.some(conn => conn.toNodeId === node.id);
            if (!hasInputConnection) {
                issues.push(`节点 "${node.name}" 没有输入连接，这可能导致它无法接收数据`);
            }
            
            // 对于非输出节点，检查是否有输出连接
            if (node.type !== 'output') {
                const hasOutputConnection = this.state.connections.some(conn => conn.fromNodeId === node.id);
                if (!hasOutputConnection) {
                    issues.push(`节点 "${node.name}" 没有输出连接，这可能导致流程中断`);
                }
            }
        });
        
        // 显示验证结果
        this.showValidationResult(issues);
    },
    
    /**
     * 显示验证结果
     */
    showValidationResult(issues) {
        let alertClass = 'alert-success';
        let title = '验证通过';
        let message = '您的流程图有效，可以正常执行。';
        
        if (issues.length > 0) {
            alertClass = 'alert-warning';
            title = '发现潜在问题';
            message = '您的流程图存在以下问题：<ul>' + 
                issues.map(issue => `<li>${issue}</li>`).join('') + 
                '</ul>';
        }
        
        // 使用Bootstrap的Toast组件显示结果
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1050';
        
        toastContainer.innerHTML = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body ${alertClass}">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // 自动删除通知
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastContainer.remove();
        });
    }
};

// 初始化流程编辑器
document.addEventListener('DOMContentLoaded', () => {
    FlowEditor.init();
});
