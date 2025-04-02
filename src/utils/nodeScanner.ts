// 节点扫描器工具
// 这个文件提供了节点组件的发现和映射功能

import { NodeDefinition } from '../services/NodeDiscoveryService';
import dynamic from 'next/dynamic';

// 命名规则接口
interface NamingConvention {
  nodeTypeToFileName: (nodeType: string) => string;
  fileNameToNodeType: (fileName: string) => string;
}

// 默认命名约定
const DefaultNamingConvention: NamingConvention = {
  // 将节点类型转换为文件名
  nodeTypeToFileName: (nodeType: string): string => {
    return nodeType
      .split('_')
      .map((part, index) => 
        // 首个单词首字母大写，其余单词全部首字母大写
        index === 0 
          ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join('') + 'Node';
  },
  
  // 将文件名转换为节点类型
  fileNameToNodeType: (fileName: string): string => {
    // 去除 "Node" 后缀
    const baseName = fileName.replace(/Node$/, '');
    
    // 插入下划线并转为大写
    return baseName
      .replace(/([A-Z])/g, '_$1') // 在大写字母前插入下划线
      .replace(/^_/, '') // 移除开头的下划线
      .toUpperCase();
  }
};

// 预定义的节点映射，避免使用 require.context
const PREDEFINED_NODES: Record<string, NodeDefinition[]> = {
  // 基本输入节点
  input: [
    {
      id: 'TEXT_INPUT',
      type: 'TEXT_INPUT',
      name: '文本输入',
      description: '文本输入节点',
      category: 'input',
      inputs: 0,
      outputs: 1,
      icon: 'text',
      component: 'input/TextInputNode'
    },
    {
      id: 'FILE_INPUT',
      type: 'FILE_INPUT',
      name: '文件输入',
      description: '文件上传和处理节点',
      category: 'input',
      inputs: 0,
      outputs: 1,
      icon: 'file',
      component: 'input/FileInputNode'
    },
    {
      id: 'IMAGE_INPUT',
      type: 'IMAGE_INPUT',
      name: '图像输入',
      description: '图像输入节点',
      category: 'input',
      inputs: 0,
      outputs: 1,
      icon: 'image',
      component: 'input/ImageInputNode'
    }
  ],
  
  // AI任务执行节点
  ai: [
    {
      id: 'MODEL_SELECTOR',
      type: 'MODEL_SELECTOR',
      name: '模型选择器',
      description: '选择AI模型和参数的节点',
      category: 'ai',
      inputs: 0,
      outputs: 1,
      icon: 'model',
      component: 'ai/ModelSelectorNode'
    },
    {
      id: 'LLM_QUERY',
      type: 'LLM_QUERY',
      name: 'LLM查询',
      description: '执行大型语言模型查询的节点',
      category: 'ai',
      inputs: 2,
      outputs: 1,
      icon: 'brain',
      component: 'ai/LlmQueryNode'
    },
    {
      id: 'IMAGE_GENERATION',
      type: 'IMAGE_GENERATION',
      name: '图像生成',
      description: '使用AI生成图像的节点',
      category: 'ai',
      inputs: 1,
      outputs: 1,
      icon: 'image',
      component: 'ai/ImageGenerationNode'
    }
  ],
  
  // 数据操作工具节点
  data: [
    {
      id: 'WEB_SEARCH',
      type: 'WEB_SEARCH',
      name: 'Web搜索',
      description: '执行网络搜索的节点',
      category: 'data',
      inputs: 1,
      outputs: 1,
      icon: 'search',
      component: 'data/WebSearchNode'
    },
    {
      id: 'DOCUMENT_QUERY',
      type: 'DOCUMENT_QUERY',
      name: '文档查询',
      description: '在文档中执行查询的节点',
      category: 'data',
      inputs: 2,
      outputs: 1,
      icon: 'document',
      component: 'data/DocumentQueryNode'
    },
    {
      id: 'DATA_TRANSFORM',
      type: 'DATA_TRANSFORM',
      name: '数据转换',
      description: '转换数据格式和结构的节点',
      category: 'data',
      inputs: 1,
      outputs: 1,
      icon: 'transform',
      component: 'data/DataTransformNode'
    },
    {
      id: 'ENCODER',
      type: 'ENCODER',
      name: '文本编码器',
      description: '文本编码转换',
      category: 'data',
      inputs: 1,
      outputs: 1,
      icon: 'embed',
      component: 'data/EncoderNode'
    }
  ],
  
  // 流程控制逻辑节点
  flow: [
    {
      id: 'CONDITION',
      type: 'CONDITION',
      name: '条件判断',
      description: '基于条件选择执行路径的节点',
      category: 'flow',
      inputs: 1,
      outputs: 2,
      icon: 'condition',
      component: 'flow/ConditionNode'
    },
    {
      id: 'LOOP',
      type: 'LOOP',
      name: '循环控制',
      description: '实现循环执行逻辑的节点',
      category: 'flow',
      inputs: 2,
      outputs: 1,
      icon: 'loop',
      component: 'flow/LoopNode'
    },
    {
      id: 'SAMPLER',
      type: 'SAMPLER',
      name: '采样器',
      description: '从多个选项中采样输出',
      category: 'flow',
      inputs: 1,
      outputs: 1,
      icon: 'sampler',
      component: 'flow/SamplerNode'
    }
  ],
  
  // 监控与调试节点
  debug: [
    {
      id: 'LOGGER',
      type: 'LOGGER',
      name: '日志记录',
      description: '记录节点执行过程和结果的节点',
      category: 'debug',
      inputs: 1,
      outputs: 1,
      icon: 'log',
      component: 'debug/LoggerNode'
    },
    {
      id: 'VISUALIZER',
      type: 'VISUALIZER',
      name: '数据可视化',
      description: '将数据以可视化方式展示的节点',
      category: 'debug',
      inputs: 1,
      outputs: 0,
      icon: 'chart',
      component: 'debug/VisualizerNode'
    }
  ],
  
  // 输出节点
  output: [
    {
      id: 'TEXT_OUTPUT',
      type: 'TEXT_OUTPUT',
      name: '文本输出',
      description: '输出文本结果的节点',
      category: 'output',
      inputs: 1,
      outputs: 0,
      icon: 'text-out',
      component: 'output/TextOutputNode'
    },
    {
      id: 'FILE_OUTPUT',
      type: 'FILE_OUTPUT',
      name: '文件输出',
      description: '将结果保存为文件的节点',
      category: 'output',
      inputs: 1,
      outputs: 0,
      icon: 'file-out',
      component: 'output/FileOutputNode'
    },
    {
      id: 'IMAGE_OUTPUT',
      type: 'IMAGE_OUTPUT',
      name: '图像输出',
      description: '输出图像结果的节点',
      category: 'output',
      inputs: 1,
      outputs: 0,
      icon: 'image-out',
      component: 'output/ImageOutputNode'
    }
  ],
  
  // 用户交互控制节点
  interaction: [
    {
      id: 'USER_INPUT',
      type: 'USER_INPUT',
      name: '用户输入',
      description: '请求用户输入的节点',
      category: 'interaction',
      inputs: 1,
      outputs: 1,
      icon: 'user',
      component: 'interaction/UserInputNode'
    },
    {
      id: 'CONFIRMATION',
      type: 'CONFIRMATION',
      name: '确认对话框',
      description: '显示确认对话框的节点',
      category: 'interaction',
      inputs: 1,
      outputs: 2,
      icon: 'confirm',
      component: 'interaction/ConfirmationNode'
    }
  ],
  
  // 高级和自定义节点
  advanced: [
    {
      id: 'CUSTOM_NODE',
      type: 'CUSTOM_NODE',
      name: '自定义节点',
      description: '用户可定制的自定义节点',
      category: 'advanced',
      inputs: 1,
      outputs: 1,
      icon: 'code',
      component: 'advanced/CustomNode'
    }
  ]
};

// 尝试通过API扫描文件系统获取节点文件
const scanNodeFilesFromFileSystem = async (rootPath: string): Promise<Record<string, string[]>> => {
  // 注意：此函数仅在浏览器环境运行，且需要服务器支持
  // 如果不支持文件系统API，会静默失败并返回空对象
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return {};
  }
  
  try {
    // 尝试通过API获取节点文件信息
    const response = await fetch('/api/node-discovery/scan');
    if (!response.ok) {
      throw new Error(`节点扫描API响应错误: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('通过API扫描节点文件失败:', error);
    return {};
  }
};

// 扫描目录中的所有节点组件
export function scanNodeComponents(): Record<string, NodeDefinition[]> {
  // 在服务器端或静态生成时，返回预定义节点映射
  if (typeof window === 'undefined') {
    return PREDEFINED_NODES;
  }
  
  // 在客户端尝试动态扫描节点文件
  // 这里可以通过API请求或其他方式动态获取节点信息
  // 目前为简化处理，直接返回预定义节点
  try {
    // 检查是否有缓存的节点定义
    const cachedNodes = sessionStorage.getItem('omniflow-node-definitions');
    if (cachedNodes) {
      const parsed = JSON.parse(cachedNodes);
      if (parsed && typeof parsed === 'object') {
        console.log('使用缓存的节点定义');
        return parsed;
      }
    }
  } catch (e) {
    console.warn('读取缓存的节点定义失败:', e);
  }
  
  // 返回预定义节点
  return PREDEFINED_NODES;
}

// 异步初始化节点定义，用于启动时扫描
export async function initializeNodeDefinitions(): Promise<Record<string, NodeDefinition[]>> {
  const result = scanNodeComponents();
  
  // 尝试通过API扫描文件系统
  try {
    const fsNodes = await scanNodeFilesFromFileSystem('/src/components/nodes');
    if (fsNodes && Object.keys(fsNodes).length > 0) {
      // 将文件系统扫描结果转换为节点定义
      // 这需要服务器端API支持，因此这里只是预留接口
      console.log('从文件系统获取到节点文件:', fsNodes);
    }
  } catch (error) {
    console.warn('扫描文件系统节点失败:', error);
  }
  
  // 尝试缓存结果，简化后续加载
  try {
    sessionStorage.setItem('omniflow-node-definitions', JSON.stringify(result));
  } catch (e) {
    console.warn('缓存节点定义失败:', e);
  }
  
  return result;
}

// 获取节点组件名称映射
export function getNodeComponentMap(): Record<string, any> {
  const componentMap: Record<string, any> = {};
  
  // 在服务器渲染时，返回空映射，组件将使用动态导入
  if (typeof window === 'undefined') {
    return componentMap;
  }
  
  // 预定义节点组件映射
  const nodeComponentMapping: Record<string, string> = {
    // 输入节点
    'TEXT_INPUT': '../components/nodes/input/TextInputNode',
    'FILE_INPUT': '../components/nodes/input/FileInputNode',
    'IMAGE_INPUT': '../components/nodes/input/ImageInputNode',
    
    // AI任务执行节点
    'MODEL_SELECTOR': '../components/nodes/ai/ModelSelectorNode',
    'LLM_QUERY': '../components/nodes/ai/LlmQueryNode',
    'IMAGE_GENERATION': '../components/nodes/ai/ImageGenerationNode',
    
    // 数据操作工具节点
    'WEB_SEARCH': '../components/nodes/data/WebSearchNode',
    'DOCUMENT_QUERY': '../components/nodes/data/DocumentQueryNode',
    'DATA_TRANSFORM': '../components/nodes/data/DataTransformNode',
    'ENCODER': '../components/nodes/data/EncoderNode',
    
    // 流程控制逻辑节点
    'CONDITION': '../components/nodes/flow/ConditionNode',
    'LOOP': '../components/nodes/flow/LoopNode',
    'SAMPLER': '../components/nodes/flow/SamplerNode',
    
    // 监控与调试节点
    'LOGGER': '../components/nodes/debug/LoggerNode',
    'VISUALIZER': '../components/nodes/debug/VisualizerNode',
    
    // 输出节点
    'TEXT_OUTPUT': '../components/nodes/output/TextOutputNode',
    'FILE_OUTPUT': '../components/nodes/output/FileOutputNode',
    'IMAGE_OUTPUT': '../components/nodes/output/ImageOutputNode',
    
    // 用户交互控制节点
    'USER_INPUT': '../components/nodes/interaction/UserInputNode',
    'CONFIRMATION': '../components/nodes/interaction/ConfirmationNode',
    
    // 高级节点
    'CUSTOM_NODE': '../components/nodes/advanced/CustomNode'
  };
  
  // 使用预定义映射而不是动态扫描
  Object.entries(nodeComponentMapping).forEach(([nodeType, path]) => {
    // 在实际应用中，这里应该使用动态导入来加载组件
    // 但这里只是返回组件路径，实际组件会在需要时导入
    componentMap[nodeType] = path;
    
    // 添加驼峰式的索引，方便查找
    const camelCaseType = toCamelCase(nodeType);
    if (camelCaseType !== nodeType) {
      componentMap[camelCaseType] = path;
    }
  });
  
  return componentMap;
}

// 将下划线字符串转换为驼峰式
function toCamelCase(str: string): string {
  return str.toLowerCase()
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

// 从文件名推断节点类型
function inferNodeTypeFromFileName(fileName: string): string {
  return DefaultNamingConvention.fileNameToNodeType(fileName);
}

// 导出命名约定
export const NodeNamingConvention = DefaultNamingConvention;