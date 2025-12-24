import crypto from "crypto";

export class VerificationService {
    /**
     * Generates a unique token (optional, might still be useful for other purposes).
     */
    static generateVerificationCode(): string {
        return crypto.randomBytes(3).toString("hex").toUpperCase();
    }

    /**
     * Fetches player information from the official Standoff 2 store API.
     * @param standoff2Id The player's Standoff 2 ID.
     * @returns A promise that resolves to player info or an error.
     */
    static async getPlayerInfoFromStore(
        standoff2Id: string
    ): Promise<{ success: boolean; nickname?: string; avatar?: string; error?: string }> {
        try {
            const api = "https://store.standoff2.com/api";
            const response = await fetch(`${api}/v2/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({ uid: standoff2Id })
            });

            if (!response.ok) {
                const data = await response.json() as any;
                return {
                    success: false,
                    error: data.message || `Store API returned ${response.status}`,
                };
            }

            const data = await response.json() as any;

            // The response structure usually contains nick and avatar
            if (data && data.nick) {
                return {
                    success: true,
                    nickname: data.nick,
                    avatar: data.avatar,
                };
            } else {
                return {
                    success: false,
                    error: "Player not found on Standoff 2 store",
                };
            }
        } catch (error) {
            console.error("Store API Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to connect to Standoff 2 store",
            };
        }
    }

    /**
     * Verifies if the store nickname matches the expected nickname.
     */
    static async verifyNicknameMatch(
        standoff2Id: string,
        expectedNickname: string
    ): Promise<{ success: boolean; nickname?: string; avatar?: string; error?: string }> {
        const result = await this.getPlayerInfoFromStore(standoff2Id);

        if (!result.success) return result;

        const isMatch = result.nickname?.trim().toLowerCase() === expectedNickname.trim().toLowerCase();

        return {
            success: isMatch,
            nickname: result.nickname,
            avatar: result.avatar,
            error: isMatch ? undefined : `Nickname mismatch. Expected: "${expectedNickname}", Found: "${result.nickname}"`
        };
    }
}
