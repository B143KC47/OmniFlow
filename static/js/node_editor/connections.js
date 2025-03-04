/**
 * OmniFlow流程编辑器连接模块
 * 负责处理节点间的连接
 */

import { FlowCore } from './core.js';

export const FlowConnections = {
    /**
     * 初始化连接模块
     */
    init() {
        console.log('初始化流程编辑器连接模块');
        return this;
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
        FlowCore.state.canvas.appendChild(svg);
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
                FlowCore.state.connectingFrom = handle;
            }
        });
        
        // 鼠标进入 - 准备接收连接
        handle.addEventListener('mouseenter', () => {
            // 如果正在创建连接且当前是输入连接点，设置目标
            if (FlowCore.state.connectingFrom && handle.getAttribute('data-handle-type') === 'input') {
                // 确保不是同一个节点
                const fromNode = FlowCore.state.connectingFrom.closest('.node');
                const toNode = handle.closest('.node');
                
                if (fromNode !== toNode) {
                    handle.classList.add('handle-highlight');
                    FlowCore.state.connectingTo = handle;
                }
            }
        });
        
        // 鼠标离开 - 取消目标
        handle.addEventListener('mouseleave', () => {
            handle.classList.remove('handle-highlight');
            if (FlowCore.state.connectingTo === handle) {
                FlowCore.state.connectingTo = null;
            }
        });
        
        // 鼠标抬起 - 完成连接
        handle.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            
            if (FlowCore.state.connectingFrom && handle.getAttribute('data-handle-type') === 'input') {
                // 确保不是同一个节点
                const fromNode = FlowCore.state.connectingFrom.closest('.node');
                const toNode = handle.closest('.node');
                
                if (fromNode !== toNode) {
                    this.createConnection(FlowCore.state.connectingFrom, handle);
                }
            }
            
            // 重置连接状态
            FlowCore.state.connectingFrom = null;
            FlowCore.state.connectingTo = null;
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
        const existingConnection = FlowCore.state.connections.find(conn => {
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
        const targetHasConnection = FlowCore.state.connections.find(conn => {
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
        const canvasRect = FlowCore.state.canvas.getBoundingClientRect();
        
        const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left) / FlowCore.state.scale;
        const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top) / FlowCore.state.scale;
        const toX = (toRect.left + toRect.width / 2 - canvasRect.left) / FlowCore.state.scale;
        const toY = (toRect.top + toRect.height / 2 - canvasRect.top) / FlowCore.state.scale;
        
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
        FlowCore.state.connections.push({
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
        FlowCore.state.connections.forEach(conn => {
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
                            const canvasRect = FlowCore.state.canvas.getBoundingClientRect();
                            const fromRect = fromHandle.getBoundingClientRect();
                            const toRect = toHandle.getBoundingClientRect();
                            
                            const fromX = (fromRect.left + fromRect.width / 2 - canvasRect.left) / FlowCore.state.scale;
                            const fromY = (fromRect.top + fromRect.height / 2 - canvasRect.top) / FlowCore.state.scale;
                            const toX = (toRect.left + toRect.width / 2 - canvasRect.left) / FlowCore.state.scale;
                            const toY = (toRect.top + toRect.height / 2 - canvasRect.top) / FlowCore.state.scale;
                            
                            connectionElement.setAttribute('d', this.createConnectionPath(fromX, fromY, toX, toY));
                        }
                    }
                }
            }
        });
    },
    
    /**
     * 选择连接
     */
    selectConnection(connection) {
        // 取消之前的选择
        FlowCore.deselectAll();
        
        // 设置新选择的连接
        connection.classList.add('selected-connection');
        connection.setAttribute('stroke-width', '3');
        FlowCore.state.selectedConnection = connection;
    },
    
    /**
     * 删除连接
     */
    removeConnection(connectionId) {
        const connectionIndex = FlowCore.state.connections.findIndex(conn => conn.id === connectionId);
        if (connectionIndex !== -1) {
            FlowCore.state.connections.splice(connectionIndex, 1);
            const connectionElement = document.getElementById(connectionId);
            if (connectionElement) {
                connectionElement.remove();
            }
            this.updateConnectionCount();
        }
    },
    
    /**
     * 更新连接计数
     */
    updateConnectionCount() {
        const countElement = document.getElementById('connectionCount');
        if (countElement) {
            countElement.textContent = FlowCore.state.connections.length;
        }
    }
};

