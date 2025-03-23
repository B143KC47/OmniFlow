import React, { useState, useRef, useEffect } from 'react';
import Node from './Node';
import Connection from './Connection';
import './NodeSystem.css';

const NodeSystem = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectingNode, setConnectingNode] = useState(null);
  const [connectingPort, setConnectingPort] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // 添加新节点
  const addNode = (position) => {
    const newNode = {
      id: `node-${Date.now()}`,
      position,
      inputs: [{ id: `input-${Date.now()}-1` }],
      outputs: [{ id: `output-${Date.now()}-1` }]
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
    return newNode;
  };

  // 开始连接节点
  const startConnecting = (nodeId, portId, isOutput) => {
    setConnectingNode({ nodeId, isOutput });
    setConnectingPort(portId);
  };

  // 完成连接节点
  const finishConnecting = (nodeId, portId, isOutput) => {
    if (!connectingNode) return;
    
    // 确保不能自连接并且输入/输出端口类型匹配
    if (connectingNode.nodeId === nodeId) return;
    if (connectingNode.isOutput === isOutput) return;
    
    const sourceNodeId = connectingNode.isOutput ? connectingNode.nodeId : nodeId;
    const sourcePortId = connectingNode.isOutput ? connectingPort : portId;
    const targetNodeId = connectingNode.isOutput ? nodeId : connectingNode.nodeId;
    const targetPortId = connectingNode.isOutput ? portId : connectingPort;
    
    // 检查连接是否已存在
    const connectionExists = connections.some(
      conn => conn.sourceNodeId === sourceNodeId && 
              conn.sourcePortId === sourcePortId && 
              conn.targetNodeId === targetNodeId && 
              conn.targetPortId === targetPortId
    );
    
    if (!connectionExists) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        sourceNodeId,
        sourcePortId,
        targetNodeId,
        targetPortId
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    
    setConnectingNode(null);
    setConnectingPort(null);
  };

  // 取消连接
  const cancelConnecting = () => {
    setConnectingNode(null);
    setConnectingPort(null);
  };

  // 删除节点
  const removeNode = (nodeId) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    // 同时删除与该节点相关的所有连接
    setConnections(prevConnections => 
      prevConnections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    );
  };

  // 删除连接
  const removeConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  // 监听鼠标移动
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 获取节点位置信息
  const getNodePosition = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  };

  // 处理背景点击，添加新节点
  const handleCanvasClick = (e) => {
    if (e.target === containerRef.current) {
      if (connectingNode) {
        // 如果正在连接，点击空白区域取消连接
        cancelConnecting();
      } else {
        // 否则，在点击位置添加新节点
        const rect = containerRef.current.getBoundingClientRect();
        const position = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        addNode(position);
      }
    }
  };

  return (
    <div 
      className="node-system-container" 
      ref={containerRef}
      onClick={handleCanvasClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 先渲染连接线，确保它们在节点下方 */}
      <svg className="connection-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* 渲染所有连接 */}
        {connections.map(connection => {
          const sourceNode = getNodePosition(connection.sourceNodeId);
          const targetNode = getNodePosition(connection.targetNodeId);
          return (
            <Connection
              key={connection.id}
              source={sourceNode}
              target={targetNode}
              sourcePortId={connection.sourcePortId}
              targetPortId={connection.targetPortId}
              onRemove={() => removeConnection(connection.id)}
            />
          );
        })}
        
        {/* 渲染正在创建的连接 */}
        {connectingNode && (
          <Connection
            isTemp={true}
            source={connectingNode.isOutput 
              ? getNodePosition(connectingNode.nodeId) 
              : mousePosition}
            target={connectingNode.isOutput 
              ? mousePosition 
              : getNodePosition(connectingNode.nodeId)}
            sourcePortId={connectingNode.isOutput ? connectingPort : null}
            targetPortId={connectingNode.isOutput ? null : connectingPort}
          />
        )}
      </svg>
      
      {/* 然后渲染节点，确保它们在连接线上方 */}
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          onStartConnecting={startConnecting}
          onFinishConnecting={finishConnecting}
          onRemove={() => removeNode(node.id)}
        />
      ))}
    </div>
  );
};

export default NodeSystem;
