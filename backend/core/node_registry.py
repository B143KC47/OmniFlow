from typing import Dict, Type, Any
import importlib
import inspect
import os
import sys
from .base_node import BaseNode

class NodeRegistry:
    """节点类型注册表，用于动态加载和管理节点类型"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NodeRegistry, cls).__new__(cls)
            cls._instance.node_types = {}
        return cls._instance
    
    def register(self, node_class: Type[BaseNode]) -> None:
        """注册节点类型"""
        node_type = node_class.__name__
        self.node_types[node_type] = node_class
        print(f"Registered node type: {node_type}")
        
    def get(self, node_type: str) -> Type[BaseNode]:
        """获取节点类型"""
        return self.node_types.get(node_type)
        
    def load_nodes_from_directory(self, directory: str) -> None:
        """从目录加载节点模块并注册节点类型"""
        # 确保目录在Python路径中
        if directory not in sys.path:
            sys.path.append(directory)
            
        # 遍历目录中的Python文件
        for filename in os.listdir(directory):
            if filename.endswith('.py') and not filename.startswith('__'):
                module_name = filename[:-3]  # 去掉.py后缀
                try:
                    # 导入模块
                    module = importlib.import_module(module_name)
                    
                    # 查找模块中的BaseNode子类
                    for name, obj in inspect.getmembers(module):
                        if inspect.isclass(obj) and issubclass(obj, BaseNode) and obj != BaseNode:
                            self.register(obj)
                            
                except Exception as e:
                    print(f"Error loading node module {module_name}: {str(e)}")
                    
    def get_all_node_types(self) -> Dict[str, Type[BaseNode]]:
        """获取所有注册的节点类型"""
        return self.node_types.copy()
        
    def create_node(self, node_type: str, node_id: str, properties: Dict[str, Any] = None) -> BaseNode:
        """根据节点类型创建节点实例"""
        node_class = self.get(node_type)
        if node_class:
            node = node_class(node_id)
            if properties:
                for key, value in properties.items():
                    node.set_property(key, value)
            return node
        else:
            raise ValueError(f"Unknown node type: {node_type}")
            
    @classmethod
    def get_instance(cls) -> 'NodeRegistry':
        """获取单例实例"""
        if cls._instance is None:
            cls._instance = NodeRegistry()
        return cls._instance