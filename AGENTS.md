<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->
<!-- Last updated: 2026-08-25 | Last verified: 2026-08-25 -->

# AGENTS.md

**Precedence:** the **closest `AGENTS.md`** to the files you're changing wins. Root holds global defaults only.

## Commands
> Source: Manual Config

<!-- AGENTS-GENERATED:START commands -->
| Task | Command | ~Time |
|------|---------|-------|
| Dev server | `npm start` | — |
| Build | `npm run build` | ~20s |
| Watch build | `npm run watch` | — |

> NB: `lint`, `format` e `test` non sono attualmente configurati in `package.json`. La verifica di riferimento è `npm run build` (vedi "Angular Build Checker"). Aggiungerli richiede installare il tooling relativo (ESLint/Prettier/Karma).
<!-- AGENTS-GENERATED:END commands -->

> If commands fail, verify against package.json or ask user to update.

## Response Style
- Answer first, elaborate only if needed. No sycophantic openers.
- For yes/no or status questions, lead with the answer.
- Skip preamble. Match response length to task complexity.

## Custom Agent Rules (Concrete Actions)

- **Subagent-Driven & Parallel Orchestration**: Whenever executing tasks, refactoring, feature implementation, research, or audits, YOU MUST structure the workflow by delegating tasks to specialized subagents (e.g., `wiki-coder`, `wiki-reviewer`, `research`, `ui-tester-agent`). Whenever subtasks are independent (e.g., backend handler + frontend UI, research + template refactoring, or multi-file audits), invoke subagents **in parallel** concurrently with a single `invoke_subagent` batch call. The lead agent acts as orchestrator: defines clear prompts, synchronizes results, validates builds with `npm run build`, and presents consolidated findings to the user.
- **Proactive Orchestration**: Before executing a request, evaluate the full scope. If working on UI, proactively READ design systems and animation guidelines before writing code. If working on backend, proactively check architecture and security patterns.
- **Auto-Commit**: Whenever you complete a significant chunk of work or hit a milestone, you MUST execute `git add` and `git commit` using conventional commit format. Reference `.agents/skills/auto-git-commit/SKILL_git.md` for message format.
- **Theme Factory (CSS/UI)**: Whenever you edit CSS, stylesheets, or UI components, you MUST READ the file `.agents/skills/theme-factory/themes/12-qe-theme.md` and strictly apply its rules. Palette: qe-blue `#377DFF`, magenta `#F80086`, bg `#F8FAFD`, testo `#1E2022`, font Poppins.
- **Frontend Design**: Before creating new layouts, align with standard Angular 18 standalone component best practices. Reference `.agents/skills/frontend-design/` and `.agents/skills/frontend_checklist/`.
- **Animation Guidelines**: When implementing UI animations or transitions, proactively READ the corresponding files in `.agents/skills/animation/` (e.g. gsap-web, micro-interaction, svg-animation) to ensure 60fps performance.
- **Angular Build Checker**: Whenever you modify frontend code, you MUST RUN `npm run build` to ensure the app compiles. The 6 CSS `::view-transition` warnings are preexisting and harmless. If errors occur, auto-fix and retry before notifying the user.
- **UI Layout Adjustments**: You are "blind" to the visual render. When asked to fix overlapping, cut-off, or spacing issues, make significant, bold changes. Always verify parent container properties like overflow, flex-wrap, or fixed height.
- **Visual testing**: When asked to fix visual issues, use `.agents/skills/webapp-testing/SKILL_testing.md` to verify. Show test output as evidence before claiming work is complete — never say "tested" or "verified" without pasting terminal output.
- **ui-ux-pro**: Whenever designing, building, reviewing, or fixing UI/UX interfaces, invoke the `ui-ux-pro` skill (`.agents/skills/ui-ux-pro/`) for UX guidelines, palettes, and design tokens.
- **ui-tester**: Whenever you modify Angular templates or want to verify UI interactions (buttons, modals, links), use `.agents/skills/ui-tester/SKILL.md` to run visual and logical checks.
- **api-generator**: Whenever you need to create a new backend endpoint for IIS (`.ashx`), use `.agents/skills/api-generator/SKILL.md` to follow standard C# JSON-handling patterns. Always enforce `Auth.IsAuthorized(context)` on mutating requests (POST/PUT/DELETE).
- **Backend & IIS Security**:
  - `Data/tokens.json` and `Data/users.json` MUST be blocked from static downloads via `web.config` request filtering. Sensitive server-only JSON files must NEVER be served to the public.
  - All mutating endpoints (`save_smartflow.ashx`, `navigation_settings.ashx`, `upload_asset.ashx`, etc.) MUST strictly enforce `if (!Auth.IsAuthorized(context)) { context.Response.StatusCode = 401; ... return; }`.
- **Frontend Auth Headers**: Whenever making `http.post` / mutating calls to protected `.ashx` endpoints from Angular (e.g. upload asset, save guides, save smartflow, save navigation), you MUST explicitly include `Authorization: Bearer <token>` (or `session_token`) in the request headers.
- **C# Compatibility (IIS .NET 4.0)**: Never use C# 6.0+ syntax in `.ashx` files (NO string interpolation `$""`, NO null-propagation `?.`, NO expression bodies `=>`, NO `nameof()`). Always use `string.Format()` and standard C# 4.0 syntax.
- **mock-data-cleaner**: Whenever you need to prepare the frontend for real HTTP integration, use `.agents/skills/mock-data-cleaner/SKILL.md` to strip out hardcoded mock data cleanly.
- **manual-generator**: Whenever you need to create, format, or write a manual (wiki guide), use `.agents/skills/manual-generator/SKILL.md` to ensure the output respects the required MDX structure, HTML formatting, and UI tags.
- **Console Check**: After any code modifications, check the terminal output (`ng serve` / `npm run build`) to ensure there are no errors (`TypeError`, `HttpErrorResponse`, etc.) before considering the task complete.

## Boundaries

### Always Do
- Decompose operations into subagent tasks and run independent tasks in parallel whenever applicable.
- Run `npm run build` before committing (pre-commit check).
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
Every time the user accepts or confirms a code modification, you MUST automatically commit and push the changes to the CURRENT working branch (`master`). It is permitted to push directly to `master` unless the user specifies otherwise.