import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';

const SettingsView: React.FC = () => {
  const closeWindow = useCallback(() => {
    void (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch {}
    })();
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <div style={{ height: 'env(titlebar-area-height, 0px)' }} />
      <div className="h-10 flex items-center justify-between px-4 border-b">
        <div className="text-sm font-semibold text-foreground">Settings</div>
        <Button variant="ghost" size="sm" onClick={closeWindow}>
          Close
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="text-sm text-muted-foreground">
          这里放置应用设置项（主题、语言、存储路径、快捷键等）。
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
