"""
处理节点类
"""
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPainterPath, QPen, QBrush, QColor, QPainter, QLinearGradient
from node_editor.core.node import Node
from UI import NODE_RADIUS, NODE_HEIGHT, PROCESS_NODE_COLOR_TOP, PROCESS_NODE_COLOR_BOTTOM, GLOW_COLOR, NODE_BORDER_COLOR

class ProcessNode(Node):
    """处理节点"""
    def __init__(self, title="Process", scene=None):
        super().__init__(title, scene, 1, 1)
        # 设置处理节点特有样式
        
    def paint(self, painter, option, widget):
        """使用蓝色渐变"""
        painter.setRenderHint(QPainter.Antialiasing)
        
        path = QPainterPath()
        path.addRoundedRect(self.rect(), NODE_RADIUS, NODE_RADIUS)
        
        gradient = QLinearGradient(0, 0, 0, NODE_HEIGHT)
        gradient.setColorAt(0, QColor(PROCESS_NODE_COLOR_TOP))
        gradient.setColorAt(1, QColor(PROCESS_NODE_COLOR_BOTTOM))
        
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
