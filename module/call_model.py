import os
import json
from openai import OpenAI

def load_api_config():
    """
    从配置文件加载API设置
    
    Returns:
        dict: 包含API配置的字典
    """
    config_path = 'data/config/api_settings.json'
    default_config = {
        "apiKeys": {
            "deepseek": "",
            "openai": ""
        },
        "defaultModel": "deepseek-chat"
    }
    
    try:
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return default_config
    except Exception as e:
        print(f"加载API配置出错: {e}")
        return default_config

def get_deepseek_response(input_text):
    """
    Send a request to DeepSeek API and return the model's response.
    
    Args:
        input_text (str): The user input to send to the model
        
    Returns:
        str: The text response from DeepSeek
    """
    # 从配置加载API密钥
    config = load_api_config()
    api_key = config["apiKeys"].get("deepseek", "")
    
    if not api_key:
        return "错误: DeepSeek API密钥未配置。请在设置页面配置API密钥。"
    
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": input_text},
            ],
            stream=False
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"调用DeepSeek API时出错: {str(e)}"

def get_openai_response(input_text, model="gpt-3.5-turbo"):
    """
    Send a request to OpenAI API and return the model's response.
    
    Args:
        input_text (str): The user input to send to the model
        model (str): The model to use (gpt-3.5-turbo, gpt-4, etc.)
        
    Returns:
        str: The text response from OpenAI
    """
    # 从配置加载API密钥
    config = load_api_config()
    api_key = config["apiKeys"].get("openai", "")
    
    if not api_key:
        return "错误: OpenAI API密钥未配置。请在设置页面配置API密钥。"
    
    try:
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant"},
                {"role": "user", "content": input_text},
            ],
            stream=False
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"调用OpenAI API时出错: {str(e)}"

def call_model(input_text):
    """
    根据系统配置调用相应的大语言模型
    
    Args:
        input_text (str): 用户输入文本
        
    Returns:
        str: 模型的响应文本
    """
    config = load_api_config()
    default_model = config.get("defaultModel", "deepseek-chat")
    
    if default_model == "deepseek-chat":
        return get_deepseek_response(input_text)
    elif default_model.startswith("gpt-"):
        return get_openai_response(input_text, model=default_model)

