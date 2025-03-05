import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QSplitter, QWidget, QVBoxLayout, 
                            QHBoxLayout, QTextEdit, QPushButton, QLineEdit, QLabel, 
                            QTabWidget, QScrollArea, QFrame)
from PyQt5.QtCore import Qt, QDateTime
from PyQt5.QtGui import QColor, QPainter, QFont

# 导入模组化的节点编辑器
from node_editor.view import FlowEditorView

class NodeEditorWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # 使用模组化的节点编辑器视图
        self.flow_editor = FlowEditorView(self)
        layout.addWidget(self.flow_editor)
        
        # 添加底部工具栏
        tools_layout = QHBoxLayout()
        
        self.add_process_btn = QPushButton("添加处理节点")
        self.add_process_btn.clicked.connect(self.add_process_node)
        
        self.add_condition_btn = QPushButton("添加条件节点")
        self.add_condition_btn.clicked.connect(self.add_condition_node)
        
        tools_layout.addWidget(self.add_process_btn)
        tools_layout.addWidget(self.add_condition_btn)
        tools_layout.addStretch()
        
        layout.addLayout(tools_layout)
    
    def add_process_node(self):
        # 在视图中心添加处理节点
        view_center = self.flow_editor.mapToScene(
            self.flow_editor.viewport().rect().center())
        self.flow_editor.scene.create_node("process", view_center.x(), view_center.y())
    
    def add_condition_node(self):
        # 在视图中心添加条件节点
        view_center = self.flow_editor.mapToScene(
            self.flow_editor.viewport().rect().center())
        self.flow_editor.scene.create_node("condition", view_center.x(), view_center.y())

class ChatWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        
        # Chat history display
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setStyleSheet(
            "background-color: #2D2D2D; color: #E0E0E0; border: none; font-size: 11pt;"
        )
        
        # Message input area
        input_layout = QHBoxLayout()
        
        self.message_input = QTextEdit()
        self.message_input.setFixedHeight(80)
        self.message_input.setStyleSheet(
            "background-color: #2D2D2D; color: #E0E0E0; border: 1px solid #007ACC; font-size: 11pt;"
        )
        
        self.send_button = QPushButton("Send")
        self.send_button.setStyleSheet(
            "background-color: #007ACC; color: white; font-weight: bold; padding: 8px 15px; border: none;"
        )
        self.send_button.clicked.connect(self.send_message)
        
        input_layout.addWidget(self.message_input)
        input_layout.addWidget(self.send_button)
        
        layout.addWidget(self.chat_display, stretch=1)
        layout.addLayout(input_layout)
        
        # Add welcome message
        self.add_system_message("Welcome to the LLM Chat System. Type a message to begin...")
    
    def add_message(self, message, is_user=True):
        timestamp = QDateTime.currentDateTime().toString("hh:mm")
        
        if is_user:
            name = "<span style='color: #4EC9B0; font-weight: bold;'>You</span>"
        else:
            name = "<span style='color: #569CD6; font-weight: bold;'>AI</span>"
        
        formatted_message = f"<span style='color: #7A7A7A; font-size: 9pt;'>{timestamp}</span> {name}: {message}<br><br>"
        self.chat_display.append(formatted_message)
        
    def add_system_message(self, message):
        formatted_message = f"<span style='color: #919191; font-style: italic;'>System: {message}</span><br>"
        self.chat_display.append(formatted_message)
    
    def send_message(self):
        message = self.message_input.toPlainText().strip()
        if message:
            self.add_message(message, True)
            self.message_input.clear()
            
            # Simulate AI response - in a real app, you would connect to your LLM here
            self.add_message("This is a simulated response from the LLM. You would integrate with your model API here.", False)

class ModelSettingsWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        
        form_layout = QVBoxLayout()
        
        # Model selection
        model_label = QLabel("LLM Model:")
        model_label.setStyleSheet("color: #E0E0E0; font-weight: bold;")
        self.model_input = QLineEdit("gpt-4")
        self.model_input.setStyleSheet("background-color: #2D2D2D; color: #E0E0E0; padding: 5px; border: 1px solid #3E3E3E;")
        
        # Temperature setting
        temp_label = QLabel("Temperature:")
        temp_label.setStyleSheet("color: #E0E0E0; font-weight: bold;")
        self.temp_input = QLineEdit("0.7")
        self.temp_input.setStyleSheet("background-color: #2D2D2D; color: #E0E0E0; padding: 5px; border: 1px solid #3E3E3E;")
        
        # API key
        api_label = QLabel("API Key:")
        api_label.setStyleSheet("color: #E0E0E0; font-weight: bold;")
        self.api_input = QLineEdit()
        self.api_input.setStyleSheet("background-color: #2D2D2D; color: #E0E0E0; padding: 5px; border: 1px solid #3E3E3E;")
        self.api_input.setEchoMode(QLineEdit.Password)
        
        # Add fields to layout
        for label, widget in [(model_label, self.model_input), 
                            (temp_label, self.temp_input), 
                            (api_label, self.api_input)]:
            form_layout.addWidget(label)
            form_layout.addWidget(widget)
            form_layout.addSpacing(10)
        
        # Save button
        self.save_button = QPushButton("Save Settings")
        self.save_button.setStyleSheet(
            "background-color: #007ACC; color: white; font-weight: bold; padding: 8px 15px; border: none;"
        )
        
        form_layout.addWidget(self.save_button)
        form_layout.addStretch(1)
        
        layout.addLayout(form_layout)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("LLM Chat System")
        self.resize(1200, 800)
        self.setup_ui()
        
    def setup_ui(self):
        # 设置样式表
        self.setStyleSheet("""
            QMainWindow, QWidget {
                background-color: #1E1E1E;
                color: #E0E0E0;
            }
            QSplitter::handle {
                background-color: #333333;
            }
            QTabWidget::pane {
                border: 1px solid #333333;
            }
            QTabBar::tab {
                background-color: #2D2D2D;
                color: #E0E0E0;
                padding: 8px 15px;
                margin-right: 2px;
            }
            QTabBar::tab:selected {
                background-color: #3E3E3E;
                border-bottom: 2px solid #007ACC;
            }
        """)
        
        # 主布局与分割器
        self.main_splitter = QSplitter(Qt.Horizontal)
        
        # 左侧：Chat
        self.chat_widget = ChatWidget()
        
        # 右侧：选项卡
        self.right_tabs = QTabWidget()
        
        # 设置选项卡
        self.settings_widget = ModelSettingsWidget()
        
        # 节点编辑器选项卡 - 使用模组化的NodeEditorWidget
        self.node_editor = NodeEditorWidget()
        
        # 添加选项卡
        self.right_tabs.addTab(self.settings_widget, "Model Settings")
        self.right_tabs.addTab(self.node_editor, "节点编辑器")
        
        # 将部件添加到分割器
        self.main_splitter.addWidget(self.chat_widget)
        self.main_splitter.addWidget(self.right_tabs)
        
        # 设置初始大小（2:1比例）
        self.main_splitter.setSizes([800, 400])
        
        # 设置中央部件
        self.setCentralWidget(self.main_splitter)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())