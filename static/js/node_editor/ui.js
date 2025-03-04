/**
 * OmniFlow流程编辑器UI模块
 * 负责用户界面交互和模态框等UI元素
 */

import { FlowCore } from './core.js';
import { FlowNodes } from './nodes.js';
import { FlowConnections } from './connections.js';
import { FlowIO } from './io.js';
import { FlowUtils } from './utils.js';

export const FlowUI = {
    /**
     * 初始化UI模块
     */
    init() {
        console.log('初始化流程编辑器UI模块');
        
        // 设置模态框事件
        this.initModalEvents();
        
        // 设置工具栏事件
        this.setupToolbarEvents();
        
        // 设置迷你地图
        this.initMiniMap();
        
        // 设置键盘快捷键
        this.setupKeyboardShortcuts();
        
        // 初始化缩放级别显示
        this.updateZoomLevel();
        
        return this;
    },
    
    /**
     * 初始化模态框事件
     */
    initModalEvents() {
        // 加载流程模态框事件
        const loadFlowModal = document.getElementById('loadFlowModal');
        if (loadFlowModal) {
            loadFlowModal.addEventListener('show.bs.modal', () => {
                FlowIO.loadFlowsList();
            });
        }
        
        // 执行流程模态框事件
        const executeFlowModal = document.getElementById('executeFlowModal');
        if (executeFlowModal) {
            executeFlowModal.addEventListener('show.bs.modal', () => {
                FlowIO.prepareFlowExecution();
            });
        }
        
        // 启动执行按钮
        const startExecutionBtn = document.getElementById('startExecution');
        if (startExecutionBtn) {
            startExecutionBtn.addEventListener('click', () => {
                FlowIO.startFlowExecution();
            });
        }
    },
    
    /**
     * 设置工具栏事件
     */
    setupToolbarEvents() {
        // 新建流程
        const newFlowBtn = document.getElementById('newFlow');
        if (newFlowBtn) {
            newFlowBtn.addEventListener('click', () => {
                if (confirm('确定要创建新流程吗？当前未保存的内容将丢失。')) {
                    FlowCore.resetState();
                    FlowIO.clearCanvas();
                    this.showStatusMessage('已创建新流程', 'success');
                }
            });
        }
        
        // 保存流程
        const saveFlowBtn = document.getElementById('saveFlow');
        if (saveFlowBtn) {
            saveFlowBtn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('saveFlowModal'));
                // 将当前流程名填入模态框
                const flowNameInput = document.getElementById('flowName');
                const saveFlowNameInput = document.getElementById('saveFlowName');
                if (flowNameInput && saveFlowNameInput) {
                    saveFlowNameInput.value = flowNameInput.value || '';
                }
                modal.show();
            });
        }
        
        // 确认保存
        const confirmSaveBtn = document.getElementById('confirmSave');
        if (confirmSaveBtn) {
            confirmSaveBtn.addEventListener('click', () => {
                FlowIO.saveFlow();
            });
        }
        
        // 加载流程
        const loadFlowBtn = document.getElementById('loadFlow');
        if (loadFlowBtn) {
            loadFlowBtn.addEventListener('click', () => {
                FlowIO.showLoadFlowDialog();
            });
        }
        
        // 删除选中节点
        const deleteSelectedBtn = document.getElementById('deleteSelected');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                if (FlowCore.state.selectedNode) {
                    FlowNodes.deleteNode(FlowCore.state.selectedNode);
                } else if (FlowCore.state.selectedConnection) {
                    const connId = FlowCore.state.selectedConnection.id;
                    FlowConnections.removeConnection(connId);
                    FlowCore.state.selectedConnection = null;
                }
            });
        }
        
        // 复制选中节点
        const duplicateSelectedBtn = document.getElementById('duplicateSelected');
        if (duplicateSelectedBtn) {
            duplicateSelectedBtn.addEventListener('click', () => {
                if (FlowCore.state.selectedNode) {
                    FlowNodes.duplicateNode(FlowCore.state.selectedNode);
                }
            });
        }
        
        // 执行流程
        const executeFlowBtn = document.getElementById('executeFlow');
        if (executeFlowBtn) {
            executeFlowBtn.addEventListener('click', () => {
                FlowIO.executeFlow();
            });
        }
        
        // 验证流程
        const validateFlowBtn = document.getElementById('validateFlow');
        if (validateFlowBtn) {
            validateFlowBtn.addEventListener('click', () => {
                FlowIO.validateFlow();
            });
        }
        
        // 自适应视图按钮
        const fitContentBtn = document.getElementById('fitContent');
        if (fitContentBtn) {
            fitContentBtn.addEventListener('click', () => {
                FlowCore.fitContent();
                this.updateZoomLevel();
            });
        }
        
        // 缩放按钮
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const resetViewBtn = document.getElementById('resetView');
        
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                FlowCore.zoom(0.1);
                this.updateZoomLevel();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                FlowCore.zoom(-0.1);
                this.updateZoomLevel();
            });
        }
        
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                FlowCore.resetView();
                this.updateZoomLevel();
            });
        }
        
        // 流程名称更改
        const flowNameInput = document.getElementById('flowName');
        if (flowNameInput) {
            flowNameInput.addEventListener('change', (e) => {
                FlowCore.state.flowName = e.target.value;
            });
        }
    },
    
    /**
     * 更新缩放级别显示
     */
    updateZoomLevel() {
        const zoomLevelElement = document.getElementById('zoomLevel');
        if (zoomLevelElement) {
            const percentage = Math.round(FlowCore.state.scale * 100);
            zoomLevelElement.textContent = `${percentage}%`;
        }
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
            
            // Delete键或Backspace键 - 删除选中节点或连接
            if (e.key === 'Delete' || e.key === 'Backspace') {
                FlowNodes.deleteSelected();
                e.preventDefault();
            }
            
            // Ctrl+D - 复制选中节点
            if (e.ctrlKey && e.key === 'd') {
                FlowNodes.duplicateSelected();
                e.preventDefault();
            }
            
            // Ctrl+S - 保存流程
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                document.getElementById('saveFlow')?.click();
            }
            
            // Ctrl+O - 打开流程
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                document.getElementById('loadFlow')?.click();
            }
            
            // Ctrl+N - 新建流程
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                document.getElementById('newFlow')?.click();
            }
            
            // F5 - 执行流程
            if (e.key === 'F5') {
                e.preventDefault();
                document.getElementById('executeFlow')?.click();
            }
            
            // Ctrl+F - 适应内容
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                FlowCore.fitContent();
                this.updateZoomLevel();
            }
            
            // Ctrl++ 或 Ctrl+= - 放大
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                FlowCore.zoom(0.1);
                e.preventDefault();
            }
            
            // Ctrl+- - 缩小
            if (e.ctrlKey && e.key === '-') {
                FlowCore.zoom(-0.1);
                e.preventDefault();
            }
            
            // Ctrl+0 - 重置视图
            if (e.ctrlKey && e.key === '0') {
                FlowCore.resetView();
                e.preventDefault();
            }
            
            // Ctrl+F 或 F - 适应内容
            if ((e.ctrlKey && e.key === 'f') || (!e.ctrlKey && e.key === 'f')) {
                FlowCore.fitContent();
                e.preventDefault();
            }
            
            // Escape - 取消选择
            if (e.key === 'Escape') {
                FlowCore.deselectAll();
                FlowNodes.updatePropertiesPanel();
            }
        });
    },
    
    /**
     * 初始化迷你地图
     */
    initMiniMap() {
        const miniMap = document.getElementById('miniMap');
        if (!miniMap) return;
        
        // 创建视口元素
        const viewport = document.createElement('div');
        viewport.className = 'mini-map-viewport';
        miniMap.appendChild(viewport);
        
        // 创建标签
        const label = document.createElement('div');
        label.className = 'mini-map-label';
        label.textContent = '迷你地图';
        miniMap.appendChild(label);
        
        // 定期更新迷你地图
        setInterval(() => this.updateMiniMap(), 500);
    },
    
    /**
     * 更新迷你地图
     */
    updateMiniMap() {
        const miniMap = document.getElementById('miniMap');
        if (!miniMap) return;
        
        const viewport = miniMap.querySelector('.mini-map-viewport');
        if (!viewport) return;
        
        // 清除旧的节点表示
        miniMap.querySelectorAll('.mini-map-node').forEach(node => node.remove());
        
        // 计算缩放比例
        const canvas = FlowCore.state.canvas;
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const miniMapRect = miniMap.getBoundingClientRect();
        
        const scaleX = miniMapRect.width / canvasRect.width;
        const scaleY = miniMapRect.height / canvasRect.height;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 留一些边距
        
        // 更新视口位置和大小
        const visibleWidth = canvasRect.width / FlowCore.state.scale;
        const visibleHeight = canvasRect.height / FlowCore.state.scale;
        
        viewport.style.width = `${visibleWidth * scale}px`;
        viewport.style.height = `${visibleHeight * scale}px`;
        viewport.style.left = `${(-FlowCore.state.offsetX) * scale}px`;
        viewport.style.top = `${(-FlowCore.state.offsetY) * scale}px`;
        
        // 添加节点表示
        FlowCore.state.nodes.forEach(nodeData => {
            const node = document.querySelector(`.node[data-node-id="${nodeData.id}"]`);
            if (!node) return;
            
            const miniNode = document.createElement('div');
            miniNode.className = 'mini-map-node';
            
            const nodeRect = node.getBoundingClientRect();
            
            // 计算节点在迷你地图中的位置和尺寸
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
            if (nodeType) {
                const typeConfig = FlowNodes.nodeTypes?.[nodeType];
                if (typeConfig?.color) {
                    miniNode.style.backgroundColor = typeConfig.color;
                }
            }
            
            miniMap.appendChild(miniNode);
        });
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
    },

    /**
     * 创建工具提示
     * @param {HTMLElement} element 提示目标元素
     * @param {string} text 提示文本
     */
    createTooltip(element, text) {
        // 使用Bootstrap的Tooltip组件
        if (window.bootstrap && bootstrap.Tooltip) {
            const tooltip = new bootstrap.Tooltip(element, {
                title: text,
                placement: 'auto',
                trigger: 'hover',
                container: 'body'
            });
            return tooltip;
        }
        
        // 如果没有Bootstrap，创建简单的自定义提示
        element.setAttribute('title', text);
    },
    
    /**
     * 在状态栏显示消息
     * @param {string} message 消息文本
     * @param {string} type 消息类型 (info, success, warning, danger)
     * @param {number} duration 显示时长(毫秒)，0表示不自动消失
     */
    showStatusMessage(message, type = 'info', duration = 3000) {
        const statusBar = document.querySelector('.status-bar');
        const statusMsg = document.querySelector('.status-message');
        if (!statusBar || !statusMsg) return;
        
        // 更新状态栏消息
        statusMsg.innerHTML = message;
        statusMsg.className = `status-message text-${type} small`;
        
        // 如果设定了自动消失
        if (duration > 0) {
            setTimeout(() => {
                statusMsg.textContent = '准备就绪';
                statusMsg.className = 'status-message text-muted small';
            }, duration);
        }
    },
    
    /**
     * 创建上下文菜单
     * @param {MouseEvent} event 触发事件
     * @param {Object[]} menuItems 菜单项配置
     */
    showContextMenu(event, menuItems) {
        // 阻止默认上下文菜单
        event.preventDefault();
        
        // 移除任何现有菜单
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // 创建新菜单
        const menu = document.createElement('div');
        menu.className = 'context-menu dropdown-menu show';
        menu.style.position = 'absolute';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        menu.style.zIndex = '1050';
        
        // 添加菜单项
        menuItems.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'dropdown-divider';
                menu.appendChild(divider);
            } else {
                const menuItem = document.createElement('button');
                menuItem.className = 'dropdown-item';
                if (item.disabled) {
                    menuItem.classList.add('disabled');
                    menuItem.disabled = true;
                }
                
                if (item.icon) {
                    menuItem.innerHTML = `<i class="bi ${item.icon} me-2"></i>${item.label}`;
                } else {
                    menuItem.textContent = item.label;
                }
                
                if (!item.disabled && item.action) {
                    menuItem.addEventListener('click', () => {
                        item.action();
                        menu.remove();
                    });
                }
                
                menu.appendChild(menuItem);
            }
        });
        
        // 添加到文档
        document.body.appendChild(menu);
        
        // 点击其他地方时关闭菜单
        document.addEventListener('click', () => {
            menu.remove();
        }, { once: true });
    }
};
