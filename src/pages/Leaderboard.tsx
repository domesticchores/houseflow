import { useState, useEffect } from "react";
import { Container, Table, Badge } from "reactstrap";
import { getWeeklyLeaderboard, type LeaderboardEntry } from "@/services/statsService";

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getWeeklyLeaderboard());
  }, []);

  return (
    <Container className="py-4">
      <h4 className="mb-1">Weekly Leaderboard</h4>
      <p className="text-muted small mb-3">Resets every Sunday at midnight UTC</p>

      {entries.length === 0 ? (
        <p className="text-muted">No annotations submitted this week yet.</p>
      ) : (
        <Table dark bordered hover size="sm">
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
                    <Badge color={i === 0 ? "warning" : i === 1 ? "secondary" : "info"}>
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
