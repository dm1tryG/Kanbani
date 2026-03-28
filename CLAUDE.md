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

### Step 6: Dev Server
- After finishing work, **always** start the dev server locally and send the user the link.
- If the port is busy — kill the process and restart: `lsof -ti:3000 | xargs kill -9; npm run dev`.
- Send the link: `http://localhost:3000`

### Step 7: Show the Full Diff
- **Always** show the user the **full diff** of everything done in this iteration — from the commit where work started (branch point / first commit on branch) to current HEAD.
- Use `git diff <start>...HEAD` to show the complete picture, not just the last commit.
- This is mandatory. The user wants to review the entire delta, not incremental pieces.

## Testing Strategy
- **E2E tests**: end-to-end tests that cover user-facing flows.
- **Browser/agent tests**: tests that run in a real or headless browser environment. **Always capture screenshots** during browser/agent tests and attach them as comments on the PR for visual review.
- Test files live alongside the code or in a dedicated `tests/` or `e2e/` directory.
- All tests must pass before pushing.
- **Screenshots are NOT committed to the repo.** They are uploaded externally and linked in PR comments.

## Attaching Screenshots to PRs
Screenshots must be attached to every PR via a comment. Use this process:

1. Run e2e tests — they save screenshots to `e2e/screenshots/`.
2. Create a **draft GitHub release** as a temporary asset host:
   ```bash
   gh release create screenshots-temp --title "temp" --notes "temp" --draft
   ```
3. Upload screenshot files to the release:
   ```bash
   gh release upload screenshots-temp e2e/screenshots/*.png
   ```
4. Get the download URLs:
   ```bash
   gh release view screenshots-temp --json assets --jq '.assets[].url'
   ```
5. Post a PR comment with the images using the URLs:
   ```bash
   gh pr comment <PR_NUMBER> --body "$(cat <<EOF
   ## E2E Screenshots
   ![description](URL_FROM_STEP_4)
   EOF
   )"
   ```
6. **Do NOT** commit screenshots to the repo — they are gitignored.

## Git
- **Never** add `Co-Authored-By` lines to commits. All commits are authored solely by the user.

## UI System
- **Read [`UIkit.md`](UIkit.md) before creating or modifying any UI component.** It defines all colors, typography, components, and rules.
- **All UI must use design tokens and shared components from `src/components/ui/`.** No raw hex colors, no hardcoded Tailwind color classes (like `text-blue-600`), no raw `<button>`/`<input>` with inline styling. Use `<Button>`, `<Badge>`, `<Input>`, `<Textarea>`, `<IconButton>`.

## Tone
- You're the user's bro. Be direct, casual, and efficient.
- Grill hard on the 5 questions, then execute without hesitation.
