import React, { useState } from 'react';
import NavModal from './shared/NavModal';
import { useTranslation } from '../utils/i18n';

interface ModelLibraryProps {
  onClose: () => void;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  size?: string;
  category: string;
  tags: string[];
  parameters: number;
  lastUpdated: Date;
  installed?: boolean;
  popular?: boolean;
}

// 模型列表
const models: Model[] = [
  {
    id: 'llama-3-70b',
    name: 'Llama-3-70B',
    provider: 'Meta AI',
    description: 'Meta AI开发的开源大语言模型，70B参数版本',
    size: '70B',
    category: 'text',
    tags: ['开源', 'LLM', '通用'],
    parameters: 70000000000,
    lastUpdated: new Date('2023-12-15'),
    popular: true
  },
  {
    id: 'llama-3-8b',
    name: 'Llama-3-8B',
    provider: 'Meta AI',
    description: 'Meta AI开发的开源大语言模型，8B参数版本',
    size: '8B',
    category: 'text',
    tags: ['开源', 'LLM', '通用'],
    parameters: 8000000000,
    lastUpdated: new Date('2023-12-15'),
    installed: true
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'OpenAI最新的多模态大语言模型，支持图像、音频和文本输入',
    category: 'multimodal',
    tags: ['闭源', 'API', '多模态'],
    parameters: 1500000000000,
    lastUpdated: new Date('2024-05-13'),
    popular: true,
    installed: true
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Anthropic的最新模型，卓越的推理和深度分析能力',
    category: 'text',
    tags: ['闭源', 'API', '推理'],
    parameters: 1000000000000,
    lastUpdated: new Date('2024-03-04'),
    popular: true
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    description: '高质量的文生图模型，支持详细的图像生成',
    category: 'image',
    tags: ['开源', '图像生成'],
    parameters: 2600000000,
    lastUpdated: new Date('2023-11-21'),
    installed: true
  },
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    provider: 'OpenAI',
    description: '强大的语音识别和转录模型，支持多种语言',
    category: 'audio',
    tags: ['开源', '语音识别'],
    parameters: 1550000000,
    lastUpdated: new Date('2023-09-30')
  },
  {
    id: 'text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    provider: 'OpenAI',
    description: '文本嵌入模型，用于生成文本的向量表示',
    category: 'embedding',
    tags: ['闭源', 'API', '嵌入'],
    parameters: 1500000000,
    lastUpdated: new Date('2024-01-25'),
    installed: true
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google的多模态AI模型，支持文本、图像分析',
    category: 'multimodal',
    tags: ['闭源', 'API', '多模态'],
    parameters: 350000000000,
    lastUpdated: new Date('2023-12-06'),
    popular: true
  }
];

