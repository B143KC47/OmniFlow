import React, { useRef, useEffect, useState } from 'react';
import './Connection.css';

const Connection = ({ 
  source, 
  target, 
  sourcePortId, 
  targetPortId, 
  isTemp = false, 
  onRemove 
}) => {
  const [path, setPath] = useState('');
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 });
  const connectionRef = useRef(null);
  
  // 计算端口在节点上的位置
  const getPortPosition = (nodePosition, portId, isOutput) => {
    // 这里可以根据实际的端口布局进行调整
    if (portId) {
      const portElement = document.getElementById(portId);
      if (portElement) {
        const portRect = portElement.getBoundingClientRect();
        const containerRect = document.querySelector('.node-system-container').getBoundingClientRect();
        return {
          x: portRect.left - containerRect.left + (isOutput ? portRect.width : 0),
          y: portRect.top - containerRect.top + portRect.height / 2
        };
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
    const controlPointOffset = Math.min(dx * 0.6, 200); // 增加曲线弯曲程度
    
    // 如果两个节点高度差较大，增加垂直方向的曲率
    const verticalOffset = dy > 50 ? dy * 0.3 : 0;
    
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
      y: (sourcePos.y + targetPos.y) / 2 - 10 // 稍微上移，避免遮挡节点
    });
  }, [source, target, sourcePortId, targetPortId]);

  return (
    <g className={`connection ${isTemp ? 'temp-connection' : ''}`} ref={connectionRef}>
      <path
        d={path}
        className="connection-path"
        fill="none"
        style={{ pointerEvents: 'stroke' }} // 确保只有线条部分可交互
      />
      
      {!isTemp && onRemove && (
        <circle
          cx={midPoint.x}
          cy={midPoint.y}
          r={8}
          className="connection-delete-btn"
          onClick={onRemove}
        />
      )}
    </g>
  );
};

export default Connection;
