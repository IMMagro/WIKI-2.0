<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->
<!-- Last updated: 2026-08-14 | Last verified: 2026-08-14 -->

# AGENTS.md

**Precedence:** the **closest `AGENTS.md`** to the files you're changing wins. Root holds global defaults only.

## Commands
> Source: Manual Config

<!-- AGENTS-GENERATED:START commands -->
| Task | Command | ~Time |
|------|---------|-------|
| Lint | `npm run lint` | ~10s |
| Format | `npm run format` | ~5s |
| Test (single) | `npm run test` | ~2s |
| Build | `npm run build` | ~30s |
<!-- AGENTS-GENERATED:END commands -->

> If commands fail, verify against Makefile/package.json/composer.json or ask user to update.

## Response Style
- Answer first, elaborate only if needed. No sycophantic openers ("Great question!", "Absolutely!").
- For yes/no or status questions, lead with the answer.
- Skip preamble. Match response length to task complexity.

## Custom Agent Rules (Integrated Skills)

- **auto-git-commit**: Whenever you complete a significant chunk of work or hit a milestone, you must invoke the auto-git-commit skill to commit the changes.
- **theme-factory**: Whenever you edit CSS, stylesheets or UI components, you must invoke the theme-factory skill to ensure color palette consistency and design system integrity. **Crucially, ALWAYS apply the "12. Quaderno Elettronico Theme" (found in `.agents/skills/theme-factory/themes/12-qe-theme.md`) to style the Wiki.**
- **webapp-testing**: Whenever you finish frontend changes, you must invoke the webapp-testing skill to verify the UI functionality, catch regressions, and ensure cross-browser consistency.
- **frontend-design**: Before creating new layouts, consult this skill to align with the chosen framework (Angular in this case) best practices.
- **animation-guidelines**: Whenever you are asked to implement UI animations, transitions, or effects (like scroll animations, glassmorphism, or SVG paths), you must consult the corresponding animation skill (e.g., `gsap-web`, `micro-interaction`, `motion-background`, `svg-animation`, `glassmorphism`) to ensure smooth 60fps performance and best practices.
- **angular-build-checker**: Whenever you complete a coding task or modify frontend code, you must invoke the angular-build-checker skill to ensure the app compiles and starts without errors. Se ci sono errori nell'avvio, correggi e poi riprovi.
## Boundaries

### Always Do
- Run pre-commit checks before committing
- Add tests for new code paths
- Use conventional commit format: `type(scope): subject`
- Use **atomic commits** (one logical change per commit); preserve signatures, keep bisection useful
- **Show test output as evidence before claiming work is complete** — never say "try again", "should work now", "tested", "verified", or "all green" without pasted command output
- Before any edit, verify `pwd` resolves inside the intended repo worktree.

### Ask First
- Adding new dependencies
- Modifying CI/CD configuration
- Changing public API signatures
- Repo-wide refactoring or rewrites

### Never Do
- Commit secrets, credentials, or sensitive data
- Modify vendor/, node_modules/, or generated files
- Push directly to main/master branch — open a PR

## Contributing (for AI agents)
- **Comprehension**: Understand the problem before submitting code.
- **Context**: Every PR must explain the trade-offs considered and link to the issue it addresses.
- **Continuity**: Respond to review feedback. Drive-by PRs without follow-up will be closed.

## Scoped AGENTS.md (MUST read when working in these directories)
<!-- AGENTS-GENERATED:START scope-index -->
<!-- AGENTS-GENERATED:END scope-index -->

> **Agents**: When you read or edit files in a listed directory, you **must** load its AGENTS.md first. It contains directory-specific conventions that override this root file.

## When instructions conflict
The nearest `AGENTS.md` wins. Explicit user prompts override files.
