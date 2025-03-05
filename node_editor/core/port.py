"""
节点端口(Port)类，用于连接节点
"""
from PyQt5.QtWidgets import QGraphicsEllipseItem, QGraphicsTextItem
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QBrush, QPen, QColor, QFont, QRadialGradient, QPainter  # 添加 QPainter

from UI import PORT_RADIUS, PORT_HOVER_RADIUS, PORT_COLOR, PORT_HOVER_COLOR, PORT_FONT_SIZE, PORT_BORDER_COLOR

class Port(QGraphicsEllipseItem):
    """节点上的连接端口"""
    def __init__(self, parent=None, port_type="input", name=""):
        super().__init__(-PORT_RADIUS, -PORT_RADIUS, PORT_RADIUS*2, PORT_RADIUS*2, parent)
        self.port_type = port_type  # "input" 或 "output"
        self.name = name
        self.node = parent
        self.connection = None  # 连接到这个端口的连接线
        self.setAcceptHoverEvents(True)
        
        # 设置端口样式
        self.setBrush(QBrush(QColor(PORT_COLOR)))
        self.setPen(QPen(QColor(PORT_BORDER_COLOR), 2))
        
        # 添加端口标签
        if name:
            self.label = QGraphicsTextItem(name, parent)
            self.label.setDefaultTextColor(QColor(Qt.white))
            font = QFont()
            font.setPointSize(PORT_FONT_SIZE)
            self.label.setFont(font)
            
            # 根据端口类型放置标签
            label_width = self.label.boundingRect().width()
            label_height = self.label.boundingRect().height()
            if port_type == "input":
                self.label.setPos(PORT_RADIUS*2 + 5, -label_height/2)
            else:
                self.label.setPos(-label_width - 5 - PORT_RADIUS, -label_height/2)
        
        self.setZValue(2)
        
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.scene().start_connection(self)
            event.accept()
        else:
            super().mousePressEvent(event)
    
    def hoverEnterEvent(self, event):
        # 放大并高亮端口
        self.prepareGeometryChange()
        self.setRect(-PORT_HOVER_RADIUS, -PORT_HOVER_RADIUS, 
                     PORT_HOVER_RADIUS*2, PORT_HOVER_RADIUS*2)
        
        # 创建发光效果
        glow = QRadialGradient(0, 0, PORT_HOVER_RADIUS*2)
        glow.setColorAt(0, QColor(PORT_HOVER_COLOR))
        glow.setColorAt(1, QColor(PORT_HOVER_COLOR).darker(150))
        self.setBrush(QBrush(glow))
        
        super().hoverEnterEvent(event)
        
    def hoverLeaveEvent(self, event):
        # 恢复原始大小和颜色
        self.prepareGeometryChange()
        self.setRect(-PORT_RADIUS, -PORT_RADIUS, PORT_RADIUS*2, PORT_RADIUS*2)
        self.setBrush(QBrush(QColor(PORT_COLOR)))
        super().hoverLeaveEvent(event)
