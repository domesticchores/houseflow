/**
 * Image pool service.
 * Currently uses localStorage as a JSON store.
 * Swap out the storage calls with Postgres queries when ready.
 *
 * Expected external API contract:
 *   GET /api/images/pool       → ImagePoolEntry[]
 *   POST /api/images/assign    → { imageId, userId }
 *   POST /api/images/submit    → { imageId, userId, annotations }
 *   POST /api/images/trash     → { imageId, userId }
 */

import type { BoundingBox } from "@/types/annotation";
import axios from 'axios';
import api from "./api";

export interface ImagePoolEntry {
  id: string;
  url: string;          // URL to the image (external)
  filename: string;
  assignedTo: string | null;  // user UUID or null
  status: "available" | "assigned" | "submitted" | "trashed";
}

export interface SubmittedAnnotation {
  imageId: string;
  userId: string;
  boxes: BoundingBox[];
  submittedAt: string;
}

const POOL_KEY = "annotate_image_pool";
const SUBMISSIONS_KEY = "annotate_submissions";

// --- Pool management ---

export function getPool(): ImagePoolEntry[] {
  try {
    const raw = localStorage.getItem(POOL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePool(pool: ImagePoolEntry[]) {
  localStorage.setItem(POOL_KEY, JSON.stringify(pool));
}

/**
 * Seed the pool with image URLs.
 * Call this once or from an admin panel.
 * In production, images would be loaded from a folder/bucket via API.
 */
export function seedPool(images: { url: string; filename: string }[]) {
  const existing = getPool();
  const existingUrls = new Set(existing.map((e) => e.url));
  const newEntries: ImagePoolEntry[] = images
    .filter((img) => !existingUrls.has(img.url))
    .map((img) => ({
      id: crypto.randomUUID(),
      url: img.url,
      filename: img.filename,
      assignedTo: null,
      status: "available" as const,
    }));
  savePool([...existing, ...newEntries]);
  return newEntries.length;
}

/**
 * Get a random available image and assign it to a user.
 * Returns null if no images are available.
 */
// export function assignRandomImage(userId: string): ImagePoolEntry | null {
//   const pool = getPool();

//   // Check if user already has an assigned image
//   const alreadyAssigned = pool.find(
//     (img) => img.assignedTo === userId && img.status === "assigned"
//   );
//   if (alreadyAssigned) return alreadyAssigned;

//   // Pick random from available
//   const available = pool.filter((img) => img.status === "available");
//   if (available.length === 0) return null;

//   const picked = available[Math.floor(Math.random() * available.length)];
//   picked.assignedTo = userId;
//   picked.status = "assigned";
//   savePool(pool);
//   return picked;
// }

/**
 * Submit annotations for an image.
 */
export function submitImage(imageId: string, userId: string, boxes: BoundingBox[]) {
  // const pool = getPool();
  // const img = pool.find((i) => i.id === imageId);
  // if (img) {
  //   img.status = "submitted";
  //   savePool(pool);
  // }

  // Save submission
  // const submissions = getSubmissions();
  // submissions.push({
  //   imageId,
  //   userId,
  //   boxes,
  //   submittedAt: new Date().toISOString(),
  // });
  // localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  let annotations: any[] = [
    {
      imageId,
      userId,
      boxes,
      submittedAt: new Date().toISOString(),
    }
  ]
  submitAnnotations(annotations);
  console.log("submitting")
  console.log(annotations)

}

/**
 * Trash an image (remove from pool entirely).
 */
export const trashImage = async (imageId: string, userId: string) => {
  // const pool = getPool();
  // const img = pool.find((i) => i.id === imageId);
  // if (img) {
  //   img.status = "trashed";
  //   img.assignedTo = userId;
  //   savePool(pool);
  // }
  console.log("trashing image ",imageId)
  const res = await api.post('/imager/trash', {imageId,userId});
  return res.data;
}

export function getSubmissions(): SubmittedAnnotation[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get pool stats.
 */
export function getPoolStats() {
  const pool = getPool();
  return {
    total: pool.length,
    available: pool.filter((i) => i.status === "available").length,
    assigned: pool.filter((i) => i.status === "assigned").length,
    submitted: pool.filter((i) => i.status === "submitted").length,
    trashed: pool.filter((i) => i.status === "trashed").length,
  };
}

export const submitAnnotations = async (annotations: any[]) => {
  try {
    const res = await api.post('/imager/submit', annotations);
    return res.data;
  } catch (error) {
    console.error("Error saving annotations:", error);
    throw error;
  }
};

export const getRandomTask = async (uuid: string) => {
  const res = await api.get('/imager/get-task?uuid='+uuid);
    return res.data;
};