import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer';

const PID_FILE = path.resolve(process.cwd(), '.chrome-pid');
const PORT = 9222;

async function getChromePath() {
    try {
        // Try to use puppeteer's cached chrome if available
        const browserFetcher = puppeteer.createBrowserFetcher();
        const revisions = browserFetcher.localRevisions();
        if (revisions.length > 0) {
            const info = await browserFetcher.revisionInfo(revisions[0]);
            return info.executablePath;
        }
    } catch (e) {}
    
    // Fallback to standard paths
    const platform = process.platform;
    if (platform === 'darwin') {
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'linux') {
        return '/usr/bin/google-chrome';
    } else if (platform === 'win32') {
        return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }
    throw new Error('Could not locate Chrome executable.');
}

async function isPortOpen(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        return response.ok;
    } catch (e) {
        return false;
    }
}

async function main() {
    if (await isPortOpen(PORT)) {
        console.log(`Chrome is already running on port ${PORT}.`);
        return;
    }

    const chromePath = await getChromePath();
    console.log(`Launching Chrome from: ${chromePath}`);

    const args = [
        '--remote-debugging-port=' + PORT,
        '--no-first-run',
        '--no-default-browser-check',
        // '--headless=new', // Headless mode disabled for visibility
        '--hide-crash-restore-bubble',
        '--user-data-dir=' + path.join(os.homedir(), '.chrome-debug')
    ];

    const subprocess = spawn(chromePath, args, {
        detached: true,
        stdio: 'ignore'
    });

    subprocess.unref();
    
    fs.writeFileSync(PID_FILE, subprocess.pid.toString());
    console.log(`Chrome launch initiated (PID: ${subprocess.pid}). Waiting for port ${PORT}...`);

    // Poll until port is open
    for (let i = 0; i < 20; i++) {
        if (await isPortOpen(PORT)) {
            console.log(`Chrome is now ready on port ${PORT}`);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.error(`Timeout waiting for Chrome to start on port ${PORT}`);
    process.exit(1);
}

main().catch(console.error);
