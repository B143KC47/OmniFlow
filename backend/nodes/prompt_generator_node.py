from typing import Any, Dict, List
from ..core.base_node import BaseNode

class PromptGeneratorNode(BaseNode):
    def __init__(self, node_id: str):
        super().__init__(node_id, "PromptGeneratorNode")
        self.inputs = {
            "template": None,
            "variables": {},
            "examples": []
        }
        self.outputs = {
            "prompt": None,
            "error": None
        }
        self.properties = {
            "template_type": "simple" # simple, few_shot, chain_of_thought
        }
        
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """根据模板和变量生成提示"""
        template = input_data.get("template", "")
        variables = input_data.get("variables", {})
        examples = input_data.get("examples", [])
        template_type = self.get_property("template_type")
        
        if not template:
            return {"error": "Template cannot be empty", "prompt": ""}
            
        try:
            prompt = ""
            
            if template_type == "simple":
                # 简单模板替换
                prompt = self._process_simple_template(template, variables)
            
            elif template_type == "few_shot":
                # 少样本学习模板
                prompt = self._process_few_shot_template(template, variables, examples)
            
            elif template_type == "chain_of_thought":
                # 思维链模板
                prompt = self._process_chain_of_thought_template(template, variables, examples)
            
            else:
                # 默认简单模板
                prompt = self._process_simple_template(template, variables)
            
            return {
                "prompt": prompt,
                "error": None
            }
        except Exception as e:
            return {
                "prompt": "",
                "error": f"Error generating prompt: {str(e)}"
            }
    
    def _process_simple_template(self, template: str, variables: Dict[str, Any]) -> str:
        """处理简单模板"""
        # 简单变量替换
        prompt = template
        for key, value in variables.items():
            placeholder = f"{{{key}}}"
            prompt = prompt.replace(placeholder, str(value))
        return prompt
    
    def _process_few_shot_template(self, template: str, variables: Dict[str, Any], examples: List[Dict[str, Any]]) -> str:
        """处理少样本学习模板"""
        # 生成示例部分
        examples_text = ""
        for i, example in enumerate(examples):
            example_str = f"Example {i+1}:\n"
            for key, value in example.items():
                example_str += f"{key}: {value}\n"
            examples_text += example_str + "\n"
        
        # 替换模板中的变量和示例
        variables["examples"] = examples_text
        return self._process_simple_template(template, variables)
    
    def _process_chain_of_thought_template(self, template: str, variables: Dict[str, Any], examples: List[Dict[str, Any]]) -> str:
        """处理思维链模板"""
        # 生成思维链示例部分
        cot_examples = ""
        for i, example in enumerate(examples):
            cot_str = f"Example {i+1}:\n"
            cot_str += f"Question: {example.get('question', '')}\n"
            cot_str += f"Thought process: {example.get('thoughts', '')}\n"
            cot_str += f"Answer: {example.get('answer', '')}\n\n"
            cot_examples += cot_str
        
        # 替换模板中的变量和思维链示例
        variables["cot_examples"] = cot_examples
        return self._process_simple_template(template, variables)