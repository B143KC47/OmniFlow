"""
结束节点类
"""
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPainterPath, QPen, QBrush, QColor, QPainter, QLinearGradient  # 确保 QPainter 在这里导入
from node_editor.core.node import Node
from UI import NODE_RADIUS, NODE_HEIGHT, END_NODE_COLOR_TOP, END_NODE_COLOR_BOTTOM, GLOW_COLOR, NODE_BORDER_COLOR

class FlowEndNode(Node):
    """结束节点"""
    def __init__(self, scene=None):
        super().__init__("End", scene, 1, 0)
        # 设置结束节点特有样式
        
    def paint(self, painter, option, widget):
        """使用红色渐变"""
        painter.setRenderHint(QPainter.Antialiasing)
        
        path = QPainterPath()
        path.addRoundedRect(self.rect(), NODE_RADIUS, NODE_RADIUS)
        
        gradient = QLinearGradient(0, 0, 0, NODE_HEIGHT)
        gradient.setColorAt(0, QColor(END_NODE_COLOR_TOP))
        gradient.setColorAt(1, QColor(END_NODE_COLOR_BOTTOM))
        
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
