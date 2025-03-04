/**
 * OmniFlow流程编辑器IO模块
 * 负责保存、加载和执行流程
 */

import { FlowCore } from './core.js';
import { FlowNodes } from './nodes.js';
import { FlowUI } from './ui.js';
import { FlowConnections } from './connections.js';

export const FlowIO = {
    /**
     * 初始化IO模块
     */
    init() {
        console.log('初始化流程编辑器IO模块');
        return this;
    },
    
    /**
     * 清空流程画布
     */
    clearCanvas() {
        const nodesContainer = document.getElementById('nodesContainer');
        if (nodesContainer) {
            nodesContainer.innerHTML = '';
        }
        
        const connectionsContainer = document.getElementById('connectionsContainer');
        if (connectionsContainer) {
            connectionsContainer.innerHTML = '';
            // 重新创建临时连接线
            FlowConnections.createTempConnectionLine();
        }
        
        FlowNodes.updateNodeCount();
        FlowConnections.updateConnectionCount();
        
        // 重置流程名输入框
        const flowNameInput = document.getElementById('flowName');
        if (flowNameInput) {
            flowNameInput.value = '';
        }
    },
    
    /**
     * 保存流程
     */
    saveFlow() {
        const flowName = document.getElementById('saveFlowName').value;
        const flowDesc = document.getElementById('saveFlowDesc')?.value || '';
        const saveAsNew = document.getElementById('saveAsNew')?.checked || false;
        
        if (!flowName) {
            alert('请输入流程名称');
            return;
        }
        
        FlowCore.state.flowName = flowName;
        
        // 准备流程数据
        const flowData = {
            name: flowName,
            description: flowDesc,
            nodes: FlowCore.state.nodes,
            connections: FlowCore.state.connections,
            saveAsNew: saveAsNew,
            flowId: saveAsNew ? null : FlowCore.state.flowId
        };
        
        // 发送保存请求
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
                // 更新流程ID
                FlowCore.state.flowId = data.flowId;
                
                // 更新流程名输入框
                document.getElementById('flowName').value = flowName;
                
                // 关闭模态框
                const modal = bootstrap.Modal.getInstance(document.getElementById('saveFlowModal'));
                modal.hide();
                
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
                    this.importFlow(data.flow);
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
     * 根据ID加载流程
     */
    loadFlowById(flowId) {
        fetch(`/api/load-flow?flowId=${encodeURIComponent(flowId)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.importFlow(data.flow);
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
     * 导入流程数据到编辑器
     */
    importFlow(flowData) {
        // 清空当前流程
        FlowCore.resetState();
        this.clearCanvas();
        
        // 设置流程基本信息
        FlowCore.state.flowName = flowData.name;
        FlowCore.state.flowId = flowData.flowId;
        document.getElementById('flowName').value = flowData.name;
        
        // 设置最大节点ID
        if (flowData.nodes.length > 0) {
            const maxId = Math.max(...flowData.nodes.map(n => n.id));
            FlowCore.state.nextNodeId = maxId + 1;
        }
        
        // 导入节点
        flowData.nodes.forEach(nodeData => {
            // 创建新节点并更新其位置和数据
            const node = FlowNodes.createNode(nodeData.type);
            
            // 更新节点在DOM中的位置
            node.style.left = `${nodeData.position.x}px`;
            node.style.top = `${nodeData.position.y}px`;
            
            // 更新节点标题
            node.querySelector('.node-title').textContent = nodeData.name;
            
            // 更新节点数据
            const nodeIndex = FlowCore.state.nodes.findIndex(n => n.id === parseInt(node.getAttribute('data-node-id')));
            if (nodeIndex >= 0) {
                FlowCore.state.nodes[nodeIndex] = {
                    ...FlowCore.state.nodes[nodeIndex],
                    name: nodeData.name,
                    position: nodeData.position,
                    data: nodeData.data || {}
                };
            }
        });
        
        // 重新创建连接
        flowData.connections.forEach(connData => {
            // 找到源节点和目标节点
            const fromNode = document.querySelector(`.node[data-node-id="${connData.fromNodeId}"]`);
            const toNode = document.querySelector(`.node[data-node-id="${connData.toNodeId}"]`);
            
            if (fromNode && toNode) {
                // 获取对应的连接点
                const fromHandle = fromNode.querySelector(`.handle-output[data-handle-index="${connData.fromHandleIndex}"]`);
                const toHandle = toNode.querySelector(`.handle-input[data-handle-index="${connData.toHandleIndex}"]`);
                
                if (fromHandle && toHandle) {
                    // 创建连接
                    FlowConnections.createConnection(fromHandle, toHandle);
                }
            }
        });
        
        // 更新统计数据
        FlowNodes.updateNodeCount();
        FlowConnections.updateConnectionCount();
        
        // 适应视图
        setTimeout(() => {
            FlowCore.fitContent();
        }, 100);
    },
    
    /**
     * 准备流程执行
     */
    prepareFlowExecution() {
        // 找到所有输入节点
        const inputNodes = FlowCore.state.nodes.filter(node => node.type === 'input');
        
        // 准备输入表单
        const inputFields = document.getElementById('flowInputFields');
        if (!inputFields) return;
        
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
        const resultArea = document.getElementById('flowExecutionResult');
        if (resultArea) {
            resultArea.innerHTML = '<div class="text-center text-muted">请点击"执行"按钮运行流程</div>';
        }
        
        // 隐藏进度条
        const progressBar = document.getElementById('executionProgress');
        if (progressBar) {
            progressBar.classList.add('d-none');
        }
    },
    
    /**
     * 开始流程执行
     */
    startFlowExecution() {
        if (FlowCore.state.isExecuting) return;
        FlowCore.state.isExecuting = true;
        
        // 显示进度条
        const progressBar = document.getElementById('executionProgress');
        if (progressBar) {
            progressBar.classList.remove('d-none');
            progressBar.querySelector('.progress-bar').style.width = '0%';
        }
        
        // 收集输入数据
        const inputData = {};
        const inputNodes = FlowCore.state.nodes.filter(node => node.type === 'input');
        
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
            flowId: FlowCore.state.flowId,
            name: FlowCore.state.flowName,
            nodes: FlowCore.state.nodes,
            connections: FlowCore.state.connections,
            input: inputData
        };
        
        // 更新进度动画
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 90) clearInterval(progressInterval);
            if (progressBar) {
                progressBar.querySelector('.progress-bar').style.width = `${progress}%`;
            }
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
            if (progressBar) {
                progressBar.querySelector('.progress-bar').style.width = '100%';
            }
            
            setTimeout(() => {
                if (progressBar) {
                    progressBar.classList.add('d-none');
                }
                FlowCore.state.isExecuting = false;
                
                if (data.status === 'success') {
                    this.displayExecutionResult(data);
                } else {
                    const resultArea = document.getElementById('flowExecutionResult');
                    if (resultArea) {
                        resultArea.innerHTML = `
                            <div class="alert alert-danger">
                                <h5>执行失败</h5>
                                <p>${data.message || '未知错误'}</p>
                            </div>
                        `;
                    }
                }
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            if (progressBar) {
                progressBar.classList.add('d-none');
            }
            FlowCore.state.isExecuting = false;
            
            console.error('执行流程出错:', error);
            const resultArea = document.getElementById('flowExecutionResult');
            if (resultArea) {
                resultArea.innerHTML = `
                    <div class="alert alert-danger">
                        <h5>执行出错</h5>
                        <p>${error.message || '网络错误或服务器异常'}</p>
                    </div>
                `;
            }
        });
    },
    
    /**
     * 显示执行结果
     */
    displayExecutionResult(data) {
        const resultContainer = document.getElementById('flowExecutionResult');
        if (!resultContainer) return;
        
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
        if (FlowCore.state.nodes.length === 0) {
            issues.push('流程中没有任何节点');
            FlowUI.showValidationResult(issues);
            return;
        }
        
        // 检查是否有名称
        if (!FlowCore.state.flowName) {
            issues.push('流程没有命名');
        }
        
        // 检查输入节点
        const inputNodes = FlowCore.state.nodes.filter(node => node.type === 'input');
        if (inputNodes.length === 0) {
            issues.push('流程中没有输入节点，可能无法启动流程');
        }
        
        // 检查输出节点
        const outputNodes = FlowCore.state.nodes.filter(node => node.type === 'output');
        if (outputNodes.length === 0) {
            issues.push('流程中没有输出节点，可能无法产生结果');
        }
        
        // 检查未连接的节点
        FlowCore.state.nodes.forEach(node => {
            // 跳过输入节点，它们不需要输入连接
            if (node.type === 'input') return;
            
            // 检查节点是否有输入连接
            const hasInputConnection = FlowCore.state.connections.some(conn => conn.toNodeId === node.id);
            if (!hasInputConnection) {
                issues.push(`节点 "${node.name}" 没有输入连接，这可能导致它无法接收数据`);
            }
            
            // 对于非输出节点，检查是否有输出连接
            if (node.type !== 'output') {
                const hasOutputConnection = FlowCore.state.connections.some(conn => conn.fromNodeId === node.id);
                if (!hasOutputConnection) {
                    issues.push(`节点 "${node.name}" 没有输出连接，这可能导致流程中断`);
                }
            }
        });
        
        // 显示验证结果
        FlowUI.showValidationResult(issues);
    },
    
    /**
     * 执行流程
     */
    executeFlow() {
        const modal = new bootstrap.Modal(document.getElementById('executeFlowModal'));
        modal.show();
    }
};
