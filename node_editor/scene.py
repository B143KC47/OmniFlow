"""
节点编辑器场景，管理所有节点和连接
"""
from PyQt5.QtWidgets import QGraphicsScene, QGraphicsView
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPen, QBrush, QColor, QPainter  # 添加 QPainter 导入

from node_editor.core.connection import Connection
from node_editor.nodes.start_node import FlowStartNode
from node_editor.nodes.end_node import FlowEndNode
from node_editor.nodes.process_node import ProcessNode
from node_editor.nodes.condition_node import ConditionNode
from node_editor.core.port import Port

from UI import DARK_BG, GRID_COLOR, GRID_COLOR_SECONDARY, CONNECTION_COLOR

class FlowEditorScene(QGraphicsScene):
    """节点编辑器场景"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setSceneRect(0, 0, 8000, 8000)
        self.grid_size = 25  # 主要网格大小
        self.fine_grid_size = 5  # 次要网格大小
        self.temp_connection = None
        self.start_port = None
        
        # 绘制背景网格
        self._draw_grid()
        
        # 添加开始和结束节点
        self.start_node = self.create_node("start", 200, 200)
        self.end_node = self.create_node("end", 600, 200)
    
    def _draw_grid(self):
        """绘制背景网格"""
        self.setBackgroundBrush(QBrush(QColor(DARK_BG)))
    
    def drawBackground(self, painter, rect):
        """重新实现网格绘制，添加UE风格网格线"""
        super().drawBackground(painter, rect)
        
        painter.setRenderHint(QPainter.Antialiasing, False)  # 网格线不需要抗锯齿
        
        # 绘制网格
        left = int(rect.left()) - (int(rect.left()) % self.fine_grid_size)
        top = int(rect.top()) - (int(rect.top()) % self.fine_grid_size)
        
        # 先绘制次要网格线(细线)
        fine_grid_pen = QPen(QColor(GRID_COLOR_SECONDARY))
        fine_grid_pen.setWidth(1)
        painter.setPen(fine_grid_pen)
        
        for x in range(left, int(rect.right()), self.fine_grid_size):
            if x % self.grid_size != 0:  # 跳过与主网格重叠的线
                painter.drawLine(x, int(rect.top()), x, int(rect.bottom()))
                
        for y in range(top, int(rect.bottom()), self.fine_grid_size):
            if y % self.grid_size != 0:  # 跳过与主网格重叠的线
                painter.drawLine(int(rect.left()), y, int(rect.right()), y)
        
        # 再绘制主网格线(粗线)
        grid_pen = QPen(QColor(GRID_COLOR))
        grid_pen.setWidth(1)
        painter.setPen(grid_pen)
        
        for x in range(left, int(rect.right()), self.grid_size):
            painter.drawLine(x, int(rect.top()), x, int(rect.bottom()))
            
        for y in range(top, int(rect.bottom()), self.grid_size):
            painter.drawLine(int(rect.left()), y, int(rect.right()), y)
        
        # 绘制中心参考十字线
        painter.setPen(QPen(QColor(CONNECTION_COLOR).darker(150), 1, Qt.DashLine))
        # 垂直线
        painter.drawLine(0, int(rect.top()), 0, int(rect.bottom()))
        # 水平线
        painter.drawLine(int(rect.left()), 0, int(rect.right()), 0)
    
    def create_node(self, node_type, x=0, y=0):
        """创建指定类型的节点"""
        if node_type == "start":
            node = FlowStartNode(self)
        elif node_type == "end":
            node = FlowEndNode(self)
        elif node_type == "process":
            node = ProcessNode(scene=self)
        elif node_type == "condition":
            node = ConditionNode(scene=self)
        else:
            return None
            
        node.setPos(x, y)
        self.addItem(node)
        return node
    
    def start_connection(self, port):
        """开始创建连接线"""
        # 如果端口已有连接，先删除
        if port.connection and port.port_type == "output":
            port.connection.delete()
            
        self.start_port = port
        self.temp_connection = Connection(source_port=port if port.port_type == "output" else None, 
                                         dest_port=port if port.port_type == "input" else None)
        self.addItem(self.temp_connection)
        
    def mouseMoveEvent(self, event):
        """鼠标移动事件"""
        super().mouseMoveEvent(event)
        
        if self.temp_connection and self.start_port:
            # 更新临时连接线的终点
            pos = event.scenePos()
            if self.start_port.port_type == "output":
                self.temp_connection.temp_end_point = pos
            else:
                self.temp_connection.source_port = None
                self.temp_connection.temp_end_point = pos
                
            self.temp_connection.update_path()
    
    def mouseReleaseEvent(self, event):
        """鼠标释放事件"""
        super().mouseReleaseEvent(event)
        
        if self.temp_connection and self.start_port:
            # 获取鼠标下的项
            item = self.itemAt(event.scenePos(), None)
            
            if isinstance(item, Port):
                end_port = item
                
                # 检查是否可以连接
                if self._can_connect(self.start_port, end_port):
                    # 创建正式连接
                    if self.start_port.port_type == "output":
                        connection = Connection(self.start_port, end_port)
                    else:
                        connection = Connection(end_port, self.start_port)
                        
                    self.removeItem(self.temp_connection)
                    self.addItem(connection)
                    connection.update_path()
                else:
                    # 连接不合法，删除临时连接
                    self.removeItem(self.temp_connection)
            else:
                # 没有连接到端口，删除临时连接
                self.removeItem(self.temp_connection)
                
            self.temp_connection = None
            self.start_port = None

    def _can_connect(self, port1, port2):
        """检查两个端口是否可以连接"""
        # 不能自连接
        if port1.node == port2.node:
            return False
        # 类型必须相反
        if port1.port_type == port2.port_type:
            return False
        # 输入端口只能有一个连接
        if port1.port_type == "input" and port1.connection:
            return False
        if port2.port_type == "input" and port2.connection:
            return False
        return True
