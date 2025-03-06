from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseNode(ABC):
    def __init__(self, node_id: str, node_type: str):
        self.node_id = node_id
        self.node_type = node_type
        self.inputs = {}
        self.outputs = {}
        self.properties = {}
    
    @abstractmethod
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理输入数据并返回输出结果"""
        pass
    
    def set_property(self, key: str, value: Any) -> None:
        """设置节点属性"""
        self.properties[key] = value
    
    def get_property(self, key: str) -> Any:
        """获取节点属性"""
        return self.properties.get(key)
    
    def to_dict(self) -> Dict[str, Any]:
        """将节点转换为字典格式"""
        return {
            "id": self.node_id,
            "type": self.node_type,
            "properties": self.properties,
            "inputs": self.inputs,
            "outputs": self.outputs
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'BaseNode':
        """从字典创建节点实例"""
        node = cls(data["id"], data["type"])
        node.properties = data.get("properties", {})
        node.inputs = data.get("inputs", {})
        node.outputs = data.get("outputs", {})
        return node 