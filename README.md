# FileUploader

A multi-user file manager built with Node.js and Express. Users sign up, organize files into folders, upload by drag and drop, and download or delete them. Files live in Supabase Storage, and each user can only see their own.

I built this to practice full-stack fundamentals end to end: authentication, relational data modeling, file storage, and the security details that are easy to skip in a tutorial project.

## Screenshots

![File list](docs/files.png)

| Dark mode | Mobile |
| --- | --- |
| ![Dark mode](docs/dark.png) | ![Mobile view](docs/mobile.png) |

## Features

- Account signup and login with hashed passwords (bcrypt) and Passport sessions stored in Postgres
- Folders: create, rename, delete (deleting a folder also removes its stored files)
- Drag-and-drop or browse upload with a progress bar and multi-file support
- File cards showing type, size, and upload date; download and delete with a confirmation dialog
- Responsive layout with a mobile drawer, automatic dark mode, and toast notifications
- Accessible basics: keyboard-operable upload area, focus styles, labelled controls, reduced-motion support

## Tech stack

| Area | Choice |
| --- | --- |
| Server | Node.js, Express 4 |
| Views | Pug, one shared stylesheet with design tokens, vanilla JavaScript (no framework) |
| Auth | Passport (local strategy), express-session, bcryptjs |
| Data | PostgreSQL via Prisma ORM, sessions stored with `@quixo3/prisma-session-store` |
| File storage | Supabase Storage |
| Validation | express-validator, multer |

## Design and security decisions

- **Ownership checks on every query.** Files and folders are always looked up through the logged-in user, so guessing another user's ID returns a 404 instead of their data.
- **CSRF protection.** State-changing requests need a per-session token. Forms send it in a hidden field and the upload script sends it as a header. Deletes and logout are POST requests, never links.
- **Safe uploads.** Files are stored under unique keys (`<userId>/<uuid>-<name>`) so same-named files never overwrite each other. Uploads are size-limited and streamed from memory, so no temp files are left behind.
- **Private bucket.** Downloads go through the app, which checks ownership first, so the storage bucket can stay private.
- **Auth hygiene.** Passwords are never trimmed or escaped, login errors are generic so usernames can't be probed, login attempts are rate limited, and session cookies are `httpOnly` and `sameSite`.
- **Strict CSP.** No inline scripts or styles, so a Content-Security-Policy header can block injected code.

## Getting started

Requirements: Node 18+, a PostgreSQL database, and a Supabase project with a storage bucket (all available on free tiers).

```bash
git clone https://github.com/davidsan13/fileUploader.git
cd fileUploader
npm install
cp .env.example .env        # fill in the values
npx prisma generate
npx prisma db push
npm run dev                 # http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SESSIONSECRET` | Long random string for signing session cookies |
| `SUPA_URL`, `SUPABASE_KEY` | Supabase project URL and service key (server-side only) |
| `SUPABASE_BUCKET` | Storage bucket name (default `newFiles`) |
| `MAX_UPLOAD_MB` | Per-file upload limit (default 25) |

## Project structure

```
app.js, bin/www      App setup (sessions, passport, CSRF, security headers) and server entry
routes/              /users, /folders, /files (folder and file routes require login)
controllers/         Request handlers, all scoped to the current user
middleware/          Auth guards, CSRF, flash messages, rate limiting, passport strategy
lib/                 Shared Prisma client, Supabase storage helper, formatting helpers
views/, public/      Pug templates, stylesheet, client-side script
prisma/schema.prisma Data model: User, Folder, File, Session
```

## Lessons learned

- **A working login is only the start of auth.** The real work was making every folder and file query scoped to the logged-in user, adding CSRF tokens, and keeping login errors generic so usernames can't be probed.
- **Configuration bugs are easy to miss.** Loading `.env` after other modules had already read it, and a mis-formatted `SUPABASE_BUCKET` value, both caused failures that looked unrelated to the real cause.
- **Keep migrations in sync with the schema.** My first migration drifted from `schema.prisma`, so setup uses `prisma db push` until I re-baseline it.
- **Shared CSS and JavaScript pay off.** Moving duplicated inline styles and scripts into shared files made the UI consistent and allowed a strict Content-Security-Policy.

## What I'd build next

- Automated tests in the repo (I checked auth, CSRF, and cross-user access against an in-memory fake database, but haven't committed a test suite yet)
- Baseline the Prisma migrations so setup uses `migrate` instead of `db push`
- Nested folders, file rename and move, and shareable expiring links
- Image previews and a per-user storage quota

## Author

David San, [github.com/davidsan13](https://github.com/davidsan13)
