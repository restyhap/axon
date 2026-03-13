/**
 * 脑图视图组件
 * 用于以思维导图形式展示文档内容
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

const MindmapView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex items-center justify-center">
      <h1 className="text-2xl font-bold text-muted-foreground">{t('view.mindmap')}</h1>
    </div>
  );
};

export default MindmapView;
