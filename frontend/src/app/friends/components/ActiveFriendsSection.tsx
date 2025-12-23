"use client";

import { Users } from "lucide-react";
import FriendCard from "./FriendCard";

interface Friend {
  id: string;
  userId: string;
  name: string;
  inGameName: string;
  standoff2Id?: string;
  avatar?: string;
  elo: number;
  isOnline: boolean;
  wins?: number;
  losses?: number;
}

interface ActiveFriendsSectionProps {
  friends: Friend[];
  onMessage: (friendId: string) => void;
}

export default function ActiveFriendsSection({
  friends,
  onMessage,
}: ActiveFriendsSectionProps) {
  const onlineFriends = friends.filter((f) => f.isOnline);
  const offlineFriends = friends.filter((f) => !f.isOnline);

  return (
    <div className="bg-gradient-to-br from-[#1e2433] to-[#252d3d] rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          Friends
        </h2>
        <span className="text-orange-500 font-semibold text-lg">
          {friends.length}
        </span>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No friends yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Search for players and send friend requests!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {onlineFriends.length > 0 && (
            <div>
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Online ({onlineFriends.length})
              </h3>
              <div className="space-y-3">
                {onlineFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onMessage={onMessage}
                  />
                ))}
              </div>
            </div>
          )}

          {offlineFriends.length > 0 && (
            <div className={onlineFriends.length > 0 ? "mt-6" : ""}>
              <h3 className="text-gray-500 font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full" />
                Offline ({offlineFriends.length})
              </h3>
              <div className="space-y-3">
                {offlineFriends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onMessage={onMessage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

