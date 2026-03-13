/**
 * 编辑器视图组件
 * 用于编辑 Markdown 文档的主视图
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

const EditorView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex items-center justify-center">
      <h1 className="text-2xl font-bold text-muted-foreground">{t('view.editor')}</h1>
    </div>
  );
};

export default EditorView;
