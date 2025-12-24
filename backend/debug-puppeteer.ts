import puppeteer from "puppeteer";
import fs from "fs";

async function debugPuppeteer() {
    console.log("Starting Debug Puppeteer (Deep Inspect)...");
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36");

    let step = 1;
    async function takeScreenshot(name: string) {
        const fileName = `debug_inspect_step_${step++}_${name}.png`;
        await page.screenshot({ path: fileName });
        console.log(`Saved screenshot: ${fileName}`);
    }

    try {
        console.log("Navigating to https://store.standoff2.com/...");
        await page.goto("https://store.standoff2.com/", { waitUntil: 'networkidle2', timeout: 60000 });
        await takeScreenshot("1_home_page");

        // 0. Handle Cookie Banner (Click Strategy)
        console.log("Checking for cookie banner...");
        await page.evaluate(`() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const cookieBtn = buttons.find(b => {
                const txt = b.innerText.toUpperCase();
                return txt.includes('ПРИНЯТЬ') || txt.includes('ACCEPT');
            });
            if (cookieBtn) cookieBtn.click();
        }`);
        await new Promise(r => setTimeout(r, 2000));
        await takeScreenshot("2_after_cookie_banner");

        // 1. Click Login button (Top Right)
        console.log("Clicking top-right login button...");
        await page.evaluate(`() => {
           const buttons = Array.from(document.querySelectorAll('button', 'a', 'div[role="button"]'));
           const loginBtn = buttons.find(b => {
               const txt = b.innerText.toUpperCase();
               return txt.includes('АВТОРИЗОВАТЬСЯ') || 
                      txt.includes('AUTHORIZE') || 
                      txt.includes('LOG IN');
           });
           if (loginBtn) loginBtn.click();
        }`);
        await new Promise(r => setTimeout(r, 2000));
        await takeScreenshot("3_after_top_login_click");

        // 2. Click the large Authorize button in the menu
        console.log("Clicking secondary authorize button...");
        await page.evaluate(`() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const authBtn = buttons.find(b => {
                const txt = b.innerText.toUpperCase();
                return (txt.includes('АВТОРИЗОВАТЬСЯ') || txt.includes('AUTHORIZE'));
            });
            
            if (authBtn) authBtn.click();
        }`).catch((e) => console.log("Secondary click error: " + e));

        await new Promise(r => setTimeout(r, 2000));
        await takeScreenshot("4_after_secondary_auth_click");

        // 3. IDENTIFY INPUT
        console.log("Inspecting inputs...");
        const inputDetails = await page.evaluate(`() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            return inputs.map(i => ({
                outerHTML: i.outerHTML,
                isVisible: !!(i.offsetWidth || i.offsetHeight || i.getClientRects().length),
                placeholder: i.placeholder
            }));
        }`) as any[];

        console.log("Found inputs:", JSON.stringify(inputDetails, null, 2));

    } catch (e) {
        console.error("Debug Error:", e);
        await takeScreenshot("error");
    } finally {
        await browser.close();
    }
}

debugPuppeteer();
