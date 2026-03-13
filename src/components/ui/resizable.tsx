/**
 * 可调整尺寸面板组件
 * 基于 react-resizable-panels 封装的可拖动调整布局组件
 */
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/** 可调整面板组 */
function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/** 可调整面板 */
function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

/** 可调整面板分隔条 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  /** 是否显示拖动手柄 */
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-[2px] items-center justify-center aria-[orientation=horizontal]:h-[2px] aria-[orientation=horizontal]:w-full [&[aria-orientation=horizontal]>div]:rotate-90 cursor-col-resize aria-[orientation=horizontal]:cursor-row-resize outline-none focus:outline-none focus-visible:outline-none",
        "bg-transparent",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
