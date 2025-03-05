import sys
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QSplitter, QWidget, QVBoxLayout, 
                            QHBoxLayout, QTextEdit, QPushButton, QLineEdit, QLabel, 
                            QTabWidget, QScrollArea, QFrame, QMessageBox)
from PyQt5.QtCore import Qt, QDateTime
from PyQt5.QtGui import QColor, QPainter, QFont

# 导入模组化的节点编辑器
from node_editor.view import FlowEditorView
from chat_ui import EnhancedChatWidget
from chat_history import ChatSessionManager
from chat_settings import ChatSettingsWidget
from llm_connector import LLMConnector

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
        self.setWindowTitle("OmniFlow 对话编辑系统")
        self.resize(1200, 800)
        
        # 创建LLM连接器
        self.llm_connector = LLMConnector()
        
        # 设置UI
        self.setup_ui()
        
        # 设置信号连接
        self.setup_connections()
        
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
        
        # 聊天界面区域 - 包含聊天历史管理和聊天窗口
        chat_container = QWidget()
        chat_layout = QHBoxLayout(chat_container)
        chat_layout.setContentsMargins(0, 0, 0, 0)
        chat_layout.setSpacing(0)
        
        # 聊天历史管理
        self.session_manager = ChatSessionManager()
        self.session_manager.setMaximumWidth(250)
        
        # 增强的聊天界面
        self.chat_widget = EnhancedChatWidget()
        
        chat_layout.addWidget(self.session_manager)
        chat_layout.addWidget(self.chat_widget)
        
        # 右侧：选项卡
        self.right_tabs = QTabWidget()
        
        # 设置选项卡
        self.settings_widget = ChatSettingsWidget()
        
        # 节点编辑器选项卡 - 使用模组化的NodeEditorWidget
        self.node_editor = NodeEditorWidget()
        
        # 添加选项卡
        self.right_tabs.addTab(self.settings_widget, "模型设置")
        self.right_tabs.addTab(self.node_editor, "节点编辑器")
        
        # 将部件添加到分割器
        self.main_splitter.addWidget(chat_container)
        self.main_splitter.addWidget(self.right_tabs)
        
        # 设置初始大小比例
        self.main_splitter.setSizes([800, 400])
        
        # 设置中央部件
        self.setCentralWidget(self.main_splitter)
        
        # 状态栏显示当前模型
        self.statusBar().showMessage(f"当前模型: {self.llm_connector.settings['model']}")
    
    def setup_connections(self):
        """设置信号和槽连接"""
        # 聊天窗口信号
        self.chat_widget.messageSent.connect(self.on_message_sent)
        
        # 聊天历史信号
        self.session_manager.sessionSelected.connect(self.on_session_selected)
        self.session_manager.newSessionCreated.connect(self.on_new_session)
        
        # 设置窗口信号
        self.settings_widget.settingsChanged.connect(self.on_settings_changed)
        
        # LLM连接器信号
        self.llm_connector.responseReceived.connect(self.on_llm_response)
        self.llm_connector.errorOccurred.connect(self.on_llm_error)
        
        # 加载设置
        self.settings_widget.load_settings()
    
    def on_message_sent(self, message):
        """处理发送的消息"""
        # 保存消息到会话
        self.session_manager.save_message(message, True)
        
        # 发送消息到LLM
        self.llm_connector.send_message(message)
        
        # 显示正在输入的提示
        self.chat_widget.message_area.add_system_message("AI正在思考...")
    
    def on_llm_response(self, response):
        """处理LLM响应"""
        # 移除"正在思考"提示
        container = self.chat_widget.message_area.widget()
        if container:
            layout = container.layout()
            if layout and layout.count() > 1:
                # 获取最后一个非拉伸项
                item = layout.itemAt(layout.count() - 2)
                if item and item.widget():
                    widget = item.widget()
                    if isinstance(widget, QLabel) and "AI正在思考..." in widget.text():
                        widget.deleteLater()
        
        # 显示响应
        self.chat_widget.message_area.add_message(response, False)
        
        # 保存到会话
        self.session_manager.save_message(response, False)
    
    def on_llm_error(self, error):
        """处理LLM错误"""
        # 显示错误消息
        self.chat_widget.message_area.add_system_message(f"错误: {error}")
    
    def on_session_selected(self, session_id, messages):
        """处理选择会话事件"""
        # 清除当前聊天
        self.chat_widget.clear_chat()
        
        # 加载历史消息
        for msg in messages:
            self.chat_widget.message_area.add_message(
                msg['content'], 
                msg['is_user']
            )
        
        # 更新LLM连接器的历史
        self.llm_connector.set_history(messages)
    
    def on_new_session(self, session_id):
        """处理新建会话事件"""
        self.chat_widget.clear_chat()
        self.llm_connector.clear_history()
    
    def on_settings_changed(self, settings):
        """处理设置变更"""
        # 更新LLM连接器设置
        self.llm_connector.update_settings(settings)
        
        # 更新状态栏
        self.statusBar().showMessage(f"当前模型: {settings['model']}")
        
        # 应用主题
        if 'dark_mode' in settings:
            # 在这里可以实现主题切换
            pass
            
        # 应用字体大小
        if 'font_size' in settings:
            font_size = 11  # 默认中等大小
            if settings['font_size'] == "小":
                font_size = 9
            elif settings['font_size'] == "大":
                font_size = 13
                
            # 可以在这里应用字体大小
            
    def closeEvent(self, event):
        """应用关闭事件"""
        # 您可以在这里添加提示保存会话等功能
        event.accept()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())