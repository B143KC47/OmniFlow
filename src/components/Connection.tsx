import React, { FC } from 'react';
import { EdgeProps, getBezierPath, getStraightPath } from 'reactflow';

interface CustomEdgeData {
  sourceType?: string;
  targetType?: string;
  isValid?: boolean;
  label?: string;
}

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
  animated,
}) => {
  // 自定义数据
  const edgeData = data as CustomEdgeData;
  const isCompatible = edgeData?.isValid !== false;
  
  // 基于类型或状态设置边的样式 - 添加半透明效果以避免完全遮挡节点
  const edgeStyle = {
    ...style,
    stroke: isCompatible 
      ? selected 
        ? 'var(--connection-hover-color)'
        : 'var(--connection-color)'
      : 'var(--error-color)',
    strokeWidth: selected ? 3 : 2,
    strokeDasharray: !isCompatible || animated ? '5,5' : 'none',
    opacity: 0.75, // 添加半透明效果
    pointerEvents: 'stroke', // 保证只有线条部分可交互
  };

  // 使用优化的贝塞尔曲线路径，增加曲率使连接更明显绕过节点
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.5, // 增加曲率
  });

  // 获取中点位置用于标签和删除按钮
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 - 10; // 稍微上移标签位置避免遮挡

  return (
    <>
      {/* 连接线路径 - 添加className以便在CSS中控制z-index */}
      <path
        id={id}
        className={`react-flow__edge-path connection-path ${animated ? 'animated' : ''} ${selected ? 'selected' : ''}`}
        d={edgePath}
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      
      {/* 类型匹配指示器 */}
      {edgeData?.sourceType && edgeData?.targetType && (
        <g transform={`translate(${midX},${midY})`} className="edge-indicator">
          <circle
            r={12}
            fill="var(--node-color)"
            stroke={isCompatible ? 'var(--success-color)' : 'var(--error-color)'}
            strokeWidth={2}
            className="edge-type-indicator"
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={10}
            fill={isCompatible ? 'var(--success-color)' : 'var(--error-color)'}
            style={{ pointerEvents: 'none' }}
          >
            {isCompatible ? '✓' : '✗'}
          </text>
        </g>
      )}

      {/* 连接标签 - 添加背景使其更易阅读 */}
      {edgeData?.label && (
        <g transform={`translate(${labelX},${labelY})`} className="edge-label-container">
          <rect 
            x={-40} 
            y={-10} 
            width={80} 
            height={20} 
            rx={4} 
            fill="var(--node-color)" 
            fillOpacity={0.7} 
            stroke="var(--node-border-color)"
            strokeWidth={1}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={10}
            fill="var(--node-text-color)"
            style={{
              pointerEvents: 'none',
              fontWeight: 500,
            }}
            className="edge-label"
          >
            {edgeData.label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;