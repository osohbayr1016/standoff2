import { VerificationService } from './src/services/verificationService';
import dotenv from 'dotenv';
dotenv.config();

async function testScraper() {
    const testId = "12345678"; // Sample ID
    const testCode = "TEST";

    console.log(`Starting API test for ID: ${testId}...`);
    console.log("This will fetch player info directly from https://store.standoff2.com/api");

    try {
        const result = await VerificationService.getPlayerInfoFromStore(testId);
        console.log("-----------------------------------------");
        console.log("API Result:", result.success ? "SUCCESS" : "FAILURE");
        if (result.nickname) console.log("Nickname:", result.nickname);
        if (result.avatar) console.log("Avatar:", result.avatar);
        if (result.error) console.log("Error Details:", result.error);
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Test execution failed:", err);
    }
}

testScraper();
