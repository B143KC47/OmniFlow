from typing import Any, Dict, List
import json
from ..core.base_node import BaseNode

class DataProcessorNode(BaseNode):
    def __init__(self, node_id: str):
        super().__init__(node_id, "DataProcessorNode")
        self.inputs = {
            "data": None,
            "filter_condition": None,
            "extract_fields": None,
            "transform_script": None
        }
        self.outputs = {
            "result": None,
            "error": None
        }
        self.properties = {
            "operation_type": "filter"  # filter, extract, transform, combine
        }
        
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """处理输入数据并返回结果"""
        data = input_data.get("data")
        operation_type = self.get_property("operation_type")
        
        if data is None:
            return {"error": "Input data cannot be empty", "result": None}
            
        try:
            result = None
            
            if operation_type == "filter":
                filter_condition = input_data.get("filter_condition")
                result = self._filter_data(data, filter_condition)
                
            elif operation_type == "extract":
                extract_fields = input_data.get("extract_fields")
                result = self._extract_fields(data, extract_fields)
                
            elif operation_type == "transform":
                transform_script = input_data.get("transform_script")
                result = self._transform_data(data, transform_script)
                
            elif operation_type == "combine":
                # 合并多个数据源
                result = self._combine_data(data)
                
            else:
                result = data  # 默认原样返回数据
                
            return {
                "result": result,
                "error": None
            }
        except Exception as e:
            return {
                "result": None,
                "error": f"Error processing data: {str(e)}"
            }
    
    def _filter_data(self, data: Any, filter_condition: str) -> Any:
        """根据条件过滤数据"""
        if isinstance(data, list):
            # 为安全起见，使用一个简单的条件表达式解析器
            # 实际实现可能需要更安全和复杂的方法
            filtered_data = []
            
            for item in data:
                # 简单的条件评估，这里假设条件是一个简单的键值比较
                # 例如: "key == value" 或 "key > 10"
                if filter_condition and isinstance(item, dict):
                    try:
                        key, op, value = self._parse_condition(filter_condition)
                        if key in item:
                            if self._evaluate_condition(item[key], op, value):
                                filtered_data.append(item)
                    except:
                        # 如果条件解析失败，则跳过
                        pass
                else:
                    filtered_data.append(item)
            
            return filtered_data
        else:
            return data  # 非列表数据不进行过滤
    
    def _extract_fields(self, data: Any, extract_fields: List[str]) -> Any:
        """从数据中提取指定字段"""
        if not extract_fields:
            return data
            
        if isinstance(data, dict):
            # 从字典中提取字段
            result = {}
            for field in extract_fields:
                if field in data:
                    result[field] = data[field]
            return result
            
        elif isinstance(data, list):
            # 从列表中的每个字典提取字段
            result = []
            for item in data:
                if isinstance(item, dict):
                    extracted = {}
                    for field in extract_fields:
                        if field in item:
                            extracted[field] = item[field]
                    result.append(extracted)
                else:
                    result.append(item)  # 非字典项原样保留
            return result
            
        else:
            return data  # 其他类型数据不进行提取
    
    def _transform_data(self, data: Any, transform_script: str) -> Any:
        """使用脚本转换数据"""
        if not transform_script:
            return data
            
        try:
            # 非常简单的转换实现，仅支持一些基本操作
            # 实际应用中可能需要更安全和功能丰富的方法
            
            # 转换为字符串
            if transform_script == "to_string":
                return json.dumps(data)
                
            # 转换为列表
            elif transform_script == "to_list" and not isinstance(data, list):
                if isinstance(data, dict):
                    return list(data.items())
                else:
                    return [data]
                    
            # 转换为字典
            elif transform_script == "to_dict" and not isinstance(data, dict):
                if isinstance(data, list) and all(isinstance(item, tuple) and len(item) == 2 for item in data):
                    return dict(data)
                else:
                    return {"value": data}
            
            # 默认情况下返回原始数据
            return data
            
        except Exception as e:
            # 转换失败则返回原始数据
            print(f"Transform failed: {str(e)}")
            return data
    
    def _combine_data(self, data: Any) -> Any:
        """合并数据"""
        if isinstance(data, list):
            result = []
            for item in data:
                if isinstance(item, list):
                    result.extend(item)
                else:
                    result.append(item)
            return result
        elif isinstance(data, dict):
            # 假设data是一个包含多个字典的字典
            result = {}
            for key, value in data.items():
                if isinstance(value, dict):
                    result.update(value)
                else:
                    result[key] = value
            return result
        else:
            return data
    
    def _parse_condition(self, condition: str) -> tuple:
        """解析简单的条件表达式 (key op value)"""
        condition = condition.strip()
        
        # 支持的操作符
        operators = ["==", "!=", ">", "<", ">=", "<="]
        
        for op in operators:
            if op in condition:
                parts = condition.split(op, 1)
                key = parts[0].strip()
                value = parts[1].strip()
                
                # 尝试将值转换为适当的类型
                try:
                    if value.lower() == "true":
                        value = True
                    elif value.lower() == "false":
                        value = False
                    elif value.isdigit():
                        value = int(value)
                    elif value.replace(".", "", 1).isdigit() and value.count(".") <= 1:
                        value = float(value)
                    else:
                        # 去掉引号
                        if (value.startswith('"') and value.endswith('"')) or \
                           (value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                except:
                    pass
                
                return key, op, value
                
        # 如果没有找到操作符，则返回默认值
        return "key", "==", "value"
    
    def _evaluate_condition(self, left: Any, op: str, right: Any) -> bool:
        """评估简单的条件表达式"""
        if op == "==":
            return left == right
        elif op == "!=":
            return left != right
        elif op == ">":
            return left > right
        elif op == "<":
            return left < right
        elif op == ">=":
            return left >= right
        elif op == "<=":
            return left <= right
        else:
            return False