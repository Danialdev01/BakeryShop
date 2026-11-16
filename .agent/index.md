# Project

Project information for AI agents working here. Edit freely, people and agents alike:
the harness writes this file once and afterwards only refreshes the file list at the end.

## About

Blank project ready for a fresh start. The previous bakery frontend, sample data, assets, dependencies, and build configuration have been removed. There is currently no frontend or backend, and no run or build commands.

## The .agent folder

Documentation in `notes/` is editable and synchronized with the app. Each page has YAML frontmatter with a `ucch` JSON object (id, title, parentId, icon, cover, position). Preserve IDs; edit the title in frontmatter. New Markdown files without metadata become pages. Rich editor blocks use fenced `ucch-node` JSON; preserve their full content. Ordinary text uses Markdown. Do not edit `cache/`. Conflicts are reported in the documentation editor; preserve both versions before resolving them.

When asked to create run buttons, inspect project scripts, then edit `.agent/commands.json`: {"commands":[{"id":"dev","label":"Run dev","command":"pnpm dev","cwd":".","icon":"play"}]}. Keep existing unrelated commands. IDs must be unique lowercase letters, digits, dashes or underscores (max 40 characters); cwd is relative to the project. Buttons refresh automatically. To run a saved command when asked, read the current file and execute its command in its cwd using your shell tool. Editing the file does not run it.

`.agent/` is where this project keeps its application settings, context and knowledge
for AI agents and the people working with them. Every agent the harness runs --
whichever provider -- reads this file at the start of every turn.

Read whatever here is relevant before working, refer to it, and keep it current when
the project changes, the About section above included. The list below is kept up to
date by the harness.

## Files in .agent

<!-- agent:files:start -->
- `index.md`: this file: what the project is and what is in this folder
<!-- agent:files:end -->
