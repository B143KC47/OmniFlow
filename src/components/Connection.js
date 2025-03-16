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
    
    // 使用贝塞尔曲线创建平滑路径
    const dx = Math.abs(targetPos.x - sourcePos.x);
    const controlPointOffset = Math.min(dx * 0.5, 150); // 控制曲线弯曲程度
    
    const path = `
      M ${sourcePos.x},${sourcePos.y} 
      C ${sourcePos.x + controlPointOffset},${sourcePos.y} 
        ${targetPos.x - controlPointOffset},${targetPos.y} 
        ${targetPos.x},${targetPos.y}
    `;
    
    setPath(path);
    
    // 计算路径的中点位置（用于放置删除按钮）
    setMidPoint({
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    });
  }, [source, target, sourcePortId, targetPortId]);

  return (
    <g className={`connection ${isTemp ? 'temp-connection' : ''}`} ref={connectionRef}>
      <path
        d={path}
        className="connection-path"
        fill="none"
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
