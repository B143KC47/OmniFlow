// 节点扫描器工具
// 这个文件使用 webpack 的 require.context 来扫描节点组件目录

import { NodeDefinition } from '../services/NodeDiscoveryService';

// 添加 Webpack 模块类型声明
declare const require: {
  context(directory: string, useSubdirectories?: boolean, regExp?: RegExp): __WebpackModuleApi.RequireContext;
};

declare namespace __WebpackModuleApi {
  interface RequireContext {
    keys(): string[];
    (id: string): any;
    <T>(id: string): T;
    resolve(id: string): string;
  }
}

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

// 扫描目录中的所有节点组件
export function scanNodeComponents(): Record<string, NodeDefinition[]> {
  const categoryMap: Record<string, NodeDefinition[]> = {
    input: [],
    ai: [],
    flow: [],
    utility: [],
    advanced: [],
    output: [],
  };
  
  // 只在客户端环境中执行
  if (typeof window === 'undefined' || typeof require.context !== 'function') {
    return categoryMap;
  }
  
  try {
    // 扫描 input 节点目录
    try {
      const inputContext = require.context('../components/nodes/input', true, /\.tsx$/);
      processCategoryContext(inputContext, 'input', categoryMap);
    } catch (e) {
      console.log('No input nodes found or directory does not exist');
    }
    
    // 扫描 ai 节点目录
    try {
      const aiContext = require.context('../components/nodes/ai', true, /\.tsx$/);
      processCategoryContext(aiContext, 'ai', categoryMap);
    } catch (e) {
      console.log('No ai nodes found or directory does not exist');
    }
    
    // 扫描 flow 节点目录
    try {
      const flowContext = require.context('../components/nodes/flow', true, /\.tsx$/);
      processCategoryContext(flowContext, 'flow', categoryMap);
    } catch (e) {
      console.log('No flow nodes found or directory does not exist');
    }
    
    // 扫描 utility 节点目录
    try {
      const utilityContext = require.context('../components/nodes/utility', true, /\.tsx$/);
      processCategoryContext(utilityContext, 'utility', categoryMap);
    } catch (e) {
      console.log('No utility nodes found or directory does not exist');
    }
    
    // 扫描 advanced 节点目录
    try {
      const advancedContext = require.context('../components/nodes/advanced', true, /\.tsx$/);
      processCategoryContext(advancedContext, 'advanced', categoryMap);
    } catch (e) {
      console.log('No advanced nodes found or directory does not exist');
    }
    
    // 扫描 output 节点目录
    try {
      const outputContext = require.context('../components/nodes/output', true, /\.tsx$/);
      processCategoryContext(outputContext, 'output', categoryMap);
    } catch (e) {
      console.log('No output nodes found or directory does not exist');
    }
    
    // 扫描 search 节点目录
    try {
      const searchContext = require.context('../components/nodes/search', true, /\.tsx$/);
      processCategoryContext(searchContext, 'utility', categoryMap); // search 节点归类为 utility
    } catch (e) {
      console.log('No search nodes found or directory does not exist');
    }
    
    // 扫描根节点目录 (直接在 nodes 下的节点文件)
    try {
      const rootContext = require.context('../components/nodes', false, /\.tsx$/);
      const rootFiles = rootContext.keys().filter((key: string) => 
        !key.includes('BaseNode') && // 排除基础节点
        !key.includes('/') // 只包含直接在根目录下的文件
      );
      
      rootFiles.forEach((path: string) => {
        processNodeFile(rootContext, path, 'utility', categoryMap);
      });
    } catch (e) {
      console.log('Error scanning root nodes directory', e);
    }
    
  } catch (error) {
    console.error('Error scanning node components:', error);
  }
  
  return categoryMap;
}

// 处理一个类别目录的上下文
function processCategoryContext(
  context: __WebpackModuleApi.RequireContext,
  category: string,
  categoryMap: Record<string, NodeDefinition[]>
): void {
  const nodeFiles = context.keys();
  
  nodeFiles.forEach((path: string) => {
    processNodeFile(context, path, category, categoryMap);
  });
}

