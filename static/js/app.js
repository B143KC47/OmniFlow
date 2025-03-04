// 主应用程序入口

document.addEventListener('DOMContentLoaded', function() {
    // 加载所有模块
    initModules().then(() => {
        console.log('OmniFlow初始化完成');
    }).catch(error => {
        console.error('OmniFlow初始化失败:', error);
    });
});

// 初始化所有模块
async function initModules() {
    try {
        // 初始化主题
        initTheme();
        
        // 初始化编辑器
        const editor = new FlowEditor('drawflow');
        
        // 初始化UI控制器
        const ui = new UIController(editor);
        
        // 初始化流程引擎
        const flowEngine = new FlowEngine(editor.editor);
        
        // 连接UI和流程引擎
        ui.connectFlowEngine(flowEngine);
        
        // 全局访问
        window.omniFlow = {
            editor: editor,
            ui: ui,
            flowEngine: flowEngine
        };
        
        // 添加示例流程
        if (!localStorage.getItem('hasExampleFlow')) {
            try {
                await addExampleFlow();
                localStorage.setItem('hasExampleFlow', 'true');
            } catch(e) {
                console.error('添加示例流程失败:', e);
            }
        }
        
        return true;
    } catch(error) {
        console.error('初始化模块出错:', error);
        throw error;
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // 监听系统主题变化
    if (savedTheme === 'auto') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.body.classList.remove('dark-mode');
                document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }
}

// 添加示例流程
async function addExampleFlow() {
    const exampleFlow = {
        "drawflow": {
            "Home": {
                "data": {
                    "1": {
                        "id": 1,
                        "name": "flowStart",
                        "data": {
                            "description": "开始执行流程"
                        },
                        "class": "node-flowStart",
                        "html": "...",
                        "typenode": "flowStart",
                        "inputs": {},
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 200,
                        "pos_y": 200
                    },
                    "2": {
                        "id": 2,
                        "name": "userInput",
                        "data": {
                            "promptMessage": "请输入你想问的问题"
                        },
                        "class": "node-userInput",
                        "html": "...",
                        "typenode": "userInput",
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "1",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "3",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 500,
                        "pos_y": 200
                    },
                    "3": {
                        "id": 3,
                        "name": "llmResponse",
                        "data": {
                            "systemPrompt": "你是一个有用的AI助手",
                            "prompt": "简洁地回答以下问题",
                            "model": "gpt-3.5-turbo",
                            "temperature": 0.7
                        },
                        "class": "node-llmResponse",
                        "html": "...",
                        "typenode": "llmResponse",
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "2",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "4",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 800,
                        "pos_y": 200
                    },
                    "4": {
                        "id": 4,
                        "name": "textOutput",
                        "data": {
                            "staticText": ""
                        },
                        "class": "node-textOutput",
                        "html": "...",
                        "typenode": "textOutput",
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "3",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {
                            "output_1": {
                                "connections": [
                                    {
                                        "node": "5",
                                        "output": "input_1"
                                    }
                                ]
                            }
                        },
                        "pos_x": 1100,
                        "pos_y": 200
                    },
                    "5": {
                        "id": 5,
                        "name": "flowEnd",
                        "data": {
                            "description": "结束流程执行"
                        },
                        "class": "node-flowEnd",
                        "html": "...",
                        "typenode": "flowEnd",
                        "inputs": {
                            "input_1": {
                                "connections": [
                                    {
                                        "node": "4",
                                        "input": "output_1"
                                    }
                                ]
                            }
                        },
                        "outputs": {},
                        "pos_x": 1400,
                        "pos_y": 200
                    }
                }
            }
        }
    };

    try {
        const response = await fetch('/save_flow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: '简单问答流程示例',
                data: exampleFlow
            })
        });
        
        const result = await response.json();
        console.log('示例流程保存结果:', result);
    } catch (error) {
        console.error('保存示例流程失败:', error);
        throw error;
    }
}

// 注册Service Worker (如果需要)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('ServiceWorker注册成功:', registration.scope);
        }, function(err) {
            console.log('ServiceWorker注册失败:', err);
        });
    });
}
