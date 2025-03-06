from typing import Dict, List, Any
from .base_node import BaseNode
import json
import os

class WorkflowManager:
    def __init__(self):
        self.nodes: Dict[str, BaseNode] = {}
        self.connections: List[Dict[str, str]] = []
        
    def add_node(self, node: BaseNode) -> None:
        """添加节点到工作流"""
        self.nodes[node.node_id] = node
        
    def add_connection(self, from_node: str, from_output: str, to_node: str, to_input: str) -> None:
        """添加节点间的连接"""
        self.connections.append({
            "from_node": from_node,
            "from_output": from_output,
            "to_node": to_node,
            "to_input": to_input
        })
        
    def execute(self, initial_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """执行工作流"""
        if initial_data is None:
            initial_data = {}
            
        # 存储节点执行结果
        results = {}
        
        # 计算节点依赖关系
        dependencies = self._calculate_dependencies()
        
        # 按依赖顺序执行节点
        for node_id in self._topological_sort(dependencies):
            node = self.nodes[node_id]
            
            # 收集输入数据
            input_data = {}
            for conn in self.connections:
                if conn["to_node"] == node_id:
                    from_node_id = conn["from_node"]
                    if from_node_id in results:
                        input_data[conn["to_input"]] = results[from_node_id][conn["from_output"]]
            
            # 添加初始数据
            if node_id in initial_data:
                input_data.update(initial_data[node_id])
            
            # 执行节点
            results[node_id] = node.process(input_data)
            
        return results
    
    def _calculate_dependencies(self) -> Dict[str, List[str]]:
        """计算节点依赖关系"""
        dependencies = {node_id: [] for node_id in self.nodes}
        for conn in self.connections:
            dependencies[conn["to_node"]].append(conn["from_node"])
        return dependencies
    
    def _topological_sort(self, dependencies: Dict[str, List[str]]) -> List[str]:
        """拓扑排序"""
        visited = set()
        temp = set()
        order = []
        
        def visit(node_id: str):
            if node_id in temp:
                raise ValueError("Workflow contains cycles")
            if node_id in visited:
                return
            temp.add(node_id)
            for dep in dependencies.get(node_id, []):
                visit(dep)
            temp.remove(node_id)
            visited.add(node_id)
            order.append(node_id)
            
        for node_id in self.nodes:
            if node_id not in visited:
                visit(node_id)
                
        return order[::-1]
    
    def save_to_file(self, filepath: str) -> None:
        """保存工作流到文件"""
        workflow_data = {
            "nodes": {node_id: node.to_dict() for node_id, node in self.nodes.items()},
            "connections": self.connections
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(workflow_data, f, indent=2)
            
    @classmethod
    def load_from_file(cls, filepath: str) -> 'WorkflowManager':
        """从文件加载工作流"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        workflow = cls()
        
        # 加载节点
        for node_id, node_data in data["nodes"].items():
            node_type = node_data["type"]
            # 这里需要一个节点类型注册表来创建正确的节点实例
            node_class = NODE_REGISTRY.get(node_type)
            if node_class:
                node = node_class.from_dict(node_data)
                workflow.add_node(node)
                
        # 加载连接
        for conn in data["connections"]:
            workflow.add_connection(
                conn["from_node"],
                conn["from_output"],
                conn["to_node"],
                conn["to_input"]
            )
            
        return workflow 