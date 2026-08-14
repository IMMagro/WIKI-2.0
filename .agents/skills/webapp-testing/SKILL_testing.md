---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
license: Complete terms in LICENSE.txt
---

# Web App Testing Skill

Drive a real browser to exercise your web app end-to-end. The agent opens the page, clicks through the flow, fills forms, and reports what it sees.

## When to Use

- You just finished a frontend change and need to verify it actually works in the browser
- You want to reproduce a UI bug before fixing it
- You're reviewing a PR and want to see the change live, not just in the diff

## What It Does

1. **Starts** a local dev server if one isn't running
2. **Opens** the target page in a headless browser
3. **Exercises** the golden path and likely edge cases
4. **Asserts** visible state (text, DOM structure, network calls)
5. **Captures** screenshots and console logs
6. **Reports** regressions or unexpected behavior

## Usage

`
/webapp-testing
`

## Example Prompts

- "Test the checkout flow end-to-end"
- "Verify the login form rejects empty emails"
- "Reproduce the bug where the sidebar collapses on mobile"

## Integration

Works with Playwright and the Chrome DevTools MCP. If neither is installed, the skill prompts you to add one.

## Complementary Skills

- playwright-skill — for authoring Playwright test files
- eview — to tie test results back to PR review
