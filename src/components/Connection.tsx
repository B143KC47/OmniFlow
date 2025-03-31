import React, { FC } from 'react';
import { EdgeProps, getBezierPath, getStraightPath } from 'reactflow';
import styles from './Connection.module.css'; // 改为导入CSS模块

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
    ${styles['connection-path']} 
    ${animated ? styles.animated : ''} 
    ${selected ? styles.selected : ''} 
    ${isCompatible ? styles.compatible : styles.incompatible}
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
        <g transform={`translate(${midX},${midY})`} className={styles['edge-indicator']}>
          <circle
            className={`${styles['edge-type-indicator']} ${isCompatible ? styles.compatible : styles.incompatible}`}
            strokeWidth={2}
          />
          <text
            className={`${styles['edge-indicator-text']} ${isCompatible ? styles.compatible : styles.incompatible}`}
          >
            {isCompatible ? '✓' : '✗'}
          </text>
        </g>
      )}

      {/* 连接标签 - 添加适当的类名以便CSS控制 */}
      {edgeData?.label && (
        <g transform={`translate(${labelX},${labelY})`} className={styles['edge-label-container']}>
          <rect 
            className={styles['edge-label-rect']}
          />
          <text
            className={styles['edge-label-text']}
          >
            {edgeData.label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;