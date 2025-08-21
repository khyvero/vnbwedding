# Wedding RSVP & Guest Management Website

A complete, self-hostable wedding website built with Express, EJS, and PostgreSQL. This project provides a beautiful public-facing site for guests and a secure admin dashboard for managing RSVPs, the guest list, and invites.

---

## Features

- **Guest Experience:**
  - Modern, responsive design.
  - Public pages for Story, Travel, Gallery, etc.
  - Secure, code-based access for invited guests, with a seamless modal-based login flow.
  - Robust RSVP submission form.
- **Admin Dashboard (`/admin`):**
  - Secure password-protected access.
  - Centralized dashboard to view all RSVPs and guests at a glance.
  - Full CRUD (Create, Read, Update, Delete) functionality for the guest list and invites.
  - Advanced filtering and search capabilities.
  - **Download guest list as a formatted PDF.**
- **Technology Stack:**
  - **Backend:** Express.js
  - **Frontend:** EJS (Embedded JavaScript templates) for simple server-side rendering.
  - **Database:** PostgreSQL (for both development and production).
  - **Local Development:** Docker Compose for a consistent, one-command setup.
  - **Deployment:** Fully automated deployment using Ansible.

---

## Local Development Setup

Get the project running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### 1. Configure Environment

Create a new file named `.env` in the root of the project and add the following content. This file provides the connection string for your local database and sets the password for the admin dashboard.

```
# Local Database Connection
DATABASE_URL="postgresql://vnbwedding_user:YOUR_DB_PASSWORD@localhost:5433/vnbwedding"

# Local Admin Password
ADMIN_PASSWORD=admin
```

- **Important:**
  - Replace `YOUR_DB_PASSWORD` with a password of your choice.
  - This same password must also be set in the `docker-compose.db.yml` file.
  - You can change the `ADMIN_PASSWORD` to whatever you like for local testing.

### 2. Start the Development Environment

Run the development script from your terminal:

```bash
# Make the script executable (only needs to be done once)
chmod +x start-dev.sh

# Run the script
./start-dev.sh
```

This script will:
1.  Start the PostgreSQL database in a Docker container.
2.  Apply all necessary database migrations.
3.  Start the development server.

### 3. Access the Application

- **Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Deployment (Ansible)

This project includes a complete Ansible playbook to deploy the application to a production Ubuntu/Debian server.

**Key Features**:
- **Nginx & HTTPS**: Installs Nginx as a reverse proxy and secures the site with a free Let's Encrypt SSL certificate.
- **PostgreSQL Database**: Deploys a robust PostgreSQL database in a Docker container.
- **Automated Setup**: The playbook handles everything from system dependencies to application configuration.
- **Process Management**: Runs the application as a `systemd` service for reliability.

**To Deploy**:
1.  **Install Ansible**: Ensure Ansible is installed on your local machine.
2.  **Configure Inventory**: Edit `ansible/inventory` and replace the placeholder IP and user with your server details.
3.  **Create Vault**: Create an Ansible Vault file (`ansible/vault.yml`) to store your secrets.
4.  **Run the Playbook**:
    ```bash
    ansible-playbook -i ansible/inventory ansible/playbook.yml --ask-vault-pass
    ```

---

## Development Log

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

10. **Automated Deployment & Local Development:**
    *   **Ansible Playbook:** Created a comprehensive Ansible playbook to fully automate the deployment process.
    *   **Dual Database Strategy:** The application is now configured to use PostgreSQL in production for robustness and SQLite in development for simplicity. The Ansible playbook automatically modifies the Prisma schema on the server during deployment.
    *   **Local Development Script:** Added a `dev.sh` script to streamline the local development setup, automatically configuring the environment for SQLite and running the necessary migrations.
    *   **Production Web Server & SSL:** The playbook now installs and configures Nginx as a reverse proxy and uses Certbot to automatically provision and renew a free Let's Encrypt SSL certificate, enabling HTTPS.

**⚠️ Next Steps:**

*   Unique invite links + QR codes.
*   Email invites (SMTP) with ICS attachment.
*   Theming (Tailwind via CDN or build pipeline).
