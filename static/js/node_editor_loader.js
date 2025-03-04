/**
 * OmniFlow流程编辑器加载器
 * 负责初始化模块化的流程编辑器
 */

// 检查浏览器是否支持ES模块
const supportsModules = 'noModule' in document.createElement('script');

function loadEditor() {
    if (supportsModules) {
        // 使用ES模块加载
        import('./node_editor/index.js')
            .then(module => {
                console.log('流程编辑器模块加载成功');
                // 模块会自动初始化
            })
            .catch(error => {
                console.error('加载编辑器模块时出错:', error);
                showErrorMessage('加载编辑器模块失败，请检查浏览器控制台获取详细信息。');
            });
    } else {
        // 不支持ES模块的回退方案
        console.error('您的浏览器不支持ES模块，请使用现代浏览器访问此页面。');
        showErrorMessage('您的浏览器不支持此应用程序所需的现代JavaScript功能。请使用最新版本的Chrome、Firefox、Safari或Edge浏览器。');
    }
}

function showErrorMessage(message) {
    const canvas = document.getElementById('flowCanvas');
    if (canvas) {
        canvas.innerHTML = `
            <div class="alert alert-danger m-3">
                <h4 class="alert-heading">加载错误</h4>
                <p>${message}</p>
            </div>
        `;
    } else {
        alert(`错误: ${message}`);
    }
}

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', loadEditor);
