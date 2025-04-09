/**
 * 节点样式和布局常量
 * 集中定义所有节点样式相关的常量，便于统一管理
 */

// 节点尺寸常量
export const NODE_SIZE = {
  DEFAULT_WIDTH: 260,
  MIN_WIDTH: 200,
  MIN_HEIGHT: 120,
  HEADER_HEIGHT: 42, // 与节点头部高度保持一致
  BORDER_RADIUS: 8,
  HANDLE_SIZE: 12,
};

// 节点 z-index 层级常量
export const Z_INDEX = {
  BACKGROUND: 0,
  EDGES: 2,
  NODE: 3,
  NODE_SELECTED: 100,
  HANDLE: 1000,
  MODAL: 2000,
};

// 现代暗色绿色主题节点样式
export const NODE_THEME = {
  // 所有节点类型使用相同的绿色主题
  INPUT: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  PROCESSING: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  OUTPUT: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  AI_MODEL: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  FLOW_CONTROL: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  UTILITY: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  CUSTOM: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)'
  },
  // 默认主题
  DEFAULT: {
    headerColor: 'var(--node-header-bg-gradient, linear-gradient(90deg, #10b981, #059669))',
    borderColor: 'var(--node-border, #2a2a2a)',
    titleColor: 'var(--node-title-color, #ffffff)',
    backgroundColor: 'var(--node-bg, #1a1a1a)',
    textColor: 'var(--node-text-color, #e0e0e0)',
    textMuted: 'var(--node-text-muted, #a0a0a0)',
    handleBg: 'var(--port-color, #10b981)',
    handleBorder: 'var(--node-bg, #1a1a1a)',
    handleHoverBg: 'var(--port-hover-color, #34d399)',
    handleHoverBorder: 'var(--node-bg, #1a1a1a)'
  },
  // 节点状态
  STATUS: {
    running: {
      borderColor: 'var(--primary-color, #10b981)',
      boxShadow: '0 0 0 2px var(--primary-color, #10b981), 0 0 15px rgba(16, 185, 129, 0.5)'
    },
    completed: {
      borderColor: 'var(--success-color, #10b981)',
      boxShadow: '0 0 0 2px var(--success-color, #10b981), 0 0 15px rgba(16, 185, 129, 0.5)'
    },
    error: {
      borderColor: 'var(--error-color, #ef4444)',
      boxShadow: '0 0 0 2px var(--error-color, #ef4444), 0 0 15px rgba(239, 68, 68, 0.5)'
    }
  }
};

// 动画常量
export const ANIMATIONS = {
  TRANSITION_SPEED: '0.3s',
  PULSE_ANIMATION: `pulse 2s infinite`,
  APPEAR_ANIMATION: `nodeAppear 0.3s ease-out forwards`,
  COLLAPSE_ANIMATION: `nodeCollapse 0.3s ease-out forwards`,
  EXPAND_ANIMATION: `nodeExpand 0.3s ease-out forwards`,
};

// 设置不同类型的输入输出端口的颜色映射 - 使用不同颜色区分类型
export const PORT_TYPE_COLORS = {
  'text': '#10b981',      // 绿色
  'string': '#10b981',    // 绿色
  'number': '#3b82f6',    // 蓝色
  'boolean': '#f59e0b',   // 橙色
  'image': '#06b6d4',     // 青色
  'video': '#f43f5e',     // 深红色
  'audio': '#14b8a6',     // 青绿色
  'file': '#ef4444',      // 红色
  'object': '#ec4899',    // 粉色
  'array': '#8b5cf6',     // 紫色
  'any': '#10b981',       // 绿色
  'default': '#10b981'    // 绿色
};

// 添加默认节点配置
export const DEFAULT_NODE_CONFIG = {
  // 文本输入节点
  TEXT_INPUT: {
    inputs: {
      text: { type: 'text', value: '', label: '输入文本' }
    },
    outputs: {
      text: { type: 'text', value: '' }
    }
  },
  // 图像输入节点
  IMAGE_INPUT: {
    inputs: {
      image: { type: 'image', value: null, label: '上传图像' }
    },
    outputs: {
      image: { type: 'image', value: null }
    }
  },
  // 文件输入节点
  FILE_INPUT: {
    inputs: {
      file: { type: 'file', value: null, label: '上传文件' }
    },
    outputs: {
      fileContent: { type: 'object', value: null },
      fileName: { type: 'text', value: '' },
      fileType: { type: 'text', value: '' }
    }
  },
  // LLM查询节点
  LLM_QUERY: {
    inputs: {
      prompt: { type: 'text', value: '', label: '提示词' },
      model: { type: 'text', value: '', label: '模型' }
    },
    outputs: {
      response: { type: 'text', value: '' }
    }
  },
  // 文本输出节点
  TEXT_OUTPUT: {
    inputs: {
      text: { type: 'text', value: '', label: '文本输入' }
    },
    outputs: {}
  }
};
