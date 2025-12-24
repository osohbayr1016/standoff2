"use client";

import MatchResultCard from "./MatchResultCard";

interface ResultsListProps {
  filter: string;
  results: any[];
  onApprove: (id: string, winner: "alpha" | "bravo", name: string) => void;
  onReject: (id: string) => void;
  actionLoading: string | null;
}

export default function ResultsList({
  filter,
  results,
  onApprove,
  onReject,
  actionLoading,
}: ResultsListProps) {
  const title = filter === "pending" 
    ? `Pending Match Verifications (${results.length})`
    : `Moderation History (${results.length})`;
  
  const emptyMessage = filter === "pending"
    ? "No pending match results"
    : `No ${filter === "reviewed" ? "reviewed" : "disputed"} match results`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {results.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{emptyMessage}</div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <MatchResultCard
              key={result._id}
              result={result}
              onApprove={onApprove}
              onReject={onReject}
              loading={actionLoading === result._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

