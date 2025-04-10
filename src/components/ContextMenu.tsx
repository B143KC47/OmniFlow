import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { NodeCategory } from '../services/NodeDiscoveryService';
import NodeDiscoveryService from '../services/NodeDiscoveryService';
import { useTranslation } from '../utils/i18n';
import styles from './ContextMenu.module.css';
import { contextMenu } from 'react-contexify';

// Import icons
import {
  FiCopy,
  FiClipboard,
  FiTrash2,
  FiPlus,
  FiCheckSquare,
  FiRotateCcw,
  FiRotateCw,
  FiType,
  FiImage,
  FiFile,
  FiCode,
  FiSearch,
  FiFileText,
  FiCpu,
  FiRepeat,
  FiActivity,
  FiDatabase,
  FiFilter,
  FiTerminal,
  FiBox
} from 'react-icons/fi';

interface ContextMenuProps {
  id: string;
  onSelectNode: (nodeType: string, position: { x: number; y: number }) => void;
  autoHideTimeout?: number; // 自动隐藏超时时间（毫秒）
}

const ContextMenu: React.FC<ContextMenuProps> = ({ id, onSelectNode, autoHideTimeout = 3000 }) => {
  const { t } = useTranslation();
  const [nodeCategories, setNodeCategories] = useState<NodeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNodeSubmenu, setShowNodeSubmenu] = useState<boolean>(false);

  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const menuRef = useRef<HTMLDivElement>(null);

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
              name: t('nodes.imageInput.name') || t('defaultNames.imageInput'),
              description: t('nodes.imageInput.description') || t('defaultDescriptions.imageInput'),
              category: 'input',
              inputs: 0,
              outputs: 1,
              icon: 'image'
            },
            {
              id: 'file_input',
              type: 'FILE_INPUT',
              name: t('nodes.fileInput.name') || t('defaultNames.fileInput'),
              description: t('nodes.fileInput.description') || t('defaultDescriptions.fileInput'),
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
              name: t('nodes.encoder.name') || t('defaultNames.encoder'),
              description: t('nodes.encoder.description') || t('defaultDescriptions.encoder'),
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
              name: t('nodes.documentQuery.name') || t('defaultNames.documentQuery'),
              description: t('nodes.documentQuery.description') || t('defaultDescriptions.documentQuery'),
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
              name: t('nodes.sampler.name') || t('defaultNames.sampler'),
              description: t('nodes.sampler.description') || t('defaultDescriptions.sampler'),
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
          description: t('nodes.categories.outputDescription') || t('defaultDescriptions.outputCategory'),
          nodes: [
            {
              id: 'text_output',
              type: 'TEXT_OUTPUT',
              name: t('nodes.textOutput.name') || t('defaultNames.textOutput'),
              description: t('nodes.textOutput.description') || t('defaultDescriptions.textOutput'),
              category: 'output',
              inputs: 1,
              outputs: 0,
              icon: 'text'
            },
            {
              id: 'image_output',
              type: 'IMAGE_OUTPUT',
              name: t('nodes.imageOutput.name') || t('defaultNames.imageOutput'),
              description: t('nodes.imageOutput.description') || t('defaultDescriptions.imageOutput'),
              category: 'output',
              inputs: 1,
              outputs: 0,
              icon: 'image'
            },
            {
              id: 'file_output',
              type: 'FILE_OUTPUT',
              name: t('nodes.fileOutput.name') || t('defaultNames.fileOutput'),
              description: t('nodes.fileOutput.description') || t('defaultDescriptions.fileOutput'),
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

  // 重置自动隐藏计时器
  const resetAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }

    lastActivityTimeRef.current = Date.now();

    autoHideTimerRef.current = setTimeout(() => {
      // 检查自上次活动以来是否已经过了足够的时间
      const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
      if (timeSinceLastActivity >= autoHideTimeout) {
        contextMenu.hideAll();
      }
    }, autoHideTimeout);
  }, [autoHideTimeout]);

  // 处理鼠标移动事件
  const handleMouseMove = useCallback(() => {
    resetAutoHideTimer();
  }, [resetAutoHideTimer]);

  // 设置鼠标移动监听器
  useEffect(() => {
    const menuElement = menuRef.current;
    if (menuElement) {
      menuElement.addEventListener('mousemove', handleMouseMove);
    }

    // 初始化自动隐藏计时器
    resetAutoHideTimer();

    // 监听菜单显示事件
    const handleMenuShown = () => {
      resetAutoHideTimer();
      setActiveCategory(null); // 重置活动分类
    };

    // 使用 MutationObserver 监听菜单元素的变化
    // 这是因为 react-contexify 不提供 onShown 回调
    if (menuElement) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // 当菜单被添加到 DOM 时触发
            handleMenuShown();
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        if (menuElement) {
          menuElement.removeEventListener('mousemove', handleMouseMove);
        }
        if (autoHideTimerRef.current) {
          clearTimeout(autoHideTimerRef.current);
        }
      };
    }

    // If menuElement is not available, return a simple cleanup function
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
    };
  }, [handleMouseMove, resetAutoHideTimer]);

  // 添加节点处理函数
  const handleAddNode = (nodeType: string, { event }: any) => {
    // 使用鼠标位置作为节点的位置
    const position = { x: event.clientX, y: event.clientY };
    console.log(`从右键菜单添加节点: ${nodeType}，位置: ${position.x}, ${position.y}`);
    onSelectNode(nodeType, position);
    contextMenu.hideAll(); // 添加节点后隐藏菜单
  };

  // 处理分类悬停
  const handleCategoryHover = (categoryId: string) => {
    console.log(`Mouse entered category: ${categoryId}`);
    // 立即设置活动分类，提高响应速度
    setActiveCategory(categoryId);
    resetAutoHideTimer();
  };

  // 获取节点图标
  const getNodeIcon = (nodeType: string, iconName?: string, category?: string) => {
    // 根据节点类型或图标名称返回对应的图标组件
    const iconClass = category ? `${styles['comfy-menu-icon']} ${styles[`category-${category}`]}` : styles['comfy-menu-icon'];

    switch (iconName?.toLowerCase() || nodeType.toLowerCase()) {
      case 'text':
      case 'text_input':
      case 'text_output':
        return <FiType className={iconClass} />;
      case 'image':
      case 'image_input':
      case 'image_output':
        return <FiImage className={iconClass} />;
      case 'file':
      case 'file_input':
      case 'file_output':
        return <FiFile className={iconClass} />;
      case 'code':
      case 'encoder':
      case 'custom_node':
        return <FiCode className={iconClass} />;
      case 'search':
      case 'web_search':
        return <FiSearch className={iconClass} />;
      case 'document':
      case 'document_query':
        return <FiFileText className={iconClass} />;
      case 'model':
      case 'model_selector':
        return <FiCpu className={iconClass} />;
      case 'loop':
      case 'loop_control':
        return <FiRepeat className={iconClass} />;
      case 'brain':
      case 'llm_query':
        return <FiActivity className={iconClass} />;
      case 'filter':
      case 'sampler':
        return <FiFilter className={iconClass} />;
      default:
        return <FiBox className={iconClass} />;
    }
  };


  // 获取分类图标
  const getCategoryIcon = (categoryId: string) => {
    // 根据分类ID返回对应的图标组件
    const iconClass = `${styles['comfy-menu-icon']} ${styles[`category-${categoryId.toLowerCase()}`] || ''}`;

    switch (categoryId.toLowerCase()) {
      case 'input':
        return <FiFile className={iconClass} />;
      case 'ai':
        return <FiActivity className={iconClass} />;
      case 'utility':
        return <FiTerminal className={iconClass} />;
      case 'output':
        return <FiDatabase className={iconClass} />;
      case 'flow':
        return <FiRepeat className={iconClass} />;
      default:
        return <FiBox className={iconClass} />;
    }
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

  // 分类已经在菜单中直接使用了其name属性，不需要额外的翻译函数

  return (
    <div className={styles['contexify-wrapper']} ref={menuRef}>
      <Menu id={id} className={styles['comfy-context-menu']} theme="dark">
        {/* 普通选项 */}
        <Item className={styles['comfy-menu-item']}>
          <FiCopy className={styles['comfy-menu-icon']} />
          {t('contextMenu.copy')}
        </Item>
        <Item className={styles['comfy-menu-item']}>
          <FiClipboard className={styles['comfy-menu-icon']} />
          {t('contextMenu.paste')}
        </Item>
        <Item className={styles['comfy-menu-item']}>
          <FiTrash2 className={styles['comfy-menu-icon']} />
          {t('contextMenu.delete')}
        </Item>
        <Separator />

        {/* 添加节点子菜单 */}
        <div className={styles['add-node-container']}>
          {/* 主菜单项 */}
          <Item
            className={`${styles['comfy-menu-item']} ${styles['add-node-item']}`}
            onMouseEnter={() => {
              console.log('Mouse entered Add Node');
              setShowNodeSubmenu(true);
            }}
            onMouseLeave={() => {
              // 使用延迟确保鼠标移动到子菜单时不会立即隐藏
              setTimeout(() => {
                // 检查鼠标是否在子菜单上
                const submenuElement = document.querySelector(`.${styles['node-submenu-content']}`);
                if (submenuElement && !submenuElement.matches(':hover')) {
                  setShowNodeSubmenu(false);
                }
              }, 100);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FiPlus className={styles['comfy-menu-icon']} />
                <span>{t('contextMenu.addNode')}</span>
              </div>
              <span className={styles['submenu-arrow']}>▶</span>
            </div>
          </Item>

          {/* 子菜单内容 - 只在悬停时显示 */}
          {showNodeSubmenu && (
            <div
              className={styles['node-submenu-content']}
              onMouseEnter={() => setShowNodeSubmenu(true)}
              onMouseLeave={() => setShowNodeSubmenu(false)}
            >
              {/* 动态生成所有节点类别 */}
              {nodeCategories.map((category) => (
                <div
                  key={`category-container-${category.id}`}
                  className={styles['category-wrapper']}
                >
                  <Item
                    key={`category-${category.id}`}
                    className={`${styles['comfy-menu-item']} ${styles['category-item']} ${activeCategory === category.id ? styles['active-category'] : ''}`}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {getCategoryIcon(category.id)}
                        <span>{category.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={styles['category-count']}>{category.nodes.length}</span>
                        <span className={styles['submenu-arrow']}>▶</span>
                      </div>
                    </div>
                  </Item>

                  {/* 子子菜单 - 当分类被激活时显示 */}
                  {activeCategory === category.id && (
                    <div className={styles['category-submenu-content']}>
                      {category.nodes.map((node, index) => (
                        <Item
                          key={`${category.id}-${node.id}-${index}`}
                          onClick={e => handleAddNode(node.type, e)}
                          className={`${styles['comfy-menu-item']} ${styles['node-item']}`}
                        >
                          {getNodeIcon(node.type, node.icon, category.id)}
                          {node.name}
                        </Item>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />
        <Item className={styles['comfy-menu-item']}>
          <FiCheckSquare className={styles['comfy-menu-icon']} />
          {t('contextMenu.selectAll')}
        </Item>
        <Item className={styles['comfy-menu-item']}>
          <FiRotateCcw className={styles['comfy-menu-icon']} />
          {t('contextMenu.undo')}
        </Item>
        <Item className={styles['comfy-menu-item']}>
          <FiRotateCw className={styles['comfy-menu-icon']} />
          {t('contextMenu.redo')}
        </Item>
      </Menu>
    </div>
  );
};

export default ContextMenu;