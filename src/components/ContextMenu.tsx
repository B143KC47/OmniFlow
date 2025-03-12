import React, { useEffect, useRef } from 'react';
import { Menu, Item, Separator, Submenu, ItemParams } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { XYPosition } from 'reactflow';
import { FiCopy, FiTrash2, FiEdit2 } from 'react-icons/fi';

export const MENU_ID = 'flow-context-menu';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  id: string;
  onAddNode: (nodeType: string, position: XYPosition) => void;
  position: XYPosition;
}

// 定义上下文菜单项点击时的处理函数
const handleItemClick = ({ id, props }: ItemParams) => {
  if (props && props.onAddNode && typeof props.onAddNode === 'function') {
    props.onAddNode(id, props.position);
  }
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onDelete,
  onDuplicate,
  onEdit,
  id,
  onAddNode,
  position,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      icon: <FiEdit2 className="comfy-menu-icon" />,
      label: '编辑',
      onClick: onEdit,
      show: !!onEdit,
    },
    {
      icon: <FiCopy className="comfy-menu-icon" />,
      label: '复制',
      onClick: onDuplicate,
      show: !!onDuplicate,
    },
    {
      icon: <FiTrash2 className="comfy-menu-icon" />,
      label: '删除',
      onClick: onDelete,
      show: !!onDelete,
    },
  ];

  const style = {
    position: 'fixed' as const,
    left: x,
    top: y,
    zIndex: 1000,
  };

  const menuProps = {
    onAddNode,
    position,
  };

  return (
    <div className="comfy-context-menu" style={style} ref={menuRef}>
      {menuItems
        .filter((item) => item.show)
        .map((item, index) => (
          <div
            key={index}
            className="comfy-menu-item"
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      <Menu id={id} animation={false} className="comfy-context-menu">
        <Submenu label={
          <div className="comfy-menu-item">
            <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <span>Basic Nodes</span>
          </div>
        }>
          <Item id="textInput" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Text Input</span>
            </div>
          </Item>
        </Submenu>

        <Submenu label={
          <div className="comfy-menu-item">
            <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <span>AI Nodes</span>
          </div>
        }>
          <Item id="llmQuery" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>LLM Query</span>
            </div>
          </Item>
          <Item id="modelSelector" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Model Selector</span>
            </div>
          </Item>
        </Submenu>

        <Submenu label={
          <div className="comfy-menu-item">
            <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Search Nodes</span>
          </div>
        }>
          <Item id="webSearch" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Web Search</span>
            </div>
          </Item>
          <Item id="documentQuery" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Document Query</span>
            </div>
          </Item>
        </Submenu>

        <Separator />

        <Submenu label={
          <div className="comfy-menu-item">
            <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Processing Nodes</span>
          </div>
        }>
          <Item id="encoder" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Encoder</span>
            </div>
          </Item>
          <Item id="sampler" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Sampler</span>
            </div>
          </Item>
          <Item id="custom" onClick={handleItemClick} {...menuProps}>
            <div className="comfy-menu-item">
              <svg className="comfy-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Custom</span>
            </div>
          </Item>
        </Submenu>

        <style jsx global>{`
          .comfy-context-menu {
            background-color: var(--node-color);
            border: 1px solid var(--node-border-color);
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            padding: 6px 0;
            min-width: 180px;
          }
          
          .comfy-menu-item {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            color: var(--node-text-color);
            font-size: 12px;
            transition: all 0.2s ease;
          }
          
          .comfy-menu-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            color: var(--primary-color);
          }
          
          .react-contexify__item:hover > .react-contexify__item__content {
            background-color: var(--node-header-color);
            color: var(--node-title-color);
          }
          
          .react-contexify__item:hover .comfy-menu-icon {
            color: var(--node-title-color);
          }
          
          .react-contexify__separator {
            background-color: var(--node-border-color);
            height: 1px;
            margin: 6px 0;
          }
        `}</style>
      </Menu>
    </div>
  );
};

export default ContextMenu;