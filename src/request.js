import puppeteer from "puppeteer";


export const sendConnectionRequests = async (data) => {
    console.log(data);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto("https://www.linkedin.com/login");
        await page.type("#username", data.email);
        await page.type("#password", data.password);
        await page.click("button[type='submit']");
        await page.waitForNavigation();

        await page.goto("https://www.linkedin.com/mynetwork/grow/?skipRedirect=true");
        await page.waitForSelector("button[aria-label*='Invite']");

        const connectButtons = await page.$$(
            "button[aria-label*='Invite']"
        );

        console.log(`Connection button count: ${connectButtons.length}`);
        let count = 0;
        for (let button of connectButtons) {
            if (count > data.connectionCount) break;
            count++;
            try {
                await button.click();
                console.log("Connection Sent.");

                await page.waitForTimeout(Math.random() * 3000 + 2000);
            } catch (error) {
                console.error("Error:", error.message);
            }
        }
    } catch (error) {
        console.error("Error bot:", error.message);
    } finally {
        await browser.close();
    }
};
