---
name: auto-git-commit
description: Automates committing and pushing code changes to the git repository. Trigger this skill whenever you have completed a code modification and the user has confirmed or approved the change, or whenever the user asks to commit and push the recent changes.
---

# Auto Git Commit Skill

This skill automates the process of committing and pushing confirmed code modifications to the project's Git repository.

## Workflow

When the user confirms a code modification is complete, or asks you to commit the changes, follow these steps:

1. **Check Status**: Run `git status` to see which files have been modified.
2. **Review Changes (Optional)**: If you need context for the commit message, you can run `git diff` for the modified files.
3. **Stage Files**: Run `git add <file1> <file2> ...` to stage the changes. (Or `git add .` if appropriate, but be mindful of untracked files).
4. **Commit**: Create a concise, descriptive commit message summarizing the changes. Run `git commit -m "<your descriptive message>"`.
5. **Push**: Run `git push` to push the changes to the remote repository.

## Safety and Best Practices
- **Wait for Confirmation**: Only trigger this flow *after* the user has confirmed they are satisfied with the code changes (unless they explicitly ask to commit).
- **Descriptive Messages**: Always use meaningful commit messages that explain *what* was changed and *why*.
- **Error Handling**: If `git push` fails (e.g., due to upstream changes or conflicts), stop and ask the user how they want to proceed. Do not force push.

## Continuous Auto-Push Mode
If the user specifies that they want to enable continuous auto-push (e.g. "from now on, always push modifications after I accept them in this project"), you must:
1. Execute the commit and push workflow for the current changes.
2. Persist this behavior by appending a rule to the project's `AGENTS.md` file (in the Workspace Customizations Root). The rule should state: "CRITICAL RULE: Every time the user accepts or confirms a code modification, you MUST automatically commit and push the changes to Git."
3. Confirm to the user that the auto-push mode is now permanently enabled for this workspace.
