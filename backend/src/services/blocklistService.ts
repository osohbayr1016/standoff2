
export class BlocklistService {
    // Map<LobbyId, Map<UserId, ExpiryTimestamp>>
    private static blocklist: Map<string, Map<string, number>> = new Map();

    private static BLOCK_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Block a user from a lobby for 5 minutes
     */
    static blockUser(lobbyId: string, userId: string): void {
        if (!this.blocklist.has(lobbyId)) {
            this.blocklist.set(lobbyId, new Map());
        }

        const lobbyBlocklist = this.blocklist.get(lobbyId)!;
        const expiry = Date.now() + this.BLOCK_DURATION;

        lobbyBlocklist.set(userId, expiry);
        console.log(`[Blocklist] Blocked user ${userId} from lobby ${lobbyId} until ${new Date(expiry).toISOString()}`);
    }

    /**
     * Check if a user is blocked from a lobby
     */
    static isBlocked(lobbyId: string, userId: string): boolean {
        const lobbyBlocklist = this.blocklist.get(lobbyId);
        if (!lobbyBlocklist) return false;

        const expiry = lobbyBlocklist.get(userId);
        if (!expiry) return false;

        if (Date.now() > expiry) {
            // Expired, remove from blocklist
            lobbyBlocklist.delete(userId);
            return false;
        }

        return true;
    }

    /**
     * Get remaining block time in seconds
     */
    static getRemainingTime(lobbyId: string, userId: string): number {
        const lobbyBlocklist = this.blocklist.get(lobbyId);
        if (!lobbyBlocklist) return 0;

        const expiry = lobbyBlocklist.get(userId);
        if (!expiry) return 0;

        const remaining = expiry - Date.now();
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    }
}
