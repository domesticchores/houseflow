/**
 * Stats / leaderboard service.
 * Currently uses localStorage. Swap with Postgres queries when ready.
 *
 * SQL equivalent for weekly leaderboard (no weekly reset needed):
 *
 *   SELECT user_id, username, COUNT(*) as count
 *   FROM submissions
 *   WHERE submitted_at >= date_trunc('week', NOW())
 *     AND submitted_at < date_trunc('week', NOW()) + interval '7 days'
 *   GROUP BY user_id, username
 *   ORDER BY count DESC;
 *
 * The week starts on Sunday (ISO: Monday, adjust with DOW).
 * To get Sunday-midnight reset:
 *
 *   SELECT user_id, username, COUNT(*) as count
 *   FROM submissions
 *   WHERE submitted_at >= (
 *     date_trunc('week', NOW() + interval '1 day') - interval '1 day'
 *   )
 *   GROUP BY user_id, username
 *   ORDER BY count DESC;
 */

import api from "./api";
import { getSubmissions } from "./imageService";

export interface LeaderboardEntry {
  userId: string;
  username: string;
  count: number;
}

/**
 * Get the start of the current week (Sunday at midnight UTC).
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sunday
  const diff = day; // days since Sunday
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

/**
 * Get weekly leaderboard from submissions.
 * In production, this is a single SQL query (see above).
 */
export const getWeeklyLeaderboard = async (usernames: Record<string, string> = {}): Promise<LeaderboardEntry[]> => {
  try {
    const res = await api.get('/imager/leaderboard');
    const data: { userId: string; submissions: number }[] = res.data;
    return data.map((entry) => ({
      userId: entry.userId,
      username: usernames[entry.userId] || entry.userId.slice(0, 8),
      count: entry.submissions,
    }));
    
    
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

/**
 * Get total annotations for a user (all time).
 */
export function getUserTotalCount(userId: string): number {
  return getSubmissions().filter((s) => s.userId === userId).length;
}
