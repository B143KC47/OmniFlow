import React, { useState } from 'react';
import NavModal from './shared/NavModal';
import { useTranslation, Trans } from '../utils/i18n';

interface QueueHistoryProps {
  onClose: () => void;
}

interface QueueItem {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  startTime: Date;
  endTime?: Date;
  nodes: number;
  progress: number;
}

const QueueHistory: React.FC<QueueHistoryProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 模拟队列历史数据
  const queueItems: QueueItem[] = [
    {
      id: 'job-001',
      name: '文本生成工作流',
      status: 'success',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3500000),
      nodes: 5,
      progress: 100
    },
    {
      id: 'job-002',
      name: '数据分析工作流',
      status: 'running',
      startTime: new Date(Date.now() - 1800000),
      nodes: 8,
      progress: 65
    },
    {
      id: 'job-003',
      name: '图像生成工作流',
      status: 'failed',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 7150000),
      nodes: 4,
      progress: 30
    },
    {
      id: 'job-004',
      name: '机器学习训练任务',
      status: 'pending',
      startTime: new Date(Date.now() - 300000),
      nodes: 12,
      progress: 0
    },
    {
      id: 'job-005',
      name: '自动化测试工作流',
      status: 'success',
      startTime: new Date(Date.now() - 5400000),
      endTime: new Date(Date.now() - 5200000),
      nodes: 7,
      progress: 100
    },
  ];

  // 过滤队列项
  const filteredItems = queueItems.filter(item => {
    // 状态过滤
    if (filter === 'running' && (item.status !== 'running' && item.status !== 'pending')) return false;
    if (filter === 'completed' && item.status !== 'success') return false;
    if (filter === 'failed' && item.status !== 'failed') return false;
    
    // 搜索过滤
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(t('app.locale'), {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 计算运行时间
  const calculateRuntime = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diffMs = endTime.getTime() - start.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    return t('queue.runtime', { minutes, seconds });
  };

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="px-2 py-1 rounded-full bg-[#10a37f]/20 text-[#10a37f] text-xs flex items-center">
            <span className="w-2 h-2 bg-[#10a37f] rounded-full mr-1.5"></span>
            <Trans id="queue.status.success" />
          </span>
        );
      case 'running':
        return (
          <span className="px-2 py-1 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] text-xs flex items-center">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full mr-1.5 animate-pulse"></span>
            <Trans id="queue.status.running" />
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 rounded-full bg-[#ef4444]/20 text-[#ef4444] text-xs flex items-center">
            <span className="w-2 h-2 bg-[#ef4444] rounded-full mr-1.5"></span>
            <Trans id="queue.status.failed" />
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full bg-[#eab308]/20 text-[#eab308] text-xs flex items-center">
            <span className="w-2 h-2 bg-[#eab308] rounded-full mr-1.5"></span>
            <Trans id="queue.status.pending" />
          </span>
        );
      default:
        return null;
    }
  };

  // 模态框标题的图标
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <NavModal title={t('app.header.queueHistory')} icon={icon} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'all' ? 'bg-[#10a37f] text-white' : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'}`}
              onClick={() => setFilter('all')}
            >
              <Trans id="queue.filter.all" />
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'running' ? 'bg-[#10a37f] text-white' : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'}`}
              onClick={() => setFilter('running')}
            >
              <Trans id="queue.filter.running" />
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'completed' ? 'bg-[#10a37f] text-white' : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'}`}
              onClick={() => setFilter('completed')}
            >
              <Trans id="queue.filter.completed" />
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${filter === 'failed' ? 'bg-[#10a37f] text-white' : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'}`}
              onClick={() => setFilter('failed')}
            >
              <Trans id="queue.filter.failed" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={t("queue.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 队列列表 */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#666]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{t('queue.noMatchingJobs')}</p>
            <p className="text-sm mt-2">{t('queue.noMatchingJobsDescription')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#282828] text-sm">
              <thead>
                <tr className="text-[#888]">
                  <th className="py-3 text-left font-medium">{t('queue.columns.name')}</th>
                  <th className="py-3 text-left font-medium">{t('queue.columns.status')}</th>
                  <th className="py-3 text-left font-medium">{t('queue.columns.startTime')}</th>
                  <th className="py-3 text-left font-medium">{t('queue.columns.runtime')}</th>
                  <th className="py-3 text-left font-medium">{t('queue.columns.nodeCount')}</th>
                  <th className="py-3 text-center font-medium">{t('queue.columns.progress')}</th>
                  <th className="py-3 text-right font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-4 font-medium text-white">{item.name}</td>
                    <td className="py-4">{getStatusLabel(item.status)}</td>
                    <td className="py-4 text-[#999]">{formatTime(item.startTime)}</td>
                    <td className="py-4 text-[#999]">{calculateRuntime(item.startTime, item.endTime)}</td>
                    <td className="py-4 text-[#999]">{item.nodes}</td>
                    <td className="py-4">
                      <div className="w-full bg-[#141414] rounded-full h-2 flex items-center justify-center">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'failed' ? 'bg-[#ef4444]' : 
                            item.status === 'success' ? 'bg-[#10a37f]' : 'bg-[#3b82f6]'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center mt-1 text-[#999]">{item.progress}%</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {item.status === 'running' || item.status === 'pending' ? (
                          <button 
                            className="p-1 rounded hover:bg-[#282828] text-[#ef4444] transition-colors"
                            title={t('queue.actions.cancel')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : (
                          <button 
                            className="p-1 rounded hover:bg-[#282828] text-[#10a37f] transition-colors"
                            title={t('queue.actions.view')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        <button 
                          className="p-1 rounded hover:bg-[#282828] text-[#666] hover:text-[#fff] transition-colors"
                          title={t('common.delete')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </NavModal>
  );
};

export default QueueHistory;