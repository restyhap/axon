/**
 * 演示视图组件
 * 用于全屏演示文档内容
 */
import React from 'react';
import { useTranslation } from 'react-i18next';

const PresentationView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex items-center justify-center">
      <h1 className="text-2xl font-bold text-muted-foreground">{t('view.presentation')}</h1>
    </div>
  );
};

export default PresentationView;
