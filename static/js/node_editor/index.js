/**
 * OmniFlow流程编辑器入口文件
 * 负责初始化和协调各模块工作
 */

import { FlowCore } from './core.js';
import { FlowNodes } from './nodes.js';
import { FlowConnections } from './connections.js';
import { FlowIO } from './io.js';
import { FlowUI } from './ui.js';

// 初始化各模块
document.addEventListener('DOMContentLoaded', () => {
    console.log('OmniFlow流程编辑器初始化中...');
    
    // 获取画布元素
    const canvas = document.getElementById('flowCanvas');
    if (!canvas) {
        console.error('找不到画布元素!');
        return;
    }
    
    // 初始化核心模块
    FlowCore.init(canvas);
    
    // 创建节点容器
    FlowNodes.createNodesContainer();
    
    // 创建连接容器
    FlowConnections.createConnectionsLayer();
    
    // 创建临时连接线
    FlowConnections.createTempConnectionLine();
    
    // 初始化各功能模块
    FlowNodes.init();
    FlowConnections.init();
    FlowUI.init();
    FlowIO.init();
    
    // 设置画布事件
    setupCanvasEvents(canvas);
    
    // 设置节点模板拖拽
    setupNodeTemplates();
    
    console.log('OmniFlow流程编辑器初始化完成');
});

/**
 * 设置画布事件
 */
function setupCanvasEvents(canvas) {
    // 画布点击事件 - 清除选择
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) {
            FlowCore.deselectAll();
            FlowNodes.updatePropertiesPanel();
        }
    });
    
    // 画布鼠标移动事件 - 处理连接创建和节点拖动
    canvas.addEventListener('mousemove', (e) => {
        handleMouseMove(e, canvas);
    });
    
    // 画布鼠标抬起事件 - 完成节点拖动和连接创建
    canvas.addEventListener('mouseup', (e) => {
        handleMouseUp(e);
    });
    
    // 画布上下文菜单 - 阻止浏览器默认菜单并显示自定义菜单
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        
        // 只有在点击空白区域时才显示画布上下文菜单
        if (e.target === canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            const x = (e.clientX - canvasRect.left) / FlowCore.state.scale;
            const y = (e.clientY - canvasRect.top) / FlowCore.state.scale;
            
            FlowUI.showContextMenu(e, [
                { label: '粘贴', icon: 'bi-clipboard', action: () => console.log('粘贴到位置:', x, y) },
                { label: '重置视图', icon: 'bi-arrows-fullscreen', action: () => FlowCore.resetView() },
                { label: '适应内容', icon: 'bi-arrows-angle-contract', action: () => FlowCore.fitContent() }
            ]);
        }
    });
    
    // 画布键盘事件
    document.addEventListener('keydown', (e) => {
        // 如果焦点在输入框或文本区域，不处理快捷键
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // 删除选中的节点或连接
            if (FlowCore.state.selectedNode) {
                FlowNodes.deleteNode(FlowCore.state.selectedNode);
                e.preventDefault();
            } else if (FlowCore.state.selectedConnection) {
                const connId = FlowCore.state.selectedConnection.id;
                FlowConnections.removeConnection(connId);
                FlowCore.state.selectedConnection = null;
                e.preventDefault();
            }
        } else if (e.ctrlKey && e.key === 'd') {
            // 复制选中的节点
            if (FlowCore.state.selectedNode) {
                FlowNodes.duplicateNode(FlowCore.state.selectedNode);
                e.preventDefault();
            }
        }
    });
}

/**
 * 处理鼠标移动事件
 */
