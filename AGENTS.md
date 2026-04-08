<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-workflow-rules -->
# Git workflow — mandatory rules

## Never use worktrees
Do NOT use `git worktree` or the `isolation: "worktree"` parameter on any Agent tool call.
All work happens directly on the `main` branch in `/Users/USER/Desktop/intrainin`.

**Why:** worktrees create hidden `.claude/worktrees/*` directories, orphaned branches, and confusing
parallel states that the owner cannot see or navigate. They were used in early sessions and caused
exactly that problem — delete them if you ever see them.

**How to apply:** work on `main` directly. For risky changes, use a feature branch off `main` with a
clear name (e.g. `feat/layer-8-paystack`), get confirmation before creating it, merge via PR, then
delete the branch. Never use the `isolation: "worktree"` Agent option.
<!-- END:git-workflow-rules -->
