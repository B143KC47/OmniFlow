import React from 'react';
import { NodeType, NodeData } from '../types';
import TextInputNode from './nodes/TextInputNode';
import LlmQueryNode from './nodes/LlmQueryNode';
import WebSearchNode from './nodes/WebSearchNode';
import DocumentQueryNode from './nodes/DocumentQueryNode';
import ModelSelectorNode from './nodes/ModelSelectorNode';
import CustomNode from './nodes/CustomNode';

interface NodeProps {
  id: string;
  type: NodeType;
  data: NodeData;
  position: { x: number; y: number };
  selected: boolean;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDataChange: (id: string, data: NodeData) => void;
}

const Node: React.FC<NodeProps> = ({ 
  id, 
  type, 
  data, 
  position, 
  selected, 
  onPositionChange,
  onConnect,
  onDataChange
}) => {
  // 处理拖动节点
  const handleDrag = (e: React.DragEvent) => {
    const newPosition = {
      x: position.x + e.movementX,
      y: position.y + e.movementY
    };
    onPositionChange(id, newPosition);
  };

  // 根据节点类型渲染不同的节点组件
  const renderNodeContent = () => {
    const commonProps = {
      id,
      data,
      selected,
      isConnectable: true,
      onDataChange: (newData: NodeData) => onDataChange(id, newData)
    };

    switch (type) {
      case NodeType.TEXT_INPUT:
        return <TextInputNode {...commonProps} />;
      case NodeType.LLM_QUERY:
        return <LlmQueryNode {...commonProps} />;
      case NodeType.WEB_SEARCH:
        return <WebSearchNode {...commonProps} />;
      case NodeType.DOCUMENT_QUERY:
        return <DocumentQueryNode {...commonProps} />;
      case NodeType.MODEL_SELECTOR:
        return <ModelSelectorNode {...commonProps} />;
      case NodeType.CUSTOM:
        return <CustomNode {...commonProps} />;
      default:
        return <div>未知节点类型</div>;
    }
  };

  return (
    <div
      className={`absolute p-4 rounded-lg shadow-lg ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        backgroundColor: '#2d3748', // 深色背景更容易看见
        color: '#e2e8f0', // 浅色文字
        border: '1px solid #4a5568',
        minWidth: '200px',
        cursor: 'move',
        zIndex: 100, // 确保节点在高层级
        position: 'absolute', // 确保绝对定位
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' // 增强阴影效果
      }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('nodeId', id)}
      onDrag={handleDrag}
    >
      <div className="font-bold mb-2 text-lg">{data.label || '节点'}</div>
      {renderNodeContent()}
      <div className="mt-2 flex justify-between">
        <div 
          className="w-4 h-4 rounded-full bg-blue-500 cursor-pointer hover:bg-blue-600"
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData('sourceNodeId', id);
          }}
        />
        <div 
          className="w-4 h-4 rounded-full bg-green-500 cursor-pointer hover:bg-green-600"
          onDrop={(e) => {
            e.preventDefault();
            const sourceId = e.dataTransfer.getData('sourceNodeId');
            if (sourceId && sourceId !== id) {
              onConnect(sourceId, id);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};

export default Node;