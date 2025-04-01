import React, { useState, useEffect } from 'react';
import { NodeType } from '../types';
import NodeDiscoveryService, { NodeDefinition, NodeCategory } from '../services/NodeDiscoveryService';
import { useTranslation } from '../utils/i18n';
import styles from './NodeLibrary.module.css'; // 使用 CSS Modules，不要直接导入 .css 文件

interface NodeLibraryProps {
  onClose: () => void;
  onSelectNode: (nodeType: string) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onClose, onSelectNode }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>('all');
  const [nodeCategories, setNodeCategories] = useState<NodeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化节点发现服务
  useEffect(() => {
    const initializeNodes = async () => {
      setIsLoading(true);
      try {
        const nodeDiscoveryService = NodeDiscoveryService.getInstance();
        await nodeDiscoveryService.initialize(t);
        setNodeCategories(nodeDiscoveryService.getAllNodeCategories());
      } catch (error) {
        console.error('初始化节点库时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNodes();
  }, [t]);

  // 获取所有节点的扁平列表
  const getAllNodes = (): NodeDefinition[] => {
    return nodeCategories.flatMap(category => category.nodes);
  };

  // 处理节点点击
  const handleNodeClick = (nodeType: string) => {
    onSelectNode(nodeType);
    onClose();
  };

  // 处理搜索
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 过滤节点
  const getFilteredNodes = () => {
    let filtered = getAllNodes();

    // 按搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.name.toLowerCase().includes(term) || 
        node.description.toLowerCase().includes(term)
      );
    }

    // 按分类过滤
    if (activeCategory && activeCategory !== 'all') {
      filtered = filtered.filter(node => node.category === activeCategory);
    }

    return filtered;
  };

  // 节点卡片组件
  const NodeCard = ({ node }: { node: NodeDefinition }) => {
    return (
      <div 
        className={styles.nodeCard}
        onClick={() => handleNodeClick(node.type)}
      >
        <div className={styles.nodeCardHeader}>
          <div className={`${styles.nodeIcon} ${getNodeColorClass(node.category)}`}>
            {getNodeIcon(node.icon)}
          </div>
          <div className={styles.nodeBadges}>
            {node.popular && (
              <span className={styles.popularBadge}>
                {t('library.popular')}
              </span>
            )}
            {node.new && (
              <span className={styles.newBadge}>
                {t('library.new')}
              </span>
            )}
          </div>
        </div>
        <h3 className={styles.nodeTitle}>{node.name}</h3>
        <p className={styles.nodeDescription}>{node.description}</p>
        <div className={styles.nodeFooter}>
          <div className={styles.nodeStats}>
            <span className={styles.nodeInputs}>{t('library.node.inputs')}: {node.inputs}</span>
            <span>{t('library.node.outputs')}: {node.outputs}</span>
          </div>
          <div className={styles.nodeAction}>
            <button>
              {t('common.add')} +
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 根据节点类型获取颜色类
  const getNodeColorClass = (category: string) => {
    // 保留现有风格，只是改为使用自定义类
    return `node-color-${category}`;
  };

  // 获取节点图标
  const getNodeIcon = (iconType: string) => {
    switch (iconType) {
      case 'text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        );
      case 'brain':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
      case 'code':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'embed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'random':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'flow':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        );
      case 'output':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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

  const filteredNodes = getFilteredNodes();
  
  return (
    <div className={styles.nodeLibrary}>
      {/* 顶部栏 */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t('library.node.title')}</h2>
        <button 
          onClick={onClose}
          className={styles.closeButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* 搜索框 */}
      <div className={styles.search}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder={t('library.node.search')}
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={styles.searchIcon}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* 类别选择器 */}
      <div className={styles.categoryTabs}>
        <button 
          className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.categoryTabActive : styles.categoryTabInactive}`}
          onClick={() => setActiveCategory('all')}
        >
          {t('library.categories.all')}
        </button>
        {nodeCategories.map((category) => (
          <button 
            key={category.id}
            className={`${styles.categoryTab} ${activeCategory === category.id ? styles.categoryTabActive : styles.categoryTabInactive}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* 加载状态 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyStateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{t('library.node.notFound')}</p>
          </div>
        </div>
      ) : (
        <div className={styles.nodeGrid}>
          {filteredNodes.map((node, index) => (
            <NodeCard key={`${node.category}-${node.id}-${index}`} node={node} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeLibrary;