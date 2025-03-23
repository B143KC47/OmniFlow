import React, { useState, useEffect } from 'react';
import NavModal from './shared/NavModal';
import NodeLibraryNav from './NodeLibraryNav';
import { NodeType } from '../types';
import { useTranslation, Trans } from '../utils/i18n';

// 节点类型定义
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

// 节点分类定义
interface Category {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
}

interface NodeLibraryProps {
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onClose, onSelectNode }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeCategories, setNodeCategories] = useState<Category[]>([]);
  
  // 初始化节点数据
  useEffect(() => {
    // 模拟节点数据加载
    const sampleNodes: Node[] = [
      {
        id: NodeType.TEXT_INPUT,
        name: t('nodes.textInput.name'),
        description: t('nodes.textInput.description'),
        category: 'input',
        inputs: 0,
        outputs: 1,
        icon: 'text',
        popular: true
      },
      {
        id: NodeType.LLM_QUERY,
        name: t('nodes.llmQuery.name'),
        description: t('nodes.llmQuery.description'),
        category: 'ai',
        inputs: 1,
        outputs: 1,
        icon: 'brain',
        popular: true
      },
      {
        id: NodeType.WEB_SEARCH,
        name: t('nodes.webSearch.name'), 
        description: t('nodes.webSearch.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'search',
        new: true
      },
      {
        id: NodeType.DOCUMENT_QUERY,
        name: t('nodes.documentQuery.name'),
        description: t('nodes.documentQuery.description'),
        category: 'utility',
        inputs: 1,
        outputs: 1,
        icon: 'document'
      },
      {
        id: NodeType.MODEL_SELECTOR,
        name: t('nodes.modelSelector.name'),
        description: t('nodes.modelSelector.description'),
        category: 'ai',
        inputs: 0,
        outputs: 1,
        icon: 'model'
      },
      {
        id: 'LOOP_CONTROL',
        name: t('nodes.loopControl.name'),
        description: t('nodes.loopControl.description'),
        category: 'flow',
        inputs: 1,
        outputs: 2,
        icon: 'loop'
      },
      {
        id: NodeType.CUSTOM,
        name: t('nodes.custom.name'),
        description: t('nodes.custom.description'),
        category: 'advanced',
        inputs: 1,
        outputs: 1,
        icon: 'code',
        new: true
      }
    ];

    setNodes(sampleNodes);

    // 创建分类
    const categories: Category[] = [
      {
        id: 'input',
        name: t('nodes.categories.input'),
        description: t('nodes.categories.inputDescription'),
        nodes: []
      },
      {
        id: 'ai',
        name: 'AI',
        description: t('nodes.categories.aiDescription'),
        nodes: []
      },
      {
        id: 'utility',
        name: t('nodes.categories.util'),
        description: t('nodes.categories.utilDescription'),
        nodes: []
      },
      {
        id: 'flow',
        name: t('nodes.categories.flow'),
        description: t('nodes.categories.flowDescription'),
        nodes: []
      },
      {
        id: 'advanced',
        name: t('nodes.categories.advanced'),
        description: t('nodes.categories.advancedDescription'),
        nodes: []
      }
    ];
    
    // 特殊分类
    const popularCategory: Category = {
      id: 'popular',
      name: t('nodes.categories.popular'),
      description: t('nodes.categories.popularDescription'),
      nodes: []
    };

    const newCategory: Category = {
      id: 'new',
      name: t('nodes.categories.new'),
      description: t('nodes.categories.newDescription'),
      nodes: []
    };

    // 填充分类中的节点
    sampleNodes.forEach(node => {
      // 找到对应分类并添加
      const categoryIndex = categories.findIndex(cat => cat.id === node.category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].nodes.push(node);
      }
      
      // 添加到"热门"分类
      if (node.popular) {
        popularCategory.nodes.push(node);
      }
      
      // 添加到"新增"分类
      if (node.new) {
        newCategory.nodes.push(node);
      }
    });
    
    // 添加特殊分类到分类列表前面
    if (newCategory.nodes.length > 0) {
      categories.unshift(newCategory);
    }
    
    if (popularCategory.nodes.length > 0) {
      categories.unshift(popularCategory);
    }
    
    // 添加"所有"分类
    categories.unshift({
      id: 'all',
      name: t('nodes.categories.all'),
      description: t('nodes.categories.allDescription'),
      nodes: sampleNodes
    });
    
    setNodeCategories(categories);
  }, [t]); // 依赖t函数，确保语言变更时重新获取节点数据

  // 获取当前显示的节点
  const getFilteredNodes = () => {
    // 根据选择的分类获取节点
    let filteredNodes = nodes;
    
    if (selectedCategory !== 'all') {
      const category = nodeCategories.find(cat => cat.id === selectedCategory);
      filteredNodes = category?.nodes || [];
    }
    
    // 应用搜索过滤器
    if (searchTerm) {
      filteredNodes = filteredNodes.filter(node => 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredNodes;
  };

  // 获取分类描述
  const getCategoryDescription = () => {
    const category = nodeCategories.find(cat => cat.id === selectedCategory);
    return category?.description || '';
  };

  // 渲染节点卡片
  const renderNodeCard = (node: Node) => (
    <div 
      key={node.id}
      className="bg-[#1a1a1a] rounded-md p-4 border border-[#282828] hover:border-[#10a37f] transition-all cursor-pointer group"
      onClick={() => onSelectNode(node.id)}
    >
      <div className="mb-3 flex justify-between items-start">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getNodeColorClass(node.category)}`}>
          {getNodeIcon(node.icon)}
        </div>
        <div className="flex space-x-2">
          {node.new && (
            <span className="px-1.5 py-0.5 bg-[#f44336]/10 text-[#f44336] text-xs rounded">
              {t('common.new')}
            </span>
          )}
          {node.popular && (
            <span className="px-1.5 py-0.5 bg-[#ff9800]/10 text-[#ff9800] text-xs rounded">
              {t('common.popular')}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-white font-medium text-base mb-1">{node.name}</h3>
      <p className="text-[#999] text-sm mb-4 h-10 line-clamp-2">{node.description}</p>
      <div className="flex justify-between items-center text-xs text-[#666] pt-2 border-t border-[#282828] group-hover:border-[#10a37f33] transition-all">
        <div className="flex items-center">
          <span className="mr-3">{t('library.node.inputs')}: {node.inputs}</span>
          <span>{t('library.node.outputs')}: {node.outputs}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-[#10a37f]">
            {t('common.add')} +
          </button>
        </div>
      </div>
    </div>
  );

  // 根据节点类型获取颜色类
  const getNodeColorClass = (category: string) => {
    switch (category) {
      case 'input': return 'bg-[#1e88e5]/10 text-[#1e88e5]';
      case 'ai': return 'bg-[#10a37f]/10 text-[#10a37f]';
      case 'utility': return 'bg-[#ff9800]/10 text-[#ff9800]';
      case 'flow': return 'bg-[#9c27b0]/10 text-[#9c27b0]';
      case 'advanced': return 'bg-[#607d8b]/10 text-[#607d8b]';
      default: return 'bg-[#666]/10 text-[#666]';
    }
  };

  // 获取节点图标
  const getNodeIcon = (iconType: string) => {
    switch (iconType) {
      case 'text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
      case 'brain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'document':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'model':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'loop':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  // 模态框标题的图标
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  // 获取搜索结果集
  const filteredNodes = getFilteredNodes();

  return (
    <NavModal
      title={t('library.node.title')}
      icon={icon}
      onClose={onClose}
    >
      <div className="flex min-h-0 h-full">
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
                {selectedCategory === 'popular' ? t('nodes.categories.popular') : 
                 selectedCategory === 'new' ? t('nodes.categories.new') :
                 nodeCategories.find(c => c.id === selectedCategory)?.name || t('nodes.categories.all')}
              </h2>
              <p className="text-sm text-[#999] mt-1">{getCategoryDescription()}</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder={t('library.node.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 节点网格 */}
          {filteredNodes.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredNodes.map(node => renderNodeCard(node))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#333] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl text-[#666] font-medium">{t('library.node.notFound')}</h3>
              <p className="text-[#555] mt-2">{t('library.node.tryDifferent')}</p>
            </div>
          )}
        </div>
      </div>
    </NavModal>
  );
};

export default NodeLibrary;