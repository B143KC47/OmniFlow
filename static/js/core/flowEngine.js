class FlowEngine {
    constructor(editor) {
        this.editor = editor;
        this.running = false;
        this.variables = new Map();
        this.currentNode = null;
        this.executionPath = [];
        this.nodeStates = new Map();
        this.apiKey = localStorage.getItem('apiKey') || '';
    }
    
    async start() {
        if (this.running) return;
        
        this.running = true;
        this.variables.clear();
        this.executionPath = [];
        this.nodeStates.clear();
        
        try {
            // 查找开始节点
            const startNode = this.findStartNode();
            if (!startNode) {
                throw new Error('找不到Flow开始节点');
            }
            
            // 开始执行
            await this.executeNode(startNode.id);
            
            this.emit('flow:completed', {
                success: true,
                path: this.executionPath
            });
        } catch (error) {
            this.emit('flow:error', {
                error: error.message,
                node: this.currentNode
            });
        } finally {
            this.running = false;
        }
    }
    
    async executeNode(nodeId) {
        const node = this.editor.getNodeFromId(nodeId);
        if (!node) return null;
        
        this.currentNode = node;
        this.executionPath.push(nodeId);
        
        // 更新节点状态为执行中
        this.setNodeState(nodeId, 'executing');
        
        try {
            const result = await this.executeNodeLogic(node);
            
            // 更新节点状态为执行成功
            this.setNodeState(nodeId, 'executed-success');
            
            // 处理后续节点
            if (result !== null) {
                const connections = this.editor.getConnections(nodeId);
                for (const conn of connections) {
                    if (this.shouldFollowConnection(conn, result)) {
                        await this.executeNode(conn.node_in);
                    }
                }
            }
            
            return result;
        } catch (error) {
            // 更新节点状态为执行失败
            this.setNodeState(nodeId, 'executed-error');
            throw error;
        }
    }
    
    async executeNodeLogic(node) {
        switch (node.name) {
            case 'flowStart':
                return true;
                
            case 'flowEnd':
                return null;
                
            case 'llmResponse':
                return await this.executeLLMNode(node);
                
            case 'webSearch':
                return await this.executeWebSearchNode(node);
                
            case 'userInput':
                return await this.executeUserInputNode(node);
                
            case 'textOutput':
                return await this.executeTextOutputNode(node);
                
            case 'thinkOutput':
                return await this.executeThinkOutputNode(node);
                
            case 'condition':
                return await this.executeConditionNode(node);
                
            case 'switch':
                return await this.executeSwitchNode(node);
                
            case 'variable':
                return await this.executeVariableNode(node);
                
            default:
                throw new Error(`未知的节点类型: ${node.name}`);
        }
    }
    
    async executeLLMNode(node) {
        const input = this.getNodeInput(node);
        const { systemPrompt, prompt, model, temperature } = node.data;
        
        // 发送API请求
        const response = await this.callLLMAPI({
            model,
            temperature,
            systemPrompt,
            prompt,
            input
        });
        
        return response;
    }
    
    async executeWebSearchNode(node) {
        const input = this.getNodeInput(node);
        const { searchEngine, resultCount } = node.data;
        
        // 执行搜索
        const results = await this.performWebSearch(input, searchEngine, resultCount);
        return results;
    }
    
    async executeUserInputNode(node) {
        const { promptMessage } = node.data;
        
        // 显示输入提示并等待用户输入
        return new Promise((resolve) => {
            this.emit('input:required', {
                message: promptMessage,
                callback: (input) => resolve(input)
            });
        });
    }
    
    async executeTextOutputNode(node) {
        const input = this.getNodeInput(node);
        const { staticText } = node.data;
        
        const outputText = staticText || input;
        
        // 显示输出
        this.emit('output:text', outputText);
        return outputText;
    }
    
    async executeThinkOutputNode(node) {
        const input = this.getNodeInput(node);
        const { thinkContent } = node.data;
        
        const outputText = thinkContent || input;
        
        // 显示思考输出
        this.emit('output:think', outputText);
        return outputText;
    }
    
    async executeConditionNode(node) {
        const input = this.getNodeInput(node);
        const { conditionExpr } = node.data;
        
        // 执行条件表达式
        const result = this.evaluateCondition(input, conditionExpr);
        return result;
    }
    
    async executeSwitchNode(node) {
        const input = this.getNodeInput(node);
        const { cases } = node.data;
        
        // 查找匹配的情况
        const caseIndex = cases.indexOf(input);
        return caseIndex >= 0 ? caseIndex : cases.length - 1;
    }
    
    async executeVariableNode(node) {
        const input = this.getNodeInput(node);
        const { variableName, defaultValue } = node.data;
        
        // 设置变量值
        this.variables.set(variableName, input || defaultValue);
        return input || defaultValue;
    }
    
    // 辅助方法
    getNodeInput(node) {
        const inputConnections = this.editor.getConnections().filter(
            conn => conn.node_in === node.id
        );
        
        if (inputConnections.length === 0) return null;
        
        const sourceNode = this.editor.getNodeFromId(inputConnections[0].node_out);
        return sourceNode ? sourceNode.data.output : null;
    }
    
    shouldFollowConnection(connection, result) {
        const sourceNode = this.editor.getNodeFromId(connection.node_out);
        if (!sourceNode) return false;
        
        switch (sourceNode.name) {
            case 'condition':
                return connection.output_index === (result ? 0 : 1);
            case 'switch':
                return connection.output_index === result;
            default:
                return true;
        }
    }
    
    setNodeState(nodeId, state) {
        const element = document.getElementById(`node-${nodeId}`);
        if (element) {
            // 先清除所有状态类
            element.classList.remove('executing', 'executed-success', 'executed-error');
            
            // 应用新状态
            if (state) {
                element.classList.add(state);
            }
            
            // 记录状态
            this.nodeStates.set(nodeId, state);
        }
    }
    
    findStartNode() {
        const nodes = this.editor.export().drawflow.Home.data;
        for (const nodeId in nodes) {
            const node = nodes[nodeId];
            if (node.name === 'flowStart') {
                return this.editor.getNodeFromId(nodeId);
            }
        }
        return null;
    }
    
    evaluateCondition(input, expr) {
        // 安全的条件表达式执行
        try {
            // 将输入变量放入作用域
            const 输入 = input;
            
            // 为变量提供访问
            const variables = {};
            this.variables.forEach((value, key) => {
                variables[key] = value;
            });
            
            // 使用间接的方式执行表达式，避免全局作用域污染
            const result = new Function('输入', 'variables', `return ${expr}`)(输入, variables);
            return Boolean(result);
        } catch (error) {
            console.error('条件表达式执行错误:', error);
            return false;
        }
    }
    
    async callLLMAPI(params) {
        if (!this.apiKey) {
            throw new Error('API密钥未设置，请在设置中添加您的API密钥');
        }
        
        this.emit('log:info', `正在调用LLM API (${params.model})...`);
        
        try {
            // 构建请求体
            const systemMessage = params.systemPrompt ? { role: "system", content: params.systemPrompt } : null;
            const userContent = params.input ? 
                (params.prompt ? `${params.prompt}\n\n${params.input}` : params.input) : 
                params.prompt;
                
            const messages = [
                ...(systemMessage ? [systemMessage] : []),
                { role: "user", content: userContent }
            ];
            
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: params.model,
                    messages: messages,
                    temperature: params.temperature
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`API错误: ${error.message || response.statusText}`);
            }
            
            const data = await response.json();
            this.emit('log:success', '成功获取LLM响应');
            return data.choices[0].message.content;
        } catch (error) {
            this.emit('log:error', `LLM API错误: ${error.message}`);
            throw error;
        }
    }
    
    async performWebSearch(query, searchEngine, resultCount) {
        if (!query) {
            return "无搜索关键词";
        }
        
        this.emit('log:info', `正在使用${searchEngine}搜索: "${query}"...`);
        
        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    engine: searchEngine,
                    resultCount
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`搜索错误: ${error.message || response.statusText}`);
            }
            
            const data = await response.json();
            this.emit('log:success', `成功获取${data.results.length}条搜索结果`);
            return this.formatSearchResults(data.results);
        } catch (error) {
            this.emit('log:error', `搜索错误: ${error.message}`);
            throw error;
        }
    }
    
    formatSearchResults(results) {
        let formatted = "搜索结果:\n\n";
        results.forEach((result, index) => {
            formatted += `${index + 1}. ${result.title}\n`;
            formatted += `   ${result.url}\n`;
            formatted += `   ${result.snippet}\n\n`;
        });
        return formatted;
    }
    
    // 事件系统
    emit(event, data) {
        const customEvent = new CustomEvent(event, { detail: data });
        document.dispatchEvent(customEvent);
    }
    
    on(event, callback) {
        document.addEventListener(event, (e) => callback(e.detail));
    }
}