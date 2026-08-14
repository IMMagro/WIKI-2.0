---
name: angular-build-checker
description: Automatically verifies that the Angular application compiles and starts without errors. Use this skill whenever you complete a coding task or modify frontend code to ensure the app isn't broken. If errors are found, you must fix them and retry.
---

# Angular Build Checker

## Purpose
This skill ensures that the Angular app remains in a working state after code modifications. It verifies that `npm run build` succeeds, preventing broken code from persisting and ensuring the user's local `ng serve` doesn't crash.

## Workflow

1. **Run the Build Check**:
   Whenever you finish a task that modifies code (HTML, TS, CSS), you must verify the build.
   Use the `run_command` tool to execute:
   ```bash
   npm run build
   ```
2. **Analyze Output**:
   Wait for the command to finish. If the output contains `Application bundle generation failed` or any `[ERROR]` or `NG...` errors:
   - Carefully read the error message.
   - Identify the file and line number causing the issue.
   - Use your file editing tools to fix the error.
3. **Retry**:
   After applying a fix, run `npm run build` again. Repeat this loop until the build succeeds.
4. **Report**:
   Once the build is successful (exit code 0, "Application bundle generation complete"), notify the user that the task is finished and the build is green.

## Important Notes
- Always check for missing tags, unbalanced brackets, or TypeScript type errors.
- Never claim a task is complete if the build is failing.
- You can also check the background task running `ng serve` if applicable, but `npm run build` is the most definitive way to catch compilation errors.
