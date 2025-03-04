/**
 * OmniFlow流程编辑器核心模块
 * 负责状态管理和核心功能
 */

// 导出核心对象
export const FlowCore = {
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
    
    /**
     * 初始化核心模块
     */
    init(canvas) {
        console.log('初始化流程编辑器核心');
        this.state.canvas = canvas;
        return this;
    },
    
    /**
     * 重置状态
     */
    resetState() {
        this.state.nodes = [];
        this.state.connections = [];
        this.state.nextNodeId = 1;
        this.state.selectedNode = null;
        this.state.selectedConnection = null;
        this.state.draggedNode = null;
        this.state.connectingFrom = null;
        this.state.connectingTo = null;
        this.state.flowName = '';
    },
    
    /**
     * 应用变换
     */
    applyTransform() {
        const nodesContainer = document.getElementById('nodesContainer');
        const connectionsContainer = document.getElementById('connectionsContainer');
        
        if (nodesContainer && connectionsContainer) {
            nodesContainer.style.transform = `scale(${this.state.scale}) translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
            connectionsContainer.style.transform = `scale(${this.state.scale}) translate(${this.state.offsetX}px, ${this.state.offsetY}px)`;
        }
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
     * 适应画布内容
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
    },

    /**
     * 对外公开初始化方法
     * 用于启动整个流程编辑器
     */
    initEditor() {
        console.log('初始化完整流程编辑器');
        
        // 初始化画布拖放事件
        const canvas = this.state.canvas;
        if (canvas) {
            // 支持从外部拖入文件
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvas.classList.add('drag-over');
            });
            
            canvas.addEventListener('dragleave', () => {
                canvas.classList.remove('drag-over');
            });
            
            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                canvas.classList.remove('drag-over');
                
                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type === "application/json") {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            try {
                                const flowData = JSON.parse(event.target.result);
                                const loadEvent = new CustomEvent('flow:import', { 
                                    detail: { flow: flowData } 
                                });
                                canvas.dispatchEvent(loadEvent);
                            } catch (error) {
                                console.error('无法解析JSON文件:', error);
                                alert('无法解析JSON文件。请确保文件格式正确。');
                            }
                        };
                        reader.readAsText(file);
                    } else {
                        alert('请拖入JSON格式的流程定义文件');
                    }
                }
            });
        }
        
        return this;
    }
};
