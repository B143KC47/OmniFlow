import React, { useState } from 'react';
import { useTranslation, Trans } from '../utils/i18n';

interface NewWorkflowModalProps {
  onClose: () => void;
  onCreateWorkflow: (name: string, description: string, template?: string) => void;
}

const NewWorkflowModal: React.FC<NewWorkflowModalProps> = ({ onClose, onCreateWorkflow }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(t('workflow.defaultName'));
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  
  // 可用的工作流模板
  const templates = [
    { id: 'blank', name: t('workflow.templates.blank'), description: t('workflow.templates.blankDescription'), icon: 'file-earmark' },
    { id: 'chatbot', name: t('workflow.templates.chatbot'), description: t('workflow.templates.chatbotDescription'), icon: 'chat-dots' },
    { id: 'document-qa', name: t('workflow.templates.documentQa'), description: t('workflow.templates.documentQaDescription'), icon: 'file-text' },
    { id: 'api-integration', name: t('workflow.templates.apiIntegration'), description: t('workflow.templates.apiIntegrationDescription'), icon: 'hdd-network' }
  ];

  // 处理创建工作流
  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateWorkflow(name, description, selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-[#282828] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#282828] bg-[#0e0e0e]">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#10a37f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <Trans id="workflow.createWorkflow.title" />
          </h2>
          <button 
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors p-1 rounded-full hover:bg-[#1a1a1a]"
            aria-label={t("common.close")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* 工作流名称 */}
            <div>
              <label htmlFor="workflow-name" className="block text-sm font-medium text-white mb-1">
                <Trans id="workflow.createWorkflow.nameLabel" />
              </label>
              <input
                id="workflow-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666] transition-all duration-200"
                placeholder={t("workflow.createWorkflow.namePlaceholder")}
              />
            </div>
            
            {/* 工作流描述 */}
            <div>
              <label htmlFor="workflow-description" className="block text-sm font-medium text-white mb-1">
                <Trans id="workflow.createWorkflow.descriptionLabel" /> <span className="text-[#666]">({t('common.optional')})</span>
              </label>
              <textarea
                id="workflow-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#141414] border border-[#282828] focus:border-[#10a37f] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10a37f] placeholder-[#666] transition-all duration-200 min-h-[80px]"
                placeholder={t("workflow.createWorkflow.descriptionPlaceholder")}
              />
            </div>

            {/* 工作流模板选择 */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                <Trans id="workflow.templates.select" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <div 
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedTemplate === template.id 
                        ? 'border-[#10a37f] bg-[#10a37f]/5 shadow-md shadow-[#10a37f]/10' 
                        : 'border-[#282828] hover:border-[#444] bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        selectedTemplate === template.id ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'bg-[#282828] text-[#666]'
                      }`}>
                        {getTemplateIcon(template.icon)}
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-xs text-[#888] mt-1">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center px-6 py-4 border-t border-[#282828] bg-[#0e0e0e]">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-[#282828] rounded text-sm transition-all duration-200"
            >
              <Trans id="common.cancel" />
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#10a37f] hover:bg-[#0fd292] text-white rounded text-sm transition-all duration-200 shadow-lg shadow-[#10a37f]/20 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <Trans id="workflow.createWorkflow.create" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 辅助函数，根据图标名称返回SVG图标
const getTemplateIcon = (iconName: string) => {
  switch (iconName) {
    case 'file-earmark':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
        </svg>
      );
    case 'chat-dots':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          <path d="M2.165 15.803.153 15.114A1.5 1.5 0 0 1 2.518 13H14.5a1.5 1.5 0 0 1 1.5 1.5v.728l-2.016.689A9.533 9.533 0 0 1 8 16c-1.93 0-3.8-.407-5.835-1.197zm11.341-2.893A13.755 13.755 0 0 0 8 12c-1.964 0-3.833.407-5.506 1.136A12.088 12.088 0 0 1 1.5 13H14.5c-.576 0-1.137.066-1.677.19z"/>
          <path d="M14.5 3h-13A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3z"/>
        </svg>
      );
    case 'file-text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
          <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
        </svg>
      );
    case 'hdd-network':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.5 5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zM3 4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.5v3a1.5 1.5 0 0 1 1.5 1.5h5.5a.5.5 0 0 1 0 1H10A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5H.5a.5.5 0 0 1 0-1H6A1.5 1.5 0 0 1 7.5 10V7H2a2 2 0 0 1-2-2V4zm1 0v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm6 7.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5z"/>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      );
  }
};

export default NewWorkflowModal;