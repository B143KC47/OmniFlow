"""
条件节点类
"""
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPainterPath, QPen, QBrush, QColor, QPainter, QLinearGradient  # 确保 QPainter 在这里导入
from node_editor.core.node import Node
from UI import (NODE_RADIUS, NODE_HEIGHT, NODE_TITLE_HEIGHT, 
               CONDITION_NODE_COLOR_TOP, CONDITION_NODE_COLOR_BOTTOM, 
               GLOW_COLOR, NODE_BORDER_COLOR)

class ConditionNode(Node):
    """条件节点"""
    def __init__(self, scene=None):
        super().__init__("Condition", scene, 1, 2)
        # 设置条件节点特有样式
        
        # 为True和False输出添加标签
        true_port = self.output_ports[0]
        false_port = self.output_ports[1]
        
        # 更新端口标签
        if hasattr(true_port, 'label'):
            true_port.label.setPlainText("True")
        
        if hasattr(false_port, 'label'):
            false_port.label.setPlainText("False")
        
    def paint(self, painter, option, widget):
        """使用紫色渐变"""
        painter.setRenderHint(QPainter.Antialiasing)
        
        path = QPainterPath()
        path.addRoundedRect(self.rect(), NODE_RADIUS, NODE_RADIUS)
        
        gradient = QLinearGradient(0, 0, 0, NODE_HEIGHT)
        gradient.setColorAt(0, QColor(CONDITION_NODE_COLOR_TOP))
        gradient.setColorAt(1, QColor(CONDITION_NODE_COLOR_BOTTOM))
        
        painter.fillPath(path, QBrush(gradient))
        
        # 绘制选中效果
        if self.isSelected():
            glow_pen = QPen(QColor(GLOW_COLOR))
            glow_pen.setWidth(2)
            painter.setPen(glow_pen)
        else:
            border_pen = QPen(QColor(NODE_BORDER_COLOR))
            border_pen.setWidth(2)
            painter.setPen(border_pen)
            
        painter.drawPath(path)
        
        # 绘制菱形条件标志
        diamond_size = 15
        x = (self.rect().width() - diamond_size) / 2
        y = NODE_TITLE_HEIGHT + 15
        
        diamond_path = QPainterPath()
        diamond_path.moveTo(x + diamond_size/2, y)
        diamond_path.lineTo(x + diamond_size, y + diamond_size/2)
        diamond_path.lineTo(x + diamond_size/2, y + diamond_size)
        diamond_path.lineTo(x, y + diamond_size/2)
        diamond_path.closeSubpath()
        
        painter.fillPath(diamond_path, QBrush(Qt.white))
        painter.setPen(QPen(Qt.white, 1))
        painter.drawPath(diamond_path)
