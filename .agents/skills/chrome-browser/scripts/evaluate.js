import puppeteer from 'puppeteer';

const PORT = 9222;
// Args: <tab_index_or_url_part> <script>
const target = process.argv[2];
const script = process.argv[3];

if (!target || !script) {
    console.error("Usage: node evaluate.js <tab_index> <script>");
    process.exit(1);
}

async function main() {
    try {
        const browserURL = `http://127.0.0.1:${PORT}`;
        const browser = await puppeteer.connect({ browserURL });
        
        const pages = await browser.pages();
        let page;
        
        // Try parsing as index
        const index = parseInt(target);
        if (!isNaN(index) && index < pages.length) {
            page = pages[index];
        } else {
            // Find by URL match
            page = pages.find(p => p.url().includes(target));
        }

        if (!page) {
            console.error(`Tab matching '${target}' not found.`);
            process.exit(1);
        }

        const result = await page.evaluate((code) => {
            // Execute the code in the browser context
            // We wrap it in eval/function to handle expressions
            try {
                return eval(code);
            } catch (e) {
                return e.toString();
            }
        }, script);

        console.log(JSON.stringify(result));
        await browser.disconnect();
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

main();
