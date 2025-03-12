import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';

// 动态导入 WorkflowEditor 组件
const WorkflowEditor = dynamic(
  () => import('@/components/WorkflowEditor'),
  { 
    loading: () => (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-[#666] text-sm">加载编辑器...</div>
      </div>
    ),
    ssr: false
  }
);

import { Workflow } from '../types';
import McpManager from '../components/McpManager';

interface WorkflowStorage {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'zh' }) => {
  return {
    props: {
      messages: (await import(`@/messages/${locale}.json`)).default
    }
  };
};

const HomePage: React.FC = () => {
  // 使用 useState 来跟踪客户端渲染状态
  const [isClient, setIsClient] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowStorage[]>([]);
  const [showMcpManager, setShowMcpManager] = useState(false);

  // 在客户端挂载后更新状态
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 从本地存储加载工作流
  useEffect(() => {
    if (!isClient) return;

    try {
      const storedWorkflows = localStorage.getItem('workflows');
      if (storedWorkflows) {
        setWorkflows(JSON.parse(storedWorkflows));
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    }
  }, [isClient]);

  // 保存工作流
  const handleSaveWorkflow = (workflow: Workflow) => {
    try {
      // 更新当前工作流
      setCurrentWorkflow(workflow);
      
      // 更新工作流列表
      const exists = workflows.some(w => w.id === workflow.id);
      let updatedWorkflows: WorkflowStorage[];
      
      if (exists) {
        updatedWorkflows = workflows.map(w => 
          w.id === workflow.id 
            ? { ...w, updatedAt: Date.now() } 
            : w
        );
      } else {
        const newWorkflowItem: WorkflowStorage = {
          id: workflow.id,
          name: workflow.name || '未命名工作流',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        updatedWorkflows = [...workflows, newWorkflowItem];
      }
      
      setWorkflows(updatedWorkflows);
      
      // 保存到本地存储
      localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
      localStorage.setItem(`workflow_${workflow.id}`, JSON.stringify(workflow));
      
    } catch (error) {
      console.error('保存工作流失败:', error);
    }
  };

  // 创建新工作流
  const handleCreateNewWorkflow = () => {
    const now = Date.now();
    const id = `workflow_${now}`;
    const newWorkflow: Workflow = {
      id,
      name: '新工作流',
      nodes: [],
      edges: [],
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
    
    setCurrentWorkflow(newWorkflow);
  };

  // 加载工作流
  const handleLoadWorkflow = (workflowItem: WorkflowStorage) => {
    try {
      const storedWorkflow = localStorage.getItem(`workflow_${workflowItem.id}`);
      if (storedWorkflow) {
        setCurrentWorkflow(JSON.parse(storedWorkflow));
      }
    } catch (error) {
      console.error('加载工作流失败:', error);
    }
  };

  // 删除工作流
  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('确定要删除这个工作流吗？')) {
      try {
        // 从列表中移除
        const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
        setWorkflows(updatedWorkflows);
        
        // 从本地存储中删除
        localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
        localStorage.removeItem(`workflow_${workflowId}`);
        
        // 如果当前工作流被删除，清空当前工作流
        if (currentWorkflow && currentWorkflow.id === workflowId) {
          setCurrentWorkflow(null);
        }
      } catch (error) {
        console.error('删除工作流失败:', error);
      }
    }
  };

  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 显示MCP管理器
  const handleShowMcpManager = () => {
    setShowMcpManager(true);
  };

  // 只在客户端渲染时显示完整内容
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-[#666] text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#050505] text-[#e0e0e0] overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="bg-[#0a0a0a] border-b border-[#282828] h-14 flex items-center px-4 z-10 shadow-md">
      <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="mr-4 p-1.5 rounded hover:bg-[#1a1a1a] transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#10a37f">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white tracking-wider flex items-center">
            <span className="text-[#10a37f] mr-1">Omni</span>
            <span>Flow</span>
          </h1>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-4 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#10a37f] rounded text-sm transition-all duration-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              队列历史
            </button>
            <button className="px-4 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#10a37f] rounded text-sm transition-all duration-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              节点库
            </button>
            <button className="px-4 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#10a37f] rounded text-sm transition-all duration-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              模型库
            </button>
            <button 
              onClick={handleShowMcpManager}
              className="px-4 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#10a37f] rounded text-sm transition-all duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              外部服务
            </button>
            <button className="px-4 py-1.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] hover:border-[#10a37f] rounded text-sm transition-all duration-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              工作流
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCreateNewWorkflow}
            className="px-4 py-1.5 bg-[#10a37f] hover:bg-[#0fd292] rounded text-white text-sm transition-all duration-200 shadow-lg shadow-[#10a37f]/20 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新建工作流
          </button>
          <button className="p-1.5 rounded hover:bg-[#1a1a1a] transition-all duration-200 border border-transparent hover:border-[#282828]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        {sidebarOpen && (
          <div className="w-64 bg-[#0a0a0a] border-r border-[#282828] flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#282828] bg-[#0e0e0e]">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                我的工作流
              </h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索工作流..."
                  className="w-full bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666] transition-all duration-200"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2.5 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-[#0a0a0a] to-[#141414]">
              {workflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#666] text-sm p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  暂无工作流
                </div>
              ) : (
                <div className="space-y-1">
                  {workflows.map(workflow => (
                    <div 
                      key={workflow.id} 
                      className={`flex justify-between items-center p-2.5 rounded-md cursor-pointer transition-all duration-200 border ${
                        currentWorkflow?.id === workflow.id 
                        ? 'bg-[#141414] border-[#10a37f] shadow-md shadow-[#10a37f]/10' 
                        : 'border-transparent hover:bg-[#141414] hover:border-[#282828]'
                      }`}
                      onClick={() => handleLoadWorkflow(workflow)}
                    >
                      <span className="truncate flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${currentWorkflow?.id === workflow.id ? 'text-[#10a37f]' : 'text-[#666]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        {workflow.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkflow(workflow.id);
                        }}
                        className="text-[#666] hover:text-[#f44336] p-1 rounded-full hover:bg-[#1a1a1a] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-[#282828] bg-[#0e0e0e]">
              <button
                onClick={handleCreateNewWorkflow}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-[#10a37f] hover:bg-[#0fd292] rounded-md text-white text-sm transition-all duration-200 shadow-lg shadow-[#10a37f]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新建工作流
              </button>
            </div>
          </div>
        )}

        {/* 主工作区 */}
        <div className="flex-1 overflow-hidden">
          <WorkflowEditor
            initialWorkflow={currentWorkflow || undefined}
            onSave={handleSaveWorkflow}
          />
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <footer className="bg-[#0a0a0a] border-t border-[#282828] h-6 flex items-center px-4 text-xs text-[#666]">
        <div className="flex items-center">
          <span className="text-[#10a37f] font-medium mr-1">Omni</span>
          <span className="font-medium">Flow</span>
          <span className="ml-2 text-[#444]">v1.0.0</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          节点: <span className="text-[#10a37f] ml-1">{currentWorkflow?.nodes.length || 0}</span>
        </div>
        <div className="ml-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          连接: <span className="text-[#10a37f] ml-1">{currentWorkflow?.edges?.length || 0}</span>
        </div>
      </footer>

      {/* MCP管理器模态框 */}
      {showMcpManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <McpManager onClose={() => setShowMcpManager(false)} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
