# OmniFlow

<div align="center">

![OmniFlow Logo](./docs/images/logo.svg) 

**An advanced node-based workflow editor designed for LLM (Large Language Model) applications**

[![Status](https://img.shields.io/badge/status-work%20in%20progress-yellow)](https://github.com/B143KC47/OmniFlow)
[![License](https://img.shields.io/badge/license-Non--Commercial-red)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)

[English](./README.md) | [中文文档](./README.CN.md)

</div>

> 🚧 **WORK IN PROGRESS - DEMO ONLY** 🚧
>
> OmniFlow is still under active development, and many features are not yet complete. Please be aware that you may encounter bugs and instability during use. Your testing and feedback are welcome and will help us improve the project!

## 📸 Showcase

<div align="center">
  <img src="./docs/images/asset1.png" alt="OmniFlow Interface" width="49%" />
  <img src="./docs/images/asset2.png" alt="OmniFlow Interface" width="49%" />
</div>
<div align="center">
  <img src="./docs/images/asset3.png" alt="OmniFlow Interface" width="49%" />
  <img src="./docs/images/asset4.png" alt="OmniFlow Interface" width="49%" />
</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Intuitive Editor** | Drag-and-drop node editor for visual workflow creation |
| 🤖 **Rich Node Types** | Extensive library of nodes for various AI tasks |
| 🔄 **Real-time Execution** | Watch your workflows run in real-time |
| 🔌 **Modular Design** | Easily extend with custom nodes |
| 🌐 **Multi-service Integration** | Connect with multiple AI services and APIs |
| 🎯 **Advanced Control Flow** | Complex node routing and conditional execution |
| 🎨 **Beautiful UI** | Dark-themed, responsive interface |

## 🔧 Tech Stack

<table>
  <tr>
    <td><b>Framework</b></td>
    <td>Next.js 14</td>
  </tr>
  <tr>
    <td><b>UI</b></td>
    <td>React 18, TailwindCSS</td>
  </tr>
  <tr>
    <td><b>Workflow Engine</b></td>
    <td>React Flow</td>
  </tr>
  <tr>
    <td><b>State Management</b></td>
    <td>Zustand</td>
  </tr>
  <tr>
    <td><b>Type System</b></td>
    <td>TypeScript</td>
  </tr>
  <tr>
    <td><b>I18n</b></td>
    <td>next-intl</td>
  </tr>
</table>

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/OmniFlow.git

# Navigate to project directory
cd OmniFlow

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

Once running, open your browser and visit: `http://localhost:3000`

## 📖 Documentation

Detailed documentation can be found in the [docs](./docs) directory, covering:

- User Guide
- API Reference
- Node Types
- Extension Development

## 🛠️ Development

### Project Structure

```
OmniFlow/
├── src/
│   ├── components/    # React components
│   ├── services/      # Business logic services
│   ├── styles/        # Global styles & themes
│   ├── types/         # TypeScript definitions
│   └── utils/         # Utility functions
├── public/            # Static assets
└── docs/              # Documentation
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run linter |
| `npm test` | Run tests |

## ⚠️ License

This project is licensed under a Non-Commercial License - see the [LICENSE](LICENSE) file for details.
**Commercial use is strictly prohibited.**

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📫 Contact

- **Issues**: [GitHub Issue Tracker](https://github.com/B143KC47/OmniFlow/issues)
- **Email**: ltu46166@gmail.com
- **Twitter**: [@B14ckc4t1337](https://x.com/B14ckc4t1337) <!-- 如果有Twitter账号，可以添加 -->

## 🙏 Acknowledgments

Thanks to all the open-source projects that made this possible:

- [React Flow](https://reactflow.dev/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)