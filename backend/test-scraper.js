const { VerificationService } = require('./src/services/verificationService');
const dotenv = require('dotenv');
dotenv.config();

async function testScraper() {
    const testId = "12345678"; // Sample ID
    const testCode = "TEST";

    console.log(`Starting scraper test for ID: ${testId}...`);
    console.log("This will open a headless browser and visit https://store.standoff2.com/");

    try {
        const result = await VerificationService.verifyPlayerOnStore(testId, testCode);
        console.log("-----------------------------------------");
        console.log("Test Result:", result.success ? "SUCCESS (Code found)" : "FAILURE (Code not found or Error)");
        if (result.nickname) console.log("Scraped Nickname:", result.nickname);
        if (result.error) console.log("Error Details:", result.error);
        console.log("-----------------------------------------");
    } catch (err) {
        console.error("Test execution failed:", err);
    }
}

testScraper();
