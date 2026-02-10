import { ImagePlus, Trash2, Image as ImageIcon } from "lucide-react";
import type { ProjectImage } from "@/types/annotation";

interface ProjectSidebarProps {
  images: ProjectImage[];
  activeImageId: string | null;
  onSelectImage: (id: string) => void;
  onUploadImages: (files: FileList) => void;
  onDeleteImage: (id: string) => void;
}

const ProjectSidebar = ({ images, activeImageId, onSelectImage, onUploadImages, onDeleteImage }: ProjectSidebarProps) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadImages(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Files</h2>
        <label className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors">
          <ImagePlus className="h-4 w-4" />
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-xs">No images yet</p>
            <p className="text-xs opacity-60">Upload to begin</p>
          </div>
        )}
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelectImage(img.id)}
            className={`group flex items-center gap-2 rounded-md px-2.5 py-2 cursor-pointer transition-colors text-sm ${
              activeImageId === img.id
                ? "bg-primary/10 text-primary"
                : "text-sidebar-foreground hover:bg-surface-2"
            }`}
          >
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-border bg-surface-2">
              <img src={img.dataUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <span className="flex-1 truncate font-mono text-xs">{img.name}</span>
            <span className="flex-shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {img.boxes.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
              className="hidden flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive group-hover:block"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ProjectSidebar;
