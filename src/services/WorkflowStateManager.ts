import { Workflow, Node, Edge, NodeType } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 工作流元数据
 */
export interface WorkflowMeta {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  nodes: number; // 节点数量
  edges: number; // 连接数量
}

/**
 * 工作流状态管理器
 * 负责工作流的保存、加载、查询等操作
 */
export class WorkflowStateManager {
  private static instance: WorkflowStateManager;
  private workflowChangeListeners: Array<(workflows: WorkflowMeta[]) => void> = [];
  
  /**
   * 获取单例实例
   */
  public static getInstance(): WorkflowStateManager {
    if (!WorkflowStateManager.instance) {
      WorkflowStateManager.instance = new WorkflowStateManager();
    }
    return WorkflowStateManager.instance;
  }
  
  /**
   * 保存工作流
   * @param workflow 工作流数据
   */
  public saveWorkflow(workflow: Workflow): void {
    try {
      // 确保工作流有ID
      if (!workflow.id) {
        workflow.id = `workflow_${Date.now()}`;
      }
      
      // 更新时间戳
      workflow.updatedAt = new Date();
      
      // 保存工作流详细数据
      localStorage.setItem(`workflow_${workflow.id}`, JSON.stringify(workflow));
      
      // 更新工作流列表
      const workflowList = this.getWorkflowList();
      const existingIndex = workflowList.findIndex(w => w.id === workflow.id);
      
      const workflowMeta: WorkflowMeta = {
        id: workflow.id,
        name: workflow.name || '未命名工作流',
        description: workflow.description,
        tags: workflow.tags || [],
        favorite: workflow.favorite || false,
        createdAt: workflow.createdAt instanceof Date ? workflow.createdAt.getTime() : workflow.createdAt || Date.now(),
        updatedAt: workflow.updatedAt instanceof Date ? workflow.updatedAt.getTime() : Date.now(),
        nodes: workflow.nodes.length,
        edges: workflow.edges.length
      };
      
      if (existingIndex !== -1) {
        workflowList[existingIndex] = workflowMeta;
      } else {
        workflowList.push(workflowMeta);
      }
      
      // 保存更新后的列表
      localStorage.setItem('workflows', JSON.stringify(workflowList));
      
      // 通知监听器
      this.notifyWorkflowChange(workflowList);
      
      console.log(`工作流 ${workflow.name || workflow.id} 保存成功`);
    } catch (error) {
      console.error('保存工作流失败:', error);
      throw new Error(`保存工作流失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 加载工作流
   * @param workflowId 工作流ID
   */
  public loadWorkflow(workflowId: string): Workflow | null {
    try {
      const workflowJson = localStorage.getItem(`workflow_${workflowId}`);
      if (!workflowJson) {
        console.warn(`未找到工作流 ${workflowId}`);
        return null;
      }
      
      const workflow = JSON.parse(workflowJson) as Workflow;
      
      // 转换日期对象
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
   * 删除工作流
   * @param workflowId 工作流ID
   */
  public deleteWorkflow(workflowId: string): boolean {
    try {
      // 从本地存储中删除详细数据
      localStorage.removeItem(`workflow_${workflowId}`);
      
      // 更新工作流列表
      const workflowList = this.getWorkflowList().filter(w => w.id !== workflowId);
      localStorage.setItem('workflows', JSON.stringify(workflowList));
      
      // 通知监听器
      this.notifyWorkflowChange(workflowList);
      
      console.log(`工作流 ${workflowId} 删除成功`);
      return true;
    } catch (error) {
      console.error(`删除工作流 ${workflowId} 失败:`, error);
      return false;
    }
  }
  
  /**
   * 获取所有工作流元数据列表
   */
  public getWorkflowList(): WorkflowMeta[] {
    try {
      const workflowsJson = localStorage.getItem('workflows');
      if (!workflowsJson) {
        return [];
      }
      
      return JSON.parse(workflowsJson) as WorkflowMeta[];
    } catch (error) {
      console.error('获取工作流列表失败:', error);
      return [];
    }
  }
  
  /**
   * 创建新工作流
   * @param name 名称
   * @param description 描述
   * @param template 模板ID
   */
  public createNewWorkflow(name?: string, description?: string, template?: string): Workflow {
    const now = new Date();
    const id = `workflow_${now.getTime()}`;
    
    // 初始化节点和边
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    if (template) {
      // 根据模板添加节点和连接
      // 这里只是一个简单的示例
      if (template === 'text-gen') {
        // 文本生成模板
        const inputNode: Node = {
          id: uuidv4(),
          type: NodeType.TEXT_INPUT,
          position: { x: 100, y: 100 },
          data: {
            label: '文本输入',
            inputs: {
              text: { value: '请输入您的提示词...' }
            },
            outputs: {}
          }
        };
        
        const modelNode: Node = {
          id: uuidv4(),
          type: NodeType.MODEL_SELECTOR,
          position: { x: 100, y: 250 },
          data: {
            label: '模型选择',
            inputs: {
              model: { value: 'deepseek-chat' },
              systemPrompt: { value: 'You are a helpful assistant.' }
            },
            outputs: {}
          }
        };
        
        const llmNode: Node = {
          id: uuidv4(),
          type: NodeType.LLM_QUERY,
          position: { x: 100, y: 400 },
          data: {
            label: 'LLM 查询',
            inputs: {},
            outputs: {}
          }
        };
        
        nodes.push(inputNode, modelNode, llmNode);
        
        // 添加连接
        edges.push({
          id: uuidv4(),
          source: inputNode.id,
          target: llmNode.id,
          sourceHandle: 'output-0',
          targetHandle: 'input-0'
        });
        
        edges.push({
          id: uuidv4(),
          source: modelNode.id,
          target: llmNode.id,
          sourceHandle: 'output-0',
          targetHandle: 'input-1'
        });
      }
    }
    
    const workflow: Workflow = {
      id,
      name: name || '新建工作流',
      description: description || '',
      nodes,
      edges,
      createdAt: now,
      updatedAt: now,
      tags: [],  // 初始化标签为空数组
      favorite: false, // 默认为非收藏状态
      executionCount: 0, // 新工作流执行次数为0
      version: '1.0.0' // 初始版本
    };
    
    // 保存新工作流
    this.saveWorkflow(workflow);
    
    return workflow;
  }
  
  /**
   * 更新工作流元数据（不更改节点和边）
   * @param id 工作流ID
   * @param meta 元数据
   */
  public updateWorkflowMeta(id: string, meta: Partial<WorkflowMeta>): boolean {
    try {
      // 加载现有工作流
      const workflow = this.loadWorkflow(id);
      if (!workflow) {
        return false;
      }
      
      // 更新元数据字段
      if (meta.name !== undefined) workflow.name = meta.name;
      if (meta.description !== undefined) workflow.description = meta.description;
      if (meta.tags !== undefined) workflow.tags = meta.tags;
      if (meta.favorite !== undefined) workflow.favorite = meta.favorite;
      
      workflow.updatedAt = new Date();
      
      // 保存更新后的工作流
      this.saveWorkflow(workflow);
      
      return true;
    } catch (error) {
      console.error(`更新工作流元数据 ${id} 失败:`, error);
      return false;
    }
  }
  
  /**
   * 添加工作流变更监听器
   * @param listener 监听器函数
   */
  public addWorkflowChangeListener(listener: (workflows: WorkflowMeta[]) => void): void {
    this.workflowChangeListeners.push(listener);
    
    // 立即通知当前状态
    listener(this.getWorkflowList());
  }
  
  /**
   * 移除工作流变更监听器
   * @param listener 监听器函数
   */
  public removeWorkflowChangeListener(listener: (workflows: WorkflowMeta[]) => void): void {
    const index = this.workflowChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.workflowChangeListeners.splice(index, 1);
    }
  }
  
  /**
   * 通知工作流变更
   * @param workflows 工作流列表
   */
  private notifyWorkflowChange(workflows: WorkflowMeta[]): void {
    this.workflowChangeListeners.forEach(listener => {
      try {
        listener(workflows);
      } catch (error) {
        console.error('工作流变更监听器执行错误:', error);
      }
    });
  }
  
  /**
   * 导出工作流
   * @param workflowId 工作流ID
   */
  public exportWorkflow(workflowId: string): string {
    const workflow = this.loadWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`导出失败：未找到工作流 ${workflowId}`);
    }
    
    // 创建导出对象（去除敏感信息，如API密钥等）
    const exportData = {
      ...workflow,
      // 清理节点中的敏感信息
      nodes: workflow.nodes.map(node => {
        // 深拷贝节点数据
        const nodeCopy = JSON.parse(JSON.stringify(node));
        
        // 对于MODEL_SELECTOR节点，移除API密钥
        if (node.type === NodeType.MODEL_SELECTOR && nodeCopy.data?.inputs?.apiKey) {
          nodeCopy.data.inputs.apiKey.value = '';
        }
        
        return nodeCopy;
      })
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * 导入工作流
   * @param workflowJson 工作流JSON字符串
   */
  public importWorkflow(workflowJson: string): Workflow {
    try {
      const workflow = JSON.parse(workflowJson) as Workflow;
      
      // 生成新ID，避免覆盖现有工作流
      workflow.id = `workflow_${Date.now()}`;
      workflow.createdAt = new Date();
      workflow.updatedAt = new Date();
      
      // 确保必要的属性存在
      workflow.tags = workflow.tags || [];
      workflow.favorite = workflow.favorite || false;
      
      // 保存导入的工作流
      this.saveWorkflow(workflow);
      
      return workflow;
    } catch (error) {
      console.error('导入工作流失败:', error);
      throw new Error(`导入工作流失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default WorkflowStateManager;