# OmniFlow

<div align="center">

![OmniFlow Logo](./docs/images/logo.svg) 

**一款为大型语言模型（LLM）应用设计的高级、基于节点的工作流编辑器**

[![状态](https://img.shields.io/badge/状态-开发中-yellow)](https://github.com/B143KC47/OmniFlow)
[![许可协议](https://img.shields.io/badge/许可协议-非商业-red)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

[English](./README.md) | [中文文档](./README.CN.md)

</div>

> 🚧 **正在施工 - 仅供演示** 🚧
>
> OmniFlow 仍在积极开发中，许多功能尚未完成。使用过程中可能会遇到 bug 和不稳定性。 欢迎您的测试和反馈，这将帮助我们改进项目！

## 📸 概览

<div align="center">
    <img src="./docs/images/asset1.png" alt="OmniFlow 界面" width="49%" />
    <img src="./docs/images/asset2.png" alt="OmniFlow 界面" width="49%" />
</div>
<div align="center">
    <img src="./docs/images/asset3.png" alt="OmniFlow 界面" width="49%" />
    <img src="./docs/images/asset4.png" alt="OmniFlow 界面" width="49%" />
</div>

## ✨ 特性

| 功能 | 描述 |
|---------|-------------|
| 📝 **直观的编辑器** | 拖放式节点编辑器，用于可视化工作流创建 |
| 🤖 **丰富的节点类型** | 适用于各种 AI 任务的广泛节点库 |
| 🔄 **实时执行** | 实时观看您的工作流程运行 |
| 🔌 **模块化设计** | 轻松扩展自定义节点 |
| 🌐 **多服务集成** | 连接多个 AI 服务和 API |
| 🎯 **高级控制流** | 复杂的节点路由和条件执行 |
| 🎨 **美观的 UI** | 深色主题，响应式界面 |

## 🔧 技术栈

<table>
    <tr>
        <td><b>框架</b></td>
        <td>Next.js 14</td>
    </tr>
    <tr>
        <td><b>UI</b></td>
        <td>React 18, TailwindCSS</td>
    </tr>
    <tr>
        <td><b>工作流引擎</b></td>
        <td>React Flow</td>
    </tr>
    <tr>
        <td><b>状态管理</b></td>
        <td>Zustand</td>
    </tr>
    <tr>
        <td><b>类型系统</b></td>
        <td>TypeScript</td>
    </tr>
    <tr>
        <td><b>国际化</b></td>
        <td>next-intl</td>
    </tr>
</table>

## 🚀 快速开始

### 前置条件

- Node.js 16+
- npm 或 yarn
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/OmniFlow.git

# 进入项目目录
cd OmniFlow

# 安装依赖
npm install
# 或者
yarn install

# 启动开发服务器
npm run dev
# 或者
yarn dev
```

运行后，打开浏览器并访问：`http://localhost:3000`

## 📖 文档

详细文档位于 [docs](./docs) 目录中，涵盖：

- 用户指南
- API 参考
- 节点类型
- 扩展开发

## 🛠️ 开发

### 项目结构

```
OmniFlow/
├── src/
│   ├── components/    # React 组件
│   ├── services/      # 业务逻辑服务
│   ├── styles/        # 全局样式 & 主题
│   ├── types/         # TypeScript 定义
│   └── utils/         # 实用函数
├── public/            # 静态资源
└── docs/              # 文档
```

### 可用脚本

| 命令 | 描述 |
|---------|-------------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run lint` | 运行 linter |
| `npm test` | 运行测试 |

## ⚠️ 许可协议

本项目采用非商业许可协议 - 详细信息请参阅 [LICENSE](LICENSE) 文件。
**严禁商业用途。**

## 🤝 贡献

欢迎贡献！ 请先阅读我们的 [贡献指南](CONTRIBUTING.md)。

## 📫 联系方式

- **问题反馈**: [GitHub Issue Tracker](https://github.com/B143KC47/OmniFlow/issues)
- **邮箱**: ltu46166@gmail.com
- **Twitter**: [@YourTwitterHandle](https://twitter.com/YourTwitterHandle) <!-- 可选：如果项目有Twitter账号，可以添加 -->

## 🙏 鸣谢

感谢所有使本项目成为可能的开源项目：

- [React Flow](https://reactflow.dev/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)