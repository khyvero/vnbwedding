# Wedding Site Starter (Express + EJS + Prisma/SQLite)

Minimal, portable RSVP site you can deploy anywhere (shared hosting, Docker, or a small VM).

---

### **Project Status & Progress Log**

This section serves as a memory bank, tracking all development progress.

**Last Updated:** 2024-07-27

**✅ Completed Tasks:**

1.  **Shared Navigation & Site Consistency:**
    *   Refactored the main header into a reusable EJS partial (`views/partials/main-header.ejs`).
    *   The header now adapts its style: a transparent version for the homepage's hero section and a solid, light-themed version for all other internal pages.
    *   Added the shared navigation bar to the "Our Story" and "Photo Gallery" pages, ensuring a consistent user experience across the site.

2.  **Theming and Styling:**
    *   Changed the primary accent color for key elements to a deep blue (`#1E2A44`).
    *   Updated the footer background, RSVP button, and the sticky header's scroll background.
    *   Ensured the mobile menu background matches the new color scheme for a consistent look.

3.  **RSVP Button Functionality:**
    *   Fixed a bug causing the RSVP button to be unresponsive.
    *   Implemented conditional logic: if the user is logged in, they are sent to the `/rsvp` page; otherwise, the access modal is shown first.
    *   After a successful login via the modal, the user is correctly redirected to their original destination (`/rsvp`).

4.  **Access Modal & Page Error Handling:**
    *   The `/access` server route now correctly returns a JSON error response for invalid codes instead of an unfriendly redirect.
    *   The standalone `/access` page now uses JavaScript to handle form submissions, displaying validation errors on the page without a full reload.

5.  **Created "Our Story" Page:**
    *   Added a new server route for `/story`.
    *   Created the corresponding `story.ejs` view file with placeholder content.
    *   The navigation link now correctly leads to the new page.

6.  **RSVP Page UI & Logic:**
    *   Adjusted the layout to display the main "RSVP" title above the user's welcome message.
    *   Enhanced the form with conditional logic:
        *   The "transport" question is now only shown if the user is attending **both** the ceremony and the reception.
        *   All follow-up questions are hidden if the user selects "No" for both the ceremony and reception, streamlining the experience.
    *   Fixed a critical server error that occurred when a user submitted an RSVP indicating they were not attending either event.
    *   Adjusted spacing and margins within the form for better visual clarity.

7.  **Homepage Design & Layout:**
    *   Refined the hero section design by layering a dark gradient over a light blue (`#B9D6E6`) one, creating a unique photo tint while maintaining text readability.
    *   Implemented a responsive hamburger menu for mobile devices.
    *   Made the header "sticky" so it remains visible on scroll, with a background effect for readability.
    *   Restructured the header layout to ensure the logo is always centered, regardless of screen size.

**⚠️ Next Steps:**

*   Add auth for `/admin`.
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
- Basic pages: Home, RSVP form, Admin dashboard (read-only).
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
