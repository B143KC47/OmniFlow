import React, { useState, useEffect } from 'react';
import NavModal from './shared/NavModal';
import { useTranslation } from '../utils/i18n';

interface WorkflowManagerProps {
  onClose: () => void;
  onLoadWorkflow?: (workflowId: string) => void;
  onCreateWorkflow?: () => void;
}

interface WorkflowItem {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  nodes: number;
  edges: number;
  tags: string[];
  favorite?: boolean;
}

// 标签选项
const getTagOptions = (t: (key: string) => string) => [
  { id: 'text-gen', name: t('workflow.tags.textGeneration') },
  { id: 'image-gen', name: t('workflow.tags.imageGeneration') },
  { id: 'analysis', name: t('workflow.tags.dataAnalysis') },
  { id: 'summarize', name: t('workflow.tags.textSummary') },
  { id: 'translation', name: t('workflow.tags.translation') },
  { id: 'search', name: t('workflow.tags.search') },
  { id: 'qa', name: t('workflow.tags.questionAnswering') },
  { id: 'workflow', name: t('workflow.tags.workflow') }
];

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ onClose, onLoadWorkflow, onCreateWorkflow }) => {
  const { t } = useTranslation();
  const tagOptions = getTagOptions(t);
  
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'nodes'>('updatedAt');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // 模态框标题的图标
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );

  // 加载工作流数据
  useEffect(() => {
    try {
      // 从本地存储加载工作流列表
      const storedWorkflows = localStorage.getItem('workflows');
      if (storedWorkflows) {
        const workflowList = JSON.parse(storedWorkflows);
        
        // 扩展工作流数据以包括更多信息
        const enhancedWorkflows = workflowList.map((item: any) => {
          // 尝试加载详细的工作流数据
          const detailData = localStorage.getItem(`workflow_${item.id}`);
          let nodes = 0;
          let edges = 0;
          
          if (detailData) {
            const workflowDetail = JSON.parse(detailData);
            nodes = workflowDetail.nodes?.length || 0;
            edges = workflowDetail.edges?.length || 0;
          }
          
          // 随机生成一些标签和描述（实际应用中应该从保存的数据中读取）
          const randomTags = [...tagOptions]
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 1)
            .map(tag => tag.id);
            
          return {
            ...item,
            description: item.description || t('workflow.defaultDescription', { nodes }),
            nodes,
            edges,
            tags: item.tags || randomTags,
            favorite: item.favorite || Math.random() > 0.7
          };
        });
        
        setWorkflows(enhancedWorkflows);
      }
    } catch (error) {
      console.error(t('workflow.errors.loadFailed'), error);
    }
  }, [t]);

  // 处理删除工作流
  const handleDeleteWorkflow = (id: string) => {
    if (window.confirm(t('workflow.confirmDelete') + ' ' + t('workflow.confirmDeleteDescription'))) {
      try {
        const updatedWorkflows = workflows.filter(workflow => workflow.id !== id);
        setWorkflows(updatedWorkflows);
        
        // 更新本地存储
        localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
        localStorage.removeItem(`workflow_${id}`);
      } catch (error) {
        console.error(t('workflow.errors.deleteFailed'), error);
      }
    }
  };

  // 处理标记为收藏
  const handleToggleFavorite = (id: string) => {
    try {
      // 1. 更新状态中的工作流数据
      const updatedWorkflows = workflows.map(workflow => {
        if (workflow.id === id) {
          return { ...workflow, favorite: !workflow.favorite };
        }
        return workflow;
      });
      
      setWorkflows(updatedWorkflows);
      
      // 2. 找到被更新的工作流
      const workflowToUpdate = updatedWorkflows.find(workflow => workflow.id === id);
      if (!workflowToUpdate) {
        throw new Error(`找不到ID为${id}的工作流`);
      }
      
      // 3. 更新工作流列表中的基本信息
      const workflowsBasicData = updatedWorkflows.map(({ id, name, description, createdAt, updatedAt, tags, favorite }) => ({
        id, name, description, createdAt, updatedAt, tags, favorite
      }));
      localStorage.setItem('workflows', JSON.stringify(workflowsBasicData));
      
      // 4. 更新单个工作流的详细数据 - 保持详细数据与基本数据同步
      const storedDetailData = localStorage.getItem(`workflow_${id}`);
      if (storedDetailData) {
        // 如果已有详细数据，则更新收藏状态
        const detailData = JSON.parse(storedDetailData);
        const updatedDetailData = {
          ...detailData,
          favorite: workflowToUpdate.favorite
        };
        localStorage.setItem(`workflow_${id}`, JSON.stringify(updatedDetailData));
      } else {
        // 如果没有详细数据，创建一个基本的数据结构包含必要字段
        // 注意：这种情况不太可能发生，但为了数据完整性添加这个处理
        const basicDetailData = {
          id: workflowToUpdate.id,
          name: workflowToUpdate.name,
          nodes: [],
          edges: [],
          favorite: workflowToUpdate.favorite,
          createdAt: workflowToUpdate.createdAt,
          updatedAt: workflowToUpdate.updatedAt
        };
        localStorage.setItem(`workflow_${id}`, JSON.stringify(basicDetailData));
      }
    } catch (error) {
      // 发生错误时，回滚UI状态
      console.error(t('workflow.errors.updateFailed'), error);
      
      // 重新加载工作流列表，回滚UI状态
      try {
        const storedWorkflows = localStorage.getItem('workflows');
        if (storedWorkflows) {
          const parsedWorkflows = JSON.parse(storedWorkflows);
          setWorkflows(parsedWorkflows);
        }
      } catch (e) {
        console.error(t('workflow.errors.rollbackFailed'), e);
      }
    }
  };

  // 加载工作流
  const handleLoadWorkflow = (id: string) => {
    if (onLoadWorkflow) {
      onLoadWorkflow(id);
      onClose();
    }
  };

  // 创建新工作流
  const handleCreateNewWorkflow = () => {
    if (onCreateWorkflow) {
      onCreateWorkflow();
      onClose();
    }
  };

  // 过滤工作流
  const filteredWorkflows = workflows.filter(workflow => {
    // 收藏过滤
    if (showFavorites && !workflow.favorite) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm && 
        !workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(workflow.description && workflow.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // 标签过滤
    if (selectedTags.length > 0 && !selectedTags.some(tag => workflow.tags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  // 排序工作流
  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'nodes':
        return b.nodes - a.nodes;
      case 'updatedAt':
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(t('app.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 获取标签名称
  const getTagName = (tagId: string) => {
    return tagOptions.find(tag => tag.id === tagId)?.name || tagId;
  };

  // 切换标签选择
  const toggleTagSelection = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <NavModal title={t('workflow.management')} icon={icon} onClose={onClose} maxWidth="1100px">
      <div className="flex flex-col h-full">
        {/* 顶部工具栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={handleCreateNewWorkflow}
              className="px-4 py-2 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded-md flex items-center transition-all duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('workflow.newWorkflow')}
            </button>
            <button
              className={`px-4 py-2 ${
                showFavorites 
                  ? 'bg-[#ef4444] text-white' 
                  : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'
              } rounded-md flex items-center transition-all duration-200`}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${showFavorites ? 'text-white' : 'text-[#ef4444]'}`} fill={showFavorites ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {t('workflow.favorites')}
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder={t('workflow.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2.5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 标签筛选 */}
        {tagOptions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#999] mb-2">{t('workflow.filterByTag')}:</h3>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagSelection(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'bg-[#10a37f] text-white' 
                      : 'bg-[#141414] text-[#999] hover:bg-[#1a1a1a]'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 工作流列表 */}
        {sortedWorkflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#666]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <p className="text-lg font-medium">
              {workflows.length === 0 
                ? t('workflow.noWorkflow') 
                : t('workflow.noMatchingWorkflows')}
            </p>
            <p className="text-sm mt-2 mb-4">
              {workflows.length === 0 
                ? t('workflow.noWorkflowDescription') 
                : t('workflow.noMatchingWorkflowsDescription')}
            </p>
            {workflows.length === 0 && (
              <button
                onClick={handleCreateNewWorkflow}
                className="px-4 py-2 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded-md flex items-center transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('workflow.newWorkflow')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWorkflows.map(workflow => (
              <div 
                key={workflow.id}
                className="bg-[#141414] border border-[#282828] hover:border-[#10a37f] rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-[#10a37f]/10"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 
                      className="text-white font-medium truncate cursor-pointer hover:text-[#10a37f] transition-colors"
                      onClick={() => handleLoadWorkflow(workflow.id)}
                    >
                      {workflow.name}
                    </h3>
                    <button
                      onClick={() => handleToggleFavorite(workflow.id)}
                      className="text-[#888] hover:text-[#ef4444] p-1 rounded-full hover:bg-[#ef4444]/10 transition-colors"
                      title={workflow.favorite ? t('workflow.removeFromFavorites') : t('workflow.addToFavorites')}
                      aria-label={workflow.favorite ? t('workflow.removeFromFavorites') : t('workflow.addToFavorites')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={workflow.favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke={workflow.favorite ? 'none' : 'currentColor'} color={workflow.favorite ? '#ef4444' : undefined}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-[#999] text-xs mt-2 line-clamp-2 h-8">
                    {workflow.description}
                  </p>
                  
                  {workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {workflow.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-1.5 py-0.5 bg-[#1a1a1a] text-[#888] text-xs rounded"
                        >
                          {getTagName(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-[#282828] px-4 py-3 flex justify-between bg-[#0e0e0e]">
                  <div className="flex items-center divide-x divide-[#333] text-xs">
                    <span className="pr-2 text-[#999]">
                      {t('workflow.nodeCount', { count: workflow.nodes })}
                    </span>
                    <span className="px-2 text-[#999]">
                      {t('workflow.edgeCount', { count: workflow.edges })}
                    </span>
                    <span className="pl-2 text-[#999]">
                      {formatDate(workflow.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleLoadWorkflow(workflow.id)}
                      className="p-1 rounded hover:bg-[#282828] text-[#10a37f] transition-colors"
                      title={t('workflow.openWorkflow')}
                      aria-label={t('workflow.openWorkflow')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="p-1 rounded hover:bg-[#282828] text-[#666] hover:text-[#ef4444] transition-colors"
                      title={t('workflow.deleteWorkflow')}
                      aria-label={t('workflow.deleteWorkflow')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NavModal>
  );
};

export default WorkflowManager;