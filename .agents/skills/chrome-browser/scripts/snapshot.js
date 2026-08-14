import puppeteer from 'puppeteer';

const PORT = 9222;
const targets = process.argv.slice(2);

if (targets.length === 0) {
    console.error("Usage: node snapshot.js <tab_index> [tab_index2] ...");
    process.exit(1);
}

function formatNode(node, depth = 0) {
    if (!node) return '';

    const indent = '  '.repeat(depth);
    const parts = [];

    // Role
    if (node.role && node.role !== 'none') {
        parts.push(node.role);
    }

    // Name (the text content)
    if (node.name) {
        parts.push(`"${node.name}"`);
    }

    // Important properties
    if (node.value) parts.push(`value="${node.value}"`);
    if (node.description) parts.push(`desc="${node.description}"`);
    if (node.focused) parts.push('focused');
    if (node.disabled) parts.push('disabled');
    if (node.expanded !== undefined) parts.push(node.expanded ? 'expanded' : 'collapsed');

    let result = '';
    if (parts.length > 0) {
        result = indent + parts.join(' ') + '\n';
    }

    // Recurse into children
    if (node.children) {
        for (const child of node.children) {
            result += formatNode(child, depth + 1);
        }
    }

    return result;
}

async function getSnapshot(pages, target) {
    let page;
    const index = parseInt(target);
    if (!isNaN(index) && index < pages.length) {
        page = pages[index];
    } else {
        page = pages.find(p => p.url().includes(target));
    }

    if (!page) {
        return `[Tab '${target}' not found]`;
    }

    const snapshot = await page.accessibility.snapshot();
    if (!snapshot) {
        return `[No accessibility tree for tab ${target}]`;
    }

    const title = await page.title();
    const url = page.url();
    return `=== Tab ${target}: ${title} ===\n${url}\n\n${formatNode(snapshot)}`;
}

async function main() {
    try {
        const browserURL = `http://127.0.0.1:${PORT}`;
        const browser = await puppeteer.connect({ browserURL });
        const pages = await browser.pages();

        // Get snapshots in parallel
        const results = await Promise.all(
            targets.map(target => getSnapshot(pages, target))
        );

        console.log(results.join('\n\n'));
        await browser.disconnect();
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}

main();
