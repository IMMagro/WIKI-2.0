---
name: chrome-browser
description: Control a headless Chrome browser to browse the web, scrape data, and manage tabs. Use this for web automation tasks.
---

# Chrome Browser Skill

Control a persistent Chrome browser instance for web automation.

## Setup
```bash
cd scripts && npm install
```

## Primary Command: browse.js (USE THIS)

**Single command for browsing + reading content.** Opens URLs and takes accessibility snapshots in one call:

```bash
node scripts/browse.js <url> [url2] [url3] ... [--snapshot] [--close]
```

**Options:**
- `--snapshot` — Take accessibility tree snapshots (RECOMMENDED for reading content)
- `--close` — Close tabs after snapshotting

**Examples:**
```bash
# Open 3 news searches and get content in ONE call
node scripts/browse.js \
  "https://google.com/search?q=news+USA&tbm=nws" \
  "https://google.com/search?q=news+China&tbm=nws" \
  "https://google.com/search?q=news+Russia&tbm=nws" \
  --snapshot

# Open, snapshot, then close tabs
node scripts/browse.js "https://example.com" --snapshot --close
```

This is the most efficient approach — launches browser if needed, opens all URLs in parallel, takes all snapshots in parallel, returns combined output.

---

## Individual Tools (for advanced use)

### launch.js
Start browser if not running:
`node scripts/launch.js`

### listTabs.js
List open tabs with indices:
`node scripts/listTabs.js`

### openTab.js
Open URLs (parallel):
`node scripts/openTab.js <url> [url2] ...`

### snapshot.js
Take accessibility snapshots (parallel):
`node scripts/snapshot.js <tab_index> [index2] ...`

### evaluate.js
Run JavaScript in a tab (use sparingly):
`node scripts/evaluate.js <tab_index> "<javascript>"`

## Notes
- Browser runs on port 9222
- Session data persists (cookies, storage)
- Accessibility snapshots are reliable — avoid custom CSS selectors
