"""
节点基类，所有节点类型都继承自此类
"""
from PyQt5.QtWidgets import (QGraphicsRectItem, QGraphicsPathItem, 
                            QGraphicsTextItem, QGraphicsDropShadowEffect,
                            QMenu, QAction, QGraphicsItem)  # 添加 QGraphicsItem 导入
from PyQt5.QtCore import Qt, QRectF
from PyQt5.QtGui import QPen, QBrush, QColor, QPainterPath, QFont, QPainter, QLinearGradient
import uuid

from node_editor.core.port import Port
from UI import (NODE_WIDTH, NODE_HEIGHT, NODE_TITLE_HEIGHT, NODE_RADIUS, 
               NODE_COLOR, NODE_BORDER_COLOR, NODE_TITLE_COLOR, GLOW_COLOR,
               NODE_TITLE_FONT_SIZE, PORT_MARGIN,
               SHADOW_BLUR_RADIUS, SHADOW_COLOR, SHADOW_OFFSET, GLOW_RADIUS)

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
