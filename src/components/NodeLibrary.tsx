import React, { useState } from 'react';
import NavModal from './shared/NavModal';
import NodeLibraryNav from './NodeLibraryNav';

interface NodeLibraryProps {
  onClose: () => void;
}

interface NodeCategory {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
}

interface Node {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: number;
  outputs: number;
  icon: string;
  popular?: boolean;
  new?: boolean;
}

// 模拟节点数据
const nodeCategories: NodeCategory[] = [
  {
    id: 'io',
    name: '输入/输出',
    description: '用于数据输入和输出的节点',
    nodes: [
      {
        id: 'text-input',
        name: '文本输入',
        description: '提供文本输入功能',
        category: 'io',
        inputs: 0,
        outputs: 1,
        icon: 'text',
        popular: true
      },
      {
        id: 'file-input',
        name: '文件输入',
        description: '从文件系统读取文件',
        category: 'io',
        inputs: 0,
        outputs: 1,
        icon: 'file'
      },
      {
        id: 'image-output',
        name: '图像输出',
        description: '显示图像或保存到文件',
        category: 'io',
        inputs: 1,
        outputs: 0,
        icon: 'image'
      },
    ]
  },
  {
    id: 'text',
    name: '文本处理',
    description: '文本分析、生成和处理节点',
    nodes: [
      {
        id: 'text-generate',
        name: '文本生成',
        description: '使用AI生成文本内容',
        category: 'text',
        inputs: 1,
        outputs: 1,
        icon: 'ai',
        popular: true
      },
      {
        id: 'text-summarize',
        name: '摘要生成',
        description: '自动为文本生成摘要',
        category: 'text',
        inputs: 1,
        outputs: 1,
        icon: 'summary',
        new: true
      },
      {
        id: 'text-translate',
        name: '文本翻译',
        description: '将文本翻译为不同语言',
        category: 'text',
        inputs: 1,
        outputs: 1,
        icon: 'translate'
      },
    ]
  },
  {
    id: 'ml',
    name: '机器学习',
    description: '机器学习和AI相关的节点',
    nodes: [
      {
        id: 'llm-query',
        name: '大语言模型查询',
        description: '向大语言模型发送查询',
        category: 'ml',
        inputs: 2,
        outputs: 1,
        icon: 'llm',
        popular: true
      },
      {
        id: 'image-recognition',
        name: '图像识别',
        description: '识别图像中的物体',
        category: 'ml',
        inputs: 1,
        outputs: 1,
        icon: 'recognition'
      },
      {
        id: 'embedding',
        name: '文本嵌入',
        description: '生成文本的向量表示',
        category: 'ml',
        inputs: 1,
        outputs: 1,
        icon: 'embedding',
        new: true
      },
    ]
  },
  {
    id: 'util',
    name: '工具',
    description: '实用工具节点',
    nodes: [
      {
        id: 'web-search',
        name: '网络搜索',
        description: '执行网络搜索查询',
        category: 'util',
        inputs: 1,
        outputs: 1,
        icon: 'search',
        popular: true
      },
      {
        id: 'json-parser',
        name: 'JSON解析',
        description: '解析JSON数据',
        category: 'util',
        inputs: 1,
        outputs: 1,
        icon: 'json'
      },
      {
        id: 'loop-control',
        name: '循环控制',
        description: '控制工作流循环执行',
        category: 'util',
        inputs: 2,
        outputs: 2,
        icon: 'loop',
        new: true
      },
    ]
  },
  {
    id: 'data',
    name: '数据处理',
    description: '数据处理和分析节点',
    nodes: [
      {
        id: 'filter',
        name: '数据过滤',
        description: '根据条件过滤数据',
        category: 'data',
        inputs: 1,
        outputs: 1,
        icon: 'filter'
      },
      {
        id: 'aggregation',
        name: '数据聚合',
        description: '聚合和汇总数据',
        category: 'data',
        inputs: 1,
        outputs: 1,
        icon: 'aggregate'
      },
      {
        id: 'sort',
        name: '数据排序',
        description: '对数据进行排序',
        category: 'data',
        inputs: 1,
        outputs: 1,
        icon: 'sort'
      },
    ]
  }
];

// 获取所有节点的平展列表
const allNodes = nodeCategories.flatMap(category => category.nodes);

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('popular');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 模态框标题的图标
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  // 过滤节点
  const getFilteredNodes = () => {
    let filteredNodes: Node[] = [];
    
    // 搜索过滤
    if (searchTerm) {
      return allNodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 分类过滤
    if (selectedCategory === 'popular') {
      filteredNodes = allNodes.filter(node => node.popular);
    } else if (selectedCategory === 'new') {
      filteredNodes = allNodes.filter(node => node.new);
    } else {
      filteredNodes = allNodes.filter(node => node.category === selectedCategory);
    }
    
    return filteredNodes;
  };

  // 获取当前分类的描述
  const getCategoryDescription = () => {
    if (selectedCategory === 'popular') return '常用的热门节点';
    if (selectedCategory === 'new') return '最新添加的节点';
    
    const category = nodeCategories.find(c => c.id === selectedCategory);
    return category?.description || '';
  };

  // 渲染节点卡片
  const renderNodeCard = (node: Node) => {
    return (
      <div key={node.id} className="bg-[#141414] border border-[#282828] hover:border-[#10a37f] rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:shadow-[#10a37f]/10 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-[#1a1a1a] rounded-lg text-[#10a37f]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex space-x-1">
            {node.new && (
              <span className="px-2 py-0.5 bg-[#3b82f6]/20 text-[#3b82f6] text-xs rounded-full">新</span>
            )}
            {node.popular && (
              <span className="px-2 py-0.5 bg-[#ef4444]/20 text-[#ef4444] text-xs rounded-full">热门</span>
            )}
          </div>
        </div>
        <h3 className="font-medium text-white mt-3">{node.name}</h3>
        <p className="text-xs text-[#999] mt-1">{node.description}</p>
        <div className="flex items-center justify-between mt-4 text-xs text-[#888]">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            输入: {node.inputs}
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            输出: {node.outputs}
          </div>
        </div>
      </div>
    );
  };

  return (
    <NavModal title="节点库" icon={icon} onClose={onClose} maxWidth="1200px">
      <div className="flex h-full">
        {/* 侧边分类导航 */}
        <div className="w-56 border-r border-[#282828] mr-6 pr-2">
          <NodeLibraryNav 
            categories={nodeCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* 主内容区域 */}
        <div className="flex-1">
          {/* 搜索和标题 */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedCategory === 'popular' ? '热门节点' : 
                 selectedCategory === 'new' ? '最新节点' :
                 nodeCategories.find(c => c.id === selectedCategory)?.name || '所有节点'}
              </h2>
              <p className="text-sm text-[#999] mt-1">{getCategoryDescription()}</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索节点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2.5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 节点网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredNodes().map(renderNodeCard)}
          </div>

          {/* 空状态 */}
          {getFilteredNodes().length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#666]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
              </svg>
              <p className="text-lg font-medium">未找到匹配的节点</p>
              <p className="text-sm mt-2">尝试使用不同的搜索词或浏览其他类别</p>
            </div>
          )}
        </div>
      </div>
    </NavModal>
  );
};

export default NodeLibrary;