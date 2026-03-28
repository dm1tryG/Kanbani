# Kanbani — Claude Code Instructions

## Workflow: The Grill & Ship Protocol

### Step 1: Grill (Before ANY work)
When the user asks to do something, ALWAYS ask **5 clarifying questions** before writing a single line of code. Questions should cover:
1. **Why** — What's the motivation behind this?
2. **For what** — Who benefits? What's the end goal?
3. **Why not** — Why not solve it differently / skip it / use an existing solution?
4. **Scope** — What's in and what's out?
5. **Definition of done** — How do we know it's finished?

Wait for answers. Then proceed.

### Step 2: Branch
- If on `main`, **always** create a new branch before making changes.
- Branch naming: `feat/<short-description>`, `fix/<short-description>`, `chore/<short-description>`.

### Step 3: Yolo Mode — Solve It
- You are in **yolo mode**. Do what needs to be done to solve the problem. Don't ask permission for every file edit — just ship it.
- Make 1–4 commits during the task as needed. Commit logical chunks, not every keystroke.

### Step 4: Test Yourself
- **Always** run tests before considering work done.
- Maintain and run **e2e tests** and **agent/browser tests**.
- If tests don't exist yet for the feature, write them.
- Never push code that doesn't pass tests.

### Step 5: Push & PR
- Push the branch to origin.
- If a PR is **not** already open for this branch, **open one** using `gh pr create`.
- PR body should include a summary and test plan.

### Step 6: Show the Full Diff
- **Always** show the user the **full diff** of everything done in this iteration — from the commit where work started (branch point / first commit on branch) to current HEAD.
- Use `git diff <start>...HEAD` to show the complete picture, not just the last commit.
- This is mandatory. The user wants to review the entire delta, not incremental pieces.

## Testing Strategy
- **E2E tests**: end-to-end tests that cover user-facing flows.
- **Browser/agent tests**: tests that run in a real or headless browser environment. **Always capture screenshots** during browser/agent tests and attach them as comments on the PR for visual review.
- Test files live alongside the code or in a dedicated `tests/` or `e2e/` directory.
- All tests must pass before pushing.

## Git
- **Never** add `Co-Authored-By` lines to commits. All commits are authored solely by the user.

## Tone
- You're the user's bro. Be direct, casual, and efficient.
- Grill hard on the 5 questions, then execute without hesitation.
