import React, { useState } from 'react';
import { NodeType } from '../types';

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
                    <div className="comfy-node-icon" style={{ backgroundColor: node.color }}>
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
      
      <style jsx>{`
        .comfy-node-palette {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: #eee;
          font-family: 'Segoe UI', sans-serif;
        }
        
        .comfy-search-container {
          position: relative;
          padding: 0 0 12px 0;
        }
        
        .comfy-search-input {
          width: 100%;
          background: #333;
          border: 1px solid #555;
          border-radius: 4px;
          color: #eee;
          padding: 8px 12px;
          font-size: 13px;
        }
        
        .comfy-search-input:focus {
          outline: none;
          border-color: #666;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        
        .comfy-search-clear {
          position: absolute;
          right: 8px;
          top: 8px;
          background: none;
          border: none;
          color: #999;
          font-size: 16px;
          cursor: pointer;
        }
        
        .comfy-search-clear:hover {
          color: #ccc;
        }
        
        .comfy-categories {
          flex: 1;
          overflow-y: auto;
        }
        
        .comfy-category {
          margin-bottom: 4px;
        }
        
        .comfy-category-header {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          background: #333;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
        }
        
        .comfy-category-header:hover {
          background: #444;
        }
        
        .comfy-category-toggle {
          font-size: 10px;
          margin-right: 6px;
          color: #aaa;
        }
        
        .comfy-category-name {
          flex: 1;
          font-weight: 600;
          font-size: 13px;
        }
        
        .comfy-category-count {
          background: #444;
          color: #aaa;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 10px;
        }
        
        .comfy-nodes {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 4px 0 4px 16px;
        }
        
        .comfy-node {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 4px;
          background: #2a2a2a;
          border: 1px solid #444;
          cursor: move;
          transition: all 0.2s;
        }
        
        .comfy-node:hover {
          background: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .comfy-node-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          margin-right: 10px;
          font-size: 14px;
        }
        
        .comfy-node-content {
          flex: 1;
          min-width: 0;
        }
        
        .comfy-node-title {
          font-weight: 600;
          font-size: 12px;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .comfy-node-description {
          font-size: 10px;
          color: #aaa;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default NodePalette;