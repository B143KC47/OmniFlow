from flask import Flask, render_template, request, jsonify, send_from_directory, redirect
import os
import json
import time
from datetime import datetime

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# 确保目录存在
os.makedirs('templates', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)
os.makedirs('data', exist_ok=True)
os.makedirs('data/flows', exist_ok=True)
os.makedirs('data/chats', exist_ok=True)
os.makedirs('data/config', exist_ok=True)  # 为配置文件添加目录

@app.route('/')
def index():
    """直接渲染节点编辑器页面，不再重定向"""
    return render_template('node_editor.html')

@app.route('/node-editor')
def node_editor():
    """渲染节点编辑器页面"""
    return render_template('node_editor.html')

@app.route('/chat')
def chat():
    """渲染聊天界面页面"""
    return render_template('chat.html')

@app.route('/settings')
def settings():
    """渲染配置页面"""
    return render_template('settings.html')

@app.route('/faq')
def faq():
    """渲染常见问题页面"""
    return render_template('faq.html')

@app.route('/api/send-message', methods=['POST'])
def send_message():
    """处理聊天消息API"""
    data = request.json
    message = data.get('message', '')
    message_type = data.get('type', 'text')
    context = data.get('context', {})
    use_flow = data.get('useFlow', False)
    
    # 记录聊天消息
    chat_log = {
        'timestamp': datetime.now().isoformat(),
        'user_message': message,
        'message_type': message_type,
        'use_flow': use_flow
    }
    
    # 简单回复逻辑
    response = ''
    if use_flow:
        # 如果启用了流程处理，可以在这里添加流程执行逻辑
        response = f"<strong>OmniFlow 助手</strong>: 已通过流程处理您的'{message_type}'类型消息：\"{message}\""
        chat_log['flow_processing'] = True
        
        # 模拟流程处理结果
        flow_result = {
            'status': 'success',
            'processed': True,
            'result': f"处理了消息：{message}",
            'executionTime': '0.5s'
        }
        
    else:
        # 常规回复逻辑
        if message_type == 'question':
            response = f"<strong>OmniFlow 助手</strong>: 关于您的问题「{message}」，我需要更多信息来回答。"
        elif message_type == 'command':
            response = f"<strong>OmniFlow 助手</strong>: 执行命令：{message}"
        else:
            response = f"<strong>OmniFlow 助手</strong>: 收到您的{message_type}：「{message}」，谢谢！"
    
    # 更新上下文
    context['last_message'] = message
    context['last_type'] = message_type
    context['timestamp'] = time.time()
    
    # 记录响应
    chat_log['system_response'] = response
    
    # 保存聊天记录
    save_chat_log(chat_log)
    
    # 构造响应
    result = {
        "reply": response,
        "context": context
    }
    
    # 如果有流程处理结果，添加到响应中
    if use_flow and 'flow_result' in locals():
        result['flowResult'] = flow_result
    
    return jsonify(result)

def save_chat_log(chat_log):
    """保存聊天记录到文件"""
    chat_file = f"data/chats/chat_{datetime.now().strftime('%Y%m%d')}.json"
    
    try:
        # 检查文件是否存在
        if os.path.exists(chat_file):
            with open(chat_file, 'r', encoding='utf-8') as f:
                chats = json.load(f)
        else:
            chats = []
        
        # 添加新的聊天记录
        chats.append(chat_log)
        
        # 写入文件
        with open(chat_file, 'w', encoding='utf-8') as f:
            json.dump(chats, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"保存聊天记录时出错: {e}")

