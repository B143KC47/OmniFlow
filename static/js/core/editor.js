/**
 * 流程编辑器类
 * 负责管理编辑器的核心功能
 */
class FlowEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`容器 ${containerId} 不存在`);
        }
        
        this.editor = new Drawflow(this.container);
        this.config = {
            zoom: 1,
            zoomMax: 1.5,
            zoomMin: 0.5,
            zoomStep: 0.1,
            historyLimit: 20
        };
        
        this.selectedNode = null;
        this.flowRunning = false;
        this.history = [];
        this.historyIndex = -1;
        this.registry = window.nodeRegistry || initNodeRegistry();
        
        // 初始化编辑器
        this.editor.reroute = true;
        this.editor.start();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化撤销/重做功能
        this.initHistory();
    }
    
    /**
     * 绑定编辑器事件
     */
    bindEvents() {
        this.editor.on('nodeSelected', (nodeId) => {
            this.selectedNode = this.editor.getNodeFromId(nodeId);
            window.eventBus.emit('node:selected', this.selectedNode);
        });
        
        this.editor.on('nodeUnselected', () => {
            this.selectedNode = null;
            window.eventBus.emit('node:unselected');
        });
        
        this.editor.on('connectionCreated', (connection) => {
            window.eventBus.emit('connection:created', connection);
            this.addToHistory();
        });
        
        this.editor.on('connectionRemoved', (connection) => {
            window.eventBus.emit('connection:removed', connection);
            this.addToHistory();
        });
        
        this.editor.on('nodeCreated', (nodeId) => {
            window.eventBus.emit('node:created', {
                nodeId,
                node: this.editor.getNodeFromId(nodeId)
            });
            this.addToHistory();
        });
        
        this.editor.on('nodeRemoved', (nodeId) => {
            window.eventBus.emit('node:removed', nodeId);
            this.addToHistory();
        });
        
        this.editor.on('nodeMoved', (nodeId) => {
            window.eventBus.emit('node:moved', {
                nodeId,
                node: this.editor.getNodeFromId(nodeId)
            });
            this.addToHistory();
        });
        
        this.editor.on('zoom', (zoom) => {
            this.config.zoom = zoom;
            window.eventBus.emit('zoom:changed', zoom);
        });
    }
    
    /**
     * 初始化历史记录
     */
    initHistory() {
        // 清空历史记录
        this.history = [];
        this.historyIndex = -1;
        
        // 记录初始状态
        this.addToHistory();
    }
    
    /**
     * 添加当前状态到历史记录
     */
    addToHistory() {
        // 如果当前索引不是历史记录的末尾，截断后面的历史记录
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // 添加当前状态到历史记录
        const currentState = this.editor.export();
        this.history.push(JSON.stringify(currentState));
        
        // 限制历史记录长度
        if (this.history.length > this.config.historyLimit) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        // 更新撤销/重做按钮状态
        window.eventBus.emit('history:updated', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }
    
    /**
     * 撤销操作
     */
    undo() {
        if (!this.canUndo()) return;
        
        this.historyIndex--;
        const previousState = JSON.parse(this.history[this.historyIndex]);
        this.editor.import(previousState);
        
        window.eventBus.emit('history:updated', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }
    
    /**
     * 重做操作
     */
    redo() {
        if (!this.canRedo()) return;
        
        this.historyIndex++;
        const nextState = JSON.parse(this.history[this.historyIndex]);
        this.editor.import(nextState);
        
        window.eventBus.emit('history:updated', {
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }
    
    /**
     * 检查是否可以撤销
     */
    canUndo() {
        return this.historyIndex > 0;
    }
    
    /**
     * 检查是否可以重做
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }
    
    /**
     * 添加节点
     * @param {string} nodeType - 节点类型
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} data - 节点数据
     * @returns {string|null} 节点ID
     */
    addNode(nodeType, x, y, data = {}) {
        const template = this.registry.getTemplate(nodeType);
        if (!template) return null;
        
        // 合并默认数据和自定义数据
        const nodeData = Object.assign({}, template.data, data);
        
        // 添加节点
        const nodeId = this.editor.addNode(
            nodeType,
            template.inputs,
            template.outputs,
            x,
            y,
            nodeType,
            nodeData,
            template.html,
            false,
            template.class
        );
        
        // 添加到历史记录
        this.addToHistory();
        
        return nodeId;
    }
    
    /**
     * 删除节点
     * @param {string} nodeId - 节点ID
     */
    removeNode(nodeId) {
        this.editor.removeNodeId(nodeId);
        this.addToHistory();
    }
    
    /**
     * 更新节点数据
     * @param {string} nodeId - 节点ID
     * @param {Object} data - 更新的数据
     */
    updateNode(nodeId, data) {
        const node = this.editor.getNodeFromId(nodeId);
        if (node) {
            Object.assign(node.data, data);
            // 更新节点UI
            this.updateNodeUI(nodeId);
            this.addToHistory();
        }
    }
    
    /**
     * 更新节点UI
     * @param {string} nodeId - 节点ID
     */
    updateNodeUI(nodeId) {
        const node = this.editor.getNodeFromId(nodeId);
        if (!node) return;
        
        const element = document.getElementById(`node-${nodeId}`);
        if (!element) return;
        
        // 获取UI更新函数
        const nodeType = node.name;
        const updater = this.registry.getUIUpdater(nodeType);
        if (updater) {
            updater(element, node.data);
        }
    }
    
    /**
     * 清空编辑器
     */
    clear() {
        this.editor.clear();
        this.selectedNode = null;
        
        // 重置历史记录
        this.initHistory();
        
        window.eventBus.emit('editor:cleared');
    }
    
    /**
     * 导入流程数据
     * @param {Object} data - 流程数据
     */
    import(data) {
        this.editor.import(data);
        
        // 重置历史记录
        this.initHistory();
        
        window.eventBus.emit('editor:imported', data);
    }
    
    /**
     * 导出流程数据
     * @returns {Object} 流程数据
     */
    export() {
        return this.editor.export();
    }
    
    /**
     * 放大
     */
    zoomIn() {
        const newZoom = Math.min(this.config.zoom + this.config.zoomStep, this.config.zoomMax);
        this.setZoom(newZoom);
    }
    
    /**
     * 缩小
     */
    zoomOut() {
        const newZoom = Math.max(this.config.zoom - this.config.zoomStep, this.config.zoomMin);
        this.setZoom(newZoom);
    }
    
    /**
     * 重置缩放
     */
    resetZoom() {
        this.setZoom(1);
    }
    
    /**
     * 设置缩放
     * @param {number} value - 缩放值
     */
    setZoom(value) {
        this.config.zoom = value;
        this.editor.zoom = value;
        this.editor.zoom_refresh();
        window.eventBus.emit('zoom:changed', value);
    }
    
    /**
     * 选择所有节点
     */
    selectAll() {
        const nodes = this.editor.getNodesFromName();
        for (const nodeId in nodes) {
            this.editor.selectNode(nodeId);
        }
    }
    
    /**
     * 获取当前选择的节点IDs
     * @returns {Array} 选择的节点ID数组
     */
    getSelectedNodeIds() {
        const selectedNodes = document.querySelectorAll('.drawflow-node.selected');
        return Array.from(selectedNodes).map(el => el.id.replace('node-', ''));
    }
    
    /**
     * 删除选中的节点
     */
    deleteSelected() {
        const selectedNodeIds = this.getSelectedNodeIds();
        for (const nodeId of selectedNodeIds) {
            this.editor.removeNodeId(nodeId);
        }
        
        if (selectedNodeIds.length > 0) {
            this.addToHistory();
        }
    }
    
    /**
     * 锁定或解锁选中的节点
     * @param {boolean} lock - 是否锁定
     */
    toggleLockSelected(lock) {
        const selectedNodeIds = this.getSelectedNodeIds();
        for (const nodeId of selectedNodeIds) {
            const element = document.getElementById(`node-${nodeId}`);
            if (element) {
                if (lock) {
                    element.classList.add('locked');
                } else {
                    element.classList.remove('locked');
                }
            }
        }
    }
}

// 全局实例
window.flowEditor = null;

// 初始化函数
function initFlowEditor(containerId) {
    window.flowEditor = new FlowEditor(containerId);
    return window.flowEditor;
}
