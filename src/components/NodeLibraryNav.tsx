import React from 'react';

interface NodeCategory {
  id: string;
  name: string;
  description: string;
  nodes: any[];
}

interface NodeLibraryNavProps {
  categories: NodeCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const NodeLibraryNav: React.FC<NodeLibraryNavProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  const renderCategoryItem = (id: string, name: string, icon: React.ReactNode, count?: number) => {
    return (
      <button
        key={id}
        className={`flex items-center justify-between w-full p-2.5 rounded-md mb-1 transition-all text-left text-sm ${
          selectedCategory === id 
            ? 'bg-[#1a1a1a] text-white border-l-2 border-[#10a37f] pl-3' 
            : 'hover:bg-[#141414] text-[#999]'
        }`}
        onClick={() => onSelectCategory(id)}
      >
        <div className="flex items-center">
          <span className="mr-2.5 text-[#10a37f]">{icon}</span>
          <span>{name}</span>
        </div>
        {count !== undefined && (
          <span className={`px-1.5 py-0.5 rounded text-xs ${
            selectedCategory === id 
              ? 'bg-[#10a37f]/20 text-[#10a37f]' 
              : 'bg-[#333] text-[#888]'
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  // 获取特殊分类的节点数量
  const getPopularNodesCount = () => {
    return categories.flatMap(c => c.nodes).filter(node => node.popular).length;
  };

  const getNewNodesCount = () => {
    return categories.flatMap(c => c.nodes).filter(node => node.new).length;
  };

  return (
    <div className="py-2">
      {/* 特殊分类 */}
      <div className="mb-4">
        {renderCategoryItem(
          'popular',
          '热门节点',
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>,
          getPopularNodesCount()
        )}
        {renderCategoryItem(
          'new',
          '最新节点',
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>,
          getNewNodesCount()
        )}
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-[#282828] my-3"></div>

      {/* 节点分类 */}
      <div>
        <h3 className="text-xs uppercase text-[#666] font-medium tracking-wider px-2 mb-2">节点分类</h3>
        {categories.map(category => (
          renderCategoryItem(
            category.id,
            category.name,
            getCategoryIcon(category.id),
            category.nodes.length
          )
        ))}
      </div>
    </div>
  );
};

// 获取分类图标
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'io':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      );
    case 'ml':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'util':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'data':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
  }
};

export default NodeLibraryNav;