import { VerificationService } from './src/services/verificationService';
import dotenv from 'dotenv';
dotenv.config();

async function testVerification() {
    const testId = "14300000"; // Sample ID (using a realistic-looking one)
    const expectedNickname = "Vraestoren"; // Assuming this is the owner of the repo or a known nickname

    console.log(`Starting verification test for ID: ${testId}...`);
    console.log(`Expecting Nickname: ${expectedNickname}`);

    try {
        const result = await VerificationService.verifyNicknameMatch(testId, expectedNickname);
        console.log("-----------------------------------------");
        console.log("Verification Result:", result.success ? "SUCCESS (Matched!)" : "FAILURE (Mismatch or Error)");
        if (result.nickname) console.log("Scraped Nickname:", result.nickname);
        if (result.avatar) console.log("Scraped Avatar URL:", result.avatar);
        if (result.error) console.log("Error Details:", result.error);
        console.log("-----------------------------------------");

        if (!result.success && !result.error && result.nickname) {
            console.log("Logic Check: Nickname was found but didn't match.");
        }
    } catch (err) {
        console.error("Test execution failed:", err);
    }
}

testVerification();
