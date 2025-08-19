# Wedding Site Starter (Express + EJS + Prisma/SQLite)

Minimal, portable RSVP site you can deploy anywhere (shared hosting, Docker, or a small VM).

---

### **Project Status & Progress Log**

This section serves as a memory bank, tracking all development progress.

**Last Updated:** 2024-07-29

**✅ Completed Tasks:**

1.  **Homepage Content & Styling:**
    *   **Locations Section:** Added a new "Locations" section to the homepage with details for the Ceremony and Party venues.
    *   **Layout Refinement:** The section's title is now correctly left-aligned, and the venues are presented in a clean, vertical list that matches the page's global style. Each location's details are on the left, with the directions button on the right.
    *   **Button Styling:** The "Show me directions" buttons have been styled to resemble Google Maps buttons, complete with a map pin icon, for a more intuitive user experience.

2.  **Layout & Navigation:**
    *   **Updated Navigation:** The main navigation links have been updated to: "Timeline", "Locations", "Story", and "Registry".
    *   **"Contact" Link:** The "Contact" button now smoothly scrolls the user to the footer of the page instead of navigating to a separate page.
    *   **Architectural Refactor:** The main header and footer have been centralized into the primary `layout.ejs` file for consistency.
    *   **Conditional Layout:** The header and footer are now conditionally rendered to hide them on administrative pages (e.g., `/admin`, `/login`), correctly separating the public site from the backend.
    *   **Bug Fixes:**
        *   Fixed a critical crash on the "Story" page caused by incorrect variables being passed to the layout.
        *   Resolved an issue where the site logo was broken on internal pages due to an incorrect file path.

3.  **Admin Dashboard Guest Management (CRUD):**
    *   **Add, Edit, Delete:** The admin dashboard is now fully functional, allowing for complete guest management.
    *   **Context-Aware Deletion:** The "Delete" functionality is now context-aware. Deleting a primary guest removes their entire party, while deleting a `+1` guest removes only that individual.
    *   **Bug Fixes:** Resolved multiple critical bugs, including an unresponsive "Add Guest" button and a recurring server crash caused by incorrect delete logic that conflicted with the database's cascading deletes.

4.  **Admin Authentication:**
    *   Secured the `/admin` routes using a password stored in the `ADMIN_PASSWORD` environment variable.
    *   Created a login page (`/admin/login`) and a logout route.
    *   Access is managed via a signed, HTTP-only cookie.

5.  **Theming and Styling:**
    *   Changed the primary accent color for key elements to a deep blue (`#1E2A44`).
    *   Updated the footer background, RSVP button, and the sticky header's scroll background.

6.  **RSVP & Access Flow:**
    *   Fixed a bug causing the RSVP button to be unresponsive.
    *   Implemented conditional logic to show the access modal if a user is not logged in.
    *   The `/access` route now correctly handles errors and redirects.

**⚠️ Next Steps:**

*   Unique invite links + QR codes.
*   Email invites (SMTP) with ICS attachment.
*   Theming (Tailwind via CDN or build pipeline).

---

## Quickstart

1. **Open in IntelliJ IDEA** (with Node.js plugin):
   - *File → Open...* and select the project folder.
   - Ensure **Node interpreter** is set (Settings → Languages & Frameworks → Node.js).

2. **Install deps** (Terminal inside IDE):
   ```bash
   npm install
   npx prisma generate
   cp .env.example .env
   ```

3. **Create DB & run migration**:
   ```bash
   npm run prisma:migrate
   npm run dev
   ```

4. Visit: http://localhost:3000

## What’s in the box

- **Express + EJS** server-rendered (no heavy front-end build).
- **Prisma + SQLite** (file at `prisma/dev.db`).
- Basic pages: Home, RSVP form, Admin dashboard.
- Security basics: Helmet, rate-limit, CSRF, cookie parsing.
- Ready for email, QR invites, ICS — stubs in `src/lib/`.

## Docker (optional)

```bash
docker build -t wedding-site .
docker run -p 3000:3000 --env-file .env -v $(pwd)/prisma:/app/prisma wedding-site
```

Or with Caddy reverse proxy:

```bash
docker compose up --build
```

Then browse http://localhost.
