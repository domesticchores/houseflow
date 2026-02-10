import { useState, useEffect, useCallback } from "react";
import { LogOut, Box } from "lucide-react";
import ProjectSidebar from "@/components/annotation/ProjectSidebar";
import AnnotationCanvas from "@/components/annotation/AnnotationCanvas";
import ClassSelector from "@/components/annotation/ClassSelector";
import BoxList from "@/components/annotation/BoxList";
import ToolBar from "@/components/annotation/ToolBar";
import { DEFAULT_CLASSES } from "@/types/annotation";
import type { ProjectImage, BoundingBox } from "@/types/annotation";
import { exportYolo } from "@/utils/yoloExport";

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const STORAGE_KEY = "annotate_ai_data";

const Dashboard = ({ username, onLogout }: DashboardProps) => {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  const activeImage = images.find((img) => img.id === activeImageId) || null;

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as ProjectImage[];
        setImages(data);
        if (data.length > 0) setActiveImageId(data[0].id);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch {}
  }, [images]);

  const handleUploadImages = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ProjectImage = {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl: e.target?.result as string,
          boxes: [],
        };
        setImages((prev) => {
          const updated = [...prev, newImage];
          if (prev.length === 0) setActiveImageId(newImage.id);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (id === activeImageId) {
        setActiveImageId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
    setSelectedBoxId(null);
  }, [activeImageId]);

  const handleBoxesChange = useCallback((newBoxes: BoundingBox[]) => {
    setImages((prev) =>
      prev.map((img) => (img.id === activeImageId ? { ...img, boxes: newBoxes } : img))
    );
  }, [activeImageId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedBoxId || !activeImage) return;
    handleBoxesChange(activeImage.boxes.filter((b) => b.id !== selectedBoxId));
    setSelectedBoxId(null);
  }, [selectedBoxId, activeImage, handleBoxesChange]);

  const handleDeleteBox = useCallback((id: string) => {
    if (!activeImage) return;
    handleBoxesChange(activeImage.boxes.filter((b) => b.id !== id));
    if (selectedBoxId === id) setSelectedBoxId(null);
  }, [activeImage, handleBoxesChange, selectedBoxId]);

  const handleChangeBoxClass = useCallback((boxId: string, classId: number) => {
    if (!activeImage) return;
    handleBoxesChange(activeImage.boxes.map((b) => (b.id === boxId ? { ...b, classId } : b)));
  }, [activeImage, handleBoxesChange]);

  const handleExport = useCallback(() => {
    if (images.length === 0) return;
    exportYolo(images, DEFAULT_CLASSES);
  }, [images]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDeleteSelected]);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10">
            <Box className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">AnnotateAI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">{username}</span>
          <button
            onClick={onLogout}
            className="rounded p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="flex flex-col">
          <ProjectSidebar
            images={images}
            activeImageId={activeImageId}
            onSelectImage={(id) => { setActiveImageId(id); setSelectedBoxId(null); }}
            onUploadImages={handleUploadImages}
            onDeleteImage={handleDeleteImage}
          />
          <ClassSelector classes={DEFAULT_CLASSES} activeClassId={activeClassId} onSelectClass={setActiveClassId} />
          {activeImage && (
            <BoxList
              boxes={activeImage.boxes}
              classes={DEFAULT_CLASSES}
              selectedBoxId={selectedBoxId}
              onSelectBox={setSelectedBoxId}
              onDeleteBox={handleDeleteBox}
              onChangeBoxClass={handleChangeBoxClass}
            />
          )}
        </div>

        {/* Main workspace */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ToolBar
            selectedBoxId={selectedBoxId}
            onDeleteSelected={handleDeleteSelected}
            onExport={handleExport}
            imageLoaded={!!activeImage}
          />
          {activeImage ? (
            <AnnotationCanvas
              imageSrc={activeImage.dataUrl}
              boxes={activeImage.boxes}
              activeClassId={activeClassId}
              classes={DEFAULT_CLASSES}
              selectedBoxId={selectedBoxId}
              onBoxesChange={handleBoxesChange}
              onSelectBox={setSelectedBoxId}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center bg-surface-0">
              <div className="text-center animate-fade-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border">
                  <Box className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Upload images to start annotating</p>
                <label className="mt-3 inline-block cursor-pointer rounded-md bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  Choose Files
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleUploadImages(e.target.files)} />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
