import { useDocumentStore, type ViewMode } from "@/stores/document";
import { useFile } from "@/hooks/use-file";
import EditorView from "@/features/editor";
import MindmapView from "@/features/mindmap";
import PresentationView from "@/features/presentation";

const viewLabels: Record<ViewMode, string> = {
  editor: "📝 编辑",
  mindmap: "🧠 脑图",
  presentation: "🎬 演示",
};

function App() {
  const { viewMode, setViewMode, filePath, isDirty } = useDocumentStore();
  const { openFile, saveFile } = useFile();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* 顶部工具栏 */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">Axon</h1>
          <span className="text-xs text-muted-foreground">
            {filePath ? filePath.split("/").pop() : "未命名"}
            {isDirty && " •"}
          </span>
        </div>

        {/* 视图切换 */}
        <nav className="flex gap-1">
          {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {viewLabels[mode]}
            </button>
          ))}
        </nav>

        {/* 文件操作 */}
        <div className="flex gap-1">
          <button
            onClick={openFile}
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            打开
          </button>
          <button
            onClick={saveFile}
            className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
          >
            保存
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex flex-1 overflow-hidden">
        {viewMode === "editor" && <EditorView />}
        {viewMode === "mindmap" && <MindmapView />}
        {viewMode === "presentation" && <PresentationView />}
      </main>
    </div>
  );
}

export default App;
