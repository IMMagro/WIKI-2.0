import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

const PORT = 9222;
const args = process.argv.slice(2);

// Parse arguments
const snapshotFlag = args.includes('--snapshot');
const closeFlag = args.includes('--close');
const urls = args.filter(a => !a.startsWith('--'));

if (urls.length === 0) {
    console.error(`Usage: node browse.js <url> [url2] [url3] ... [--snapshot] [--close]

Options:
  --snapshot  Take accessibility snapshots of all opened pages
  --close     Close the tabs after taking snapshots

Examples:
  node browse.js "https://google.com/search?q=news+USA" "https://google.com/search?q=news+China" --snapshot
  node browse.js "https://example.com" --snapshot --close`);
    process.exit(1);
}

// Format accessibility node into readable text
function formatNode(node, depth = 0) {
    if (!node) return '';
    const indent = '  '.repeat(depth);
    const parts = [];

    if (node.role && node.role !== 'none') parts.push(node.role);
    if (node.name) parts.push(`"${node.name}"`);
    if (node.value) parts.push(`value="${node.value}"`);
    if (node.description) parts.push(`desc="${node.description}"`);
    if (node.focused) parts.push('focused');
    if (node.disabled) parts.push('disabled');

    let result = '';
    if (parts.length > 0) {
        result = indent + parts.join(' ') + '\n';
    }

    if (node.children) {
        for (const child of node.children) {
            result += formatNode(child, depth + 1);
        }
    }
    return result;
}

// Check if browser is running
async function isPortOpen(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        return response.ok;
    } catch (e) {
        return false;
    }
}

// Launch browser if needed
async function ensureBrowserRunning() {
    if (await isPortOpen(PORT)) {
        return;
    }

    // Find Chrome path
    let chromePath;
    const platform = process.platform;
    if (platform === 'darwin') {
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'linux') {
        chromePath = '/usr/bin/google-chrome';
    } else if (platform === 'win32') {
        chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else {
        throw new Error('Could not locate Chrome executable.');
    }

    const chromeArgs = [
        '--remote-debugging-port=' + PORT,
        '--no-first-run',
        '--no-default-browser-check',
        '--hide-crash-restore-bubble',
        '--user-data-dir=' + path.join(os.homedir(), '.chrome-debug')
    ];

    const subprocess = spawn(chromePath, chromeArgs, {
        detached: true,
        stdio: 'ignore'
    });
    subprocess.unref();

    // Wait for browser to be ready
    for (let i = 0; i < 20; i++) {
        if (await isPortOpen(PORT)) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(`Timeout waiting for Chrome to start on port ${PORT}`);
}

// Open a URL and optionally get snapshot
async function processUrl(browser, url, takeSnapshot) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const title = await page.title();

    let result = {
        url,
        title,
        snapshot: null
    };

    if (takeSnapshot) {
        const snapshot = await page.accessibility.snapshot();
        if (snapshot) {
            result.snapshot = formatNode(snapshot);
        } else {
            result.snapshot = '[No accessibility tree available]';
        }
    }

    return { page, result };
}

async function main() {
    try {
        // Ensure browser is running
        await ensureBrowserRunning();

        const browserURL = `http://127.0.0.1:${PORT}`;
        const browser = await puppeteer.connect({ browserURL });

        // Process all URLs in parallel
        const processed = await Promise.all(
            urls.map(url => processUrl(browser, url, snapshotFlag))
        );

        // Output results
        const output = processed.map(({ result }, i) => {
            let text = `=== [${i}] ${result.title} ===\n${result.url}\n`;
            if (result.snapshot) {
                text += '\n' + result.snapshot;
            }
            return text;
        }).join('\n');

        console.log(output);

        // Close tabs if requested
        if (closeFlag) {
            await Promise.all(processed.map(({ page }) => page.close()));
        }

        await browser.disconnect();
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

main();
