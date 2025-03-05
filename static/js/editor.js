document.addEventListener('DOMContentLoaded', function() {
    // 初始化JSPlumb实例
    const jsPlumbInstance = jsPlumb.getInstance({
        Endpoint: ["Dot", { radius: 3 }],
        Connector: ["Bezier", { curviness: 50 }],
        HoverPaintStyle: { stroke: "#4a90e2", strokeWidth: 2 },
        ConnectionOverlays: [
            ["Arrow", { location: 1, id: "arrow", length: 10, foldback: 0.8 }]
        ],
        DragOptions: { cursor: 'move' },
        Container: "editorCanvas"
    });

    // 编辑器状态
    const editorState = {
        nodes: {},
        selectedNodeId: null,
        nextNodeId: 1,
        hasStartNode: false,
        startNodeId: null,
        scale: 1.0,
        panning: false,
        spaceKeyPressed: false,
        startPanX: 0,
        startPanY: 0,
        offsetX: 0,
        offsetY: 0,
        contextMenuX: 0,
        contextMenuY: 0,
        clipboard: null,
        isFullscreen: false, // 添加全屏状态跟踪
        canvas: {
            width: 20000,   // 更大的画布
            height: 20000,  // 更大的画布
            centerX: 10000, // 中心X坐标
            centerY: 10000  // 中心Y坐标
        }
    };

    // 节点类型定义
    const nodeTypes = {
        'flow-start': {
            name: '流程开始',
            icon: 'fa-play-circle',
            color: '#1a472a',
            inputs: [],
            outputs: [{ id: 'default', name: '下一步' }],
            getDefaultData: () => ({
                title: '开始',
                description: '流程开始节点'
            }),
            validate: () => true
        },
        'flow-end': {
            name: '流程结束',
            icon: 'fa-stop-circle',
            color: '#5c1a1a',
            inputs: [{ id: 'default', name: '输入' }],
            outputs: [],
            getDefaultData: () => ({
                title: '结束',
                description: '流程结束节点'
            }),
            validate: () => true
        }
    };

    // 初始化编辑器
    function initEditor() {
        // 设置JSPlumb默认外观
        jsPlumbInstance.importDefaults({
            PaintStyle: {
                stroke: "#cccccc",
                strokeWidth: 2
            },
            EndpointStyle: {
                fill: "#cccccc",
                stroke: "#333333",
                strokeWidth: 1,
                radius: 4
            }
        });

        // 初始化画布控制
        initCanvasControls();

        // 初始化右键菜单
        initContextMenu();

        // 初始化节点属性面板
        initPropertiesPanel();

        // 初始化按钮事件
        initButtons();

        // 创建新流程
        newFlow();

        // 初始化全屏模式
        initFullscreenMode();

        // 窗口大小改变时重绘连接线
        window.addEventListener('resize', function() {
            jsPlumbInstance.repaintEverything();
        });

        // 将视图居中到画布中心
        centerViewToCanvasCenter();

        // 添加画布控制按钮事件
        initCanvasControlButtons();

        // 调整初始视图
        setTimeout(() => {
            // 延迟执行以确保DOM已完全加载
            centerViewToCanvasCenter();
            jsPlumbInstance.repaintEverything();
        }, 100);

        // 添加窗口大小调整处理
        window.addEventListener('resize', handleWindowResize);
        
        // 延迟调用布局修复
        setTimeout(() => {
            adjustCanvasWidth();
            centerViewToCanvasCenter();
        }, 200);
    }

    // 初始化画布控制（平移和缩放）
    function initCanvasControls() {
        const workspace = document.getElementById('editorWorkspace');
        const canvas = document.getElementById('editorCanvas');

        // 鼠标按下时开始平移（如果空格键被按下或使用中键）
        workspace.addEventListener('mousedown', function(e) {
            // 中键或空格键+鼠标左键
            if (e.button === 1 || (editorState.spaceKeyPressed && e.button === 0)) {
                editorState.panning = true;
                editorState.startPanX = e.clientX;
                editorState.startPanY = e.clientY;
                workspace.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        // 鼠标移动时平移画布
        document.addEventListener('mousemove', function(e) {
            if (editorState.panning) {
                const deltaX = e.clientX - editorState.startPanX;
                const deltaY = e.clientY - editorState.startPanY;
                editorState.offsetX += deltaX;
                editorState.offsetY += deltaY;
                editorState.startPanX = e.clientX;
                editorState.startPanY = e.clientY;
                updateCanvasTransform();
            }
        });

        // 鼠标放开时结束平移
        document.addEventListener('mouseup', function() {
            if (editorState.panning) {
                editorState.panning = false;
                workspace.style.cursor = editorState.spaceKeyPressed ? 'grab' : 'default';
            }
        });

        // 鼠标滚轮缩放画布
        workspace.addEventListener('wheel', function(e) {
            e.preventDefault();

            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const newScale = Math.min(Math.max(editorState.scale + delta, 0.3), 3);

            // 以鼠标位置为中心进行缩放
            const rect = workspace.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // 计算鼠标相对于画布内容的位置
            const contentX = (mouseX - editorState.offsetX) / editorState.scale;
            const contentY = (mouseY - editorState.offsetY) / editorState.scale;

            editorState.offsetX = mouseX - contentX * newScale;
            editorState.offsetY = mouseY - contentY * newScale;
            editorState.scale = newScale;

            updateCanvasTransform();
        });

        // 空格键按下切换平移模式
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !e.repeat) {
                editorState.spaceKeyPressed = true;
                workspace.style.cursor = 'grab';
            }

            // Ctrl+Z 撤销
            if (e.ctrlKey && e.code === 'KeyZ') {
                e.preventDefault();
                // 实现撤销功能
            }

            // Ctrl+C 复制
            if (e.ctrlKey && e.code === 'KeyC' && editorState.selectedNodeId) {
                e.preventDefault();
                copySelectedNode();
            }

            // Ctrl+V 粘贴
            if (e.ctrlKey && e.code === 'KeyV') {
                e.preventDefault();
                pasteNode();
            }

            // Delete 删除
            if ((e.code === 'Delete' || e.code === 'Backspace') && editorState.selectedNodeId) {
                e.preventDefault();
                deleteNode(editorState.selectedNodeId);
            }

            // Esc 取消选择
            if (e.code === 'Escape') {
                closePropertiesPanel();
                selectNode(null);
            }

            // F 键居中所有节点
            if (e.code === 'KeyF') {
                e.preventDefault();
                if (Object.keys(editorState.nodes).length > 0) {
                    centerAllNodes();
                }
            }
        });

        // 空格键释放
        document.addEventListener('keyup', function(e) {
            if (e.code === 'Space') {
                editorState.spaceKeyPressed = false;
                workspace.style.cursor = editorState.panning ? 'grabbing' : 'default';
            }
        });

        // 编辑器失去焦点时，重置状态
        window.addEventListener('blur', function() {
            editorState.panning = false;
            editorState.spaceKeyPressed = false;
            workspace.style.cursor = 'default';
        });

        // 点击空白处取消选择
        workspace.addEventListener('click', function(e) {
            if (e.target === workspace || e.target === canvas) {
                selectNode(null);
            }
        });
    }

    // 更新画布变换
    function updateCanvasTransform() {
        const canvas = document.getElementById('editorCanvas');
        canvas.style.transform = `translate(${editorState.offsetX}px, ${editorState.offsetY}px) scale(${editorState.scale})`;

        // 更新JSPlumb缩放
        jsPlumbInstance.setZoom(editorState.scale);

        // 更新缩放信息
        const zoomInfo = document.getElementById('zoomInfo');
        zoomInfo.textContent = Math.round(editorState.scale * 100) + '%';

        // 检查并显示视口外节点的指示器
        updateNodeIndicators();
        
        // 重绘所有连接线，确保它们能正确显示
        setTimeout(() => {
            jsPlumbInstance.repaintEverything();
        }, 10);
    }

    // 居中显示所有节点
    function centerAllNodes() {
        // 没有节点直接返回
        if (Object.keys(editorState.nodes).length === 0) {
            centerViewToCanvasCenter();
            return;
        }

        // 计算所有节点的边界
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        Object.values(editorState.nodes).forEach(node => {
            const el = document.getElementById(node.id);
            if (el) {
                const rect = el.getBoundingClientRect(); // 使用 getBoundingClientRect 获取更准确的尺寸
                const left = node.position.left;
                const top = node.position.top;
                const right = left + rect.width / editorState.scale; // 考虑缩放因素
                const bottom = top + rect.height / editorState.scale;
                
                minX = Math.min(minX, left);
                minY = Math.min(minY, top);
                maxX = Math.max(maxX, right);
                maxY = Math.max(maxY, bottom);
            }
        });

        // 计算节点组的中心点
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // 获取工作区尺寸
        const workspace = document.getElementById('editorWorkspace');
        const workspaceWidth = workspace.clientWidth; // 使用 clientWidth 获取元素内部宽度
        const workspaceHeight = workspace.clientHeight;

        // 调整画布偏移，使节点居中
        editorState.offsetX = workspaceWidth / 2 - centerX * editorState.scale;
        editorState.offsetY = workspaceHeight / 2 - centerY * editorState.scale;

        updateCanvasTransform();
    }

    // 将视图居中到画布中心
    function centerViewToCanvasCenter() {
        const workspace = document.getElementById('editorWorkspace');
        const workspaceWidth = workspace.clientWidth || window.innerWidth;
        const workspaceHeight = workspace.clientHeight || window.innerHeight - 90;

        // 计算将画布中心放置在视口中心所需的偏移量
        editorState.offsetX = workspaceWidth / 2 - editorState.canvas.centerX * editorState.scale;
        editorState.offsetY = workspaceHeight / 2 - editorState.canvas.centerY * editorState.scale;

        updateCanvasTransform();
    }

    // 初始化画布控制按钮
    function initCanvasControlButtons() {
        // 中心所有节点按钮
        document.getElementById('centerNodesBtn').addEventListener('click', function() {
            centerAllNodes();
        });

        // 重置缩放按钮
        document.getElementById('resetZoomBtn').addEventListener('click', function() {
            resetZoom();
        });
    }

    // 重置缩放
    function resetZoom() {
        editorState.scale = 1.0;
        updateCanvasTransform();
    }

    // 显示视口外节点的指示器
    function updateNodeIndicators() {
        // 移除所有现有指示器
        const indicators = document.querySelectorAll('.node-indicator');
        indicators.forEach(indicator => indicator.remove());

        // 获取工作区尺寸
        const workspace = document.getElementById('editorWorkspace');
        const wsRect = workspace.getBoundingClientRect();

        // 为视口外的节点创建指示器
        Object.values(editorState.nodes).forEach(node => {
            const nodeEl = document.getElementById(node.id);
            if (!nodeEl) return;

            // 计算节点中心在屏幕上的位置
            const nodeLeft = node.position.left * editorState.scale + editorState.offsetX;
            const nodeTop = node.position.top * editorState.scale + editorState.offsetY;
            const nodeRight = nodeLeft + nodeEl.offsetWidth * editorState.scale;
            const nodeBottom = nodeTop + nodeEl.offsetHeight * editorState.scale;

            // 检查节点是否在视口外
            if (nodeRight < 0 || nodeLeft > wsRect.width || nodeBottom < 0 || nodeTop > wsRect.height) {
                // 计算方向和位置
                let x = Math.max(10, Math.min(wsRect.width - 10, nodeLeft + nodeEl.offsetWidth / 2 * editorState.scale));
                let y = Math.max(10, Math.min(wsRect.height - 10, nodeTop + nodeEl.offsetHeight / 2 * editorState.scale));

                // 如果中心点在视口外，则将指示器移动到视口边缘
                if (x < 10) x = 10;
                if (x > wsRect.width - 10) x = wsRect.width - 10;
                if (y < 10) y = 10;
                if (y > wsRect.height - 10) y = wsRect.height - 10;

                // 创建并添加指示器
                createNodeIndicator(x, y, node.id);
            }
        });
    }

    // 创建节点指示器
    function createNodeIndicator(x, y, nodeId) {
        const indicators = document.querySelector('.node-indicators') || 
                          createNodeIndicatorsContainer();

        const indicator = document.createElement('div');
        indicator.className = 'node-indicator';
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        indicator.innerHTML = '<i class="fas fa-chevron-circle-right"></i>';

        // 点击指示器导航到对应节点
        indicator.addEventListener('click', function() {
            navigateToNode(nodeId);
        });

        indicators.appendChild(indicator);
    }

    // 创建节点指示器容器
    function createNodeIndicatorsContainer() {
        const workspace = document.getElementById('editorWorkspace');
        const container = document.createElement('div');
        container.className = 'node-indicators';
        workspace.appendChild(container);
        return container;
    }

    // 导航到特定节点
    function navigateToNode(nodeId) {
        const node = editorState.nodes[nodeId];
        if (!node) return;

        // 将节点居中显示
        const workspace = document.getElementById('editorWorkspace');
        const nodeEl = document.getElementById(nodeId);

        if (nodeEl) {
            // 计算节点中心位置
            const nodeWidth = nodeEl.offsetWidth;
            const nodeHeight = nodeEl.offsetHeight;
            const nodeCenterX = node.position.left + nodeWidth / 2;
            const nodeCenterY = node.position.top + nodeHeight / 2;

            // 计算将节点居中所需的画布偏移
            editorState.offsetX = workspace.offsetWidth / 2 - nodeCenterX * editorState.scale;
            editorState.offsetY = workspace.offsetHeight / 2 - nodeCenterY * editorState.scale;

            updateCanvasTransform();

            // 选中节点
            selectNode(nodeId);
        }
    }

    // 初始化右键菜单
    function initContextMenu() {
        const workspace = document.getElementById('editorWorkspace');
        const contextMenu = document.getElementById('contextMenu');

        // 右键显示菜单
        workspace.addEventListener('contextmenu', function(e) {
            e.preventDefault();

            // 保存右键点击位置（用于创建节点）
            editorState.contextMenuX = (e.clientX - editorState.offsetX) / editorState.scale;
            editorState.contextMenuY = (e.clientY - editorState.offsetY) / editorState.scale;

            // 显示菜单并定位
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';

            // 如果右键点击了节点，更新菜单项
            updateContextMenuItems(e.target);
        });

        // 点击菜单项
        contextMenu.addEventListener('click', function(e) {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const nodeType = item.dataset.nodeType;
                const action = item.dataset.action;

                if (nodeType) {
                    createNode(nodeType, editorState.contextMenuX, editorState.contextMenuY);
                } else if (action) {
                    switch (action) {
                        case 'copy':
                            copySelectedNode();
                            break;
                        case 'paste':
                            pasteNode(editorState.contextMenuX, editorState.contextMenuY);
                            break;
                    }
                }

                hideContextMenu();
            }
        });

        // 点击其他地方隐藏菜单
        document.addEventListener('click', hideContextMenu);
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Escape') hideContextMenu();
        });
    }

    // 根据上下文更新右键菜单
    function updateContextMenuItems(target) {
        const contextMenu = document.getElementById('contextMenu');
        const copyItem = contextMenu.querySelector('[data-action="copy"]');
        const pasteItem = contextMenu.querySelector('[data-action="paste"]');

        // 检查是否右键点击了节点
        const nodeEl = target.closest('.flow-node');
        if (nodeEl) {
            copyItem.style.display = 'flex';
            // 选择该节点
            selectNode(nodeEl.id);
        } else {
            copyItem.style.display = 'none';
        }

        // 检查剪贴板是否有内容
        pasteItem.style.display = editorState.clipboard ? 'flex' : 'none';
    }

    // 隐藏右键菜单
    function hideContextMenu() {
        document.getElementById('contextMenu').style.display = 'none';
    }

    // 复制选中节点
    function copySelectedNode() {
        if (!editorState.selectedNodeId) return;

        const node = editorState.nodes[editorState.selectedNodeId];
        if (node) {
            editorState.clipboard = {
                type: node.type,
                data: JSON.parse(JSON.stringify(node.data))
            };
        }
    }

    // 粘贴节点
    function pasteNode(x, y) {
        if (!editorState.clipboard) return;

        // 默认粘贴到画布中心
        if (x === undefined || y === undefined) {
            const workspace = document.getElementById('editorWorkspace');
            x = (workspace.offsetWidth / 2 - editorState.offsetX) / editorState.scale;
            y = (workspace.offsetHeight / 2 - editorState.offsetY) / editorState.scale;
        }

        // 创建节点
        const newNode = createNode(
            editorState.clipboard.type,
            x,
            y
        );

        if (newNode) {
            // 复制数据
            Object.assign(newNode.data, editorState.clipboard.data);

            // 更新节点显示
            const nodeEl = document.getElementById(newNode.id);
            renderNodeContent(nodeEl, newNode);
        }
    }

    // 初始化节点属性面板
    function initPropertiesPanel() {
        const panel = document.getElementById('nodePropertiesPanel');
        const closeBtn = document.getElementById('closeProperties');

        closeBtn.addEventListener('click', closePropertiesPanel);
    }

    // 显示节点属性面板
    function showPropertiesPanel() {
        const panel = document.getElementById('nodePropertiesPanel');
        panel.classList.add('show');
    }

    // 关闭节点属性面板
    function closePropertiesPanel() {
        const panel = document.getElementById('nodePropertiesPanel');
        panel.classList.remove('show');
    }

    // 初始化按钮事件
    function initButtons() {
        document.getElementById('newFlow').addEventListener('click', function() {
            if (confirm('创建新流程将清除当前画布，确定继续吗？')) {
                newFlow();
            }
        });

        document.getElementById('saveFlow').addEventListener('click', saveFlow);
        document.getElementById('loadFlow').addEventListener('click', loadFlow);
        document.getElementById('exportFlow').addEventListener('click', exportFlow);

        document.getElementById('zoomOut').addEventListener('click', function() {
            zoomCanvas(-0.1);
        });

        document.getElementById('resetView').addEventListener('click', function() {
            resetCanvasView();
        });

        // 添加全屏按钮事件监听
        document.getElementById('toggleFullScreen').addEventListener('click', function() {
            // 全屏功能在initFullscreenMode中已实现
        });
    }

    // 初始化全屏模式
    function initFullscreenMode() {
        const toggleBtn = document.getElementById('toggleFullScreen');
        const editorRoot = document.getElementById('editor-root');
        const editorHeader = document.getElementById('editorHeader');
        const editorFooter = document.getElementById('editorFooter');

        toggleBtn.addEventListener('click', function() {
            editorState.isFullscreen = !editorState.isFullscreen;

            if (editorState.isFullscreen) {
                // 进入全屏模式
                editorRoot.classList.add('fullscreen-mode');
                editorHeader.classList.add('hidden');
                editorFooter.classList.add('hidden');
                toggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
                toggleBtn.title = '退出全屏';

                // 如果浏览器支持原生全屏API，使用它
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
            } else {
                // 退出全屏模式
                editorRoot.classList.remove('fullscreen-mode');
                editorHeader.classList.remove('hidden');
                editorFooter.classList.remove('hidden');
                toggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
                toggleBtn.title = '全屏模式';

                // 如果浏览器支持原生全屏API，退出全屏
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }

            // 调整JSPlumb以适应新的尺寸
            setTimeout(() => {
                jsPlumbInstance.repaintEverything();
            }, 300);
        });

        // 监听浏览器全屏状态变化
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        function handleFullscreenChange() {
            // 检查是否处于全屏模式
            const isNativeFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            // 如果通过ESC键退出了全屏，也要更新我们的UI
            if (!isNativeFullscreen && editorState.isFullscreen) {
                editorState.isFullscreen = false;
                editorRoot.classList.remove('fullscreen-mode');
                editorHeader.classList.remove('hidden');
                editorFooter.classList.remove('hidden');
                toggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
                toggleBtn.title = '全屏模式';

                // 调整JSPlumb以适应新的尺寸
                setTimeout(() => {
                    jsPlumbInstance.repaintEverything();
                }, 300);
            }
        }
    }

    // 放大/缩小画布
    function zoomCanvas(delta) {
        const newScale = Math.min(Math.max(editorState.scale + delta, 0.3), 3);

        // 获取工作区中心
        const workspace = document.getElementById('editorWorkspace');
        const centerX = workspace.offsetWidth / 2;
        const centerY = workspace.offsetHeight / 2;

        // 计算相对于画布内容的位置
        const contentX = (centerX - editorState.offsetX) / editorState.scale;
        const contentY = (centerY - editorState.offsetY) / editorState.scale;

        // 调整偏移以保持中心不变
        editorState.offsetX = centerX - contentX * newScale;
        editorState.offsetY = centerY - contentY * newScale;

        editorState.scale = newScale;
        updateCanvasTransform();
    }

    // 重置画布视图
    function resetCanvasView() {
        editorState.scale = 1.0;

        if (Object.keys(editorState.nodes).length > 0) {
            // 如果有节点，居中显示所有节点
            centerAllNodes();
        } else {
            // 否则重置到初始位置
            editorState.offsetX = 0;
            editorState.offsetY = 0;
            updateCanvasTransform();
        }
    }

    // 创建新流程
    function newFlow() {
        // 清除画布
        clearCanvas();

        // 创建开始节点，放在画布中心
        createNode('flow-start', editorState.canvas.centerX - 100, editorState.canvas.centerY);

        // 重置视图
        centerViewToCanvasCenter();
    }

    // 清除画布
    function clearCanvas() {
        // 解除所有事件绑定和连接点
        jsPlumbInstance.reset();

        // 清空画布
        const canvas = document.getElementById('editorCanvas');
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }

        // 重置状态
        editorState.nodes = {};
        editorState.selectedNodeId = null;
        editorState.nextNodeId = 1;
        editorState.hasStartNode = false;
        editorState.startNodeId = null;

        // 关闭属性面板
        closePropertiesPanel();
    }

    // 创建节点
    function createNode(type, left, top) {
        // 检查是否是开始节点并且已经存在
        if (type === 'flow-start' && editorState.hasStartNode) {
            alert('流程图中只能有一个开始节点');
            return null;
        }

        const id = `node_${editorState.nextNodeId++}`;
        const position = { left, top };
        const nodeType = nodeTypes[type];

        if (!nodeType) {
            console.error(`未知节点类型: ${type}`);
            return null;
        }

        // 创建节点对象
        const node = {
            id,
            type,
            position,
            data: nodeType.getDefaultData(),
            inputs: nodeType.inputs,
            outputs: nodeType.outputs
        };

        // 如果是开始节点，更新状态
        if (type === 'flow-start') {
            editorState.hasStartNode = true;
            editorState.startNodeId = id;
        }

        // 保存节点
        editorState.nodes[id] = node;

        // 渲染节点
        renderNode(node);

        // 选中新创建的节点
        selectNode(id);

        return node;
    }

    // 渲染节点
    function renderNode(node) {
        const canvas = document.getElementById('editorCanvas');
        const nodeEl = document.createElement('div');

        nodeEl.id = node.id;
        nodeEl.className = 'flow-node';
        nodeEl.style.left = `${node.position.left}px`;
        nodeEl.style.top = `${node.position.top}px`;

        // 添加节点类型特定的类
        nodeEl.classList.add(`${node.type}`);

        // 渲染节点内容
        renderNodeContent(nodeEl, node);

        // 添加到画布
        canvas.appendChild(nodeEl);

        // 配置节点可拖动
        jsPlumbInstance.draggable(nodeEl, {
            grid: [10, 10],
            containment: 'parent',
            stop: function(event) {
                // 更新节点位置
                node.position = {
                    left: parseInt(nodeEl.style.left, 10),
                    top: parseInt(nodeEl.style.top, 10)
                };
            }
        });

        // 添加节点点击事件
        nodeEl.addEventListener('click', function(e) {
            e.stopPropagation();
            selectNode(node.id);
        });

        // 双击打开属性面板
        nodeEl.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            showPropertiesPanel();
        });

        // 添加连接端点
        addEndpoints(node);
    }

    // 渲染节点内容
    function renderNodeContent(nodeEl, node) {
        const nodeType = nodeTypes[node.type];

        // 创建节点头部和内容
        nodeEl.innerHTML = `
            <div class="flow-node-header">
                <span>${node.data.title}</span>
                <i class="fas ${nodeType.icon}"></i>
            </div>
            <div class="flow-node-body">
                ${node.data.description}
            </div>
        `;
    }

    // 添加连接点
    function addEndpoints(node) {
        const nodeEl = document.getElementById(node.id);

        // 添加输入端点
        node.inputs.forEach((input, index) => {
            // 计算端点位置（均匀分布）
            const y = (index + 1) * (100 / (node.inputs.length + 1));

            // 创建端点
            jsPlumbInstance.addEndpoint(nodeEl, {
                uuid: `${node.id}_in_${input.id}`,
                anchor: [0, y / 100, -1, 0],
                isTarget: true,
                maxConnections: -1,
                endpoint: "Dot",
                paintStyle: { 
                    fill: "#4a90e2",
                    radius: 5
                },
                hoverPaintStyle: {
                    fill: "#5ca1fd"
                }
            });

            // 添加视觉提示
            const handle = document.createElement('div');
            handle.className = 'node-handle input';
            handle.style.top = `${y}%`;
            handle.setAttribute('title', input.name);
            nodeEl.appendChild(handle);
        });

        // 添加输出端点
        node.outputs.forEach((output, index) => {
            // 计算端点位置（均匀分布）
            const y = (index + 1) * (100 / (node.outputs.length + 1));

            // 创建端点
            jsPlumbInstance.addEndpoint(nodeEl, {
                uuid: `${node.id}_out_${output.id}`,
                anchor: [1, y / 100, 1, 0],
                isSource: true,
                maxConnections: -1,
                endpoint: "Dot",
                paintStyle: { 
                    fill: "#e24a4a",
                    radius: 5
                },
                hoverPaintStyle: {
                    fill: "#f56c6c"
                }
            });

            // 添加视觉提示
            const handle = document.createElement('div');
            handle.className = 'node-handle output';
            handle.style.top = `${y}%`;
            handle.setAttribute('title', output.name);
            nodeEl.appendChild(handle);
        });
    }

    // 选择节点
    function selectNode(nodeId) {
        // 取消之前的选择
        if (editorState.selectedNodeId) {
            const prevEl = document.getElementById(editorState.selectedNodeId);
            if (prevEl) prevEl.classList.remove('selected');
        }

        // 更新选择状态
        editorState.selectedNodeId = nodeId;

        // 高亮选中的节点
        if (nodeId) {
            const nodeEl = document.getElementById(nodeId);
            if (nodeEl) {
                nodeEl.classList.add('selected');
                updatePropertyForm(editorState.nodes[nodeId]);
            }
        }
    }

    // 更新属性表单
    function updatePropertyForm(node) {
        const propertyForm = document.getElementById('propertyForm');
        propertyForm.innerHTML = '';

        if (!node) return;

        // 创建属性表单
        const properties = [
            { id: 'title', name: '标题', type: 'text', value: node.data.title },
            { id: 'description', name: '描述', type: 'textarea', value: node.data.description }
        ];

        properties.forEach(prop => {
            const formGroup = document.createElement('div');
            formGroup.className = 'property-group';

            const label = document.createElement('label');
            label.textContent = prop.name;
            label.setAttribute('for', `property_${prop.id}`);
            formGroup.appendChild(label);

            let input;

            switch (prop.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.rows = 3;
                    break;
                default:
                    input = document.createElement('input');
                    input.type = prop.type || 'text';
            }

            input.id = `property_${prop.id}`;
            input.name = prop.id;
            input.value = prop.value;

            input.addEventListener('change', function() {
                const value = this.value;
                node.data[prop.id] = value;

                // 更新节点显示
                const nodeEl = document.getElementById(node.id);
                renderNodeContent(nodeEl, node);
            });

            formGroup.appendChild(input);
            propertyForm.appendChild(formGroup);
        });

        // 添加删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = '删除节点';
        deleteBtn.addEventListener('click', function() {
            if (confirm('确定要删除该节点吗？')) {
                deleteNode(node.id);
                closePropertiesPanel();
            }
        });

        propertyForm.appendChild(deleteBtn);
    }

    // 删除节点
    function deleteNode(nodeId) {
        const node = editorState.nodes[nodeId];
        if (!node) return;

        // 如果是开始节点，更新状态
        if (node.type === 'flow-start') {
            editorState.hasStartNode = false;
            editorState.startNodeId = null;
        }

        // 移除所有连接和端点
        jsPlumbInstance.remove(nodeId);

        // 从状态中删除节点
        delete editorState.nodes[nodeId];

        // 如果删除的是选中的节点，取消选择
        if (editorState.selectedNodeId === nodeId) {
            editorState.selectedNodeId = null;
        }
    }

    // 保存流程
    function saveFlow() {
        // 验证流程
        if (!validateFlow()) return;

        // 获取流程名称
        const flowName = prompt('请输入流程名称', 'my_flow');
        if (!flowName) return; // 用户取消

        const flowData = {
            name: flowName,
            nodes: Object.values(editorState.nodes).map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: node.data
            })),
            connections: jsPlumbInstance.getConnections().map(conn => ({
                sourceId: conn.sourceId,
                targetId: conn.targetId,
                sourceEndpoint: conn.endpoints[0].getUuid(),
                targetEndpoint: conn.endpoints[1].getUuid()
            }))
        };

        // 发送保存请求
        fetch('/api/save_flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flowData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
            } else {
                alert(`保存失败: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('保存流程失败:', error);
            alert('保存失败，请稍后重试');
        });
    }

    // 验证流程
    function validateFlow() {
        // 检查是否有开始节点
        if (!editorState.hasStartNode) {
            alert('流程必须包含一个开始节点');
            return false;
        }

        // 检查是否有结束节点
        let hasEndNode = false;
        for (const nodeId in editorState.nodes) {
            if (editorState.nodes[nodeId].type === 'flow-end') {
                hasEndNode = true;
                break;
            }
        }

        if (!hasEndNode) {
            alert('流程必须至少包含一个结束节点');
            return false;
        }

        return true;
    }

    // 加载流程
    function loadFlow() {
        fetch('/api/list_flows')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.flows.length > 0) {
                // 显示流程列表
                const flowName = prompt(`请选择要加载的流程：\n${data.flows.join(', ')}`, data.flows[0]);
                if (!flowName) return; // 用户取消

                // 加载选定的流程
                fetch(`/api/load_flow/${flowName}`)
                .then(response => response.json())
                .then(flowData => {
                    if (flowData.status === 'success') {
                        // 清除当前画布
                        clearCanvas();

                        // 加载流程数据
                        renderFlow(flowData.data);
                    } else {
                        alert(`加载失败: ${flowData.message}`);
                    }
                })
                .catch(error => {
                    console.error('加载流程失败:', error);
                    alert('加载失败，请稍后重试');
                });
            } else {
                alert('没有保存的流程');
            }
        })
        .catch(error => {
            console.error('获取流程列表失败:', error);
            alert('获取流程列表失败，请稍后重试');
        });
    }

    // 渲染加载的流程
    function renderFlow(flowData) {
        // 先创建所有节点
        flowData.nodes.forEach(nodeData => {
            const node = {
                id: nodeData.id,
                type: nodeData.type,
                position: nodeData.position,
                data: nodeData.data,
                inputs: nodeTypes[nodeData.type].inputs,
                outputs: nodeTypes[nodeData.type].outputs
            };

            // 如果是开始节点，更新状态
            if (node.type === 'flow-start') {
                editorState.hasStartNode = true;
                editorState.startNodeId = node.id;
            }

            // 更新节点ID计数器
            const idNum = parseInt(nodeData.id.split('_')[1], 10);
            if (idNum >= editorState.nextNodeId) {
                editorState.nextNodeId = idNum + 1;
            }

            // 保存节点
            editorState.nodes[node.id] = node;

            // 渲染节点
            renderNode(node);
        });

        // 然后创建连接
        setTimeout(() => {
            flowData.connections.forEach(conn => {
                jsPlumbInstance.connect({
                    uuids: [conn.sourceEndpoint, conn.targetEndpoint]
                });
            });

            // 调整视图以显示所有节点
            centerAllNodes();
        }, 100);
    }

    // 导出流程为JSON文件
    function exportFlow() {
        // 验证流程
        if (!validateFlow()) return;

        const flowData = {
            nodes: Object.values(editorState.nodes).map(node => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: node.data
            })),
            connections: jsPlumbInstance.getConnections().map(conn => ({
                sourceId: conn.sourceId,
                targetId: conn.targetId,
                sourceEndpoint: conn.endpoints[0].getUuid(),
                targetEndpoint: conn.endpoints[1].getUuid()
            }))
        };

        // 创建下载链接
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flowData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "flow.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    // 处理窗口大小变化
    function handleWindowResize() {
        // 先调整画布宽度
        adjustCanvasWidth();
        
        // 然后重新居中
        if (Object.keys(editorState.nodes).length > 0) {
            centerAllNodes();
        } else {
            centerViewToCanvasCenter();
        }
        
        // 重绘连接线
        jsPlumbInstance.repaintEverything();
    }
    
    // 调整画布宽度以占满整个屏幕
    function adjustCanvasWidth() {
        const root = document.getElementById('editor-root');
        const container = document.querySelector('.editor-container');
        const workspace = document.getElementById('editorWorkspace');
        
        // 获取视窗宽度并应用
        const viewportWidth = window.innerWidth;
        
        // 设置宽度
        root.style.width = viewportWidth + 'px';
        container.style.width = viewportWidth + 'px';
        workspace.style.width = viewportWidth + 'px';
        
        // 修复可能由于滚动条导致的问题
        document.body.style.overflow = 'hidden';
    }

    // 启动编辑器
    initEditor();
});
