import React, { memo } from 'react';
import { NodeType } from '../types';
import TextInputNode from './nodes/TextInputNode';
import WebSearchNode from './nodes/WebSearchNode';
import DocumentQueryNode from './nodes/DocumentQueryNode';
import ModelSelectorNode from './nodes/ModelSelectorNode';
import CustomNode from './nodes/CustomNode';
import './Node.css'; // 确保导入节点CSS

// 节点组件定义
const Node = memo(({ id, type, data, selected, isConnectable }: any) => {
  // 创建通用属性
  const commonProps = {
    id,
    data,
    selected,
    isConnectable
  };

  // 根据节点类型选择对应的组件渲染
  switch (type) {
    case NodeType.TEXT_INPUT:
      return <TextInputNode {...commonProps} />;
    case NodeType.WEB_SEARCH:
      return <WebSearchNode {...commonProps} />;
    case NodeType.DOCUMENT_QUERY:
      return <DocumentQueryNode {...commonProps} />;
    case NodeType.MODEL_SELECTOR:
      return <ModelSelectorNode {...commonProps} />;
    case NodeType.CUSTOM_NODE:
      return <CustomNode {...commonProps} />;
    default:
      // 默认使用通用节点类型
      return <div className="default-node">未知节点类型: {type}</div>;
  }
});

Node.displayName = 'Node';

export default Node;