from PyQt5.QtWidgets import (QGraphicsView, QGraphicsScene, QGraphicsItem, 
                            QGraphicsRectItem, QGraphicsEllipseItem, QGraphicsPathItem,
                            QGraphicsTextItem, QMenu, QAction, QGraphicsSceneMouseEvent,
                            QGraphicsDropShadowEffect)
from PyQt5.QtCore import Qt, QRectF, QPointF, QSizeF, QPoint, QTimer
from PyQt5.QtGui import (QPen, QBrush, QColor, QPainterPath, QFont, QPainter, 
                        QCursor, QMouseEvent, QLinearGradient, QRadialGradient)
import math
import uuid
from UI import *

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
        self.setBrush(QBrush(QColor(PORT_HOVER_COLOR)))
        
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

class Connection(QGraphicsPathItem):
    """连接两个端口的线"""
    def __init__(self, source_port=None, dest_port=None):
        super().__init__()
        self.source_port = source_port
        self.dest_port = dest_port
        self.temp_end_point = None
        
        # 设置连接线样式 - 确保宽度是整数
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
        # 高亮连接线 - 确保宽度是整数
        pen = QPen(QColor(CONNECTION_HIGHLIGHT), 3, Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin)
        self.setPen(pen)
        self.flow_effect = False
        super().hoverEnterEvent(event)
        
    def hoverLeaveEvent(self, event):
        # 恢复正常样式 - 确保宽度是整数
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

