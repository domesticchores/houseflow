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

/**
 * Submit annotations for an image.
 */
export function submitImage(imageId: string, userId: string, boxes: BoundingBox[]) {
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
 * Update annotations for an image.
 */
export const  updateImage = async (imageId: string, userId: string, boxes: BoundingBox[]) => {
  let annotations: any[] = [
    {
      imageId,
      userId,
      boxes,
      submittedAt: new Date().toISOString(),
    }
  ]
  await updateAnnotations(annotations);
  console.log("updating")
  console.log(annotations)
}

/**
 * Trash an image (remove from pool entirely).
 */
export const trashImage = async (imageId: string, userId: string) => {
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

export const updateAnnotations = async (annotations: any[]) => {
  try {
    const res = await api.post('/imager/update', annotations);
    return res.data;
  } catch (error) {
    console.error("Error updating annotations:", error);
    throw error;
  }
};

export const getRandomTask = async (uuid: string) => {
  const res = await api.get('/imager/get-task?uuid='+uuid);
    return res.data;
};

export const getReviewTask = async () => {
  const { data } = await api.get('/imager/get-submission');
  return data;
};

export const approveImage = async (imageId: string) => {
  return await api.post(`/imager/approve/${imageId}`);
};