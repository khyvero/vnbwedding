# Wedding Site Starter (Express + EJS + Prisma/SQLite)

Minimal, portable RSVP site you can deploy anywhere (shared hosting, Docker, or a small VM).

---

### **Project Status & Progress Log**

This section serves as a memory bank, tracking all development progress.

**Last Updated:** 2024-07-31

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
    *   **Data Cleanup:** Removed the "Driving" option from the admin dashboard, as it is no longer a collected data point.
    *   **Advanced Filtering & UI:** Fully repaired the admin dashboard’s filtering controls, including dropdowns and “Select All/None” buttons. Duplicate filters now use AND logic for more precise searches. A new display area shows all active filters, providing at-a-glance visibility into the applied criteria.
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

7.  **Bridesmaids & Groomsmen Pages:**
    *   **Role-Based Access:** Created dedicated pages for bridesmaids (`/bridesmaids`) and groomsmen (`/groomsmen`) with placeholder content.
    *   **Secure Routes:** Implemented middleware to restrict access to these pages based on the logged-in guest's assigned group (`bridesmaids` or `groomsmen`).
    *   **Conditional UI:** Added buttons to the homepage hero section that are only visible to the respective group members, providing a clear and exclusive entry point to their dedicated content.

8.  **Bug Fixes & Stability:**
    *   **Role-Based Access:** Fixed a bug where the conditional "Groomsmen Info" button wasn't appearing due to a data normalization issue (`groomsman` vs. `groomsmen`). The user's group is now correctly standardized, ensuring role-based access works as intended.
    *   **RSVP Submission Flow:** Resolved two critical crashes that occurred after submitting the RSVP form by removing a reference to an obsolete `driving` variable in the `success.ejs` template and ensuring the `csrfToken` is correctly passed to all rendered pages.

9.  **Footer & Contact Info:**
    *   **Contact Details:** Updated the footer with the correct phone number (`+49 15204085370`) and wedding date (`03.10.2025`).
    *   **WhatsApp Integration:** Added a WhatsApp icon and link next to the phone number for easy communication.
    *   **Link Cleanup:** Reorganized the footer links into more logical groups ("Quick Links" and "Pages") for improved navigation.

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
