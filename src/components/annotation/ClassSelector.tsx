import { Tag } from "lucide-react";
import type { AnnotationClass } from "@/types/annotation";

interface ClassSelectorProps {
  classes: AnnotationClass[];
  activeClassId: number;
  onSelectClass: (id: number) => void;
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

const ClassSelector = ({ classes, activeClassId, onSelectClass }: ClassSelectorProps) => {
  return (
    <div className="border-t border-border bg-sidebar px-4 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Tag className="h-3 w-3" />
        Classes
      </div>
      <div className="flex flex-wrap gap-1">
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              activeClassId === cls.id
                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${CLASS_DOT_COLORS[cls.color] || "bg-muted-foreground"}`} />
            {cls.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassSelector;
