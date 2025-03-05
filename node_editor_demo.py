"""
节点编辑器演示程序
"""
import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QPushButton, QHBoxLayout
from node_editor.view import FlowEditorView

class NodeEditorDemo(QMainWindow):
    def __init__(self):
        super().__init__()
        
        # 设置窗口标题和大小
        self.setWindowTitle("流程节点编辑器")
        self.resize(1200, 800)
        
        # 创建中央部件和布局
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QVBoxLayout(central_widget)
        
        # 创建节点编辑器视图
        self.editor_view = FlowEditorView()
        main_layout.addWidget(self.editor_view)
        
        # 创建底部工具按钮
        tool_layout = QHBoxLayout()
        
        # 添加处理节点按钮
        process_btn = QPushButton("添加处理节点")
        process_btn.clicked.connect(self.add_process_node)
        
        # 添加条件节点按钮
        condition_btn = QPushButton("添加条件节点")
        condition_btn.clicked.connect(self.add_condition_node)
        
        # 聚焦所有节点按钮
        focus_btn = QPushButton("聚焦所有节点")
        focus_btn.clicked.connect(self.editor_view.frameSelectedNodes)
        
        # 添加按钮到工具栏布局
        tool_layout.addWidget(process_btn)
        tool_layout.addWidget(condition_btn)
        tool_layout.addWidget(focus_btn)
        tool_layout.addStretch()
        
        main_layout.addLayout(tool_layout)
    
    def add_process_node(self):
        """添加处理节点到视图中心"""
        view_center = self.editor_view.mapToScene(
            self.editor_view.viewport().rect().center()
        )
        self.editor_view.scene.create_node("process", view_center.x(), view_center.y())
    
    def add_condition_node(self):
        """添加条件节点到视图中心"""
        view_center = self.editor_view.mapToScene(
            self.editor_view.viewport().rect().center()
        )
        self.editor_view.scene.create_node("condition", view_center.x(), view_center.y())

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = NodeEditorDemo()
    window.show()
    sys.exit(app.exec_())
