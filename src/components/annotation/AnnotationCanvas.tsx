import { useRef, useEffect, useState, useCallback } from "react";
import type { BoundingBox, AnnotationClass } from "@/types/annotation";

interface AnnotationCanvasProps {
  imageSrc: string;
  boxes: BoundingBox[];
  activeClassId: number;
  classes: AnnotationClass[];
  selectedBoxId: string | null;
  onBoxesChange: (boxes: BoundingBox[]) => void;
  onSelectBox: (id: string | null) => void;
}

type InteractionMode = "idle" | "drawing" | "moving" | "resizing";
type ResizeHandle = "tl" | "tr" | "bl" | "br";

const HANDLE_SIZE = 8;

const AnnotationCanvas = ({
  imageSrc,
  boxes,
  activeClassId,
  classes,
  selectedBoxId,
  onBoxesChange,
  onSelectBox,
}: AnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const modeRef = useRef<InteractionMode>("idle");
  const drawStartRef = useRef({ x: 0, y: 0 });
  const drawCurrentRef = useRef({ x: 0, y: 0 });
  const movingBoxRef = useRef<{ boxId: string; startNx: number; startNy: number; mouseStartX: number; mouseStartY: number } | null>(null);
  const resizingRef = useRef<{ boxId: string; handle: ResizeHandle; origBox: BoundingBox; mouseStartX: number; mouseStartY: number } | null>(null);
  const [cursorClass, setCursorClass] = useState("");

  const getClassColor = useCallback((classId: number) => {
    return classes.find((c) => c.id === classId)?.hsl || "hsl(0,0%,60%)";
  }, [classes]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      fitImage();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const fitImage = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    setCanvasSize({ w: cw, h: ch });

    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight, 1);
    const iw = img.naturalWidth * scale;
    const ih = img.naturalHeight * scale;
    const ix = (cw - iw) / 2;
    const iy = (ch - ih) / 2;
    setImgRect({ x: ix, y: iy, w: iw, h: ih });
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(() => fitImage());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [fitImage]);

  // Coordinate helpers
  const normToCanvas = useCallback((nx: number, ny: number) => ({
    x: imgRect.x + nx * imgRect.w,
    y: imgRect.y + ny * imgRect.h,
  }), [imgRect]);

  const canvasToNorm = useCallback((cx: number, cy: number) => ({
    nx: imgRect.w > 0 ? (cx - imgRect.x) / imgRect.w : 0,
    ny: imgRect.h > 0 ? (cy - imgRect.y) / imgRect.h : 0,
  }), [imgRect]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Darkened background
    ctx.fillStyle = "hsl(222, 47%, 4%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Image
    ctx.drawImage(img, imgRect.x, imgRect.y, imgRect.w, imgRect.h);

    // Boxes
    boxes.forEach((box) => {
      const tl = normToCanvas(box.x, box.y);
      const bw = box.width * imgRect.w;
      const bh = box.height * imgRect.h;
      const color = getClassColor(box.classId);
      const isSelected = box.id === selectedBoxId;

      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(tl.x, tl.y, bw, bh);

      // Fill
      ctx.fillStyle = color.replace(")", ", 0.1)").replace("hsl(", "hsla(");
      ctx.fillRect(tl.x, tl.y, bw, bh);

      // Label
      const cls = classes.find((c) => c.id === box.classId);
      if (cls) {
        const label = cls.name;
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(tl.x, tl.y - 18, tw + 8, 18);
        ctx.fillStyle = "hsl(222, 47%, 6%)";
        ctx.fillText(label, tl.x + 4, tl.y - 5);
      }

      // Resize handles
      if (isSelected) {
        const handles = [
          { x: tl.x, y: tl.y },
          { x: tl.x + bw, y: tl.y },
          { x: tl.x, y: tl.y + bh },
          { x: tl.x + bw, y: tl.y + bh },
        ];
        handles.forEach((h) => {
          ctx.fillStyle = color;
          ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
          ctx.strokeStyle = "hsl(222, 47%, 6%)";
          ctx.lineWidth = 1;
          ctx.strokeRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        });
      }
    });

    // Drawing preview
    if (modeRef.current === "drawing") {
      const sx = drawStartRef.current.x;
      const sy = drawStartRef.current.y;
      const ex = drawCurrentRef.current.x;
      const ey = drawCurrentRef.current.y;
      const color = getClassColor(activeClassId);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(sx, sy, ex - sx, ey - sy);
      ctx.setLineDash([]);
    }
  }, [boxes, imgRect, normToCanvas, selectedBoxId, getClassColor, classes, activeClassId]);

  useEffect(() => {
    draw();
  }, [draw, canvasSize]);

  // Hit testing
  const hitTestHandle = useCallback((mx: number, my: number): { boxId: string; handle: ResizeHandle } | null => {
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      if (box.id !== selectedBoxId) continue;
      const tl = normToCanvas(box.x, box.y);
      const bw = box.width * imgRect.w;
      const bh = box.height * imgRect.h;
      const handles: { h: ResizeHandle; x: number; y: number }[] = [
        { h: "tl", x: tl.x, y: tl.y },
        { h: "tr", x: tl.x + bw, y: tl.y },
        { h: "bl", x: tl.x, y: tl.y + bh },
        { h: "br", x: tl.x + bw, y: tl.y + bh },
      ];
      for (const handle of handles) {
        if (Math.abs(mx - handle.x) < HANDLE_SIZE && Math.abs(my - handle.y) < HANDLE_SIZE) {
          return { boxId: box.id, handle: handle.h };
        }
      }
    }
    return null;
  }, [boxes, selectedBoxId, normToCanvas, imgRect]);

  const hitTestBox = useCallback((mx: number, my: number): string | null => {
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      const tl = normToCanvas(box.x, box.y);
      const bw = box.width * imgRect.w;
      const bh = box.height * imgRect.h;
      if (mx >= tl.x && mx <= tl.x + bw && my >= tl.y && my <= tl.y + bh) {
        return box.id;
      }
    }
    return null;
  }, [boxes, normToCanvas, imgRect]);

  const getCanvasPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);

    // Check handle first
    const handleHit = hitTestHandle(pos.x, pos.y);
    if (handleHit) {
      modeRef.current = "resizing";
      const box = boxes.find((b) => b.id === handleHit.boxId)!;
      resizingRef.current = { boxId: handleHit.boxId, handle: handleHit.handle, origBox: { ...box }, mouseStartX: pos.x, mouseStartY: pos.y };
      return;
    }

    // Check box
    const boxHit = hitTestBox(pos.x, pos.y);
    if (boxHit) {
      onSelectBox(boxHit);
      modeRef.current = "moving";
      const box = boxes.find((b) => b.id === boxHit)!;
      movingBoxRef.current = { boxId: boxHit, startNx: box.x, startNy: box.y, mouseStartX: pos.x, mouseStartY: pos.y };
      setCursorClass("grabbing");
      draw();
      return;
    }

    // Start drawing
    onSelectBox(null);
    modeRef.current = "drawing";
    drawStartRef.current = pos;
    drawCurrentRef.current = pos;
    draw();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);

    if (modeRef.current === "drawing") {
      drawCurrentRef.current = pos;
      draw();
      return;
    }

    if (modeRef.current === "moving" && movingBoxRef.current) {
      const dx = (pos.x - movingBoxRef.current.mouseStartX) / imgRect.w;
      const dy = (pos.y - movingBoxRef.current.mouseStartY) / imgRect.h;
      const updated = boxes.map((b) =>
        b.id === movingBoxRef.current!.boxId
          ? { ...b, x: movingBoxRef.current!.startNx + dx, y: movingBoxRef.current!.startNy + dy }
          : b
      );
      onBoxesChange(updated);
      return;
    }

    if (modeRef.current === "resizing" && resizingRef.current) {
      const { handle, origBox, mouseStartX, mouseStartY, boxId } = resizingRef.current;
      const dx = (pos.x - mouseStartX) / imgRect.w;
      const dy = (pos.y - mouseStartY) / imgRect.h;

      let newX = origBox.x, newY = origBox.y, newW = origBox.width, newH = origBox.height;

      if (handle === "br") { newW = origBox.width + dx; newH = origBox.height + dy; }
      if (handle === "bl") { newX = origBox.x + dx; newW = origBox.width - dx; newH = origBox.height + dy; }
      if (handle === "tr") { newW = origBox.width + dx; newY = origBox.y + dy; newH = origBox.height - dy; }
      if (handle === "tl") { newX = origBox.x + dx; newY = origBox.y + dy; newW = origBox.width - dx; newH = origBox.height - dy; }

      if (newW < 0.005) newW = 0.005;
      if (newH < 0.005) newH = 0.005;

      const updated = boxes.map((b) => b.id === boxId ? { ...b, x: newX, y: newY, width: newW, height: newH } : b);
      onBoxesChange(updated);
      return;
    }

    // Cursor update
    const handleHit = hitTestHandle(pos.x, pos.y);
    if (handleHit) {
      setCursorClass(handleHit.handle === "tl" || handleHit.handle === "br" ? "nwse-resize" : "nesw-resize");
    } else if (hitTestBox(pos.x, pos.y)) {
      setCursorClass("grab");
    } else {
      setCursorClass("");
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (modeRef.current === "drawing") {
      const start = drawStartRef.current;
      const end = getCanvasPos(e);
      const s = canvasToNorm(Math.min(start.x, end.x), Math.min(start.y, end.y));
      const eN = canvasToNorm(Math.max(start.x, end.x), Math.max(start.y, end.y));
      const w = eN.nx - s.nx;
      const h = eN.ny - s.ny;

      if (w > 0.005 && h > 0.005) {
        const newBox: BoundingBox = {
          id: crypto.randomUUID(),
          classId: activeClassId,
          x: s.nx,
          y: s.ny,
          width: w,
          height: h,
        };
        onBoxesChange([...boxes, newBox]);
        onSelectBox(newBox.id);
      }
    }

    modeRef.current = "idle";
    movingBoxRef.current = null;
    resizingRef.current = null;
    setCursorClass("");
  };

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1, overflow: "hidden", backgroundColor: "#111" }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className={`annotation-canvas ${cursorClass}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default AnnotationCanvas;
