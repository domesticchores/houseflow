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
export function getWeeklyLeaderboard(usernames: Record<string, string> = {}): LeaderboardEntry[] {
  const weekStart = getWeekStart();
  const submissions = getSubmissions();

  const counts: Record<string, number> = {};
  for (const sub of submissions) {
    const subDate = new Date(sub.submittedAt);
    if (subDate >= weekStart) {
      counts[sub.userId] = (counts[sub.userId] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([userId, count]) => ({
      userId,
      username: usernames[userId] || userId.slice(0, 8),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get total annotations for a user (all time).
 */
export function getUserTotalCount(userId: string): number {
  return getSubmissions().filter((s) => s.userId === userId).length;
}
