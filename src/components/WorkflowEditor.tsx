import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import { useContextMenu } from 'react-contexify';
import {
  Connection as FlowConnection,
  Edge as FlowEdge,
  Node as FlowNode,
  XYPosition,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider
} from 'reactflow';
import { NodeData, NodeType, Workflow, Connection as WorkflowConnection } from '../types';
import WorkflowController, { ExecutionState } from '../services/WorkflowController';
import McpService from '../services/McpService';
import { useTranslation } from '../utils/i18n';

// 使用动态导入避免 SSR 问题
const ReactFlow = dynamic(
  () => import('reactflow').then(mod => mod.default),
  { ssr: false }
);

const Controls = dynamic(
  () => import('reactflow').then(mod => mod.Controls),
  { ssr: false }
);

const Background = dynamic(
  () => import('reactflow').then(mod => mod.Background),
  { ssr: false }
);

// 导入样式
import 'reactflow/dist/style.css';

// 动态导入节点组件
const TextInputNode = dynamic(() => import('./nodes/TextInputNode'), { ssr: false });
const DocumentQueryNode = dynamic(() => import('./nodes/DocumentQueryNode'), { ssr: false });
const WebSearchNode = dynamic(() => import('./nodes/WebSearchNode'), { ssr: false });
const ModelSelectorNode = dynamic(() => import('./nodes/ModelSelectorNode'), { ssr: false });
const EncoderNode = dynamic(() => import('./nodes/EncoderNode'), { ssr: false });
const SamplerNode = dynamic(() => import('../components/nodes/SamplerNode'), { ssr: false });
const CustomNode = dynamic(() => import('./nodes/CustomNode'), { ssr: false });
const ContextMenu = dynamic(() => import('./ContextMenu'), { ssr: false });
const McpManager = dynamic(() => import('./McpManager'), { ssr: false });

// 使用 any 类型来避免类型错误
type CustomNode = any;

interface WorkflowEditorProps {
  initialWorkflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
}

interface NodeTypes {
  [key: string]: React.ComponentType<any>;
}

// 节点类型映射表 - 使用NodeType枚举确保类型一致性
const nodeTypeMap: Record<string, NodeType> = {
  [NodeType.TEXT_INPUT]: NodeType.TEXT_INPUT,
  [NodeType.LLM_QUERY]: NodeType.LLM_QUERY,
  [NodeType.WEB_SEARCH]: NodeType.WEB_SEARCH,
  [NodeType.DOCUMENT_QUERY]: NodeType.DOCUMENT_QUERY,
  [NodeType.MODEL_SELECTOR]: NodeType.MODEL_SELECTOR,
  [NodeType.CUSTOM]: NodeType.CUSTOM,
  [NodeType.ENCODER]: NodeType.ENCODER,
  [NodeType.SAMPLER]: NodeType.SAMPLER,
};

// 注册节点类型
const nodeTypes = {
  [NodeType.TEXT_INPUT]: TextInputNode,
  [NodeType.WEB_SEARCH]: WebSearchNode,
  [NodeType.DOCUMENT_QUERY]: DocumentQueryNode,
  [NodeType.MODEL_SELECTOR]: ModelSelectorNode,
  [NodeType.CUSTOM_NODE]: CustomNode,
  [NodeType.ENCODER]: EncoderNode,
  [NodeType.SAMPLER]: SamplerNode,
};

// 定义节点类型
type CustomFlowNode = FlowNode<NodeData>;
type CustomEdge = FlowEdge;

// 上下文菜单ID
const WORKFLOW_MENU_ID = 'workflow-context-menu';

