<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->
<!-- Last updated: 2026-08-15 | Last verified: 2026-08-15 -->

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
- Answer first, elaborate only if needed. No sycophantic openers.
- For yes/no or status questions, lead with the answer.
- Skip preamble. Match response length to task complexity.

## Custom Agent Rules (Concrete Actions)

- **Proactive Orchestration**: Before executing a request, evaluate the full scope. If working on UI, proactively READ design systems and animation guidelines before writing code. If working on backend, proactively check architecture and security patterns.
- **Auto-Commit**: Whenever you complete a significant chunk of work or hit a milestone, you MUST execute `git add` and `git commit` using conventional commit format, you can also use `.agents/skills/auto-gitcommit/skill_gitcommit.md` as a reference skill to generate a git commit message.
- **Theme Factory (CSS/UI)**: Whenever you edit CSS, stylesheets, or UI components, you MUST READ the file `.agents/skills/theme-factory/themes/12-qe-theme.md` and strictly apply its rules to ensure color palette and design system consistency for the Wiki.
- **Webapp Testing**: Whenever you finish frontend changes, you MUST RUN the relevant test commands (e.g., `npm run test`) to verify UI functionality and catch regressions.
- **Frontend Design**: Before creating new layouts, align with standard Angular best practices.
- **Animation Guidelines**: When implementing UI animations or transitions, proactively READ the corresponding local documentation/files for gsap-web, micro-interaction, or svg-animation to ensure 60fps performance.
- **Angular Build Checker**: Whenever you modify frontend code, you MUST RUN `npm run build` or the appropriate start command to ensure the app compiles. If startup errors occur, you MUST auto-fix the code and retry automatically before notifying the user.
- **UI Layout Adjustments**: You are "blind" to the visual render. When asked to fix overlapping, cut-off, or spacing issues, DO NOT make micro-adjustments (e.g., changing 20px to 15px). Make significant, bold changes to ensure the issue is resolved visually. Always verify parent container properties like overflow, flex-wrap, or fixed height that might be causing child elements to be cut off.
- **Visual testing**: When asked to fix visual issues, make sure to test the changes if necessary using `.agents/skills/webapp-testing/SKILL_testing.md` and verify that the issue is resolved. Show test output as evidence before claiming work is complete — never say "tested" or "verified" without pasting the terminal output. 

## Boundaries

### Always Do
- Run pre-commit checks before committing.
- Add tests for new code paths.
- Use conventional commit format: `type(scope): subject`.
- Use **atomic commits** (one logical change per commit).
- **Show test output as evidence before claiming work is complete** — never say "tested" or "verified" without pasting the terminal output.
- Verify `pwd` resolves inside the intended repo before any edit.

### Ask First
- Adding new dependencies.
- Modifying CI/CD configuration.
- Changing public API signatures.
- Repo-wide refactoring or rewrites.

### Never Do
- Commit secrets, credentials, or sensitive data.
- Modify vendor/, node_modules/, or generated files.

## Contributing (for AI agents)
- **Comprehension**: Understand the problem before submitting code.
- **Context**: Explain the trade-offs considered and link to the issue it addresses.
- **Continuity**: Respond to review feedback.

## Scoped AGENTS.md
<!-- AGENTS-GENERATED:START scope-index -->
<!-- AGENTS-GENERATED:END scope-index -->
> **Agents**: When working in a listed directory, you MUST load its AGENTS.md first.

## CRITICAL GIT RULE
Every time the user accepts or confirms a code modification, you MUST automatically commit and push the changes to the CURRENT working branch. You should use the `main` branch as the primary branch, and it is permitted to push directly to `main` unless the user specifies otherwise.