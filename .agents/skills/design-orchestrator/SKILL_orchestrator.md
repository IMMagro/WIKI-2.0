---
name: design-orchestrator
description: Automatically orchestrates other design skills (frontend-design, theme-factory, icon-generation, etc.) based on the user's high-level request. Use this skill when the user asks to "design a page", "modify the UI", or "improve aesthetics" without specifying which exact skill to use.
---

# Design Orchestrator

This skill acts as a "Design Manager" or "Orchestrator". Its purpose is to save the user from having to manually invoke individual, specialized design skills one by one. When activated, you will analyze the user's high-level request and seamlessly chain the necessary design skills to achieve the goal.

## Available Design Skills
You have access to a suite of design-related skills in the `.agents/skills/` directory. Typically, these include (but are not limited to):
- **frontend-design**: For structuring and styling React components, layouts, and responsive pages.
- **theme-factory**: For defining color palettes, typography, and global CSS/Tailwind configurations.
- **icon-generation**: For creating custom, AI-generated icons (3D, flat, minimal).
- **background-remove**: For processing images to ensure clean, transparent backgrounds.
- **canvas-design**: For any HTML5 Canvas drawing or interactive elements.

## Workflow

When the user gives a high-level design request (e.g., "Design the user profile page", "Make the dashboard look more modern", "Add custom food icons to the menu"):

### Step 1: Analyze & Plan
1. Deconstruct the user's request to identify all the necessary moving parts (layout, assets, colors, components).
2. Identify which skills from `.agents/skills/` will be needed.
3. Formulate a brief, logical execution plan (e.g., "First I will use `theme-factory` to generate the new brand colors, then `icon-generation` for the avatars, and finally `frontend-design` to build the JSX").

### Step 2: Read Skill Contexts (If needed)
If you are unsure of the specific parameters or workflows of a skill you intend to use, use the `view_file` tool to quickly read its `SKILL.md` (e.g., `.agents/skills/icon-generation/SKILL_icongen.md`).

### Step 3: Execute the Chain
Act autonomously to execute the plan step-by-step:
1. Generate or modify the required assets/configurations using the first skill.
2. Pass the output (e.g., image paths, CSS classes) to the next skill in the chain.
3. Build the final UI components integrating all elements.

*Important*: You do not need to pause and ask the user for permission between every single skill execution unless the specific skill's instructions mandate it or you hit a critical ambiguity. The goal is to provide a smooth, "done-for-you" experience.

### Step 4: Final Polish & Auto-Commit
1. Review the final result to ensure it meets high-quality design standards (spacing, contrast, modern aesthetics).
2. In accordance with the global `auto-git-commit` rule, make sure to automatically commit and push all generated assets and code modifications to Git once the design is complete and confirmed.

## Example Use Cases

**User Request**: "Crea una schermata di login con un look moderno e scuro e metti un'icona di un lucchetto 3D."
**Orchestrator Action**:
1. Uses `icon-generation` to create the 3D padlock icon.
2. Uses `background-remove` to ensure it has a transparent background.
3. Uses `theme-factory` to ensure dark mode variables are set in CSS.
4. Uses `frontend-design` to write `Login.tsx` integrating the icon and styling.
5. Commits and pushes the result.
