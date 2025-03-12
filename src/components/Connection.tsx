import React from 'react';

interface ConnectionProps {
  id: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  onDelete: (id: string) => void;
}

const Connection: React.FC<ConnectionProps> = ({ 
  id, 
  sourcePosition, 
  targetPosition,
  onDelete
}) => {
  // 计算连接线的路径
  const path = `M ${sourcePosition.x} ${sourcePosition.y} C ${sourcePosition.x + 50} ${sourcePosition.y}, ${targetPosition.x - 50} ${targetPosition.y}, ${targetPosition.x} ${targetPosition.y}`;
  
  // 计算连接线中点位置（用于放置删除按钮）
  const midX = (sourcePosition.x + targetPosition.x) / 2;
  const midY = (sourcePosition.y + targetPosition.y) / 2;

  return (
    <g>
      <path
        d={path}
        stroke="#999"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <circle
        cx={midX}
        cy={midY}
        r={8}
        fill="#fff"
        stroke="#999"
        strokeWidth={1}
        style={{ cursor: 'pointer' }}
        onClick={() => onDelete(id)}
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fill="#999"
        style={{ pointerEvents: 'none' }}
      >
        ×
      </text>
    </g>
  );
};

export default Connection; 