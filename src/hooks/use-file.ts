import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useDocumentStore } from "@/stores/document";

/**
 * 文件操作 Hook —— 封装打开/保存文件的完整流程
 */
export function useFile() {
  const { content, filePath, setContent, setFilePath, setDirty } =
    useDocumentStore();

  const openFile = async () => {
    const selected = await open({
      filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
    });
    if (selected) {
      const text = await readTextFile(selected);
      setContent(text);
      setFilePath(selected);
      setDirty(false);
    }
  };

  const saveFile = async () => {
    let path = filePath;
    if (!path) {
      const selected = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
      });
      if (!selected) return;
      path = selected;
    }
    await writeTextFile(path, content);
    setFilePath(path);
    setDirty(false);
  };

  const saveFileAs = async () => {
    const selected = await save({
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
    if (!selected) return;
    await writeTextFile(selected, content);
    setFilePath(selected);
    setDirty(false);
  };

  return { openFile, saveFile, saveFileAs };
}

