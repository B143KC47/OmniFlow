import React, { FC } from 'react';
import { EdgeProps, getBezierPath, getStraightPath } from 'reactflow';
import './Connection.css'; // 导入CSS样式

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
  
  // 基于类型或状态设置边的样式类
  const edgeClassName = `
    react-flow__edge-path 
    connection-path 
    ${animated ? 'animated' : ''} 
    ${selected ? 'selected' : ''} 
    ${isCompatible ? 'compatible' : 'incompatible'}
  `.trim();

  // 使用优化的贝塞尔曲线路径，增加曲率使连接更明显绕过节点
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.5,
  });

  // 获取中点位置用于标签和删除按钮
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 - 10;

  return (
    <>
      {/* 连接线路径 - 使用CSS类来控制z-index和pointer-events */}
      <path
        id={id}
        className={edgeClassName}
        d={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* 类型匹配指示器 */}
      {edgeData?.sourceType && edgeData?.targetType && (
        <g transform={`translate(${midX},${midY})`} className="edge-indicator">
          <circle
            className={`edge-type-indicator ${isCompatible ? 'compatible' : 'incompatible'}`}
            strokeWidth={2}
          />
          <text
            className={`edge-indicator-text ${isCompatible ? 'compatible' : 'incompatible'}`}
          >
            {isCompatible ? '✓' : '✗'}
          </text>
        </g>
      )}

      {/* 连接标签 - 添加适当的类名以便CSS控制 */}
      {edgeData?.label && (
        <g transform={`translate(${labelX},${labelY})`} className="edge-label-container">
          <rect 
            className="edge-label-rect"
          />
          <text
            className="edge-label-text"
          >
            {edgeData.label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;