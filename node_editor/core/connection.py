"""
连接线类，用于连接两个端口
"""
from PyQt5.QtWidgets import QGraphicsPathItem
from PyQt5.QtCore import Qt, QTimer, QPointF  # 添加导入 QPointF
from PyQt5.QtGui import QPen, QColor, QPainterPath
import math
from UI import CONNECTION_COLOR, CONNECTION_HIGHLIGHT

class Connection(QGraphicsPathItem):
    """连接两个端口的线"""
    def __init__(self, source_port=None, dest_port=None):
        super().__init__()
        self.source_port = source_port
        self.dest_port = dest_port
        self.temp_end_point = None
        
        # 设置连接线样式
        pen = QPen(QColor(CONNECTION_COLOR), 3, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        self.setPen(pen)
        self.setZValue(1)
        self.setAcceptHoverEvents(True)
        
        # 添加流动效果
        self.flow_effect = True
        self.dash_offset = 0
        self.timer = None
        
        if source_port:
            source_port.connection = self
        if dest_port:
            dest_port.connection = self
            
        # 启动动画效果
        self.startFlowAnimation()
        
    def startFlowAnimation(self):
        """开启流动动画"""
        if not self.timer:
            self.timer = QTimer()
            self.timer.setInterval(100)  # 100ms更新一次
            self.timer.timeout.connect(self.updateFlowEffect)
            self.timer.start()
    
    def updateFlowEffect(self):
        """更新流动效果"""
        if self.flow_effect and self.isVisible():
            self.dash_offset = (self.dash_offset + 1) % 16
            pen = self.pen()
            dash_pattern = [3, 3]  # 虚线模式
            pen.setDashPattern(dash_pattern)
            pen.setDashOffset(self.dash_offset)
            self.setPen(pen)
            self.update()
            
    def update_path(self):
        if not self.source_port:
            return
            
        path = QPainterPath()
        
        # 获取起点坐标
        source_pos = self.source_port.mapToScene(0, 0)
        
        # 获取终点坐标
        if self.dest_port:
            dest_pos = self.dest_port.mapToScene(0, 0)
        elif self.temp_end_point:
            dest_pos = self.temp_end_point
        else:
            return
            
        # 计算控制点 - UE风格曲线
        dx = abs(dest_pos.x() - source_pos.x())
        control_dist = min(dx * 0.5, 150)  # 根据距离智能调整控制点
        
        control1 = QPointF(source_pos.x() + control_dist, source_pos.y())
        control2 = QPointF(dest_pos.x() - control_dist, dest_pos.y())
        
        # 绘制贝塞尔曲线
        path.moveTo(source_pos)
        path.cubicTo(control1, control2, dest_pos)
        
        # 添加箭头指示方向
        if self.dest_port:
            arrow_size = 8
            arrow_angle = math.atan2(dest_pos.y() - control2.y(), 
                                    dest_pos.x() - control2.x())
            
            arrow_p1 = QPointF(dest_pos.x() - arrow_size * math.cos(arrow_angle - math.pi/6),
                              dest_pos.y() - arrow_size * math.sin(arrow_angle - math.pi/6))
            
            arrow_p2 = QPointF(dest_pos.x() - arrow_size * math.cos(arrow_angle + math.pi/6),
                              dest_pos.y() - arrow_size * math.sin(arrow_angle + math.pi/6))
            
            path.moveTo(dest_pos)
            path.lineTo(arrow_p1)
            path.moveTo(dest_pos)
            path.lineTo(arrow_p2)
        
        self.setPath(path)
        
        # 如果是临时连接，添加虚线效果
        if self.temp_end_point:
            pen = self.pen()
            pen.setStyle(Qt.DashLine)
            self.setPen(pen)
        else:
            pen = self.pen()
            pen.setStyle(Qt.SolidLine)
            self.setPen(pen)
        
    def hoverEnterEvent(self, event):
        # 高亮连接线
        pen = QPen(QColor(CONNECTION_HIGHLIGHT), 3, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        self.setPen(pen)
        self.flow_effect = False
        super().hoverEnterEvent(event)
        
    def hoverLeaveEvent(self, event):
        # 恢复正常样式
        pen = QPen(QColor(CONNECTION_COLOR), 3, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        self.setPen(pen)
        self.flow_effect = True
        super().hoverLeaveEvent(event)
        
    def delete(self):
        # 停止动画
        if self.timer:
            self.timer.stop()
            self.timer = None
            
        if self.source_port:
            self.source_port.connection = None
        if self.dest_port:
            self.dest_port.connection = None
        if self.scene():
            self.scene().removeItem(self)
