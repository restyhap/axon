/**
 * 应用底部状态栏组件
 * 显示当前文档信息、字符数等状态
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';

/** 底部状态栏组件 */
export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { tabs, activeTabId } = useTabsStore();
  const { content } = useDocumentStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;

  // 计算字符数（去除空行）
  const charCount = content.trim().length;

  return (
    <div className="h-6 border-t flex items-center justify-between px-3 shrink-0 bg-muted/20 w-full">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
        <FileText size={10} className="opacity-60" />
        <span className="truncate max-w-[200px]">
          {activeTab
            ? activeTab.filePath
              ? activeTab.filePath.split('/').pop()
              : activeTab.title
            : t('editor.noDocument')}
        </span>
        {activeTab?.isDirty && (
          <span className="size-1.5 rounded-full bg-primary shrink-0" title={t('editor.unsaved')} />
        )}
      </div>
      <div className="text-[11px] text-muted-foreground/50">
        {charCount} {t('editor.chars')}
      </div>
    </div>
  );
};

export default Footer;