class Node(QGraphicsRectItem):
    """节点基类"""
    def __init__(self, title="Node", scene=None, inputs=1, outputs=1):
        super().__init__(0, 0, NODE_WIDTH, NODE_HEIGHT)
        self.id = str(uuid.uuid4())
        self.title = title
        self.parent_scene = scene
        self.input_ports = []
        self.output_ports = []
        self.content_widget = None
        self.is_hovered = False
        
        # 设置基本样式
        self.setFlag(QGraphicsItem.ItemIsMovable)
        self.setFlag(QGraphicsItem.ItemIsSelectable)
        self.setFlag(QGraphicsItem.ItemSendsGeometryChanges)
        self.setAcceptHoverEvents(True)
        
        # 创建阴影效果
        self.shadow_effect = QGraphicsDropShadowEffect()
        self.shadow_effect.setBlurRadius(SHADOW_BLUR_RADIUS)
        self.shadow_effect.setColor(QColor(SHADOW_COLOR))
        self.shadow_effect.setOffset(SHADOW_OFFSET / 2, SHADOW_OFFSET)
        
        # 建立UI组件
        self._setup_ui()
        self._create_ports(inputs, outputs)
        
    def paint(self, painter, option, widget):
        """重写绘制方法，添加渐变和圆角"""
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 创建节点主体路径（带圆角）
        path = QPainterPath()
        path.addRoundedRect(self.rect(), NODE_RADIUS, NODE_RADIUS)
        
        # 定义节点渐变颜色 (在子类中设置具体颜色)
        gradient = QLinearGradient(0, 0, 0, NODE_HEIGHT)
        gradient.setColorAt(0, QColor(NODE_COLOR))
        gradient.setColorAt(1, QColor(NODE_COLOR).darker(110))
        
        # 绘制节点主体
        painter.fillPath(path, QBrush(gradient))
        
        # 绘制选中或悬停效果
        if self.isSelected():
            # 创建选中高亮边框
            glow_pen = QPen(QColor(GLOW_COLOR))
            glow_pen.setWidth(2)
            painter.setPen(glow_pen)
            
            # 添加边缘发光效果
            glow_path = QPainterPath()
            glow_path.addRoundedRect(self.rect().adjusted(-2, -2, 2, 2), NODE_RADIUS, NODE_RADIUS)
            painter.strokePath(glow_path, QPen(QColor(GLOW_COLOR).lighter(150), 1))
        elif self.is_hovered:
            # 悬停效果
            hover_pen = QPen(QColor(NODE_BORDER_COLOR).lighter(130))
            hover_pen.setWidth(2)
            painter.setPen(hover_pen)
        else:
            border_pen = QPen(QColor(NODE_BORDER_COLOR))
            border_pen.setWidth(2)
            painter.setPen(border_pen)
            
        painter.drawPath(path)
        
        # 如果是选中状态，添加额外的细节
        if self.isSelected():
            # 添加顶部高亮线
            highlight_path = QPainterPath()
            highlight_path.moveTo(NODE_RADIUS, 0)
            highlight_path.lineTo(NODE_WIDTH - NODE_RADIUS, 0)
            
            highlight_pen = QPen(QColor(GLOW_COLOR).lighter(130), 2)
            painter.strokePath(highlight_path, highlight_pen)
        
    def _setup_ui(self):
        """设置节点UI组件"""
        # 标题背景 - 使用QGraphicsPathItem支持圆角
        title_path = QPainterPath()
        title_path.addRoundedRect(
            0, 0, NODE_WIDTH, NODE_TITLE_HEIGHT, 
            NODE_RADIUS, NODE_RADIUS
        )
        title_path.addRect(
            0, NODE_TITLE_HEIGHT - NODE_RADIUS, 
            NODE_WIDTH, NODE_RADIUS
        )
        
        self.title_bg = QGraphicsPathItem(title_path, self)
        
        # 设置标题背景渐变
        title_brush = QBrush(QColor(NODE_TITLE_COLOR))
        self.title_bg.setBrush(title_brush)
        self.title_bg.setPen(QPen(Qt.NoPen))
        
        # 标题文本
        self.title_item = QGraphicsTextItem(self.title, self)
        self.title_item.setDefaultTextColor(QColor(Qt.white))
        font = QFont()
        font.setPointSize(NODE_TITLE_FONT_SIZE)
        font.setBold(True)
        self.title_item.setFont(font)
        
        title_width = self.title_item.boundingRect().width()
        title_pos = (NODE_WIDTH - title_width) / 2
        self.title_item.setPos(title_pos, (NODE_TITLE_HEIGHT - self.title_item.boundingRect().height()) / 2)
        
    def hoverEnterEvent(self, event):
        """鼠标悬停事件"""
        self.is_hovered = True
        self.update()
        super().hoverEnterEvent(event)
        
    def hoverLeaveEvent(self, event):
        """鼠标离开事件"""
        self.is_hovered = False
        self.update()
        super().hoverLeaveEvent(event)
        
    def _create_ports(self, inputs, outputs):
        """创建输入和输出端口"""
        # 创建输入端口
        for i in range(inputs):
            port = Port(self, "input", f"In {i+1}" if inputs > 1 else "In")
            x_pos = PORT_MARGIN
            y_pos = NODE_TITLE_HEIGHT + (i+1) * (NODE_HEIGHT - NODE_TITLE_HEIGHT) / (inputs + 1)
            port.setPos(x_pos, y_pos)
            self.input_ports.append(port)
            
        # 创建输出端口
        for i in range(outputs):
            port = Port(self, "output", f"Out {i+1}" if outputs > 1 else "Out")
            x_pos = NODE_WIDTH - PORT_MARGIN
            y_pos = NODE_TITLE_HEIGHT + (i+1) * (NODE_HEIGHT - NODE_TITLE_HEIGHT) / (outputs + 1)
            port.setPos(x_pos, y_pos)
            self.output_ports.append(port)
        
    def itemChange(self, change, value):
        """处理节点变化，如位置变化时更新连接线"""
        if change == QGraphicsItem.ItemPositionChange and self.scene():
            # 更新所有连接线
            for port in self.input_ports + self.output_ports:
                if port.connection:
                    port.connection.update_path()
                    
        elif change == QGraphicsItem.ItemSelectedChange:
            # 选中状态变化时更新阴影
            if value:
                # 增强阴影效果
                self.shadow_effect.setBlurRadius(GLOW_RADIUS)
                self.shadow_effect.setColor(QColor(GLOW_COLOR))
            else:
                # 恢复正常阴影
                self.shadow_effect.setBlurRadius(SHADOW_BLUR_RADIUS)
                self.shadow_effect.setColor(QColor(SHADOW_COLOR))
                
        return super().itemChange(change, value)
    
    def mousePressEvent(self, event):
        """鼠标按下事件处理"""
        if event.button() == Qt.LeftButton:
            # 将节点置于顶层
            self.setZValue(10)
        super().mousePressEvent(event)
        
    def mouseReleaseEvent(self, event):
        """鼠标释放事件处理"""
        # 恢复正常Z轴值
        self.setZValue(1)
        super().mouseReleaseEvent(event)
        
    def contextMenuEvent(self, event):
        """右键菜单"""
        menu = QMenu()
        delete_action = QAction("删除节点", menu)
        menu.addAction(delete_action)
        
        selected_action = menu.exec_(event.screenPos())
        
        if selected_action == delete_action:
            self.delete()
            
    def delete(self):
        """删除节点及其连接"""
        # 删除所有连接线
        for port in self.input_ports + self.output_ports:
            if port.connection:
                port.connection.delete()
        
        # 从场景中移除
        if self.scene():
            self.scene().removeItem(self)

