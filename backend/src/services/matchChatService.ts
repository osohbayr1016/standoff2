import mongoose from "mongoose";
import MatchChat from "../models/MatchChat";
import MatchLobby from "../models/MatchLobby";

export class MatchChatService {
    /**
     * Schedule chat deletion after match ends
     * Gives players 10 minutes to report issues before deleting
     */
    static async scheduleMatchChatDeletion(lobbyId: string): Promise<void> {
        const DELETION_DELAY = 10 * 60 * 1000; // 10 minutes

        console.log(`[MatchChat] Scheduling deletion for lobby ${lobbyId} in 10 minutes`);

        setTimeout(async () => {
            try {
                // Check if there are any pending reports for this match
                const lobby = await MatchLobby.findById(lobbyId);

                if (!lobby) {
                    console.log(`[MatchChat] Lobby ${lobbyId} not found, skipping deletion`);
                    return;
                }

                // Check if match has any reports (you can add a 'hasReports' field to MatchLobby)
                if (lobby.hasReports) {
                    console.log(`[MatchChat] Lobby ${lobbyId} has reports, preserving chat for investigation`);
                    return;
                }

                // Delete all chat messages for this lobby
                const result = await MatchChat.deleteMany({
                    lobbyId: new mongoose.Types.ObjectId(lobbyId)
                });

                console.log(`[MatchChat] Deleted ${result.deletedCount} messages from lobby ${lobbyId}`);
            } catch (error) {
                console.error(`[MatchChat] Error deleting chat for lobby ${lobbyId}:`, error);
            }
        }, DELETION_DELAY);
    }

    /**
     * Immediately delete chat for a specific lobby
     * Used when match is cancelled or for admin cleanup
     */
    static async deleteLobbyChat(lobbyId: string): Promise<number> {
        try {
            const result = await MatchChat.deleteMany({
                lobbyId: new mongoose.Types.ObjectId(lobbyId)
            });

            console.log(`[MatchChat] Immediately deleted ${result.deletedCount} messages from lobby ${lobbyId}`);
            return result.deletedCount;
        } catch (error) {
            console.error(`[MatchChat] Error deleting chat for lobby ${lobbyId}:`, error);
            throw error;
        }
    }

    /**
     * Preserve chat for investigation (when a report is filed)
     */
    static async preserveChatForInvestigation(lobbyId: string): Promise<void> {
        try {
            await MatchLobby.findByIdAndUpdate(lobbyId, {
                hasReports: true,
                chatPreservedAt: new Date(),
            });

            console.log(`[MatchChat] Chat preserved for investigation in lobby ${lobbyId}`);
        } catch (error) {
            console.error(`[MatchChat] Error preserving chat for lobby ${lobbyId}:`, error);
            throw error;
        }
    }

    /**
     * Get chat history for a lobby (for reports/investigations)
     */
    static async getChatHistory(lobbyId: string): Promise<any[]> {
        try {
            const messages = await MatchChat.find({
                lobbyId: new mongoose.Types.ObjectId(lobbyId)
            })
                .populate("senderId", "name avatar")
                .sort({ createdAt: 1 });

            return messages;
        } catch (error) {
            console.error(`[MatchChat] Error fetching chat history for lobby ${lobbyId}:`, error);
            throw error;
        }
    }

    /**
     * Clean up old preserved chats (after investigation is complete)
     * Run this periodically (e.g., daily cron job)
     */
    static async cleanupOldPreservedChats(): Promise<void> {
        try {
            const PRESERVATION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days
            const cutoffDate = new Date(Date.now() - PRESERVATION_PERIOD);

            // Find lobbies with preserved chats older than 30 days
            const oldLobbies = await MatchLobby.find({
                hasReports: true,
                chatPreservedAt: { $lt: cutoffDate },
            });

            for (const lobby of oldLobbies) {
                await MatchChat.deleteMany({ lobbyId: lobby._id });
                await MatchLobby.findByIdAndUpdate(lobby._id, {
                    hasReports: false,
                    chatPreservedAt: null,
                });
            }

            console.log(`[MatchChat] Cleaned up ${oldLobbies.length} old preserved chats`);
        } catch (error) {
            console.error("[MatchChat] Error cleaning up old preserved chats:", error);
        }
    }
}
