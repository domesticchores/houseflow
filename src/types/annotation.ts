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
  { id: 0, name: "brownie_brittle", color: "anno-red", hsl: "hsl(0, 85%, 60%)" },
  { id: 1, name: "little_bites_blueberry", color: "anno-green", hsl: "hsl(142, 70%, 50%)" },
  { id: 2, name: "little_bites_chocolate", color: "anno-blue", hsl: "hsl(217, 90%, 60%)" },
  { id: 3, name: "mike_n_ikes", color: "anno-yellow", hsl: "hsl(45, 95%, 55%)" },
  { id: 4, name: "nacho_doritos", color: "anno-magenta", hsl: "hsl(300, 75%, 60%)" },
  { id: 5, name: "pepsi", color: "anno-cyan", hsl: "hsl(187, 72%, 50%)" },
  { id: 6, name: "sour_patch", color: "anno-orange", hsl: "hsl(25, 90%, 55%)" },
  { id: 7, name: "smart_food_popcorn", color: "anno-purple", hsl: "hsl(270, 70%, 60%)" },
];