// 处理单个节点文件
function processNodeFile(
  context: __WebpackModuleApi.RequireContext,
  path: string,
  category: string,
  categoryMap: Record<string, NodeDefinition[]>
): void {
  try {
    const module = context(path);
    
    // 提取组件名称 (去除 ./ 和 .tsx)
    const componentName = path.replace(/^\.\//, '').replace(/\.tsx$/, '');
    
    // 提取可能的子类别 (从路径中)
    const pathParts = path.split('/');
    const subcategory = pathParts.length > 2 ? pathParts[pathParts.length - 2] : undefined;
    
    // 如果组件导出了 NODE_DEFINITION 静态属性
    if (module.default && module.default.NODE_DEFINITION) {
      const nodeDef = module.default.NODE_DEFINITION;
      
      // 添加到相应类别
      categoryMap[category].push({
        ...nodeDef,
        category,
        subcategory,
        component: componentName
      });
    } 
    // 如果组件导出了 NODE_TYPE 静态属性
    else if (module.default && module.default.NODE_TYPE) {
      const nodeType = module.default.NODE_TYPE;
      const displayName = module.default.displayName || componentName;
      
      // 生成节点定义
      categoryMap[category].push({
        id: nodeType,
        type: nodeType,
        name: displayName,
        description: `${displayName} 节点`,
        category,
        subcategory,
        inputs: module.default.INPUTS_COUNT || 1,
        outputs: module.default.OUTPUTS_COUNT || 1,
        icon: module.default.ICON || category.toLowerCase(),
        component: componentName
      });
    }
    // 如果组件有 displayName 但没有 NODE_DEFINITION，尝试自动生成定义
    else if (module.default && module.default.displayName) {
      const displayName = module.default.displayName;
      
      // 使用命名约定推断节点类型
      const nodeType = inferNodeTypeFromFileName(componentName);
      
      categoryMap[category].push({
        id: nodeType,
        type: nodeType,
        name: displayName,
        description: `${displayName} 节点`,
        category,
        subcategory,
        inputs: module.default.INPUTS_COUNT || 1,
        outputs: module.default.OUTPUTS_COUNT || 1,
        icon: category.toLowerCase(),
        component: componentName
      });
    }
    // 尝试从文件名推断节点类型
    else if (module.default && componentName.endsWith('Node')) {
      // 基于文件名推断节点类型
      const nodeType = inferNodeTypeFromFileName(componentName);
      const displayName = componentName.replace(/Node$/, '');
      
      categoryMap[category].push({
        id: nodeType,
        type: nodeType,
        name: displayName,
        description: `${displayName} 节点`,
        category,
        subcategory,
        inputs: 1,  // 默认值
        outputs: 1, // 默认值
        icon: category.toLowerCase(),
        component: componentName
      });
    }
  } catch (error) {
    console.error(`Error processing node file ${path}:`, error);
  }
}

// 从文件名推断节点类型
function inferNodeTypeFromFileName(fileName: string): string {
  return DefaultNamingConvention.fileNameToNodeType(fileName);
}

// 获取节点组件名称映射
export function getNodeComponentMap(): Record<string, any> {
  const componentMap: Record<string, any> = {};
  
  // 只在客户端环境中执行
  if (typeof window === 'undefined' || typeof require.context !== 'function') {
    return componentMap;
  }
  
  try {
    // 获取所有节点组件
    const nodeContext = require.context('../components/nodes', true, /\.tsx$/);
    
    nodeContext.keys().forEach((path: string) => {
      try {
        const module = nodeContext(path);
        if (!module.default) return;
        
        // 忽略基础组件
        if (path.includes('BaseNode')) return;
        
        // 提取组件名称
        const componentName = path.replace(/^\.\//, '').replace(/\.tsx$/, '');
        
        // 尝试多种方式获取节点类型
        let nodeType: string | undefined;
        
        // 1. 从组件的静态属性获取
        if (module.default.NODE_TYPE) {
          nodeType = module.default.NODE_TYPE;
        } 
        // 2. 从 NODE_DEFINITION 获取
        else if (module.default.NODE_DEFINITION) {
          nodeType = module.default.NODE_DEFINITION.type;
        }
        // 3. 从组件名称推断
        else if (componentName.endsWith('Node')) {
          nodeType = inferNodeTypeFromFileName(componentName);
        }
        // 4. 从 displayName 推断
        else if (module.default.displayName) {
          const displayName = module.default.displayName;
          if (displayName.endsWith('Node')) {
            nodeType = inferNodeTypeFromFileName(displayName);
          }
        }
        
        if (nodeType) {
          componentMap[nodeType] = module.default;
          
          // 添加驼峰式的索引，方便查找
          const camelCaseType = toCamelCase(nodeType);
          if (camelCaseType !== nodeType) {
            componentMap[camelCaseType] = module.default;
          }
        }
      } catch (error) {
        console.error(`Error loading node component ${path}:`, error);
      }
    });
  } catch (error) {
    console.error('Error scanning node components:', error);
  }
  
  return componentMap;
}

// 将下划线字符串转换为驼峰式
function toCamelCase(str: string): string {
  return str.toLowerCase()
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

// 导出命名约定
export const NodeNamingConvention = DefaultNamingConvention;