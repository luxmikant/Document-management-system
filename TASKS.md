# DMS (1-Day MVP) — Task Plan

Scope (ONLY for today):
- Authentication (register/login, JWT)
- Document upload (PDF/images), metadata
- Tagging (add/edit/remove tags on a document)
- Search + filter (by keyword + tags)
- Permissions (viewer/editor) per document
- Versioning (new version on re-upload/update)
- Responsive pages (basic)

Non-goals (explicitly out of scope today):
- Password reset, email verification, SSO
- Folders/trash/audit logs/sharing links
- Diffing / compare versions / restore old versions
- Virus scanning, encryption, Redis, Docker, CI/CD

Definition of Done (MVP demo):
- A user can sign up/login.
- User uploads a PDF/image and adds tags.
- User searches documents by keyword and/or tag.
- Owner can grant another user `viewer` or `editor` access to a document.
- Viewer can see + download; Editor can edit tags and upload a new version.
- Each update creates a new version record; list versions per document.
- UI works on mobile + desktop widths (basic responsive layout).

---

## 0) Pre-flight (15–20 min)

**0.1 Choose the simplest architecture**
- Single repo with two folders:
  - `server/` (Node + Express + MongoDB)
  - `client/` (Angular)

**0.2 Local dependencies**
- Install/verify:
  - Node.js LTS
  - Angular CLI
  - MongoDB (local) OR MongoDB Atlas

**Acceptance check**
- `node -v`, `npm -v`, `ng version`, and MongoDB connection available.

---

## 1) Backend Skeleton + Auth (60–90 min)

**1.1 Create server skeleton**
- Express app structure:
  - `src/app.ts` (app)
  - `src/server.ts` (listen)
  - `src/routes/*`
  - `src/models/*`
  - `src/middleware/*`

**1.2 User model**
- Fields:
  - `email` (unique), `passwordHash`, `role` (default `user`)
  - `createdAt`, `updatedAt`