const ModelLibrary: React.FC<ModelLibraryProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'provider' | 'lastUpdated'>('lastUpdated');
  const [showInstalled, setShowInstalled] = useState<boolean>(false);

  // 定义模型分类
  const modelCategories = [
    { id: 'all', name: t('library.model.categories.all') },
    { id: 'text', name: t('library.model.categories.text') },
    { id: 'image', name: t('library.model.categories.image') },
    { id: 'audio', name: t('library.model.categories.audio') },
    { id: 'embedding', name: t('library.model.categories.embedding') },
    { id: 'multimodal', name: t('library.model.categories.multimodal') },
  ];

  // 模态框标题的图标
  const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  );

  // 过滤模型
  const filteredModels = models.filter(model => {
    // 如果只显示已安装的模型
    if (showInstalled && !model.installed) {
      return false;
    }
    
    // 分类过滤
    if (selectedCategory !== 'all' && model.category !== selectedCategory) {
      return false;
    }
    
    // 搜索过滤
    if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !model.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !model.provider.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 排序模型
  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'provider':
        return a.provider.localeCompare(b.provider);
      case 'lastUpdated':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      default:
        return 0;
    }
  });

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 格式化参数数量
  const formatParameters = (params: number) => {
    if (params >= 1000000000000) {
      return `${(params / 1000000000000).toFixed(1)}T`;
    } else if (params >= 1000000000) {
      return `${(params / 1000000000).toFixed(1)}B`;
    } else if (params >= 1000000) {
      return `${(params / 1000000).toFixed(1)}M`;
    }
    return params.toString();
  };

  return (
    <NavModal title={t('library.model.title')} icon={icon} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* 过滤栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            {modelCategories.map(category => (
              <button 
                key={category.id}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  selectedCategory === category.id 
                    ? 'bg-[#10a37f] text-white' 
                    : 'bg-[#141414] text-[#e0e0e0] hover:bg-[#1c1c1c]'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('library.model.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center">
              <input
                id="installed-filter"
                type="checkbox"
                checked={showInstalled}
                onChange={() => setShowInstalled(!showInstalled)}
                className="w-4 h-4 rounded bg-[#141414] border-[#282828] text-[#10a37f] focus:ring-[#10a37f] focus:ring-offset-0 focus:ring-1"
              />
              <label htmlFor="installed-filter" className="ml-2 text-sm text-[#e0e0e0]">
                {t('library.model.showInstalled')}
              </label>
            </div>
          </div>
        </div>

        {/* 模型列表 */}
        {sortedModels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#666]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-lg font-medium">{t('library.model.notFound')}</p>
            <p className="text-sm mt-2">{t('library.model.tryDifferent')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#282828]">
              <thead>
                <tr className="text-[#888] text-sm">
                  <th className="py-3 text-left font-medium">
                    <button 
                      className={`flex items-center ${sortBy === 'name' ? 'text-[#10a37f]' : ''}`}
                      onClick={() => setSortBy('name')}
                    >
                      {t('workflow.name')}
                      {sortBy === 'name' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="py-3 text-left font-medium">
                    <button 
                      className={`flex items-center ${sortBy === 'provider' ? 'text-[#10a37f]' : ''}`}
                      onClick={() => setSortBy('provider')}
                    >
                      {t('library.model.provider')}
                      {sortBy === 'provider' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="py-3 text-left font-medium">{t('library.model.category')}</th>
                  <th className="py-3 text-left font-medium">{t('library.model.parameters')}</th>
                  <th className="py-3 text-left font-medium">
                    <button 
                      className={`flex items-center ${sortBy === 'lastUpdated' ? 'text-[#10a37f]' : ''}`}
                      onClick={() => setSortBy('lastUpdated')}
                    >
                      {t('library.model.updatedAt')}
                      {sortBy === 'lastUpdated' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="py-3 text-right font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {sortedModels.map((model) => (
                  <tr key={model.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
                          model.category === 'text' ? 'bg-[#10a37f]/10 text-[#10a37f]' : 
                          model.category === 'image' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 
                          model.category === 'audio' ? 'bg-[#eab308]/10 text-[#eab308]' : 
                          model.category === 'embedding' ? 'bg-[#a855f7]/10 text-[#a855f7]' : 
                          'bg-[#ec4899]/10 text-[#ec4899]'
                        }`}>
                          {getCategoryIcon(model.category)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-white font-medium">{model.name}</h3>
                            {model.popular && (
                              <span className="ml-2 px-1.5 py-0.5 bg-[#ef4444]/10 text-[#ef4444] text-xs rounded">Popular</span>
                            )}
                            {model.installed && (
                              <span className="ml-2 px-1.5 py-0.5 bg-[#10a37f]/10 text-[#10a37f] text-xs rounded">Installed</span>
                            )}
                          </div>
                          <p className="text-xs text-[#999] mt-1 max-w-md line-clamp-1">{model.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-[#e0e0e0]">{model.provider}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        model.category === 'text' ? 'bg-[#10a37f]/10 text-[#10a37f]' : 
                        model.category === 'image' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 
                        model.category === 'audio' ? 'bg-[#eab308]/10 text-[#eab308]' : 
                        model.category === 'embedding' ? 'bg-[#a855f7]/10 text-[#a855f7]' : 
                        'bg-[#ec4899]/10 text-[#ec4899]'
                      }`}>
                        {getCategoryName(model.category, t)}
                      </span>
                    </td>
                    <td className="py-4 text-[#999]">{formatParameters(model.parameters)}</td>
                    <td className="py-4 text-[#999]">{formatDate(model.lastUpdated)}</td>
                    <td className="py-4 text-right">
                      {model.installed ? (
                        <button className="px-3 py-1.5 bg-[#141414] hover:bg-[#1c1c1c] border border-[#282828] rounded text-sm transition-all">
                          {t('library.model.manage')}
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded text-sm transition-all">
                          {t('library.model.install')}
                        </button>
                      )}
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

// 获取分类名称
const getCategoryName = (category: string, t: (key: string) => string) => {
  switch (category) {
    case 'text': return t('library.model.categories.text');
    case 'image': return t('library.model.categories.image');
    case 'audio': return t('library.model.categories.audio');
    case 'embedding': return t('library.model.categories.embedding');
    case 'multimodal': return t('library.model.categories.multimodal');
    default: return category;
  }
};

// 获取分类图标
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'audio':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0M12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      );
    case 'embedding':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    case 'multimodal':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
  }
};

export default ModelLibrary;