import { useState, useEffect } from "react";
import { Container, Table, Badge } from "reactstrap";
import { getWeeklyLeaderboard, type LeaderboardEntry } from "@/services/statsService";

function hoursUntilReset() {
  const getHours = () => {
    const now = new Date();
    const day = now.getUTCDay();

    // days until next Sunday
    const diff = (7 - day) % 7 || 7;

    const target = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + diff,
      0, 0, 0
    ));

    return Math.floor((target.getTime() - now.getTime()) / 36e5);
  };

  const [hours, setHours] = useState(getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHours(getHours());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return hours;
}

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const day = new Date().getUTCDay()

  useEffect(() => {
    setEntries(getWeeklyLeaderboard());
  }, []);

  return (
    <Container className="py-4">
      <h4 className="mb-1">Weekly Leaderboard</h4>
      <p className="m-0">Win drink credits for labelling the most images!</p>
      <p className="text-muted small mb-3">Resets in {hoursUntilReset()} hours.</p>

      {entries.length === 0 ? (
        <p className="text-muted">No annotations submitted this week yet.</p>
      ) : (
        <Table bordered size="sm">
          <thead>
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th>User</th>
              <th style={{ width: 120 }}>Images</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.userId}>
                <td>
                  {i < 3 ? (
                    <Badge color={i === 0 ? "warning" : i === 1 ? "primary" : "info"}>
                      {i + 1}
                    </Badge>
                  ) : (
                    i + 1
                  )}
                </td>
                <td className="font-monospace">{entry.username}</td>
                <td>{entry.count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Leaderboard;