**1.3 Auth endpoints (JWT)**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`

**Implementation notes (keep it fast):**
- Password hashing: `bcrypt`
- JWT: access token only (no refresh today)
- Middleware: `requireAuth` verifies JWT

**Acceptance checks**
- Register returns `201` and token.
- Login returns `200` and token.
- `/me` returns the current user with valid token.

---

## 2) Data Model: Document + Version + Permission (60–75 min)

**2.1 Document model**
- Fields:
  - `title` (display name)
  - `originalFilename`
  - `mimeType`, `size`
  - `ownerId`
  - `tags: string[]`
  - `currentVersionNumber`
  - `createdAt`, `updatedAt`

**2.2 Version model**
- Fields:
  - `documentId`
  - `versionNumber`
  - `storageKey` (path/filename on disk)
  - `uploadedBy`
  - `mimeType`, `size`
  - `createdAt`

**2.3 Permission model (embedded or separate)**
Fastest approach for MVP: embed in Document:
- `acl: [{ userId, access: 'viewer' | 'editor' }]`

**2.4 Indexes (minimum viable)**
- `Document.ownerId`
- `Document.tags`
- Text index on `Document.title` + `originalFilename`

**Acceptance checks**
- Can create a document record with tags.
- Can create a version record and increment versionNumber.

---

## 3) File Upload + Versioning (90–120 min)

**3.1 Storage choice (today)**
- Use local disk storage (`/uploads`) to avoid S3 complexity.
- Store file path as `storageKey` in Version.

**3.2 Upload endpoint**
- `POST /api/documents`
  - multipart form-data: file + `title` + `tags[]`
  - creates Document + Version(1)

**3.3 Update/Re-upload creates new version**
- `POST /api/documents/:id/version`
  - multipart form-data: file (optional) + tags/title updates (optional)
  - always creates a new Version when a file is provided
  - increments `currentVersionNumber`

**3.4 Validation**
- Allowed mime types: `application/pdf`, `image/png`, `image/jpeg`, `image/webp`
- Max size: pick one simple limit (e.g., 10MB)
- Return clear errors: `400` (bad file), `413` (too large)

**Acceptance checks**
- Upload PDF/image works.
- Re-upload creates Version 2.
- `GET /api/documents/:id/versions` lists versions.

---

## 4) Permissions (60–90 min)

**4.1 Permission rules (keep minimal and consistent)**
- Owner: full access.
- Viewer: can list/view/download.
- Editor: viewer + can edit tags/title + upload new version.

**4.2 Permission endpoints**
- `GET /api/documents/:id/permissions` (owner only)
- `POST /api/documents/:id/permissions` (owner only)
  - body: `{ userId, access: 'viewer'|'editor' }`
- `DELETE /api/documents/:id/permissions/:userId` (owner only)

**4.3 Middleware helper**
- `canViewDocument(doc, user)`
- `canEditDocument(doc, user)`

**Acceptance checks**
- Non-owner without ACL cannot access.
- Viewer can view/download but cannot edit.
- Editor can edit tags and upload new version.

---

## 5) Search + Filter (60–90 min)

**5.1 List/filter endpoint**
- `GET /api/documents`
  - Query params:
    - `q` keyword
    - `tags` comma-separated

**5.2 Permissions-aware results**
- Results include:
  - owned docs OR docs where user appears in `acl`

**Implementation notes (fastest):**
- If `q` present: use MongoDB text search.
- If `tags` present: `{ tags: { $all: [...] } }` or `$in` (choose one and be consistent).

**Acceptance checks**
- Searching by title/originalFilename returns expected results.
- Filtering by tag returns expected results.
- User only sees docs they own or are granted.

---

## 6) Document Read/Preview/Download (45–60 min)

**6.1 Document details**
- `GET /api/documents/:id` (permission-aware)

**6.2 Download latest version**
- `GET /api/documents/:id/download` (streams latest version)

**6.3 Download a specific version**
- `GET /api/versions/:versionId/download`

**Acceptance checks**
- Viewer can download.
- Correct content-type headers set.

---

## 7) Angular UI (2.5–3.5 hours)

Pages/components (minimum):

**7.1 Auth**
- Login page
- Register page
- JWT stored in memory or localStorage (fastest: localStorage)

**7.2 Document list**
- Search input (`q`)
- Tag filter input (simple comma-separated)
- List shows: title, tags, owner indicator, updated time

**7.3 Upload**
- File picker + title + tags
- Progress indicator (basic)

**7.4 Document detail**
- Show metadata + tags + versions list
- Buttons:
  - Download latest
  - Upload new version (if editor/owner)

**7.5 Permissions UI (owner only)**
- Add permission by user email (UI resolves to userId via a backend lookup OR use a simple user search endpoint)
- List current ACL; remove access

**Responsive requirement**
- Use Angular Material or Bootstrap grid (pick one) and ensure:
  - mobile: stacked inputs and buttons
  - desktop: search + upload aligned

**Acceptance checks**
- Mobile width works without horizontal scroll.
- End-to-end flow: register → upload → tag → search → share permission → view as other user.

---

## 8) Error Handling + Demo Polish (45–60 min)

**Backend**
- Central error middleware
- Consistent error shape:
  - `{ message, code }`

**Frontend**
- Toast/snackbar on upload failure with “retry upload” message
- Loading states for list/detail

**Acceptance checks**
- Upload failure shows a clear retry prompt.
- Unauthorized actions show a clear message.

---

# Time Budget (suggested)
- Backend auth + models: ~2.5h
- Upload + versioning + download: ~2.5h
- Permissions + search: ~2.5h
- Angular UI + responsive + wiring: ~3h
- Buffer: ~1.5h

Total: ~12 hours (full day).

---

# Cutline (if you fall behind)
If time is running out, cut in this order (highest cut first):
1) Permissions UI (keep API, minimal UI)
2) Download specific version (keep download latest)
3) Full text search (fallback to regex title search)
4) Version list UI (keep versioning in DB)

---

# Minimal API Checklist (for today)
Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET  `/api/users/me`

Documents
- POST `/api/documents` (upload new)
- GET  `/api/documents` (search/filter, permission-aware)
- GET  `/api/documents/:id`
- POST `/api/documents/:id/version` (new version)
- GET  `/api/documents/:id/versions`
- GET  `/api/documents/:id/download`

Permissions
- GET    `/api/documents/:id/permissions`
- POST   `/api/documents/:id/permissions`
- DELETE `/api/documents/:id/permissions/:userId`

Versions
- GET `/api/versions/:versionId/download`
