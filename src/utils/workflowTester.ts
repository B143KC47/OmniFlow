import { Workflow, Node, Edge, NodeType, NodeData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import WorkflowController from '../services/WorkflowController';
import { WorkflowExecutionOptions } from '../core/workflow/types';

/**
 * 工作流测试结果
 */
export interface WorkflowTestResult {
  // 成功或失败
  success: boolean;
  
  // 错误信息（如果失败）
  error?: string;
  
  // 工作流执行时间（毫秒）
  executionTime: number;
  
  // 节点执行结果
  nodeResults: Map<string, any>;
  
  // 输出摘要（最后一个节点的输出）
  output?: any;
}

/**
 * 工作流测试器
 * 用于在无UI环境下测试工作流功能
 */
export class WorkflowTester {
  private controller: WorkflowController;
  
  constructor() {
    this.controller = new WorkflowController();
  }
  
  /**
   * 测试工作流
   * @param workflow 工作流数据或ID
   * @param inputs 测试输入值
   * @param options 执行选项
   */
  public async testWorkflow(
    workflow: Workflow | string, 
    inputs: Record<string, any> = {},
    options?: WorkflowExecutionOptions
  ): Promise<WorkflowTestResult> {
    const startTime = Date.now();
    
    try {
      // 如果传入的是工作流ID，先加载工作流
      let workflowData: Workflow;
      if (typeof workflow === 'string') {
        // 从存储中加载工作流
        const loaded = this.loadWorkflow(workflow);
        if (!loaded) {
          throw new Error(`未找到工作流: ${workflow}`);
        }
        workflowData = loaded;
      } else {
        workflowData = workflow;
      }
      
      // 注入测试输入到工作流
      const modifiedWorkflow = this.injectInputs(workflowData, inputs);
      
      // 执行工作流 - 确保传递的是 Node[] 类型的节点
      const nodes = modifiedWorkflow.nodes.map(node => ({
        ...node,
        type: node.type as NodeType // 确保节点类型是 NodeType 枚举
      })) as Node[];
      
      await this.controller.execute(nodes, modifiedWorkflow.edges, options);
      
      // 收集结果
      const nodeResults = new Map<string, any>();
      modifiedWorkflow.nodes.forEach(node => {
        const result = this.controller.getNodeResult(node.id);
        if (result) {
          nodeResults.set(node.id, result);
        }
      });
      
      // 找到最后一个节点（没有出边的节点）的结果作为最终输出
      let finalOutput: any = undefined;
      const outputNodes = this.findOutputNodes(modifiedWorkflow);
      if (outputNodes.length > 0) {
        finalOutput = this.controller.getNodeResult(outputNodes[0].id);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        executionTime,
        nodeResults,
        output: finalOutput
      };
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        nodeResults: new Map()
      };
    }
  }
  
  /**
   * 向工作流注入测试输入
   * @param workflow 工作流数据
   * @param inputs 测试输入
   */
  private injectInputs(workflow: Workflow, inputs: Record<string, any>): Workflow {
    const clonedWorkflow = this.cloneWorkflow(workflow);
    
    // 为每个需要注入的输入创建一个文本输入节点
    const injectionNodes: NodeData[] = [];
    const injectionEdges: Edge[] = [];
    
    Object.entries(inputs).forEach(([key, value]) => {
      // 查找所有使用这个输入的节点
      const targetNodes = clonedWorkflow.nodes.filter(node => 
        // 节点的一个输入字段名与key匹配
        Object.keys(node.data?.inputs || {}).includes(key)
      );
      
      if (targetNodes.length > 0) {
        // 创建一个注入节点
        const injectionNode: NodeData = {
          id: `injection_${uuidv4()}`,
          type: NodeType.TEXT_INPUT as string,
          position: { x: 0, y: 0 }, // 位置不重要，因为这只是测试
          data: {
            label: `测试输入: ${key}`,
            inputs: {
              text: { value: typeof value === 'string' ? value : JSON.stringify(value) }
            },
            outputs: {}
          }
        };
        
        injectionNodes.push(injectionNode);
        
        // 为每个目标节点创建一个连接边
        targetNodes.forEach(targetNode => {
          const edge: Edge = {
            id: `edge_${uuidv4()}`,
            source: injectionNode.id,
            target: targetNode.id,
            sourceHandle: 'output-text',
            targetHandle: `input-${key}`
          };
          
          injectionEdges.push(edge);
        });
      }
    });
    
    // 将注入节点和边添加到工作流中
    clonedWorkflow.nodes = [...injectionNodes, ...clonedWorkflow.nodes];
    clonedWorkflow.edges = [...injectionEdges, ...clonedWorkflow.edges];
    
    return clonedWorkflow;
  }
  
  /**
   * 克隆工作流
   * @param workflow 原工作流
   */
  private cloneWorkflow(workflow: Workflow): Workflow {
    return JSON.parse(JSON.stringify(workflow));
  }
  
  /**
   * 从本地存储加载工作流
   * @param workflowId 工作流ID
   */
  private loadWorkflow(workflowId: string): Workflow | null {
    try {
      const workflowJson = localStorage.getItem(`workflow_${workflowId}`);
      if (!workflowJson) {
        return null;
      }
      
      const workflow: Workflow = JSON.parse(workflowJson);
      
      // 转换日期
      if (workflow.createdAt) {
        workflow.createdAt = new Date(workflow.createdAt);
      }
      if (workflow.updatedAt) {
        workflow.updatedAt = new Date(workflow.updatedAt);
      }
      
      return workflow;
    } catch (error) {
      console.error(`加载工作流 ${workflowId} 失败:`, error);
      return null;
    }
  }
  
  /**
   * 查找工作流的输出节点（没有出边的节点）
   * @param workflow 工作流数据
   */
  private findOutputNodes(workflow: Workflow): NodeData[] {
    // 收集所有作为边起点的节点ID
    const sourceNodeIds = new Set(workflow.edges.map(edge => edge.source));
    
    // 查找不是任何边起点的节点（即输出节点）
    return workflow.nodes.filter(node => !sourceNodeIds.has(node.id));
  }
  
  /**
   * 创建简单的测试工作流
   * @param name 工作流名称
   */
  public createTestWorkflow(name: string = '测试工作流'): Workflow {
    const now = new Date();
    
    // 创建文本输入节点
    const textInputNode: NodeData = {
      id: uuidv4(),
      type: NodeType.TEXT_INPUT as string,
      position: { x: 100, y: 100 },
      data: {
        label: '文本输入',
        inputs: { text: { value: '这是一个测试' } },
        outputs: {}
      }
    };
    
    // 创建LLM查询节点
    const llmQueryNode: NodeData = {
      id: uuidv4(),
      type: NodeType.LLM_QUERY as string,
      position: { x: 100, y: 250 },
      data: {
        label: 'LLM查询',
        inputs: {
          model: { value: 'deepseek-chat' },
          systemPrompt: { value: 'You are a helpful assistant.' },
          temperature: { value: '0.7' }
        },
        outputs: {}
      }
    };
    
    // 创建边
    const edge: Edge = {
      id: uuidv4(),
      source: textInputNode.id,
      target: llmQueryNode.id,
      sourceHandle: 'output-text',
      targetHandle: 'input-prompt'
    };
    
    return {
      id: `test_workflow_${now.getTime()}`,
      name,
      nodes: [textInputNode, llmQueryNode],
      edges: [edge],
      createdAt: now,
      updatedAt: now,
      tags: [],
      favorite: false
    };
  }
}

export default WorkflowTester;