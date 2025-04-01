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
    }
  ],
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
    }
  ],
  utility: [
    {
      id: 'WEB_SEARCH',
      type: 'WEB_SEARCH',
      name: 'Web搜索',
      description: '执行网络搜索的节点',
      category: 'utility',
      inputs: 1,
      outputs: 1,
      icon: 'search',
      component: 'WebSearchNode'
    },
    {
      id: 'DOCUMENT_QUERY',
      type: 'DOCUMENT_QUERY',
      name: '文档查询',
      description: '在文档中执行查询的节点',
      category: 'utility',
      inputs: 2,
      outputs: 1,
      icon: 'document',
      component: 'DocumentQueryNode'
    },
    {
      id: 'CUSTOM',
      type: 'CUSTOM',
      name: '自定义节点',
      description: '执行自定义JavaScript代码的节点',
      category: 'utility',
      inputs: 1,
      outputs: 1,
      icon: 'code',
      component: 'CustomNode'
    }
  ],
  flow: [
    {
      id: 'SAMPLER',
      type: 'SAMPLER',
      name: '采样器',
      description: '从多个选项中采样输出',
      category: 'flow',
      inputs: 1,
      outputs: 1,
      icon: 'sampler',
      component: 'SamplerNode'
    }
  ],
  advanced: [
    {
      id: 'ENCODER',
      type: 'ENCODER',
      name: '编码器',
      description: '将文本转换为嵌入向量的节点',
      category: 'advanced',
      inputs: 1,
      outputs: 1,
      icon: 'encoder',
      component: 'EncoderNode'
    }
  ],
  output: []
};

// 扫描目录中的所有节点组件
export function scanNodeComponents(): Record<string, NodeDefinition[]> {
  // 在服务器端或静态生成时，返回预定义节点映射
  if (typeof window === 'undefined') {
    return PREDEFINED_NODES;
  }
  
  // 在客户端可以尝试动态扫描，但为了避免错误，仍然返回预定义的节点
  return PREDEFINED_NODES;
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
    'TEXT_INPUT': '../components/nodes/input/TextInputNode',
    'MODEL_SELECTOR': '../components/nodes/ai/ModelSelectorNode',
    'LLM_QUERY': '../components/nodes/ai/LlmQueryNode',
    'WEB_SEARCH': '../components/nodes/WebSearchNode',
    'DOCUMENT_QUERY': '../components/nodes/DocumentQueryNode',
    'CUSTOM': '../components/nodes/CustomNode',
    'ENCODER': '../components/nodes/EncoderNode',
    'SAMPLER': '../components/nodes/SamplerNode',
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