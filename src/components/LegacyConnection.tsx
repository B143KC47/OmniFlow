import React, { useRef, useEffect, useState } from 'react';
import styles from './Connection.module.css';

interface ConnectionProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
  sourcePortId?: string;
  targetPortId?: string;
  isTemp?: boolean;
  onRemove?: () => void;
}

interface PointPosition {
  x: number;
  y: number;
}

const LegacyConnection: React.FC<ConnectionProps> = ({ 
  source, 
  target, 
  sourcePortId, 
  targetPortId, 
  isTemp = false, 
  onRemove 
}) => {
  const [path, setPath] = useState<string>('');
  const [midPoint, setMidPoint] = useState<PointPosition>({ x: 0, y: 0 });
  const connectionRef = useRef<SVGGElement>(null);
  
  // 计算端口在节点上的位置
  const getPortPosition = (nodePosition: PointPosition, portId?: string, isOutput?: boolean): PointPosition => {
    // 这里可以根据实际的端口布局进行调整
    if (portId) {
      const portElement = document.getElementById(portId);
      if (portElement) {
        const portRect = portElement.getBoundingClientRect();
        const containerRect = document.querySelector('.node-system-container')?.getBoundingClientRect();
        if (containerRect) {
          return {
            x: portRect.left - containerRect.left + (isOutput ? portRect.width : 0),
            y: portRect.top - containerRect.top + portRect.height / 2
          };
        }
      }
    }
    
    // 如果找不到端口元素，使用默认位置
    return {
      x: nodePosition.x + (isOutput ? 150 : 0), // 150是节点的估计宽度
      y: nodePosition.y + 30 // 30是端口的估计垂直位置
    };
  };

  // 更新连接路径
  useEffect(() => {
    const sourcePos = getPortPosition(source, sourcePortId, true);
    const targetPos = getPortPosition(target, targetPortId, false);
    
    // 使用贝塞尔曲线创建平滑路径，增加曲率以便更好地避开节点
    const dx = Math.abs(targetPos.x - sourcePos.x);
    const dy = Math.abs(targetPos.y - sourcePos.y);
    
    // 根据距离动态调整控制点偏移量，距离越远，曲线越平滑
    // 确保曲线的弯曲度足够大，避免被节点遮挡
    const controlPointOffset = Math.max(Math.min(dx * 0.6, 200), 50); // 最小偏移量为50
    
    // 如果两个节点高度差较大，增加垂直方向的曲率
    const verticalOffset = Math.max(dy * 0.3, 20); // 最小垂直偏移为20
    
    // 创建路径，让连接线的曲率更适合避开节点
    const path = `
      M ${sourcePos.x},${sourcePos.y} 
      C ${sourcePos.x + controlPointOffset},${sourcePos.y + verticalOffset} 
        ${targetPos.x - controlPointOffset},${targetPos.y - verticalOffset} 
        ${targetPos.x},${targetPos.y}
    `;
    
    setPath(path);
    
    // 计算路径的中点位置（用于放置删除按钮），稍微偏移以避免覆盖节点
    setMidPoint({
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2 - 15 // 增加上移距离，进一步避开节点
    });
  }, [source, target, sourcePortId, targetPortId]);

  // 合并连接的 CSS 类名
  const connectionClassName = `${isTemp ? styles['temp-connection'] : ''} ${styles.connection}`.trim();

  return (
    <g 
      className={connectionClassName}
      ref={connectionRef}
      style={{ 
        pointerEvents: isTemp ? 'none' : 'auto',
        // 临时连接线需要显示在普通连接线上方
        zIndex: isTemp ? 2 : 1
      } as React.CSSProperties}
    >
      <path
        d={path}
        className={styles['connection-path']}
        fill="none"
        style={{ 
          pointerEvents: 'stroke', // 确保只有线条部分可交互
          strokeDasharray: isTemp ? '5,5' : 'none'
        } as React.CSSProperties}
      />
      
      {!isTemp && onRemove && (
        <circle
          cx={midPoint.x}
          cy={midPoint.y}
          r={8}
          className={styles['connection-delete-btn']}
          onClick={onRemove}
        />
      )}
    </g>
  );
};

export default LegacyConnection;