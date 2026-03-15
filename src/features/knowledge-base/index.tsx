/**
 * 知识库视图组件
 * 固定显示在右侧，供编辑和脑图视图共享使用
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

const KnowledgeBaseView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <BookOpen size={32} className="opacity-30" />
      <p className="text-sm">{t('view.knowledgeBase')}</p>
    </div>
  );
};

export default KnowledgeBaseView;
