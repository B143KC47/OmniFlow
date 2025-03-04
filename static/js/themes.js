/**
 * 节点主题管理
 */
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('nodeTheme') || 'default';
        this.themeContainer = document.body;
    }
    
    /**
     * 初始化主题
     */
    init() {
        // 应用保存的主题
        this.applyTheme(this.currentTheme);
        
        // 将主题选择添加到设置对话框
        this.addThemeSelectorToSettings();
    }
    
    /**
     * 应用主题
     * @param {string} theme - 主题名称
     */
    applyTheme(theme) {
        // 清除所有主题类
        this.themeContainer.classList.remove(
            'theme-default',
            'theme-dark-tech', 
            'theme-unreal', 
            'theme-soft-modern'
        );
        
        // 添加新主题类
        if (theme !== 'default') {
            this.themeContainer.classList.add(`theme-${theme}`);
        }
        
        // 保存主题选择
        this.currentTheme = theme;
        localStorage.setItem('nodeTheme', theme);
    }
    
    /**
     * 将主题选择器添加到设置对话框
     */
    addThemeSelectorToSettings() {
        const settingsContent = document.querySelector('#settings-dialog .dialog-content');
        if (!settingsContent) return;
        
        // 创建主题选择组
        const themeGroup = document.createElement('div');
        themeGroup.className = 'form-group';
        themeGroup.innerHTML = `
            <div class="node-property-label">节点主题</div>
            <select id="node-theme-select" class="form-control">
                <option value="default">默认蓝色风格</option>
                <option value="dark-tech">深色科技风</option>
                <option value="unreal">UE5蓝图风格</option>
                <option value="soft-modern">轻柔现代风</option>
            </select>
            <div class="theme-preview" id="theme-preview"></div>
        `;
        
        // 在暗色主题选择后插入
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            const themeSelectGroup = themeSelect.closest('.form-group');
            themeSelectGroup.parentNode.insertBefore(themeGroup, themeSelectGroup.nextSibling);
            
            // 设置当前选择的主题
            document.getElementById('node-theme-select').value = this.currentTheme;
            
            // 添加事件监听器
            document.getElementById('node-theme-select').addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }
}

// 页面加载完成后初始化主题管理器
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
    window.themeManager.init();
});
