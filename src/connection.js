import puppeteer from "puppeteer";
import fs from "fs";

const COOKIE_PATH = "./linkedin_cookies.json";
let count = 0;

export const sendConnectionRequests = async (data) => {
    console.log("Starting with data:", data);
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    if (fs.existsSync(COOKIE_PATH)) {
        const cookiesString = fs.readFileSync(COOKIE_PATH);
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        console.log("Cookies loaded, login might be skipped.");
    }

    try {
        await page.goto("https://www.linkedin.com/feed/");

        if (page.url().includes("/login")) {
            console.log("Login required, logging in...");
            await page.type("#username", data.email);
            await page.type("#password", data.password);
            await page.click("button[type='submit']");
            await page.waitForNavigation();

            const cookies = await page.cookies();
            fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
            console.log("Login successful, cookies saved.");
        } else {
            console.log("Already logged in, skipping login.");
        }

        await page.goto("https://www.linkedin.com/mynetwork/grow/?skipRedirect=true");

        // console.log("Scrolling...");
        // await smartScroll(page, 20, 2000);  // 20 kez scroll, 2 saniye bekle
        // console.log("Scroll finished.");

        for (let i = 0; i < 4; i++) {
            await sendInvite(page, data);
            if (i < 3) {
                await wait(5000);
            }
        }

        console.log("Waiting for 3 minutes...");
        await wait(180000);


    } catch (error) {
        console.error("Bot error:", error.message);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
};

async function sendInvite(page, data) {
    await page.waitForSelector("button[aria-label*='Invite']", { timeout: 10000 });

    const allInviteButtons = await page.$$("button[aria-label*='Invite']");

    const connectButtons = [];

    for (const button of allInviteButtons) {
        const ariaLabel = await page.evaluate(el => el.getAttribute("aria-label"), button);

        if (
            ariaLabel &&
            !ariaLabel.toLowerCase().includes("follow") &&
            !ariaLabel.toLowerCase().includes("subscribe")
        ) {
            connectButtons.push(button);
        }
    }

    console.log(`Filtered and found ${connectButtons.length} valid connection buttons.`);


    for (let button of connectButtons) {
        if (count >= data.connectionCount) break;
        count++;
        try {
            await button.click();
            console.log(`Connection request #${count} sent.`);
            const delay = Math.floor(Math.random() * 2000) + 1000;
            await wait(delay);
        } catch (error) {
            console.error("Error sending connection:", error.message);
        }
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
