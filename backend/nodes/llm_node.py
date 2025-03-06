from typing import Any, Dict
import openai
from ..core.base_node import BaseNode

class LLMNode(BaseNode):
    def __init__(self, node_id: str):
        super().__init__(node_id, "LLMNode")
        self.inputs = {
            "prompt": None,
            "system_message": None,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        self.outputs = {
            "response": None
        }
    
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理LLM调用"""
        prompt = input_data.get("prompt", "")
        system_message = input_data.get("system_message", "You are a helpful assistant.")
        temperature = input_data.get("temperature", 0.7)
        max_tokens = input_data.get("max_tokens", 1000)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return {
                "response": response.choices[0].message.content
            }
        except Exception as e:
            return {
                "error": str(e)
            } 