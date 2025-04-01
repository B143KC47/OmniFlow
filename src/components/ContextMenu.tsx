import React, { useState, useEffect } from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { NodeCategory } from '../services/NodeDiscoveryService';
import NodeDiscoveryService from '../services/NodeDiscoveryService';
import { useTranslation } from '../utils/i18n';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  id: string;
  onSelectNode: (nodeType: string, position: { x: number; y: number }) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ id, onSelectNode }) => {
  const { t } = useTranslation();
  const [nodeCategories, setNodeCategories] = useState<NodeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化节点发现服务
  useEffect(() => {
    const initializeNodes = async () => {
      try {
        const nodeDiscoveryService = NodeDiscoveryService.getInstance();
        await nodeDiscoveryService.initialize(t);
        setNodeCategories(nodeDiscoveryService.getAllNodeCategories());
      } catch (error) {
        console.error('初始化节点类别时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNodes();
  }, [t]);
  
  // 强制添加一些基本节点类型 - 移到顶层，避免条件渲染后使用 hooks
  useEffect(() => {
    if (!isLoading && nodeCategories.length === 0) {
      console.log('未找到节点类别，添加默认节点类型');
      // 如果节点发现服务未返回任何类别，添加一些基本节点
      const basicNodes: NodeCategory[] = [
        {
          id: 'input',
          name: t('categories.input'),
          description: t('categories.inputDescription') || '输入节点',
          nodes: [
            { 
              id: 'text_input', 
              type: 'TEXT_INPUT', 
              name: t('nodes.textInput.name'), 
              description: t('nodes.textInput.description') || '文本输入节点', 
              category: 'input',
              inputs: 0,
              outputs: 1,
              icon: 'text'
            }
          ]
        },
        {
          id: 'ai',
          name: t('categories.ai'),
          description: t('categories.aiDescription') || 'AI节点',
          nodes: [
            { 
              id: 'model_selector', 
              type: 'MODEL_SELECTOR', 
              name: t('nodes.modelSelector.name'), 
              description: t('nodes.modelSelector.description') || '模型选择器', 
              category: 'ai',
              inputs: 0,
              outputs: 1,
              icon: 'model'
            },
            { 
              id: 'llm_query', 
              type: 'LLM_QUERY', 
              name: t('nodes.llmQuery.name'), 
              description: t('nodes.llmQuery.description') || 'LLM查询', 
              category: 'ai',
              inputs: 2,
              outputs: 1,
              icon: 'brain'
            }
          ]
        },
        {
          id: 'utility',
          name: t('categories.utility'),
          description: t('categories.utilityDescription') || '实用工具',
          nodes: [
            { 
              id: 'web_search', 
              type: 'WEB_SEARCH', 
              name: t('nodes.webSearch.name'), 
              description: t('nodes.webSearch.description') || '网络搜索', 
              category: 'utility',
              inputs: 1,
              outputs: 1,
              icon: 'search'
            },
            { 
              id: 'custom_node', 
              type: 'CUSTOM_NODE', 
              name: t('nodes.custom.name'), 
              description: t('nodes.custom.description') || '自定义节点', 
              category: 'utility',
              inputs: 1,
              outputs: 1,
              icon: 'code'
            }
          ]
        }
      ];
      setNodeCategories(basicNodes);
    }
  }, [isLoading, nodeCategories, t]);

  // 添加节点处理函数
  const handleAddNode = (nodeType: string, { event }: any) => {
    // 使用鼠标位置作为节点的位置
    const position = { x: event.clientX, y: event.clientY };
    console.log(`从右键菜单添加节点: ${nodeType}，位置: ${position.x}, ${position.y}`);
    onSelectNode(nodeType, position);
  };

  // 如果正在加载，显示一个简单的菜单项
  if (isLoading) {
    return (
      <div className={styles['contexify-wrapper']}>
        <Menu id={id} className={styles['comfy-context-menu']}>
          <Item disabled className={styles['comfy-menu-item']}>{t('contextMenu.loading')}</Item>
        </Menu>
      </div>
    );
  }

  return (
    <div className={styles['contexify-wrapper']}>
      <Menu id={id} className={styles['comfy-context-menu']}>
        {/* 普通选项 */}
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.copy')}</Item>
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.paste')}</Item>
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.delete')}</Item>
        <Separator />
        
        {/* 添加节点子菜单 */}
        <Submenu label={t('contextMenu.addNode')} className={styles.submenu}>
          {/* 输入节点 */}
          {nodeCategories.find(cat => cat.id === 'input') && (
            <Submenu label={t('categories.input')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'input')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`input-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
          
          {/* AI节点 */}
          {nodeCategories.find(cat => cat.id === 'ai') && (
            <Submenu label={t('categories.ai')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'ai')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`ai-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
          
          {/* 实用工具节点 */}
          {nodeCategories.find(cat => cat.id === 'utility') && (
            <Submenu label={t('categories.utility')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'utility')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`utility-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
          
          {/* 流程控制节点 */}
          {nodeCategories.find(cat => cat.id === 'flow') && (
            <Submenu label={t('categories.flow')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'flow')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`flow-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
          
          {/* 高级节点 */}
          {nodeCategories.find(cat => cat.id === 'advanced') && (
            <Submenu label={t('categories.advanced')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'advanced')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`advanced-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
          
          {/* 输出节点 */}
          {nodeCategories.find(cat => cat.id === 'output') && (
            <Submenu label={t('categories.output')} className={styles.submenu}>
              {nodeCategories
                .find(cat => cat.id === 'output')
                ?.nodes.map((node, index) => (
                  <Item 
                    key={`output-${node.id}-${index}`}
                    onClick={e => handleAddNode(node.type, e)}
                    className={styles['comfy-menu-item']}
                  >
                    {node.name}
                  </Item>
                ))}
            </Submenu>
          )}
        </Submenu>
        
        <Separator />
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.selectAll')}</Item>
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.undo')}</Item>
        <Item className={styles['comfy-menu-item']}>{t('contextMenu.redo')}</Item>
      </Menu>
    </div>
  );
};

export default ContextMenu;