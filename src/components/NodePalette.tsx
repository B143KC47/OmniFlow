import React, { useState } from 'react';
import { NodeType } from '../types';
import './NodePalette.css'; // 导入CSS文件

interface NodePaletteProps {
  // 不再需要onAddNode属性，因为我们现在使用拖放功能
}

// 节点分类
const nodeCategories = [
  {
    id: 'input',
    name: '输入',
    nodes: [
      { 
        type: NodeType.TEXT_INPUT, 
        label: '文本输入', 
        description: '允许用户输入文本',
        color: '#4a6fe3',
        icon: '📝'
      }
    ]
  },
  {
    id: 'llm',
    name: 'LLM',
    nodes: [
      { 
        type: NodeType.LLM_QUERY, 
        label: 'LLM查询', 
        description: '向LLM模型发送查询',
        color: '#4caf50',
        icon: '🤖'
      },
      { 
        type: NodeType.MODEL_SELECTOR, 
        label: '模型选择器', 
        description: '选择要使用的LLM模型',
        color: '#00bcd4',
        icon: '🔧'
      }
    ]
  },
  {
    id: 'search',
    name: '搜索',
    nodes: [
      { 
        type: NodeType.WEB_SEARCH, 
        label: '网络搜索', 
        description: '执行网络搜索获取信息',
        color: '#ff9800',
        icon: '🔍'
      },
      { 
        type: NodeType.DOCUMENT_QUERY, 
        label: '文档查询', 
        description: '在文档中搜索相关内容',
        color: '#9c27b0',
        icon: '📄'
      }
    ]
  },
  {
    id: 'advanced',
    name: '高级处理',
    nodes: [
      { 
        type: NodeType.ENCODER, 
        label: '编码器', 
        description: '将文本转换为向量编码',
        color: '#795548',
        icon: '🔠'
      },
      { 
        type: NodeType.SAMPLER, 
        label: '采样器', 
        description: '从多个选项中采样输出',
        color: '#607d8b',
        icon: '🎲'
      }
    ]
  },
  {
    id: 'custom',
    name: '自定义',
    nodes: [
      { 
        type: NodeType.CUSTOM, 
        label: '自定义节点', 
        description: '执行自定义JavaScript代码',
        color: '#e91e63',
        icon: '💻'
      }
    ]
  }
];

const NodePalette: React.FC<NodePaletteProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    nodeCategories.reduce((acc, category) => ({ ...acc, [category.id]: true }), {})
  );

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: NodeType, label: string) => {
    console.log(`开始拖拽节点, 类型: ${type}, 标签: ${label}`);
    // 使用原始枚举值作为类型，而不是字符串表示
    e.dataTransfer.setData('nodeType', type);
    e.dataTransfer.setData('nodeLabel', label);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 切换分类展开/折叠
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // 过滤节点
  const filteredCategories = searchTerm.trim() === '' 
    ? nodeCategories 
    : nodeCategories.map(category => ({
        ...category,
        nodes: category.nodes.filter(node => 
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.nodes.length > 0);

  return (
    <div className="comfy-node-palette">
      <div className="comfy-search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索节点..."
          className="comfy-search-input"
        />
        {searchTerm && (
          <button 
            className="comfy-search-clear"
            onClick={() => setSearchTerm('')}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="comfy-categories">
        {filteredCategories.map(category => (
          <div key={category.id} className="comfy-category">
            <div 
              className="comfy-category-header"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="comfy-category-toggle">
                {expandedCategories[category.id] ? '▼' : '►'}
              </div>
              <div className="comfy-category-name">{category.name}</div>
              <div className="comfy-category-count">{category.nodes.length}</div>
            </div>
            
            {expandedCategories[category.id] && (
              <div className="comfy-nodes">
                {category.nodes.map(node => (
                  <div
                    key={node.type}
                    className="comfy-node"
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type, node.label)}
                  >
                    <div className={`comfy-node-icon node-icon-${node.type.toLowerCase()}`}>
                      {node.icon}
                    </div>
                    <div className="comfy-node-content">
                      <div className="comfy-node-title">{node.label}</div>
                      <div className="comfy-node-description">{node.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;