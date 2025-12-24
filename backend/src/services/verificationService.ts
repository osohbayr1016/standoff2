import PlayerProfile, { IPlayerProfile } from "../models/PlayerProfile";

export class VerificationService {

    /**
     * Submits a request for manual verification.
     * Updates the user's profile to PENDING status.
     */
    static async requestVerification(userId: string, standoff2Id: string): Promise<{ success: boolean; message: string; status: string }> {
        try {
            const profile = await PlayerProfile.findOne({ userId });

            if (!profile) {
                return { success: false, message: "Profile not found.", status: "error" };
            }

            // Check if already verified
            if (profile.verificationStatus === "VERIFIED") {
                return { success: true, message: "User is already verified.", status: "VERIFIED" };
            }

            // Update profile with ID and set status to PENDING
            profile.standoff2Id = standoff2Id;
            profile.verificationStatus = "PENDING";
            profile.isIdVerified = false; // Reset until approved

            await profile.save();

            return {
                success: true,
                message: "Verification request submitted successfully. Please wait for admin approval.",
                status: "PENDING"
            };
        } catch (error) {
            console.error("Manual Verification Request Error:", error);
            return { success: false, message: "Internal server error.", status: "error" };
        }
    }

    /**
     * Admin: Approve a verification request.
     */
    static async approveVerification(userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const profile = await PlayerProfile.findOne({ userId });

            if (!profile) return { success: false, message: "Profile not found." };

            if (profile.verificationStatus !== "PENDING" && profile.verificationStatus !== "REJECTED" && profile.verificationStatus !== "UNVERIFIED") {
                return { success: false, message: "User is already verified or in invalid state." };
            }

            profile.verificationStatus = "VERIFIED";
            profile.isIdVerified = true;
            await profile.save();

            return { success: true, message: "User successfully verified." };
        } catch (error) {
            console.error("Approve Verification Error:", error);
            return { success: false, message: "Internal server error." };
        }
    }

    /**
     * Admin: Reject a verification request.
     */
    static async rejectVerification(userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        try {
            const profile = await PlayerProfile.findOne({ userId });

            if (!profile) return { success: false, message: "Profile not found." };

            profile.verificationStatus = "REJECTED";
            profile.isIdVerified = false;
            // Optionally store rejection reason if schema supported it
            await profile.save();

            return { success: true, message: "User verification rejected." };
        } catch (error) {
            console.error("Reject Verification Error:", error);
            return { success: false, message: "Internal server error." };
        }
    }

    /**
     * Check current verification status.
     */
    static async getVerificationStatus(userId: string): Promise<{ status: string; standoff2Id?: string }> {
        const profile = await PlayerProfile.findOne({ userId }).select("verificationStatus standoff2Id");
        return {
            status: profile?.verificationStatus || "UNVERIFIED",
            standoff2Id: profile?.standoff2Id
        };
    }
}

export default VerificationService;
