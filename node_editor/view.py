"""
节点编辑器视图
"""
from PyQt5.QtWidgets import QGraphicsView
from PyQt5.QtCore import Qt, QPoint
from PyQt5.QtGui import QPainter, QMouseEvent

from node_editor.scene import FlowEditorScene
from node_editor.core.node import Node

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
        
        # 添加控制快捷键提示
        self.setToolTip(
            "导航控制:\n"
            "- 鼠标滚轮: 缩放视图\n"
            "- 鼠标中键: 平移视图\n"
            "- 右键: 上下文菜单\n"
            "- F键: 聚焦所选节点"
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
        from PyQt5.QtWidgets import QMenu, QAction
        
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
