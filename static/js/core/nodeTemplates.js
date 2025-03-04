const nodeTemplates = {
    // ...之前的节点模板代码...
};

// 节点类型名称映射
const nodeTypeNames = {
    flowStart: 'Flow开始',
    flowEnd: 'Flow结束',
    llmResponse: '大语言模型',
    webSearch: '上网搜索',
    userInput: '用户输入',
    textOutput: '文本输出',
    thinkOutput: '思考输出',
    condition: '条件判断',
    switch: '多路选择',
    textProcess: '文本处理',
    variable: '变量设置'
};

// 获取节点类型显示名称
function getNodeTypeName(type) {
    return nodeTypeNames[type] || type;
}

// 节点模板更新函数
const nodeUIUpdaters = {
    llmResponse: function(element, data) {
        element.querySelector('.node-system-prompt').textContent = data.systemPrompt;
        element.querySelector('.node-prompt').textContent = data.prompt;
    },
    
    webSearch: function(element, data) {
        element.querySelector('.node-search-engine').textContent = data.searchEngine;
    },
    
    userInput: function(element, data) {
        element.querySelector('.node-prompt-message').textContent = data.promptMessage;
    },
    
    textOutput: function(element, data) {
        element.querySelector('.node-static-text').textContent = data.staticText || '';
    },
    
    thinkOutput: function(element, data) {
        element.querySelector('.node-think-content').textContent = data.thinkContent || '';
    },
    
    condition: function(element, data) {
        element.querySelector('.node-condition-expr').textContent = data.conditionExpr;
    },
    
    variable: function(element, data) {
        element.querySelector('.node-var-name').textContent = data.variableName;
    }
};

// 将更新函数添加到模板中
Object.keys(nodeTemplates).forEach(type => {
    if (nodeUIUpdaters[type]) {
        nodeTemplates[type].updateUI = nodeUIUpdaters[type];
    }
});
