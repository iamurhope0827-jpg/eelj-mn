# Working on Ээлж

Several people and AI sessions work on this repository at the same time. Follow this workflow so changes do not overwrite each other or reach the live site untested.

## Workflow

- `main` is protected. Do not push to it directly; the push is rejected.
- Start each change from an up-to-date `main` on its own branch: `git switch main && git pull && git switch -c <short-topic>`.
- Before opening a pull request, run `npm run check`, `npm run lint` and `npm test` locally.
- Open a pull request with `gh pr create`. CI ("Lint, build and test") must pass before it can merge.
- Render builds a preview site for every pull request; its link appears on the PR. Check the change there.
- Merge with `gh pr merge --squash --delete-branch` once CI is green. Merging deploys to the live site.
- If `main` moved while you worked, rebase your branch on it (`git pull --rebase origin main`) and re-run the tests. Do not remove features another change added unless the user asked for it.

## Tests

- `npm test` runs the Playwright tests in `tests/` against the dev server. Firebase is replaced by in-browser fakes (`tests/fake-firebase.js`), so tests never touch the real project.
- When you change a flow covered by `tests/smoke.spec.js` (sign-up, sign-in, password reset, sharing free days, invites), update the test in the same pull request.
- Local runs use the installed Microsoft Edge; CI installs Playwright's Chromium.

## Hosting and services

- Live site: https://eelj-mn.onrender.com, a Render static site defined in `render.yaml`. `npm run build` copies the site into `dist/`, which Render serves. Merges to `main` deploy automatically.
- GitHub Pages (`iamurhope0827-jpg.github.io/eelj-mn`) is the old host and is no longer used. Do not publish to a `chatgpt.site` host unless the user explicitly asks.
- Firebase project `tsagiinajil-bde42`: Authentication (Google and email/password) and Firestore (`seekers`, `invites`). The web config is `FIREBASE_CONFIG` at the top of `app.js`.
- Firestore security rules live in `firestore.rules`. They are published by pasting them into Firebase Console → Firestore Database → Rules; when you change them, tell the user to publish.
- Only `localhost` and `eelj-mn.onrender.com` are authorized Firebase domains, so Google sign-in does not work on PR preview sites. Email/password sign-in does.

## Local state

The old `.openai/` and `.impeccable/` directories are local historical tool state, excluded from the GitHub repository. Keep them out of public commits. Preserve the local `sites-source-archive` branch; it is not a publishing branch.