class FlowStartNode(Node):
    """开始节点"""
    def __init__(self, scene=None):
        super().__init__("Start", scene, 0, 1)
        # 设置开始节点特有样式
        
    def paint(self, painter, option, widget):
        """使用绿色渐变"""
        painter.setRenderHint(QPainter.Antialiasing)
        
        path = QPainterPath()
        path.addRoundedRect(self.rect(), NODE_RADIUS, NODE_RADIUS)
        
        gradient = QLinearGradient(0, 0, 0, NODE_HEIGHT)
        gradient.setColorAt(0, QColor(START_NODE_COLOR_TOP))
        gradient.setColorAt(1, QColor(START_NODE_COLOR_BOTTOM))
        
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
            item = self.itemAt(event.scenePos(), QGraphicsView.transform())
            
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

class FlowEditorView(QGraphicsView):
    """节点编辑器视图"""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.scene = FlowEditorScene(self)
        self.setScene(self.scene)
        
        # 设置视图属性
        self.setRenderHint(QPainter.Antialiasing)
        self.setViewportUpdateMode(QGraphicsView.FullViewportUpdate)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOn)
        self.setTransformationAnchor(QGraphicsView.AnchorUnderMouse)
        self.setResizeAnchor(QGraphicsView.AnchorUnderMouse)
        
        # 视图交互状态
        self.panning = False
        self.last_mouse_pos = QPoint()
        self.show_minimap = True  # 显示小地图
        
        # 添加UE风格的视图控制快捷键提示
        self.setToolTip(
            "导航控制:\n"
            "- 鼠标滚轮: 缩放视图\n"
            "- 鼠标中键: 平移视图\n"
            "- 右键: 上下文菜单\n"
            "- F键: 聚焦所选节点\n"
            "- H键: 显示/隐藏小地图"
        )
        
        # 初始缩放
        self.scale(0.8, 0.8)
        
        # 中心居中
        self.centerOn(400, 300)
    
    def keyPressEvent(self, event):
        """处理键盘事件"""
        if event.key() == Qt.Key_F:
            # 聚焦到选中节点
            self.frameSelectedNodes()
        elif event.key() == Qt.Key_H:
            # 显示/隐藏小地图
            self.show_minimap = not self.show_minimap
            self.viewport().update()
        else:
            super().keyPressEvent(event)
    
    def frameSelectedNodes(self):
        """使视图聚焦到选中的节点"""
        selected_nodes = [item for item in self.scene.selectedItems() if isinstance(item, Node)]
        if not selected_nodes:
            # 如果没有选中节点，则显示所有节点
            all_nodes = [item for item in self.scene.items() if isinstance(item, Node)]
            if all_nodes:
                # 计算所有节点的边界矩形
                rect = all_nodes[0].sceneBoundingRect()
                for node in all_nodes[1:]:
                    rect = rect.united(node.sceneBoundingRect())
                    
                # 添加一些边距
                rect.adjust(-50, -50, 50, 50)
                self.fitInView(rect, Qt.KeepAspectRatio)
        else:
            # 仅聚焦选中节点
            rect = selected_nodes[0].sceneBoundingRect()
            for node in selected_nodes[1:]:
                rect = rect.united(node.sceneBoundingRect())
                
            # 添加边距
            rect.adjust(-30, -30, 30, 30)
            self.fitInView(rect, Qt.KeepAspectRatio)
    
    def drawForeground(self, painter, rect):
        """绘制前景层，添加小地图"""
        super().drawForeground(painter, rect)
        
        # 如果启用了小地图，则绘制小地图
        if self.show_minimap:
            self.drawMinimap(painter)
    
    def drawMinimap(self, painter):
        """绘制UE风格的小地图导航"""
        # 设置小地图尺寸和位置
        minimap_width = 200
        minimap_height = 150
        margin = 10
        
        minimap_rect = QRectF(
            self.viewport().width() - minimap_width - margin,
            self.viewport().height() - minimap_height - margin,
            minimap_width,
            minimap_height
        )
        
        # 绘制小地图背景
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QBrush(QColor(DARK_BG).darker(120)))
        painter.setPen(QPen(QColor(CONNECTION_COLOR).darker(130), 1))
        # 使用QRectF绘制，而不是分开传递参数
        painter.drawRoundedRect(minimap_rect, 5, 5)
        
        # 计算场景的可见范围
        scene_rect = self.scene.itemsBoundingRect()
        all_nodes = [item for item in self.scene.items() if isinstance(item, Node)]
        if not all_nodes:
            return
        
        # 计算缩放比例
        scale_x = minimap_width / max(1, scene_rect.width())
        scale_y = minimap_height / max(1, scene_rect.height())
        scale = min(scale_x, scale_y) * 0.8  # 留出一些边距
        
        # 小地图中心点
        center_x = minimap_rect.x() + minimap_width / 2
        center_y = minimap_rect.y() + minimap_height / 2
        
        # 绘制节点
        for node in all_nodes:
            node_rect = node.sceneBoundingRect()
            
            # 计算节点在小地图上的位置和大小
            mini_x = center_x + (node_rect.x() - scene_rect.center().x()) * scale
            mini_y = center_y + (node_rect.y() - scene_rect.center().y()) * scale
            mini_w = node_rect.width() * scale
            mini_h = node_rect.height() * scale
            
            # 绘制节点矩形 - 使用QRectF而不是分开传递浮点数参数
            rect = QRectF(mini_x, mini_y, mini_w, mini_h)
            
            # 绘制节点矩形
            if isinstance(node, FlowStartNode):
                painter.setBrush(QBrush(QColor(START_NODE_COLOR_BOTTOM)))
            elif isinstance(node, FlowEndNode):
                painter.setBrush(QBrush(QColor(END_NODE_COLOR_BOTTOM)))
            elif isinstance(node, ConditionNode):
                painter.setBrush(QBrush(QColor(CONDITION_NODE_COLOR_BOTTOM)))
            else:
                painter.setBrush(QBrush(QColor(PROCESS_NODE_COLOR_BOTTOM)))
            
            painter.setPen(QPen(Qt.NoPen))
            painter.drawRect(rect)  # 使用QRectF绘制
        
        # 绘制当前视图矩形
        view_rect = self.mapToScene(self.viewport().rect()).boundingRect()
        mini_view_x = center_x + (view_rect.x() - scene_rect.center().x()) * scale
        mini_view_y = center_y + (view_rect.y() - scene_rect.center().y()) * scale
        mini_view_w = view_rect.width() * scale
        mini_view_h = view_rect.height() * scale
        
        # 创建QRectF对象
        mini_view_rect = QRectF(mini_view_x, mini_view_y, mini_view_w, mini_view_h)
        
        painter.setPen(QPen(QColor(GLOW_COLOR), 1))
        glow_color = QColor(GLOW_COLOR).lighter(200)
        glow_color.setAlpha(50)
        painter.setBrush(QBrush(glow_color))
        painter.drawRect(mini_view_rect)  # 使用QRectF绘制
    
    def wheelEvent(self, event):
        """鼠标滚轮事件，用于缩放"""
        zoom_in_factor = 1.25
        zoom_out_factor = 1 / zoom_in_factor
        
        # 当前缩放级别
        current_zoom = self.transform().m11()
        
        if event.angleDelta().y() > 0:
            # 放大
            if current_zoom < 2.5:  # 最大缩放限制
                self.scale(zoom_in_factor, zoom_in_factor)
        else:
            # 缩小
            if current_zoom > 0.3:  # 最小缩放限制
                self.scale(zoom_out_factor, zoom_out_factor)
    
    def contextMenuEvent(self, event):
        """右键菜单，用于创建节点"""
        menu = QMenu()
        process_action = QAction("添加处理节点", menu)
        condition_action = QAction("添加条件节点", menu)
        menu.addAction(process_action)
        menu.addAction(condition_action)
        
        selected_action = menu.exec_(event.globalPos())
        
        if selected_action == process_action:
            pos = self.mapToScene(event.pos())
            self.scene.create_node("process", pos.x(), pos.y())
        elif selected_action == condition_action:
            pos = self.mapToScene(event.pos())
            self.scene.create_node("condition", pos.x(), pos.y())
    
    def mousePressEvent(self, event):
        """鼠标按下事件，用于拖动视图"""
        if event.button() == Qt.MiddleButton:
            self.setDragMode(QGraphicsView.ScrollHandDrag)
            # 临时切换为鼠标左键，以启用拖动
            fake_event = QMouseEvent(
                QMouseEvent.MouseButtonPress,
                event.pos(),
                Qt.LeftButton,
                Qt.LeftButton,
                Qt.NoModifier
            )
            super().mousePressEvent(fake_event)
        else:
            super().mousePressEvent(event)
            
    def mouseReleaseEvent(self, event):
        """鼠标释放事件"""
        if event.button() == Qt.MiddleButton:
            # 恢复默认设置
            self.setDragMode(QGraphicsView.NoDrag)
            # 临时切换为鼠标左键，以完成拖动
            fake_event = QMouseEvent(
                QMouseEvent.MouseButtonRelease,
                event.pos(),
                Qt.LeftButton,
                Qt.LeftButton,
                Qt.NoModifier
            )
            super().mouseReleaseEvent(fake_event)
        else:
            super().mouseReleaseEvent(event)
