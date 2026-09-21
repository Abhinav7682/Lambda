name: e-commerce-architectural-standards
activation: always
---
# Project Constraints and Architecture

## Technology Stack
*   **Backend:** All backend logic must be exclusively written in Node.js utilizing the Express framework. Do not use Python, Django, or Flask.
*   **Web Server:** The application will be managed by systemd (or PM2) and reverse-proxied by Nginx on Amazon Linux 2023. Do not generate configuration files for Apache or Ubuntu.
*   **Database:** Utilize a lightweight SQLite database (via the better-sqlite3 or sqlite3 npm package) for product information to minimize overhead on the AWS t3.micro instance.

## Code Quality and Style
*   **Formatting:** Make sure all Node.js code is styled and formatted using standard Prettier and ESLint configurations.
*   **Error Handling:** Generate robust error handling for all Express routes. Return proper HTTP status codes (e.g., 404 for missing products, 500 for internal errors).
*   **Artifacts:** Produce implementation plan Artifacts before making direct file modifications.