function handleMouseMove(e, canvas) {
    const canvasRect = canvas.getBoundingClientRect();
    
    // 处理节点拖动
    if (FlowCore.state.draggedNode) {
        const x = (e.clientX - canvasRect.left - FlowCore.state.dragOffset.x) / FlowCore.state.scale;
        const y = (e.clientY - canvasRect.top - FlowCore.state.dragOffset.y) / FlowCore.state.scale;
        
        // 计算边界约束
        const nodeWidth = FlowCore.state.draggedNode.offsetWidth;
        const nodeHeight = FlowCore.state.draggedNode.offsetHeight;
        const maxX = (canvas.offsetWidth / FlowCore.state.scale) - nodeWidth;
        const maxY = (canvas.offsetHeight / FlowCore.state.scale) - nodeHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        FlowCore.state.draggedNode.style.left = `${boundedX}px`;
        FlowCore.state.draggedNode.style.top = `${boundedY}px`;
        
        // 更新节点的连接线
        FlowConnections.updateNodeConnections(FlowCore.state.draggedNode);
    }
    
    // 处理连接创建
    if (FlowCore.state.connectingFrom) {
        const tempLine = document.getElementById('tempConnectionLine');
        if (tempLine) {
            const fromHandle = FlowCore.state.connectingFrom;
            const fromRect = fromHandle.getBoundingClientRect();
            
            const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left) / FlowCore.state.scale;
            const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top) / FlowCore.state.scale;
            const toX = (e.clientX - canvasRect.left) / FlowCore.state.scale;
            const toY = (e.clientY - canvasRect.top) / FlowCore.state.scale;
            
            tempLine.setAttribute('d', FlowConnections.createConnectionPath(fromX, fromY, toX, toY));
            tempLine.style.display = 'block';
        }
    }
}

/**
 * 处理鼠标抬起事件
 */
function handleMouseUp(e) {
    // 结束节点拖拽
    if (FlowCore.state.draggedNode) {
        // 更新节点位置
        const nodeId = parseInt(FlowCore.state.draggedNode.getAttribute('data-node-id'));
        const nodeIndex = FlowCore.state.nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex !== -1) {
            FlowCore.state.nodes[nodeIndex].position = {
                x: parseInt(FlowCore.state.draggedNode.style.left),
                y: parseInt(FlowCore.state.draggedNode.style.top)
            };
        }
        
        FlowCore.state.draggedNode = null;
    }
    
    // 创建连接
    if (FlowCore.state.connectingFrom && FlowCore.state.connectingTo) {
        FlowConnections.createConnection(FlowCore.state.connectingFrom, FlowCore.state.connectingTo);
    }
    
    // 重置连接状态
    FlowCore.state.connectingFrom = null;
    FlowCore.state.connectingTo = null;
    
    const tempLine = document.getElementById('tempConnectionLine');
    if (tempLine) {
        tempLine.style.display = 'none';
    }
}

/**
 * 设置节点模板的拖拽功能
 */
function setupNodeTemplates() {
    const nodeTemplates = document.querySelectorAll('.node-template');
    
    nodeTemplates.forEach(template => {
        template.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            // 获取节点类型
            const nodeType = template.getAttribute('data-node-type');
            
            // 创建新节点
            const node = FlowNodes.createNode(nodeType);
            
            // 计算放置位置
            const canvas = FlowCore.state.canvas;
            const canvasRect = canvas.getBoundingClientRect();
            const templateRect = template.getBoundingClientRect();
            
            // 设置初始位置为鼠标位置减去模板中心点
            const x = (e.clientX - canvasRect.left - templateRect.width / 2) / FlowCore.state.scale;
            const y = (e.clientY - canvasRect.top - templateRect.height / 2) / FlowCore.state.scale;
            
            // 更新节点位置
            node.style.left = `${x}px`;
            node.style.top = `${y}px`;
            
            // 更新节点数据中的位置
            const nodeId = parseInt(node.getAttribute('data-node-id'));
            const nodeIndex = FlowCore.state.nodes.findIndex(n => n.id === nodeId);
            if (nodeIndex !== -1) {
                FlowCore.state.nodes[nodeIndex].position = { x, y };
            }
            
            // 开始拖动新节点
            FlowCore.state.draggedNode = node;
            FlowCore.state.dragOffset.x = templateRect.width / 2;
            FlowCore.state.dragOffset.y = templateRect.height / 2;
        });
    });
}