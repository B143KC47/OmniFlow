from flask import Flask, render_template, request, jsonify, redirect
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__)

# 确保保存流程的目录存在
FLOWS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows')
os.makedirs(FLOWS_DIR, exist_ok=True)

# 确保聊天历史目录存在
CHATS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chats')
os.makedirs(CHATS_DIR, exist_ok=True)

@app.route('/')
def index():
    # 重定向到聊天页面，使其成为默认页面
    return redirect('/chat')

@app.route('/chat')
def chat():
    return render_template('chat.html')

@app.route('/editor')
def editor():
    return render_template('editor.html')

# 删除设置页面路由
# @app.route('/settings')
# def settings():
#     return render_template('settings.html')

@app.route('/api/send_message', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message', '')
    chat_id = data.get('chat_id', '')
    
    # 如果没有chat_id，创建一个新的
    if not chat_id:
        chat_id = str(uuid.uuid4())
        # 创建新的聊天记录，设置标题为消息的前20个字符
        title = message[:20] + '...' if len(message) > 20 else message
        save_chat_metadata(chat_id, title)
    
    # 这里可以添加消息处理逻辑
    response = {"reply": f"回复: {message}", "chat_id": chat_id}
    
    # 保存消息到聊天历史
    save_chat_message(chat_id, "user", message)
    save_chat_message(chat_id, "assistant", response["reply"])
    
    return jsonify(response)

@app.route('/api/chats', methods=['GET'])
def get_chats():
    try:
        chats = []
        for filename in os.listdir(CHATS_DIR):
            if filename.endswith('_meta.json'):
                chat_id = filename.replace('_meta.json', '')
                with open(os.path.join(CHATS_DIR, filename), 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                chats.append({
                    'id': chat_id,
                    'title': metadata.get('title', '新对话'),
                    'timestamp': metadata.get('created_at', '')
                })
        
        # 按时间倒序排序
        chats.sort(key=lambda x: x['timestamp'], reverse=True)
        return jsonify({"status": "success", "chats": chats})
    except Exception as e:
        return jsonify({"status": "error", "message": f"获取聊天列表失败: {str(e)}"}), 500

@app.route('/api/chat/<chat_id>', methods=['GET'])
def get_chat_history(chat_id):
    try:
        chat_file = os.path.join(CHATS_DIR, f"{chat_id}.json")
        if os.path.exists(chat_file):
            with open(chat_file, 'r', encoding='utf-8') as f:
                messages = json.load(f)
            return jsonify({"status": "success", "messages": messages})
        else:
            return jsonify({"status": "error", "message": "聊天记录不存在"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": f"获取聊天记录失败: {str(e)}"}), 500

@app.route('/api/chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    try:
        chat_file = os.path.join(CHATS_DIR, f"{chat_id}.json")
        meta_file = os.path.join(CHATS_DIR, f"{chat_id}_meta.json")
        
        if os.path.exists(chat_file):
            os.remove(chat_file)
        if os.path.exists(meta_file):
            os.remove(meta_file)
            
        return jsonify({"status": "success", "message": "聊天记录已删除"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"删除聊天记录失败: {str(e)}"}), 500

@app.route('/api/chat/<chat_id>/title', methods=['PUT'])
def update_chat_title(chat_id):
    try:
        data = request.json
        new_title = data.get('title', '')
        
        if not new_title:
            return jsonify({"status": "error", "message": "标题不能为空"}), 400
        
        meta_file = os.path.join(CHATS_DIR, f"{chat_id}_meta.json")
        if os.path.exists(meta_file):
            with open(meta_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            metadata['title'] = new_title
            
            with open(meta_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            return jsonify({"status": "success", "message": "标题已更新"})
        else:
            return jsonify({"status": "error", "message": "聊天记录不存在"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": f"更新标题失败: {str(e)}"}), 500

# 辅助函数：保存聊天元数据
def save_chat_metadata(chat_id, title):
    metadata = {
        'title': title,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }
    
    meta_file = os.path.join(CHATS_DIR, f"{chat_id}_meta.json")
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

# 辅助函数：保存聊天消息
def save_chat_message(chat_id, role, content):
    chat_file = os.path.join(CHATS_DIR, f"{chat_id}.json")
    
    # 检查文件是否存在
    if os.path.exists(chat_file):
        with open(chat_file, 'r', encoding='utf-8') as f:
            messages = json.load(f)
    else:
        messages = []
    
    # 添加新消息
    messages.append({
        'role': role,
        'content': content,
        'timestamp': datetime.now().isoformat()
    })
    
    # 保存消息
    with open(chat_file, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)
    
    # 更新元数据的更新时间
    meta_file = os.path.join(CHATS_DIR, f"{chat_id}_meta.json")
    if os.path.exists(meta_file):
        with open(meta_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        metadata['updated_at'] = datetime.now().isoformat()
        
        with open(meta_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

@app.route('/api/save_flow', methods=['POST'])
def save_flow():
    data = request.json
    flow_name = data.get('name', 'untitled_flow')
    
    # 确保文件名安全
    flow_name = "".join([c for c in flow_name if c.isalnum() or c in ('_', '-')]) or 'untitled_flow'
    
    # 验证流程有一个开始节点和至少一个结束节点
    has_start = False
    end_count = 0
    
    for node in data.get('nodes', []):
        if node.get('type') == 'flow-start':
            has_start = True
        elif node.get('type') == 'flow-end':
            end_count += 1
    
    if not has_start:
        return jsonify({"status": "error", "message": "流程必须包含一个开始节点"}), 400
    
    if end_count == 0:
        return jsonify({"status": "error", "message": "流程必须至少包含一个结束节点"}), 400
    
    # 保存流程数据到文件
    flow_path = os.path.join(FLOWS_DIR, f'{flow_name}.json')
    
    try:
        with open(flow_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({"status": "success", "message": f"流程已保存为 {flow_name}.json"})
    except Exception as e:
        return jsonify({"status": "error", "message": f"保存失败: {str(e)}"}), 500

@app.route('/api/list_flows', methods=['GET'])
def list_flows():
    try:
        flows = []
        for filename in os.listdir(FLOWS_DIR):
            if filename.endswith('.json') :
                flows.append(filename[:-5])  # 移除.json后缀
        return jsonify({"status": "success", "flows": flows})
    except Exception as e:
        return jsonify({"status": "error", "message": f"获取流程列表失败: {str(e)}"}), 500

@app.route('/api/load_flow/<flow_name>', methods=['GET'])
def load_flow(flow_name):
    # 确保文件名安全
    flow_name = "".join([c for c in flow_name if c.isalnum() or c in ('_', '-')])
    flow_path = os.path.join(FLOWS_DIR, f'{flow_name}.json')
    
    try:
        if os.path.exists(flow_path):
            with open(flow_path, 'r', encoding='utf-8') as f:
                flow_data = json.load(f)
            return jsonify({"status": "success", "data": flow_data})
        else:
            return jsonify({"status": "error", "message": "流程不存在"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": f"加载失败: {str(e)}"}), 500

# 删除设置API路由
# @app.route('/api/save_settings', methods=['POST'])
# def save_settings():
#     data = request.json
#     # 这里可以添加保存设置的逻辑
#     return jsonify({"status": "success", "message": "设置已保存"})

if __name__ == '__main__':
    app.run(debug=True)
