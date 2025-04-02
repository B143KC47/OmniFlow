/**
 * 节点样式和布局常量
 * 集中定义所有节点样式相关的常量，便于统一管理
 */

// 节点尺寸常量
export const NODE_SIZE = {
  DEFAULT_WIDTH: 240,
  MIN_WIDTH: 200,
  MIN_HEIGHT: 120,
  HEADER_HEIGHT: 40,
  BORDER_RADIUS: 6,
  HANDLE_SIZE: 10,
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

// 修改NODE_THEME，确保所有主题类型包含backgroundColor属性
export const NODE_THEME = {
  // 节点类型对应的颜色主题
  INPUT: {
    headerColor: 'var(--input-node-header, #2c3e50)',
    borderColor: 'var(--input-node-border, #34495e)', 
    titleColor: 'var(--input-node-title, #ecf0f1)',
    backgroundColor: 'var(--input-node-bg, #2d2d2d)'
  },
  PROCESSING: {
    headerColor: 'var(--processing-node-header, #16a085)',
    borderColor: 'var(--processing-node-border, #1abc9c)',
    titleColor: 'var(--processing-node-title, #ecf0f1)',
    backgroundColor: 'var(--processing-node-bg, #2d2d2d)'
  },
  OUTPUT: {
    headerColor: 'var(--output-node-header, #c0392b)',
    borderColor: 'var(--output-node-border, #e74c3c)',
    titleColor: 'var(--output-node-title, #ecf0f1)',
    backgroundColor: 'var(--output-node-bg, #2d2d2d)'
  },
  AI_MODEL: {
    headerColor: 'var(--ai-node-header, #8e44ad)',
    borderColor: 'var(--ai-node-border, #9b59b6)',
    titleColor: 'var(--ai-node-title, #ecf0f1)',
    backgroundColor: 'var(--ai-node-bg, #2d2d2d)'
  },
  FLOW_CONTROL: {
    headerColor: 'var(--flow-node-header, #2980b9)',
    borderColor: 'var(--flow-node-border, #3498db)',
    titleColor: 'var(--flow-node-title, #ecf0f1)',
    backgroundColor: 'var(--flow-node-bg, #2d2d2d)'
  },
  UTILITY: {
    headerColor: 'var(--utility-node-header, #27ae60)',
    borderColor: 'var(--utility-node-border, #2ecc71)',
    titleColor: 'var(--utility-node-title, #ecf0f1)',
    backgroundColor: 'var(--utility-node-bg, #2d2d2d)'
  },
  CUSTOM: {
    headerColor: 'var(--custom-node-header, #d35400)',
    borderColor: 'var(--custom-node-border, #e67e22)',
    titleColor: 'var(--custom-node-title, #ecf0f1)',
    backgroundColor: 'var(--custom-node-bg, #2d2d2d)'
  },
  // 默认主题
  DEFAULT: {
    headerColor: 'var(--node-header-color, #383838)',
    borderColor: 'var(--node-border-color, #444)',
    titleColor: 'var(--node-title-color, #eee)',
    backgroundColor: 'var(--node-color, #2d2d2d)',
    textColor: 'var(--node-text-color, #ddd)',
    textMuted: 'var(--node-text-muted, #aaa)',
    handleBg: 'var(--handle-bg, #555)',
    handleBorder: 'var(--handle-border, #888)',
    handleHoverBg: 'var(--handle-hover-bg, #777)',
    handleHoverBorder: 'var(--handle-hover-border, #aaa)'
  },
  // 节点状态
  STATUS: {
    running: {
      borderColor: 'var(--primary-color, #10a37f)',
      boxShadow: '0 0 0 2px var(--primary-color, #10a37f), 0 0 10px rgba(16, 163, 127, 0.4)'
    },
    completed: {
      borderColor: 'var(--success-color, #2ecc71)',
      boxShadow: '0 0 0 2px var(--success-color, #2ecc71), 0 0 10px rgba(46, 204, 113, 0.4)'
    },
    error: {
      borderColor: 'var(--error-color, #e74c3c)',
      boxShadow: '0 0 0 2px var(--error-color, #e74c3c), 0 0 10px rgba(231, 76, 60, 0.4)'
    }
  }
};

// 动画常量
export const ANIMATIONS = {
  TRANSITION_SPEED: '0.2s',
  PULSE_ANIMATION: `pulse 2s infinite`,
};

// 设置不同类型的输入输出端口的颜色映射
export const PORT_TYPE_COLORS = {
  'text': '#4caf50',    // 绿色
  'number': '#2196f3',  // 蓝色
  'boolean': '#ff9800', // 橙色
  'image': '#9c27b0',   // 紫色
  'video': '#e91e63',   // 粉色
  'audio': '#3f51b5',   // 靛蓝色
  'file': '#795548',    // 棕色
  'object': '#607d8b',  // 蓝灰色
  'array': '#009688',   // 蓝绿色
  'any': '#9e9e9e',     // 灰色
  'default': '#9c27b0'  // 默认紫色
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