import { Download, Trash2, MousePointer, Square, ZoomIn, ZoomOut } from "lucide-react";

interface ToolBarProps {
  selectedBoxId: string | null;
  onDeleteSelected: () => void;
  onExport: () => void;
  imageLoaded: boolean;
}

const ToolBar = ({ selectedBoxId, onDeleteSelected, onExport, imageLoaded }: ToolBarProps) => {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-card px-4 py-2">
      <div className="flex items-center gap-1 rounded-md bg-surface-2 p-0.5">
        <button className="rounded px-2 py-1.5 text-xs font-medium text-primary bg-primary/10" title="Select">
          <MousePointer className="h-3.5 w-3.5" />
        </button>
        <button className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground" title="Draw Box">
          <Square className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mx-2 h-4 w-px bg-border" />

      <button
        onClick={onDeleteSelected}
        disabled={!selectedBoxId}
        className="rounded px-2 py-1.5 text-xs text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Delete Selected (Del)"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <div className="flex-1" />

      <button
        onClick={onExport}
        disabled={!imageLoaded}
        className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Export YOLO
      </button>
    </div>
  );
};

export default ToolBar;
