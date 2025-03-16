# OmniFlow

OmniFlow 是一个为 LLM (大语言模型) 应用设计的高级节点式工作流编辑器，支持可视化构建和执行复杂的 AI 工作流。

[English](./README.md)

![OmniFlow 界面](./docs/images/screenshot.png)

## ✨ 特性

- 📝 直观的拖放式节点编辑界面
- 🤖 丰富的节点类型，支持各种 AI 任务
- 🔄 实时工作流执行和状态可视化
- 🔌 模块化设计，易于扩展
- 🌐 支持多种外部服务集成
- 🎯 高级节点路由和控制功能
- 🎨 精美的深色主题界面

## 🔧 技术栈

- **框架**: Next.js 14
- **UI组件**: React 18, TailwindCSS
- **工作流引擎**: React Flow
- **状态管理**: Zustand
- **类型系统**: TypeScript
- **国际化**: next-intl

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn
- Git

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/OmniFlow.git

# 安装依赖
cd OmniFlow
npm install

# 启动开发服务器
npm run dev
```

在浏览器中访问 `http://localhost:3000`。

## 📖 文档

详细文档请查看 [docs](./docs) 目录。

## 🛠️ 开发指南

### 项目结构

```
OmniFlow/
├── src/
│   ├── components/    # React组件
│   ├── services/     # 业务逻辑服务
│   ├── styles/       # 全局样式和主题
│   ├── types/        # TypeScript类型定义
│   └── utils/        # 工具函数
├── public/           # 静态资源
└── docs/            # 文档
```

### 可用脚本

- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run lint`: 运行代码检查
- `npm test`: 运行测试

## ⚠️ 许可证

本项目使用非商业许可证 - 详见 [LICENSE](LICENSE) 文件。
严禁商业使用。

## 🤝 贡献

欢迎贡献！请先阅读我们的[贡献指南](CONTRIBUTING.md)。

## 📫 联系方式

- 提交问题: [Issue 追踪](https://github.com/yourusername/OmniFlow/issues)
- 电子邮件: your.email@example.com

## 🙏 致谢

感谢以下开源项目的支持：

- [React Flow](https://reactflow.dev/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
