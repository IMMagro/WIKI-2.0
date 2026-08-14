import puppeteer from 'puppeteer';

const PORT = 9222;
const urls = process.argv.slice(2);

if (urls.length === 0) {
    console.error("Usage: node open-tab.js <url> [url2] [url3] ...");
    process.exit(1);
}

async function main() {
    try {
        const browserURL = `http://127.0.0.1:${PORT}`;
        const browser = await puppeteer.connect({ browserURL });

        // Open all URLs in parallel
        const results = await Promise.all(urls.map(async (url) => {
            const page = await browser.newPage();
            await page.goto(url);
            return url;
        }));

        console.log(`Opened ${results.length} tab(s): ${results.join(', ')}`);
        await browser.disconnect();
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

main();
