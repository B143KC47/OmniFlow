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
      className={`absolute p-4 rounded-lg shadow-md ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        backgroundColor: '#ffffff',
        minWidth: '200px',
        cursor: 'move'
      }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('nodeId', id)}
      onDrag={handleDrag}
    >
      <div className="font-bold mb-2">{data.label || '节点'}</div>
      {renderNodeContent()}
      <div className="mt-2 flex justify-between">
        <div 
          className="w-3 h-3 rounded-full bg-gray-400 cursor-pointer"
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData('sourceNodeId', id);
          }}
        />
        <div 
          className="w-3 h-3 rounded-full bg-gray-400 cursor-pointer"
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