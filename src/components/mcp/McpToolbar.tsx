import React from 'react';

interface McpToolbarProps {
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  onAddProvider: () => void;
}

const McpToolbar: React.FC<McpToolbarProps> = ({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddProvider,
}) => {
  return (
    <div className="mcp-toolbar">
      <div className="mcp-search">
        <input 
          type="text" 
          placeholder="搜索服务..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="mcp-search-clear" 
            onClick={() => onSearchChange('')}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="mcp-categories">
        {['all', 'search', 'ai', 'database', 'custom'].map((category) => (
          <button 
            key={category}
            className={`mcp-category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category === 'all' ? '全部' :
             category === 'search' ? '搜索' :
             category === 'ai' ? 'AI' :
             category === 'database' ? '数据库' :
             '自定义'}
          </button>
        ))}
      </div>
      
      <button className="mcp-add-btn" onClick={onAddProvider}>
        添加服务
      </button>

      <style jsx>{`
        .mcp-toolbar {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #282828;
          gap: 12px;
        }
        
        .mcp-search {
          position: relative;
          min-width: 200px;
        }
        
        .mcp-search input {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #333;
          color: #e0e0e0;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .mcp-search input:focus {
          outline: none;
          border-color: #10a37f;
          box-shadow: 0 0 0 1px rgba(16, 163, 127, 0.2);
        }
        
        .mcp-search-clear {
          position: absolute;
          right: 8px;
          top: 8px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 16px;
        }
        
        .mcp-search-clear:hover {
          color: #e0e0e0;
        }
        
        .mcp-categories {
          display: flex;
          gap: 8px;
          flex: 1;
        }
        
        .mcp-category-btn {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 4px;
          color: #888;
          padding: 6px 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mcp-category-btn:hover {
          border-color: #10a37f;
          color: #e0e0e0;
        }
        
        .mcp-category-btn.active {
          background: #10a37f;
          border-color: #10a37f;
          color: white;
        }
        
        .mcp-add-btn {
          background: #10a37f;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .mcp-add-btn:hover {
          background: #0c8c6a;
        }
      `}</style>
    </div>
  );
};

export default McpToolbar;