/**
 * Markdown 知识库编辑器（基于 Tiptap）
 * - 顶部工具栏：标题、格式化、列表、代码块等
 * - 与 TabBar 联动：切换 tab 时加载对应文件内容
 * - 内容变更自动同步到 document store 并标记 dirty
 * - Cmd/Ctrl+S 保存，Cmd/Ctrl+N 新建文档
 */
import React, { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { useTabsStore } from '@/stores/tabs';
import { useDocumentStore } from '@/stores/document';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Quote,
  List,
  ListOrdered,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  FileText,
} from 'lucide-react';

const lowlight = createLowlight(common);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isMarkdownPath(filePath: string | null | undefined): boolean {
  if (!filePath) return true;
  const lower = filePath.toLowerCase();
  return lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.mdx');
}

async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

async function htmlToMarkdown(html: string): Promise<string> {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);
  return String(file).trimEnd();
}

// ── 工具栏按钮 ───────────────────────────────────────────
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active,
  disabled,
  title,
  children,
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      // 防止 focus 离开编辑器
      e.preventDefault();
      if (!disabled) onClick();
    }}
    title={title}
    disabled={disabled}
    className={cn(
      'inline-flex items-center justify-center size-6 rounded-md text-xs transition-colors shrink-0',
      active
        ? 'bg-primary/15 text-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      disabled && 'opacity-30 cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

const ToolbarDivider: React.FC = () => (
  <div className="w-px h-4 bg-border mx-1 shrink-0" />
);

// ── 主编辑器组件 ─────────────────────────────────────────
export const MarkdownEditor: React.FC = () => {
  const { t } = useTranslation();
  const { tabs, activeTabId, markDirty, openTab, updateTabTitle } = useTabsStore();
  const { setContent, setFilePath, setDirty } = useDocumentStore();

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const isMarkdownFile = isMarkdownPath(activeTab?.filePath ?? activeTab?.title);
  const isLoadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string | null>(null);
  const updateTimerRef = useRef<number | null>(null);
  const updateSeqRef = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-8 py-6 min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      if (isLoadingRef.current) return;
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
      const seq = ++updateSeqRef.current;
      updateTimerRef.current = window.setTimeout(() => {
        if (!isMarkdownFile) {
          const text = editor.getText({ blockSeparator: '\n' });
          setContent(text);
          if (activeTabId) {
            markDirty(activeTabId, true);
            setDirty(true);
          }
          return;
        }
        const html = editor.getHTML();
        htmlToMarkdown(html)
          .then((markdown) => {
            if (seq !== updateSeqRef.current) return;
            setContent(markdown);
            if (activeTabId) {
              markDirty(activeTabId, true);
              setDirty(true);
            }
          })
          .catch(() => {});
      }, 250);
    },
  });

  // 切换 tab 时加载对应文件内容
  useEffect(() => {
    if (!editor) return;
    const loadKey = `${activeTabId ?? ''}|${activeTab?.filePath ?? ''}|${activeTab?.title ?? ''}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;

    const load = async () => {
      isLoadingRef.current = true;
      try {
        if (!activeTab?.filePath) {
          editor.commands.setContent('');
          setContent('');
          setFilePath(null);
          return;
        }
        const text = await readTextFile(activeTab.filePath);
        if (isMarkdownFile) {
          const html = await markdownToHtml(text);
          editor.commands.setContent(html);
        } else {
          editor.commands.setContent(
            text
              .split('\n')
              .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : '<p></p>'))
              .join('')
          );
        }
        setContent(text);
        setFilePath(activeTab.filePath);
        setDirty(false);
        markDirty(activeTabId!, false);
      } catch {
        editor.commands.setContent('');
      } finally {
        isLoadingRef.current = false;
      }
    };

    load();
  }, [activeTabId, activeTab?.filePath, editor]);

  useEffect(
    () => () => {
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current);
    },
    []
  );

  // 保存当前文件
  const handleSave = useCallback(async () => {
    if (!editor) return;

    // 如果 tab 没有文件路径，弹出另存为对话框
    if (!activeTab?.filePath) {
      try {
        const savePath = await save({
          filters: [{ name: '文件', extensions: ['*'] }],
          defaultPath: activeTab?.title || 'untitled.md',
        });
        if (!savePath) return;
        const content = isMarkdownFile
          ? await htmlToMarkdown(editor.getHTML())
          : editor.getText({ blockSeparator: '\n' });
        await writeTextFile(savePath, content);
        const fileName = savePath.split('/').pop() || savePath;
        if (activeTabId) {
          updateTabTitle(activeTabId, fileName, savePath);
          markDirty(activeTabId, false);
        }
        setFilePath(savePath);
        setDirty(false);
      } catch {
        // ignore
      }
      return;
    }

    try {
      const content = isMarkdownFile
        ? await htmlToMarkdown(editor.getHTML())
        : editor.getText({ blockSeparator: '\n' });
      await writeTextFile(activeTab.filePath, content);
      if (activeTabId) markDirty(activeTabId, false);
      setDirty(false);
    } catch {
      // ignore
    }
  }, [activeTab, editor, activeTabId, markDirty, updateTabTitle, setFilePath, setDirty, isMarkdownFile]);

  // 新建文档
  const handleNewDocument = useCallback(() => {
    openTab({ id: '', title: t('editor.untitled'), filePath: null });
  }, [openTab, t]);

  // 快捷键
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewDocument();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, handleNewDocument]);

  if (!editor) return null;

  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden bg-background">
      {/* ── 编辑器工具栏 ── */}
      <div className="h-8 flex items-center justify-center gap-0.5 px-2 border-b bg-background shrink-0 overflow-x-auto">
        {/* 标题 */}
        <ToolbarButton
          title={t('editor.toolbar.h1')}
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.h2')}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.h3')}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={12} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* 内联格式 */}
        <ToolbarButton
          title={t('editor.toolbar.bold')}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.italic')}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.underline')}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.strike')}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.code')}
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={12} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* 块级元素 */}
        <ToolbarButton
          title={t('editor.toolbar.codeBlock')}
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.blockquote')}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.bulletList')}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.orderedList')}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={12} />
        </ToolbarButton>
        <ToolbarButton
          title={t('editor.toolbar.horizontalRule')}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={12} />
        </ToolbarButton>
      </div>

      {/* ── 编辑区 ── */}
      {!activeTab ? (
        /* 空状态 */
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground/40 cursor-pointer hover:text-muted-foreground/60 transition-colors"
          onClick={handleNewDocument}
        >
          <FileText size={36} className="opacity-40" />
          <div className="text-center">
            <p className="text-sm">{t('editor.documentEmpty')}</p>
            <p className="text-xs mt-1 opacity-70">{t('editor.newDocumentHint')}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
