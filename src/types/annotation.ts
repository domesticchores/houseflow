export interface BoundingBox {
  id: string;
  classId: number;
  // Normalized coords 0-1
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationClass {
  id: number;
  name: string;
  color: string; // tailwind anno color key
  hsl: string; // actual hsl for canvas rendering
}

export interface ProjectImage {
  id: string;
  name: string;
  dataUrl: string;
  boxes: BoundingBox[];
}

export const DEFAULT_CLASSES: AnnotationClass[] = [
  { id: 0, name: "person", color: "anno-red", hsl: "hsl(0, 85%, 60%)" },
  { id: 1, name: "car", color: "anno-green", hsl: "hsl(142, 70%, 50%)" },
  { id: 2, name: "dog", color: "anno-blue", hsl: "hsl(217, 90%, 60%)" },
  { id: 3, name: "cat", color: "anno-yellow", hsl: "hsl(45, 95%, 55%)" },
  { id: 4, name: "bicycle", color: "anno-magenta", hsl: "hsl(300, 75%, 60%)" },
  { id: 5, name: "truck", color: "anno-cyan", hsl: "hsl(187, 72%, 50%)" },
  { id: 6, name: "bird", color: "anno-orange", hsl: "hsl(25, 90%, 55%)" },
  { id: 7, name: "tree", color: "anno-purple", hsl: "hsl(270, 70%, 60%)" },
];
