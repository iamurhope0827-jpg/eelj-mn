# Ээлж prototype

A Mongolian student shift marketplace in plain HTML, CSS, and JavaScript, with a monochrome Geist-based design (light and dark).

## Run

Requires Node.js. No package installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173/. Use the `PORT` environment variable to choose another local port.

```sh
npm run check
npm run build
```

The build copies the website into `dist/` for optional static export. GitHub Pages serves the root files from the `main` branch; pushes publish updates automatically. The empty `.nojekyll` file keeps the site as plain static files.

Live prototype: https://iamurhope0827-jpg.github.io/eelj-mn/

Repository: https://github.com/iamurhope0827-jpg/eelj-mn

## Try the connected workflow

1. On the landing page, choose “Бүртгүүлэх”, pick “Ажил горилогч”, and create an account with your name, email, and a password of at least 8 characters, or use “Google-ээр бүртгүүлэх”. A verification email is sent; later visits use “Нэвтрэх”, and “Нууц үгээ мартсан уу?” sends a reset link.
2. Filter shifts by role and district, sort, save a job, or open its details.
3. Apply to a shift, then open “Миний хүсэлтүүд” to see the received application.
4. Open the profile menu (top right) → “Ажил олгогч болох” → “Ирсэн хүсэлтүүд”. Change the application to reviewing, selected, or declined.
5. Switch back with “Ажил горилогч болох” and check “Миний хүсэлтүүд” for the same status. Withdraw a selected request to release its place.
6. In employer mode, create, edit, pause, or reopen a sample shift. “Гарах” in the profile menu returns to the landing page.

The footer has a reset action with confirmation. Seed shifts use upcoming dates calculated in the Asia/Ulaanbaatar timezone.

## Prototype boundaries

Listings and employers are examples. Both roles share the same data in this browser's `localStorage` under `eelj.prototype.v1`. Applications keep a snapshot of the shift terms at submission. A selected application consumes one opening; full shifts disappear from available results. Saved shifts remain viewable even if paused or full.

Accounts use Firebase Authentication (Google or email and password, verification and password-reset emails, sessions on every device); the web config is `FIREBASE_CONFIG` at the top of `app.js`. Students who mark free days are listed for employers through Firestore (`seekers/{uid}`: name, dates, hours, district, school, bio; no email or phone), and employer invitations to them are stored in `invites` and shown under “Миний хүсэлтүүд”. Job listings, applications, and the chosen role still live in this browser only. There is no remote database, real applications, employer notifications, payments, or cross-device sync. Role switching demonstrates the workflow and provides no production access control. Use sample contact data. The interface reports when browser storage is unavailable.

## Source

- `index.html`: page shell, navigation, and SVG icon symbols.
- `styles.css`: design tokens (light/dark), responsive layout, lists, dialogs, and accessibility states.
- `app.js`: sample data, persistence, student flows, and employer management.
- `assets/fonts/`: self-hosted Geist and Geist Mono (OFL, `OFL-Geist.txt`), plus Fira Sans (OFL) used only for the ₮ glyph.
- `SYSTEM-APPROACH.md`: researched operating approach and later pilot scope.
- `DESIGN.md`: visual tokens extracted from the implemented prototype.

Browser verification covered filters, saves, invalid contact handling, applications, persistence, employer decisions, create/edit/pause/resume, capacity, withdrawal, reset, escaped user text, dialogs, and horizontal overflow at 320, 390, 768, 1024, 1280, 1440, and 1586 pixels. Local verification captures are in ignored `artifacts/`.
