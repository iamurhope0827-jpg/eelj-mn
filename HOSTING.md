# Hosting

- Provider: Render (static site), defined in `render.yaml`.
- Source repository: https://github.com/iamurhope0827-jpg/eelj-mn
- Publishing branch: `main`. Render auto-deploys on every push.
- Build: `npm run build` copies `index.html`, `styles.css`, `app.js`, and `assets/` into `dist/`, which Render serves.

Push the updated source to `main` to publish changes. No server, credentials in source, or third-party runtime is required. The prototype uses browser-local demo data, as documented in README.md.

GitHub Pages (https://iamurhope0827-jpg.github.io/eelj-mn/) was the previous host and can be turned off once the Render URL is live.
