import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { ProjectImage, AnnotationClass } from "@/types/annotation";

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
  const b64 = atob(parts[1]);
  const arr = new Uint8Array(b64.length);
  for (let i = 0; i < b64.length; i++) arr[i] = b64.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function exportYolo(images: ProjectImage[], classes: AnnotationClass[]) {
  const zip = new JSZip();
  const imgFolder = zip.folder("images")!;
  const labelFolder = zip.folder("labels")!;

  images.forEach((img) => {
    const ext = img.name.includes(".") ? img.name.split(".").pop() : "png";
    const baseName = img.name.replace(/\.[^.]+$/, "");

    // Image
    imgFolder.file(img.name, dataUrlToBlob(img.dataUrl));

    // Labels
    const lines = img.boxes.map((box) => {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      return `${box.classId} ${cx.toFixed(6)} ${cy.toFixed(6)} ${box.width.toFixed(6)} ${box.height.toFixed(6)}`;
    });
    labelFolder.file(`${baseName}.txt`, lines.join("\n"));
  });

  // data.yaml
  const yamlLines = [
    `train: ./images`,
    `val: ./images`,
    ``,
    `nc: ${classes.length}`,
    `names: [${classes.map((c) => `'${c.name}'`).join(", ")}]`,
  ];
  zip.file("data.yaml", yamlLines.join("\n"));

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "yolo_export.zip");
}
