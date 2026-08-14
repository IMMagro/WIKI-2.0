---
name: skill-integrator
description: Analyzes installed skills in the project and updates the AGENTS.md file with relevant automations. Make sure to use this skill whenever the user adds new skills, creates a skill, asks to "integrate skills", or wants to automatically register a skill's rules into the project's agent instructions.
---

# Skill Integrator

## Purpose
The `skill-integrator` automates the maintenance of the `AGENTS.md` file. As new skills are added to a project's `.agents/skills` folder, they often introduce new workflows or automations that the agent should follow consistently. This skill allows you to quickly discover all installed skills, determine their relevance to the current project, and append appropriate, persistent instructions to `AGENTS.md`.

## Workflow

When invoked, execute the following steps:

1. **Discover Installed Skills**:
   Run the bundled Python script to get a clean JSON list of all installed skills and their descriptions:
   ```bash
   python .agents/skills/skill-integrator/scripts/gather_skills.py
   ```

2. **Read Current Rules**:
   Use `view_file` to read the current contents of `AGENTS.md` in the project root. Check the `## Custom Agent Rules` section to see what rules are already active.

3. **Evaluate Relevance**:
   Evaluate each skill from the JSON output. Ask yourself:
   - Does this skill require a continuous background automation or a persistent rule?
   - For example, a tool that merely generates icons on demand does *not* need a global rule. However, a tool like `auto-git-commit` or a `code-formatter` might need a rule like "Always run the formatter before committing".
   - Only select skills that actually require persistent rules and are relevant to the project's domain.

4. **Formulate Rules**:
   For each relevant skill that is missing from `AGENTS.md`, write a concise, actionable rule in the imperative form.

   ## Rule Format Example
   **Input Skill**: `theme-factory` (Description: Generates CSS themes based on brand colors)
   **Output Rule**: `- **theme-factory**: Whenever you edit CSS or UI components, you must invoke the theme-factory skill to ensure color palette consistency.`

5. **Update AGENTS.md**:
   Use the `replace_file_content` tool to append your newly formulated rules under the `## Custom Agent Rules` section in `AGENTS.md`. Maintain clean Markdown formatting.

6. **Report to User**:
   Provide a brief summary to the user explaining which skills were successfully integrated into `AGENTS.md` and which ones were skipped (with a short explanation of why they didn't require persistent rules).