@app.route('/api/save-flow', methods=['POST'])
def save_flow():
    """保存流程图API"""
    data = request.json
    
    try:
        # 生成文件名
        flow_name = data.get('name', 'unnamed_flow')
        safe_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in flow_name.lower())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{safe_name}_{timestamp}.json"
        
        # 保存到文件
        with open(f"data/flows/{filename}", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            "status": "success",
            "filename": filename,
            "message": "流程保存成功"
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/api/list-flows', methods=['GET'])
def list_flows():
    """列出所有保存的流程图"""
    try:
        flows = []
        for filename in os.listdir('data/flows'):
            if filename.endswith('.json'):
                file_path = os.path.join('data/flows', filename)
                with open(file_path, 'r', encoding='utf-8') as f:
                    flow_data = json.load(f)
                
                flows.append({
                    'filename': filename,
                    'name': flow_data.get('name', 'Unnamed'),
                    'nodeCount': len(flow_data.get('nodes', [])),
                    'connectionCount': len(flow_data.get('connections', [])),
                    'created': datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
                })
        
        return jsonify({
            "status": "success",
            "flows": flows
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/api/execute-flow', methods=['POST'])
def execute_flow():
    """执行流程图API"""
    data = request.json
    flow_id = data.get('flowId')
    input_data = data.get('input', {})
    
    # 在实际应用中，这里应该包含流程执行的逻辑
    # 这里只是模拟一个响应
    
    time.sleep(1)  # 模拟处理时间
    
    result = {
        "status": "success",
        "executionId": f"exec_{int(time.time())}",
        "result": {
            "message": "流程执行成功",
            "processedInput": input_data,
            "output": "处理后的输出结果"
        },
        "executionTime": "1.2秒",
        "nodesPassed": 5
    }
    
    return jsonify(result)

@app.route('/api/save-config', methods=['POST'])
def save_config():
    """保存API配置信息"""
    data = request.json
    
    try:
        # 确保配置目录存在
        os.makedirs('data/config', exist_ok=True)
        
        # 保存配置到文件
        with open('data/config/api_settings.json', 'w', encoding='utf-8') as f:
            # 在实际应用中应考虑对API密钥进行加密
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            "status": "success",
            "message": "配置保存成功"
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/api/get-config', methods=['GET'])
def get_config():
    """获取API配置信息"""
    try:
        config_path = 'data/config/api_settings.json'
        
        if not os.path.exists(config_path):
            # 如果配置文件不存在，返回默认配置
            default_config = {
                "models": [
                    {"id": "deepseek-chat", "name": "DeepSeek Chat", "enabled": True},
                    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "enabled": False},
                    {"id": "gpt-4", "name": "GPT-4", "enabled": False}
                ],
                "apiKeys": {
                    "deepseek": "",
                    "openai": ""
                },
                "defaultModel": "deepseek-chat"
            }
            return jsonify(default_config)
        
        # 读取配置文件
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        return jsonify(config)
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """测试API连接"""
    data = request.json
    model_id = data.get('modelId')
    api_key = data.get('apiKey')
    
    # 在实际应用中，这里应添加实际的API连接测试逻辑
    # 目前只是返回模拟结果
    
    time.sleep(1)  # 模拟网络延迟
    
    # 假设测试成功
    success = True
    if not api_key or len(api_key) < 8:
        success = False
    
    if success:
        return jsonify({
            "status": "success",
            "message": f"成功连接到{model_id}模型API",
            "details": {
                "model": model_id,
                "latency": "200ms",
                "quota": "充足"
            }
        })
    else:
        return jsonify({
            "status": "error",
            "message": "连接失败，请检查API密钥是否正确",
            "details": {
                "errorCode": "auth_failed",
                "suggestion": "请确认API密钥格式正确且未过期"
            }
        })

@app.route('/api/themes')
def get_themes():
    """获取可用的主题"""
    themes = [
        {"id": "default", "name": "默认主题", "primary": "#3498db"},
        {"id": "dark", "name": "暗色主题", "primary": "#2c3e50"},
        {"id": "light", "name": "浅色主题", "primary": "#ecf0f1"},
        {"id": "orange", "name": "橙色主题", "primary": "#e67e22"},
        {"id": "green", "name": "绿色主题", "primary": "#27ae60"}
    ]
    return jsonify(themes)

@app.route('/project-structure')
def project_structure():
    """显示项目结构文档"""
    return render_template('project_structure.html')

@app.route('/favicon.ico')
def favicon():
    """提供网站图标"""
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
