/**
 * OmniFlow流程编辑器主入口
 * 导入并初始化所有模块
 */

import { FlowCore } from './core.js';
import { FlowNodes, nodeTypes } from './nodes.js';
import { FlowConnections } from './connections.js';
import { FlowUI } from './ui.js';
import { FlowIO } from './io.js';
import { FlowUtils } from './utils.js';

/**
 * OmniFlow流程编辑器
 * 统一模块访问入口
 */
export const FlowEditor = {
    // 导出模块
    Core: FlowCore,
    Nodes: FlowNodes,
    Connections: FlowConnections,
    UI: FlowUI,
    IO: FlowIO,
    Utils: FlowUtils,
    
    // 导出节点类型配置
    nodeTypes: nodeTypes,
    
    /**
     * 初始化流程编辑器
     */
    init() {
        console.log('OmniFlow流程编辑器初始化开始');
        
        // 获取画布元素
        const canvas = document.getElementById('flowCanvas');
        if (!canvas) {
            console.error('找不到画布元素');
            return;
        }
        
        // 初始化核心模块
        this.Core.init(canvas);
        
        // 初始化其他模块
        this.Nodes.init();
        this.Connections.init();
        this.UI.init();
        this.IO.init();
        
        // 创建连接线SVG层
        this.Connections.createConnectionsLayer();
        
        // 创建临时连接线
        this.Connections.createTempConnectionLine();
        
        // 设置流程画布事件
        this.setupCanvasEvents();
        
        // 设置节点模板拖拽
        const nodePalette = document.querySelectorAll('.node-template');
        nodePalette.forEach(template => {
            this.setupNodeTemplate(template);
        });
        
        // 加载流程（如果URL中有flowId参数）
        const params = this.Utils.parseURLParams();
        if (params.flowId) {
            this.IO.loadFlowById(params.flowId);
        }
        
        // 初始化核心编辑器
        this.Core.initEditor();
        
        // 添加画布流程导入事件监听
        canvas.addEventListener('flow:import', (e) => {
            this.IO.importFlow(e.detail.flow);
        });
        
        console.log('OmniFlow流程编辑器初始化完成');
    },
    
    /**
     * 设置流程画布事件
     */
    setupCanvasEvents() {
        const canvas = this.Core.state.canvas;
        
        // 画布点击事件 - 取消选择
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                this.Core.deselectAll();
                this.Nodes.updatePropertiesPanel();
            }
        });
        
        // 画布鼠标移动事件 - 拖拽节点和创建连接
        canvas.addEventListener('mousemove', (e) => {
            // 处理节点拖拽
            if (this.Core.state.draggedNode) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left - this.Core.state.dragOffset.x) / this.Core.state.scale;
                const y = (e.clientY - rect.top - this.Core.state.dragOffset.y) / this.Core.state.scale;
                
                this.Core.state.draggedNode.style.left = `${x}px`;
                this.Core.state.draggedNode.style.top = `${y}px`;
                
                // 更新节点的所有连接
                this.Connections.updateNodeConnections(this.Core.state.draggedNode);
            }
            
            // 处理连接创建
            if (this.Core.state.connectingFrom) {
                const rect = canvas.getBoundingClientRect();
                const tempLine = document.getElementById('tempConnectionLine');
                const fromHandle = this.Core.state.connectingFrom;
                const fromRect = fromHandle.getBoundingClientRect();
                
                const fromX = (fromRect.left + fromRect.width / 2 - rect.left) / this.Core.state.scale;
                const fromY = (fromRect.top + fromRect.height / 2 - rect.top) / this.Core.state.scale;
                const toX = (e.clientX - rect.left) / this.Core.state.scale;
                const toY = (e.clientY - rect.top) / this.Core.state.scale;
                
                // 使用贝塞尔曲线绘制连接
                tempLine.setAttribute('d', this.Connections.createConnectionPath(fromX, fromY, toX, toY));
                tempLine.style.display = 'block';
            }
        });
        
        // 画布鼠标抬起事件 - 完成连接创建
        canvas.addEventListener('mouseup', (e) => {
            if (this.Core.state.connectingFrom && this.Core.state.connectingTo) {
                this.Connections.createConnection(this.Core.state.connectingFrom, this.Core.state.connectingTo);
            }
            
            // 重置连接状态
            this.Core.state.connectingFrom = null;
            this.Core.state.connectingTo = null;
            const tempLine = document.getElementById('tempConnectionLine');
            if (tempLine) {
                tempLine.style.display = 'none';
            }
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
            const node = this.Nodes.createNode(nodeType);
            
            // 设置拖拽状态
            this.Core.state.draggedNode = node;
            
            // 计算拖拽偏移
            const rect = node.getBoundingClientRect();
            this.Core.state.dragOffset.x = e.clientX - rect.left;
            this.Core.state.dragOffset.y = e.clientY - rect.top;
            
            // 添加鼠标移动和抬起事件监听
            document.addEventListener('mousemove', this.handleNodeDragMove);
            document.addEventListener('mouseup', this.handleNodeDragEnd);
        });
    },
    
    /**
     * 处理节点拖动移动
     */
    handleNodeDragMove: function(e) {
        if (!FlowEditor.Core.state.draggedNode) return;
        
        const canvas = FlowEditor.Core.state.canvas;
        const rect = canvas.getBoundingClientRect();
        
        // 计算新位置，考虑缩放和偏移
        const x = (e.clientX - rect.left - FlowEditor.Core.state.dragOffset.x) / FlowEditor.Core.state.scale;
        const y = (e.clientY - rect.top - FlowEditor.Core.state.dragOffset.y) / FlowEditor.Core.state.scale;
        
        // 限制在画布内
        const nodeWidth = FlowEditor.Core.state.draggedNode.offsetWidth;
        const nodeHeight = FlowEditor.Core.state.draggedNode.offsetHeight;
        const maxX = canvas.offsetWidth / FlowEditor.Core.state.scale - nodeWidth;
        const maxY = canvas.offsetHeight / FlowEditor.Core.state.scale - nodeHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        FlowEditor.Core.state.draggedNode.style.left = `${boundedX}px`;
        FlowEditor.Core.state.draggedNode.style.top = `${boundedY}px`;
        
        // 更新连接线
        FlowEditor.Connections.updateNodeConnections(FlowEditor.Core.state.draggedNode);
    },
    
    /**
     * 处理节点拖动结束
     */
    handleNodeDragEnd: function(e) {
        if (!FlowEditor.Core.state.draggedNode) return;
        
        // 保存节点位置
        const node = FlowEditor.Core.state.draggedNode;
        const nodeId = node.getAttribute('data-node-id');
        const nodeData = FlowEditor.Core.state.nodes.find(n => n.id === parseInt(nodeId));
        
        if (nodeData) {
            nodeData.position = {
                x: parseInt(node.style.left),
                y: parseInt(node.style.top)
            };
        }
        
        // 重置拖拽状态
        FlowEditor.Core.state.draggedNode = null;
        
        // 移除事件监听
        document.removeEventListener('mousemove', FlowEditor.handleNodeDragMove);
        document.removeEventListener('mouseup', FlowEditor.handleNodeDragEnd);
        
        // 更新节点计数
        FlowEditor.Nodes.updateNodeCount();
    }
};

// 当DOM加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    FlowEditor.init();
});