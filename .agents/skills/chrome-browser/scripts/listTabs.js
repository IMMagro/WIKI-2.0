import puppeteer from 'puppeteer';

const PORT = 9222;

async function main() {
    try {
        const browserURL = `http://127.0.0.1:${PORT}`;
        const browser = await puppeteer.connect({ browserURL });
        
        const pages = await browser.pages();
        const tabs = await Promise.all(pages.map(async (page, index) => {
            const title = await page.title();
            const url = page.url();
            // Puppeteer doesn't expose targetId directly on Page easily, 
            // but we can map by index or use browser.targets()
            return { index, title, url };
        }));

        console.log(JSON.stringify(tabs, null, 2));
        await browser.disconnect();
    } catch (e) {
        console.error("Error connecting to Chrome:", e.message);
        process.exit(1);
    }
}

main();
