import { Trash2 } from "lucide-react";
import type { BoundingBox, AnnotationClass } from "@/types/annotation";

interface BoxListProps {
  boxes: BoundingBox[];
  classes: AnnotationClass[];
  selectedBoxId: string | null;
  onSelectBox: (id: string | null) => void;
  onDeleteBox: (id: string) => void;
  onChangeBoxClass: (boxId: string, classId: number) => void;
}

const CLASS_DOT_COLORS: Record<string, string> = {
  "anno-red": "bg-anno-red",
  "anno-green": "bg-anno-green",
  "anno-blue": "bg-anno-blue",
  "anno-yellow": "bg-anno-yellow",
  "anno-magenta": "bg-anno-magenta",
  "anno-cyan": "bg-anno-cyan",
  "anno-orange": "bg-anno-orange",
  "anno-purple": "bg-anno-purple",
};

const BoxList = ({ boxes, classes, selectedBoxId, onSelectBox, onDeleteBox, onChangeBoxClass }: BoxListProps) => {
  if (boxes.length === 0) {
    return (
      <div className="border-t border-border bg-sidebar p-4 text-center text-xs text-muted-foreground">
        Draw bounding boxes on the image
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-sidebar">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Annotations ({boxes.length})
      </div>
      <div className="max-h-48 overflow-y-auto px-2 pb-2 space-y-0.5">
        {boxes.map((box, i) => {
          const cls = classes.find((c) => c.id === box.classId);
          return (
            <div
              key={box.id}
              onClick={() => onSelectBox(box.id)}
              className={`group flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-xs transition-colors ${
                selectedBoxId === box.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${cls ? CLASS_DOT_COLORS[cls.color] || "" : ""}`} />
              <span className="font-mono flex-1 truncate">
                {cls?.name || "?"} #{i + 1}
              </span>
              <span className="font-mono text-[10px] opacity-60">
                {box.width.toFixed(2)}×{box.height.toFixed(2)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteBox(box.id); }}
                className="hidden rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoxList;
