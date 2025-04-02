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
          name: t('nodes.categories.input'),
          description: t('nodes.categories.inputDescription'),
          nodes: [
            { 
              id: 'text_input', 
              type: 'TEXT_INPUT', 
              name: t('nodes.textInput.name'), 
              description: t('nodes.textInput.description'), 
              category: 'input',
              inputs: 0,
              outputs: 1,
              icon: 'text'
            },
            { 
              id: 'image_input', 
              type: 'IMAGE_INPUT', 
              name: t('nodes.imageInput.name') || '图像输入', 
              description: t('nodes.imageInput.description') || '图像输入节点', 
              category: 'input',
              inputs: 0,
              outputs: 1,
              icon: 'image'
            },
            { 
              id: 'file_input', 
              type: 'FILE_INPUT', 
              name: t('nodes.fileInput.name') || '文件输入', 
              description: t('nodes.fileInput.description') || '文件输入节点', 
              category: 'input',
              inputs: 0,
              outputs: 1,
              icon: 'file'
            }
          ]
        },
        {
          id: 'ai',
          name: t('nodes.categories.ai'),
          description: t('nodes.categories.aiDescription'),
          nodes: [
            { 
              id: 'model_selector', 
              type: 'MODEL_SELECTOR', 
              name: t('nodes.modelSelector.name'), 
              description: t('nodes.modelSelector.description'), 
              category: 'ai',
              inputs: 0,
              outputs: 1,
              icon: 'model'
            },
            { 
              id: 'llm_query', 
              type: 'LLM_QUERY', 
              name: t('nodes.llmQuery.name'), 
              description: t('nodes.llmQuery.description'), 
              category: 'ai',
              inputs: 2,
              outputs: 1,
              icon: 'brain'
            },
            { 
              id: 'encoder', 
              type: 'ENCODER', 
              name: t('nodes.encoder.name') || '文本编码器', 
              description: t('nodes.encoder.description') || '文本编码转换', 
              category: 'ai',
              inputs: 1,
              outputs: 1,
              icon: 'code'
            }
          ]
        },
        {
          id: 'utility',
          name: t('nodes.categories.utility'),
          description: t('nodes.categories.utilDescription'),
          nodes: [
            { 
              id: 'web_search', 
              type: 'WEB_SEARCH', 
              name: t('nodes.webSearch.name'), 
              description: t('nodes.webSearch.description'), 
              category: 'utility',
              inputs: 1,
              outputs: 1,
              icon: 'search'
            },
            { 
              id: 'document_query', 
              type: 'DOCUMENT_QUERY', 
              name: t('nodes.documentQuery.name') || '文档查询', 
              description: t('nodes.documentQuery.description') || '文档查询节点', 
              category: 'utility',
              inputs: 2,
              outputs: 1,
              icon: 'document'
            },
            { 
              id: 'custom_node', 
              type: 'CUSTOM_NODE', 
              name: t('nodes.custom.name'), 
              description: t('nodes.custom.description'), 
              category: 'utility',
              inputs: 1,
              outputs: 1,
              icon: 'code'
            },
            { 
              id: 'sampler', 
              type: 'SAMPLER', 
              name: t('nodes.sampler.name') || '数据采样器', 
              description: t('nodes.sampler.description') || '数据采样处理', 
              category: 'utility',
              inputs: 1,
              outputs: 1,
              icon: 'filter'
            }
          ]
        },
        {
          id: 'output',
          name: t('nodes.categories.output'),
          description: t('nodes.categories.outputDescription') || '输出节点',
          nodes: [
            { 
              id: 'text_output', 
              type: 'TEXT_OUTPUT', 
              name: t('nodes.textOutput.name') || '文本输出', 
              description: t('nodes.textOutput.description') || '文本输出节点', 
              category: 'output',
              inputs: 1,
              outputs: 0,
              icon: 'text'
            },
            { 
              id: 'image_output', 
              type: 'IMAGE_OUTPUT', 
              name: t('nodes.imageOutput.name') || '图像输出', 
              description: t('nodes.imageOutput.description') || '图像输出节点', 
              category: 'output',
              inputs: 1,
              outputs: 0,
              icon: 'image'
            },
            { 
              id: 'file_output', 
              type: 'FILE_OUTPUT', 
              name: t('nodes.fileOutput.name') || '文件输出', 
              description: t('nodes.fileOutput.description') || '文件输出节点', 
              category: 'output',
              inputs: 1,
              outputs: 0,
              icon: 'file'
            }
          ]
        },
        {
          id: 'flow',
          name: t('nodes.categories.flow'),
          description: t('nodes.categories.flowDescription'),
          nodes: [
            { 
              id: 'loop_control', 
              type: 'LOOP_CONTROL', 
              name: t('nodes.loopControl.name'), 
              description: t('nodes.loopControl.description'), 
              category: 'flow',
              inputs: 1,
              outputs: 1,
              icon: 'loop'
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
          <Item disabled className={styles['comfy-menu-item']}>{t('contextMenu.loading') || '加载中...'}</Item>
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
            <Submenu label={t('nodes.categories.input')} className={styles.submenu}>
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
            <Submenu label={t('nodes.categories.ai')} className={styles.submenu}>
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
            <Submenu label={t('nodes.categories.utility')} className={styles.submenu}>
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
          
          {/* 输出节点 */}
          {nodeCategories.find(cat => cat.id === 'output') && (
            <Submenu label={t('nodes.categories.output')} className={styles.submenu}>
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
          
          {/* 流程控制节点 */}
          {nodeCategories.find(cat => cat.id === 'flow') && (
            <Submenu label={t('nodes.categories.flow')} className={styles.submenu}>
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