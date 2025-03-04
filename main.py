from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'omniflow-secret-key'

# 保存流程图的目录
FLOWS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flows')
os.makedirs(FLOWS_DIR, exist_ok=True)

@app.route('/')
def index():
    """渲染主页"""
    return render_template('index.html')

@app.route('/save_flow', methods=['POST'])
def save_flow():
    """保存流程图数据"""
    data = request.json
    flow_name = data.get('name', 'default')
    flow_data = data.get('data', {})
    
    # 保存到文件
    file_path = os.path.join(FLOWS_DIR, f"{flow_name}.json")
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(flow_data, f, ensure_ascii=False, indent=2)
    
    return jsonify({"success": True, "message": f"流程 {flow_name} 已保存"})

@app.route('/load_flow/<flow_name>')
def load_flow(flow_name):
    """加载流程图数据"""
    file_path = os.path.join(FLOWS_DIR, f"{flow_name}.json")
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            flow_data = json.load(f)
        return jsonify({"success": True, "data": flow_data})
    else:
        return jsonify({"success": False, "message": "流程不存在"}), 404

@app.route('/list_flows')
def list_flows():
    """列出所有保存的流程"""
    flows = [f.replace('.json', '') for f in os.listdir(FLOWS_DIR) if f.endswith('.json')]
    return jsonify({"flows": flows})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
