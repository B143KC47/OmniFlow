/**
 * 节点注册表类
 * 用于管理所有节点类型和模板
 */
class NodeRegistry {
    constructor() {
        this.templates = new Map();
        this.nodeTypeNames = new Map();
        this.nodeGroups = new Map();
        this.nodeUIUpdaters = new Map();
    }
    
    /**
     * 注册节点类型
     * @param {string} type - 节点类型标识符
     * @param {Object} template - 节点模板定义
     * @param {string} displayName - 节点类型显示名称
     * @param {string} group - 节点分组
     */
    registerNodeType(type, template, displayName, group = '其他') {
        this.templates.set(type, template);
        this.nodeTypeNames.set(type, displayName);
        
        // 添加到分组
        if (!this.nodeGroups.has(group)) {
            this.nodeGroups.set(group, new Set());
        }
        this.nodeGroups.get(group).add(type);
        
        return this;
    }
    
    /**
     * 注册UI更新函数
     * @param {string} type - 节点类型标识符
     * @param {Function} updater - UI更新函数
     */
    registerUIUpdater(type, updater) {
        this.nodeUIUpdaters.set(type, updater);
        return this;
    }
    
    /**
     * 获取节点模板
     * @param {string} type - 节点类型
     * @returns {Object|null} 节点模板
     */
    getTemplate(type) {
        return this.templates.get(type) || null;
    }
    
    /**
     * 获取节点类型名称
     * @param {string} type - 节点类型
     * @returns {string} 节点类型显示名称
     */
    getNodeTypeName(type) {
        return this.nodeTypeNames.get(type) || type;
    }
    
    /**
     * 获取节点UI更新函数
     * @param {string} type - 节点类型
     * @returns {Function|null} UI更新函数
     */
    getUIUpdater(type) {
        return this.nodeUIUpdaters.get(type) || null;
    }
    
    /**
     * 获取某个分组的所有节点类型
     * @param {string} group - 分组名称
     * @returns {Array} 节点类型数组
     */
    getNodeTypesByGroup(group) {
        return Array.from(this.nodeGroups.get(group) || []);
    }
    
    /**
     * 获取所有分组
     * @returns {Array} 分组名称数组
     */
    getAllGroups() {
        return Array.from(this.nodeGroups.keys());
    }
    
    /**
     * 初始化所有节点的UI更新函数
     */
    initUIUpdaters() {
        for (const [type, template] of this.templates.entries()) {
            if (this.nodeUIUpdaters.has(type)) {
                template.updateUI = this.nodeUIUpdaters.get(type);
            }
        }
    }
}

// 创建全局节点注册表实例
window.nodeRegistry = new NodeRegistry();

// 初始化基本节点类型
function initNodeRegistry() {
    const registry = window.nodeRegistry;
    
    // 流程控制节点
    registry.registerNodeType('flowStart', {
        html: `
            <div class="title">Flow开始 
                <div class="node-actions">
                    <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                </div>
            </div>
            <div class="node-content">
                <div class="node-property">
                    <div class="node-property-label">流程描述</div>
                    <div class="node-description">开始执行流程</div>
                </div>
                <div class="output-field">执行</div>
            </div>
        `,
        data: {
            description: "开始执行流程"
        },
        outputs: 1,
        inputs: 0,
        class: "node-flowStart"
    }, 'Flow开始', '流程控制');
    
    registry.registerNodeType('flowEnd', {
        html: `
            <div class="title">Flow结束
                <div class="node-actions">
                    <div class="node-action-button edit-node"><i class="fas fa-cog"></i></div>
                </div>
            </div>
            <div class="node-content">
                <div class="node-property">
                    <div class="node-property-label">流程描述</div>
                    <div class="node-description">结束流程执行</div>
                </div>
                <div class="input-field">输入</div>
            </div>
        `,
        data: {
            description: "结束流程执行"
        },
        outputs: 0,
        inputs: 1,
        class: "node-flowEnd"
    }, 'Flow结束', '流程控制');
    
    // 添加其他节点类型...
    
    // 注册UI更新函数
    registry.registerUIUpdater('flowStart', (element, data) => {
        element.querySelector('.node-description').textContent = data.description;
    });
    
    registry.registerUIUpdater('flowEnd', (element, data) => {
        element.querySelector('.node-description').textContent = data.description;
    });
    
    // 初始化UI更新函数
    registry.initUIUpdaters();
    
    return registry;
}
