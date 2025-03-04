/**
 * OmniFlow流程编辑器工具模块
 * 提供通用工具函数
 */

export const FlowUtils = {
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * 深拷贝对象
     * @param {Object} obj 需要深拷贝的对象
     * @returns {Object} 拷贝后的新对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // 处理日期
        if (obj instanceof Date) {
            return new Date(obj);
        }
        
        // 处理数组
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        // 处理对象
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        
        return clonedObj;
    },
    
    /**
     * 从硬编码的字符串中提取JSON
     * @param {string} str 包含JSON的字符串
     * @returns {Object|null} 解析后的JSON对象，或null（如果解析失败）
     */
    extractJSON(str) {
        try {
            // 尝试找到JSON字符串的开始和结束位置
            const start = str.indexOf('{');
            const end = str.lastIndexOf('}') + 1;
            
            if (start >= 0 && end > start) {
                const jsonStr = str.substring(start, end);
                return JSON.parse(jsonStr);
            }
            
            // 如果前面的方法失败，尝试解析整个字符串
            return JSON.parse(str);
        } catch (e) {
            console.error('解析JSON失败:', e);
            return null;
        }
    },
    
    /**
     * 格式化日期时间
     * @param {Date|string} date 日期对象或日期字符串
     * @param {string} format 格式化字符串，例如 'YYYY-MM-DD HH:mm:ss'
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        
        const pad = (num) => String(num).padStart(2, '0');
        
        const replacements = {
            'YYYY': d.getFullYear(),
            'MM': pad(d.getMonth() + 1),
            'DD': pad(d.getDate()),
            'HH': pad(d.getHours()),
            'mm': pad(d.getMinutes()),
            'ss': pad(d.getSeconds()),
        };
        
        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
    },
    
    /**
     * 防抖函数
     * @param {Function} func 要执行的函数
     * @param {number} wait 等待时间（毫秒）
     * @returns {Function} 防抖处理后的函数
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * 节流函数
     * @param {Function} func 要执行的函数
     * @param {number} limit 限制时间（毫秒）
     * @returns {Function} 节流处理后的函数
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * 计算两点之间的距离
     * @param {Object} point1 点1，格式为 {x: number, y: number}
     * @param {Object} point2 点2，格式为 {x: number, y: number}
     * @returns {number} 两点之间的距离
     */
    distance(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    },
    
    /**
     * 解析URL参数
     * @returns {Object} 包含URL参数的对象
     */
    parseURLParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const pairs = queryString.split('&');
        
        for (const pair of pairs) {
            if (pair === '') continue;
            const keyValue = pair.split('=');
            params[decodeURIComponent(keyValue[0])] = keyValue[1] ? 
                decodeURIComponent(keyValue[1].replace(/\+/g, ' ')) : '';
        }
        
        return params;
    },
    
    /**
     * 将数据下载为文件
     * @param {Object} data 要下载的数据
     * @param {string} filename 文件名
     * @param {string} type 文件类型，例如 'application/json'
     */
    downloadAsFile(data, filename, type = 'application/json') {
        let content;
        
        if (typeof data === 'object') {
            content = JSON.stringify(data, null, 2);
        } else {
            content = String(data);
        }
        
        const blob = new Blob([content], { type });
        const link = document.createElement('a');
        link.download = filename;
        link.href = window.URL.createObjectURL(blob);
        link.click();
        window.URL.revokeObjectURL(link.href);
    },
    
    /**
     * 计算节点布局
     * 自动排列节点位置以提高可读性
     * @param {Array} nodes 节点数组
     * @param {Array} connections 连接数组
     * @returns {Object} 包含新节点位置的对象
     */
    autoLayout(nodes, connections) {
        if (!nodes || nodes.length === 0) return {};
        
        // 找出输入节点和输出节点
        const inputNodes = nodes.filter(n => n.type === 'input');
        const outputNodes = nodes.filter(n => n.type === 'output');
        
        // 计算布局层级
        const nodeMap = {};
        const nodeLevels = {};
        
        // 创建节点映射
        nodes.forEach(node => {
            nodeMap[node.id] = node;
            
            // 输入节点初始化为第0层
            if (node.type === 'input') {
                nodeLevels[node.id] = 0;
            }
        });
        
        // 计算每个节点的层级
        let changed = true;
        while (changed) {
            changed = false;
            
            // 遍历所有连接，从源节点推导目标节点层级
            connections.forEach(conn => {
                if (nodeLevels[conn.fromNodeId] !== undefined) {
                    const targetLevel = nodeLevels[conn.toNodeId];
                    const suggestedLevel = nodeLevels[conn.fromNodeId] + 1;
                    
                    if (targetLevel === undefined || targetLevel < suggestedLevel) {
                        nodeLevels[conn.toNodeId] = suggestedLevel;
                        changed = true;
                    }
                }
            });
        }
        
        // 找出最大层级
        let maxLevel = 0;
        Object.values(nodeLevels).forEach(level => {
            if (level > maxLevel) maxLevel = level;
        });
        
        // 将输出节点都放在最后一层
        outputNodes.forEach(node => {
            nodeLevels[node.id] = maxLevel + 1;
        });
        
        // 计算每层节点数量
        const levelsCount = {};
        Object.values(nodeLevels).forEach(level => {
            levelsCount[level] = (levelsCount[level] || 0) + 1;
        });
        
        // 计算每层节点位置
        const newPositions = {};
        const levelHeight = 150;  // 每层高度
        const nodeWidth = 180;    // 节点宽度估计值
        const nodePadding = 40;   // 节点间隔
        
        // 按层级排列节点
        Object.keys(nodeLevels).forEach(nodeIdStr => {
            const nodeId = parseInt(nodeIdStr);
            const level = nodeLevels[nodeId];
            const nodesInLevel = levelsCount[level] || 1;
            
            // 找出该层中这个节点是第几个
            const nodesInSameLevel = nodes.filter(n => nodeLevels[n.id] === level);
            const indexInLevel = nodesInSameLevel.findIndex(n => n.id === nodeId);
            
            // 计算水平位置
            const levelWidth = (nodeWidth + nodePadding) * nodesInLevel - nodePadding;
            const x = (indexInLevel * (nodeWidth + nodePadding)) + ((window.innerWidth - levelWidth) / 2);
            
            // 计算垂直位置
            const y = level * levelHeight + 50;
            
            // 存储新位置
            newPositions[nodeId] = { x, y };
        });
        
        return newPositions;
    },
    
    /**
     * 将流程图导出为PNG图像
     * @param {HTMLElement} canvas 流程画布元素
     * @param {Object} options 导出选项
     * @returns {Promise<Blob>} 返回图像Blob对象的Promise
     */
    exportAsPNG(canvas, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const { width, height } = canvas.getBoundingClientRect();
                const scale = options.scale || 1;
                
                // 创建一个新的canvas用于导出
                const exportCanvas = document.createElement('canvas');
                exportCanvas.width = width * scale;
                exportCanvas.height = height * scale;
                const ctx = exportCanvas.getContext('2d');
                
                // 设置背景色
                ctx.fillStyle = options.backgroundColor || '#f8f9fa';
                ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
                
                // 绘制网格背景
                if (options.includeGrid !== false) {
                    ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
                    ctx.lineWidth = 1;
                    
                    const gridSize = 20 * scale;
                    
                    // 绘制竖线
                    for (let x = gridSize; x < exportCanvas.width; x += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, exportCanvas.height);
                        ctx.stroke();
                    }
                    
                    // 绘制横线
                    for (let y = gridSize; y < exportCanvas.height; y += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(exportCanvas.width, y);
                        ctx.stroke();
                    }
                }
                
                // 将html2canvas库应用到流程画布的实际内容
                // 注意：这里需要一个额外的库html2canvas，实际应用中需要引入
                if (window.html2canvas) {
                    window.html2canvas(canvas, {
                        scale: scale,
                        backgroundColor: null, // 透明背景，因为我们已经绘制了背景
                        logging: false,
                        ignoreElements: el => el.id === 'tempConnectionLine' // 忽略临时连接线
                    }).then(contentCanvas => {
                        // 将内容画布绘制到导出画布
                        ctx.drawImage(contentCanvas, 0, 0);
                        
                        // 转换为Blob并返回
                        exportCanvas.toBlob(blob => {
                            resolve(blob);
                        }, 'image/png');
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject(new Error('html2canvas库未加载'));
                }
            } catch (error) {
                reject(error);
            }
        });
    },
    
    /**
     * 从JSON文件导入流程图
     * @param {File} file JSON文件对象
     * @returns {Promise<Object>} 返回解析后的流程数据
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('无效的JSON格式'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    },
    
    /**
     * 生成流程图的统计信息
     * @param {Array} nodes 节点数组
     * @param {Array} connections 连接数组
     * @returns {Object} 统计信息对象
     */
    generateFlowStats(nodes, connections) {
        if (!nodes) return {};
        
        const stats = {
            nodeCount: nodes.length,
            connectionCount: connections.length,
            nodeTypes: {},
            inputNodes: nodes.filter(n => n.type === 'input').length,
            outputNodes: nodes.filter(n => n.type === 'output').length,
            isolatedNodes: 0, // 没有连接的节点
            maxPathLength: 0, // 最长路径长度
        };
        
        // 统计节点类型
        nodes.forEach(node => {
            stats.nodeTypes[node.type] = (stats.nodeTypes[node.type] || 0) + 1;
        });
        
        // 计算没有连接的节点
        const connectedNodeIds = new Set();
        connections.forEach(conn => {
            connectedNodeIds.add(conn.fromNodeId);
            connectedNodeIds.add(conn.toNodeId);
        });
        stats.isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id)).length;
        
        // 计算最长路径长度
        if (nodes.length > 0 && connections.length > 0) {
            // 创建邻接表
            const adjacencyList = {};
            nodes.forEach(node => {
                adjacencyList[node.id] = [];
            });
            
            connections.forEach(conn => {
                if (adjacencyList[conn.fromNodeId]) {
                    adjacencyList[conn.fromNodeId].push(conn.toNodeId);
                }
            });
            
            // 从输入节点开始DFS搜索最长路径
            const inputNodeIds = nodes.filter(n => n.type === 'input').map(n => n.id);
            
            if (inputNodeIds.length > 0) {
                const visited = new Set();
                
                const dfs = (nodeId, depth) => {
                    if (visited.has(nodeId)) return depth;
                    visited.add(nodeId);
                    
                    let maxDepth = depth;
                    (adjacencyList[nodeId] || []).forEach(nextNodeId => {
                        const newDepth = dfs(nextNodeId, depth + 1);
                        maxDepth = Math.max(maxDepth, newDepth);
                    });
                    
                    visited.delete(nodeId); // 回溯
                    return maxDepth;
                };
                
                inputNodeIds.forEach(nodeId => {
                    const pathLength = dfs(nodeId, 0);
                    stats.maxPathLength = Math.max(stats.maxPathLength, pathLength);
                });
            }
        }
        
        return stats;
    }
};