// 内部工作流编辑器组件
const FlowEditor = ({ initialWorkflow, onSave }: WorkflowEditorProps) => {
  const { t } = useTranslation();
  // 使用 useState 来跟踪客户端渲染状态
  const [isClient, setIsClient] = useState(false);

  // 在客户端挂载后更新状态
  useEffect(() => {
    setIsClient(true);
    console.log('工作流编辑器初始化完成');
    
    // 添加错误处理器，捕获React未捕获的错误
    const errorHandler = (event: ErrorEvent) => {
      console.error('全局错误:', event.error);
      // 这里可以添加错误上报或显示错误通知
    };
    
    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  // ReactFlow元素状态
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [showMcpManager, setShowMcpManager] = useState(false);
  
  // 使用 useEffect 来确保 WorkflowController 只在客户端初始化
  const workflowController = useMemo(() => {
    if (typeof window !== 'undefined') {
      const controller = new WorkflowController();
      // 初始化 McpService
      McpService.getInstance().initialize();
      return controller;
    }
    return null;
  }, []);

  const reactFlowInstance = useReactFlow();
  
  // 初始化工作流
  useEffect(() => {
    if (initialWorkflow) {
      // 将保存的工作流节点转换为 ReactFlow 节点
      const reactFlowNodes = initialWorkflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          onChange: (nodeId: string, data: any) => {
            setNodes(nds => 
              nds.map(n => 
                n.id === nodeId 
                  ? { ...n, data: { ...n.data, ...data } }
                  : n
              )
            );
          },
        },
        selected: false,
        dragging: false,
      }));

      // 将保存的连接转换为 ReactFlow 边
      const reactFlowEdges = initialWorkflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));

      // 设置节点和边
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
    }
  }, [initialWorkflow, setNodes, setEdges]);

  // 订阅执行状态变化
  useEffect(() => {
    if (!workflowController) return;

    const handleStateChange = (state: ExecutionState) => {
      setExecutionState(state);
    };

    workflowController.onStateChange(handleStateChange);
    return () => workflowController.offStateChange(handleStateChange);
  }, [workflowController]);

  // 保存工作流
  const handleSaveWorkflow = useCallback(() => {
    if (!onSave) return;
    
    // 创建工作流对象
    const workflow: Workflow = {
      id: initialWorkflow?.id || `workflow_${Date.now()}`,
      name: initialWorkflow?.name || '新工作流',
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as NodeType,
        position: node.position,
        data: {
          label: node.data.label,
          inputs: node.data.inputs || {},
          outputs: node.data.outputs || {},
        },
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      createdAt: initialWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    // 调用保存回调
    onSave(workflow);
  }, [nodes, edges, onSave, initialWorkflow]);

  // 处理连接创建
  const onConnect = useCallback((connection: FlowConnection) => {
    setEdges(edges => addEdge({
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
    }, edges));
  }, [setEdges]);

  // 添加新节点
  const addNode = useCallback((type: string, position: XYPosition) => {
    console.log(`------节点创建开始------`);
    console.log(`收到添加节点请求，类型: ${type}，位置: ${position.x}, ${position.y}`);

    // 确定节点类型，先直接使用传入的类型，如果不是有效类型再尝试从nodeTypeMap获取
    let nodeType = type as NodeType;
    
    // 检查nodeType是否有效，如果无效则尝试从映射表获取
    if (!Object.values(NodeType).includes(nodeType)) {
      console.log(`类型 ${nodeType} 不是直接的NodeType值，尝试从映射表获取...`);
      nodeType = nodeTypeMap[type];
    }

    if (!nodeType) {
      console.error(`未知的节点类型: ${type}`);
      console.log(`可用的节点类型: ${Object.values(NodeType).join(', ')}`);
      console.log(`------节点创建失败------`);
      return;
    }

    console.log(`最终解析的节点类型: ${nodeType}`);
    
    // 检查这个节点类型是否有对应的组件
    if (!nodeTypes[nodeType]) {
      console.error(`未找到节点类型 "${nodeType}" 对应的组件`);
      console.log(`已注册的节点类型映射: ${Object.keys(nodeTypes).join(', ')}`);
      console.log(`------节点创建失败------`);
      return;
    }

    // 根据节点类型设置不同的标签
    let label = '未知节点';
    switch (nodeType) {
      case NodeType.TEXT_INPUT:
        label = t('nodes.textInput.name');
        break;
      case NodeType.LLM_QUERY:
        label = t('nodes.llmQuery.name');
        break;
      case NodeType.WEB_SEARCH:
        label = t('nodes.webSearch.name');
        break;
      case NodeType.DOCUMENT_QUERY:
        label = t('nodes.documentQuery.name');
        break;
      case NodeType.MODEL_SELECTOR:
        label = t('nodes.modelSelector.name');
        break;
      case NodeType.CUSTOM:
        label = t('nodes.custom.name');
        break;
      case NodeType.ENCODER:
        label = t('nodes.encoder.name');
        break;
      case NodeType.SAMPLER:
        label = t('nodes.sampler.name');
        break;
      default:
        label = `节点-${nodeType}`;
    }

    // 创建新节点
    const newNode = {
      id: uuidv4(),
      type: nodeType,
      position,
      data: {
        label,
        inputs: {},
        outputs: {},
        onChange: (nodeId: string, data: any) => {
          setNodes(nds => 
            nds.map(node => 
              node.id === nodeId 
                ? { ...node, data: { ...node.data, ...data } }
                : node
            )
          );
        },
      },
      selected: false,
      dragging: false,
    };

    // 添加节点
    setNodes(nds => [...nds, newNode]);
    
    // 添加调试信息
    console.log('节点创建成功，节点数据:', newNode);
    console.log(`------节点创建完成------`);
  }, [setNodes, t]);

  // 显示MCP管理器
  const handleShowMcpManager = useCallback(() => {
    setShowMcpManager(true);
  }, []);

  // 执行工作流
  const handleExecute = useCallback(async () => {
    if (!workflowController) return;

    try {
      // 将 ReactFlow 节点转换为工作流节点
      const workflowNodes = nodes.map(node => {
        return {
          id: node.id,
          type: node.type as NodeType,
          position: node.position,
          data: {
            label: node.data.label,
            inputs: node.data.inputs,
            outputs: node.data.outputs,
          },
        };
      });
      
      // 将 ReactFlow 边转换为工作流连接
      const workflowConnections = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      }));
      
      // 执行工作流
      await workflowController.execute(workflowNodes as any, workflowConnections as any);
      
      // 执行成功后自动保存
      handleSaveWorkflow();
    } catch (error) {
      console.error('工作流执行失败:', error);
      // TODO: 显示错误提示
    }
  }, [workflowController, nodes, edges, handleSaveWorkflow]);

  // 停止工作流
  const handleStop = useCallback(() => {
    workflowController?.stop();
  }, [workflowController]);

  // 处理右键菜单
  const { show } = useContextMenu({
    id: WORKFLOW_MENU_ID,
  });

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      show({
        event,
        props: {
          position: {
            x: event.clientX,
            y: event.clientY,
          },
          onAddNode: addNode,
        },
      });
    },
    [show, addNode]
  );

  // 处理节点拖放
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // 获取拖放区域的位置信息
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    
    // 从拖拽数据中获取节点类型和标签信息
    const type = event.dataTransfer.getData('nodeType');
    const label = event.dataTransfer.getData('nodeLabel');

    console.log(`拖放创建节点 - 类型: ${type}, 标签: ${label}`);
    
    if (!type) {
      console.error('拖放创建节点失败: 未获取到节点类型');
      return;
    }

    // 计算放置位置（转换为画布坐标）
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });

    // 调用addNode函数创建节点
    addNode(type, position);
  }, [addNode, reactFlowInstance]);

  // 只在客户端渲染时显示内容
  if (!isClient) {
    return <div className="min-h-screen bg-[#141414]">Loading...</div>;
  }

  return (
    <>
      {workflowController && (
        <>
          <div className="comfy-editor">
            <div className="comfy-main" onContextMenu={onContextMenu}>
              <div className="comfy-toolbar">
                <button
                  onClick={handleExecute}
                  disabled={executionState?.isRunning}
                  className={clsx(
                    'comfy-button',
                    executionState?.isRunning
                      ? 'comfy-button-disabled'
                      : 'comfy-button-primary'
                  )}
                >
                  {t('workflow.runWorkflow')}
                </button>
                <button
                  onClick={handleStop}
                  disabled={!executionState?.isRunning}
                  className={clsx(
                    'comfy-button',
                    !executionState?.isRunning
                      ? 'comfy-button-disabled'
                      : 'comfy-button-danger'
                  )}
                >
                  {t('workflow.stopWorkflow')}
                </button>
                <button
                  onClick={handleSaveWorkflow}
                  disabled={executionState?.isRunning}
                  className="comfy-button comfy-button-secondary"
                >
                  {t('workflow.saveWorkflow')}
                </button>
                <button
                  onClick={handleShowMcpManager}
                  className="comfy-button comfy-button-secondary"
                >
                  {t('mcp.header.title')}
                </button>
              </div>

              {executionState?.error && (
                <div className="comfy-error-message">
                  <p>{executionState.error.message}</p>
                </div>
              )}

              <div className="comfy-flow-container" onDragOver={onDragOver} onDrop={onDrop}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  className="comfy-flow"
                  minZoom={0.1}
                  maxZoom={2}
                  defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                  snapToGrid={true}
                  snapGrid={[15, 15]}
                />
              </div>

              <ContextMenu 
                id={WORKFLOW_MENU_ID}
                x={0}
                y={0}
                onClose={() => {}}
                onAddNode={addNode}
                position={{ x: 0, y: 0 }}
              />

              {showMcpManager && (
                <div className="comfy-modal-overlay">
                  <McpManager onClose={() => setShowMcpManager(false)} />
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            .comfy-editor {
              height: 100vh;
              width: 100%;
              position: relative;
              background-color: var(--background-color);
            }
            
            .comfy-main {
              height: 100%;
              width: 100%;
              position: relative;
              overflow: hidden;
            }

            .comfy-flow-container {
              width: 100%;
              height: 100%;
            }
            
            .comfy-toolbar {
              position: absolute;
              top: 16px;
              right: 16px;
              z-index: 10;
              display: flex;
              gap: 8px;
            }
            
            .comfy-button {
              padding: 8px 16px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              border: none;
              transition: all 0.2s ease;
            }
            
            .comfy-button-primary {
              background-color: var(--primary-color);
              color: white;
            }
            
            .comfy-button-primary:hover {
              background-color: var(--secondary-color);
            }

            .comfy-button-secondary {
              background-color: #444;
              color: white;
            }
            
            .comfy-button-secondary:hover {
              background-color: #555;
            }
            
            .comfy-button-danger {
              background-color: var(--error-color);
              color: white;
            }
            
            .comfy-button-danger:hover {
              background-color: #dc2626;
            }
            
            .comfy-button-disabled {
              background-color: var(--node-border-color);
              color: var(--node-text-color);
              cursor: not-allowed;
              opacity: 0.6;
            }
            
            .comfy-error-message {
              position: absolute;
              top: 64px;
              right: 16px;
              z-index: 10;
              background-color: var(--error-color);
              color: white;
              padding: 8px 16px;
              border-radius: 4px;
              font-size: 12px;
              max-width: 300px;
            }
            
            .comfy-modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            
            :global(.comfy-flow) {
              background-color: var(--background-color);
            }
            
            :global(.comfy-controls) {
              background-color: var(--node-color);
              border: 1px solid var(--node-border-color);
              border-radius: 6px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            }
            
            :global(.comfy-controls button) {
              background-color: var(--node-color);
              color: var(--node-text-color);
              border-bottom: 1px solid var(--node-border-color);
            }
            
            :global(.comfy-controls button:hover) {
              background-color: var(--node-header-color);
            }
          `}</style>
        </>
      )}
    </>
  );
};

// 包装组件，确保每个工作流编辑器实例都有自己的 ReactFlow 上下文
const WorkflowEditor = ({ initialWorkflow, onSave }: WorkflowEditorProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-[#141414]">Loading...</div>;
  }

  return (
    <ReactFlowProvider>
      <FlowEditor initialWorkflow={initialWorkflow} onSave={onSave} />
    </ReactFlowProvider>
  );
};

export default WorkflowEditor;