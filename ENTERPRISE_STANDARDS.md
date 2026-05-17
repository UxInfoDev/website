# Enterprise Application Standards & Guidelines

This document outlines the standard rules, patterns, and best practices followed in this enterprise-level application. All developers contributing to this repository are expected to adhere to these guidelines to ensure maintainability, scalability, security, and performance.

## 1. Architecture & Project Structure
- **Separation of Concerns:** Maintain a strict boundary between the Frontend (React/Vite) and Backend (Express/Node.js). 
- **Component-Based UI:** Keep React components modular, reusable, and single-responsibility.
- **Service Layer Pattern:** Backend business logic should be abstracted away from Express route controllers.
- **Environment Parity:** Keep development, staging, and production environments as similar as possible. Never hardcode environment-specific URLs or secrets.

## 2. Coding Standards & Clean Code
- **Naming Conventions:**
  - Variables/Functions: `camelCase` (e.g., `fetchUserData`)
  - React Components/Classes: `PascalCase` (e.g., `UserProfile`)
  - Constants/Env Variables: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
  - Files: `PascalCase` for React components (`Button.jsx`), `kebab-case` for utils/configs (`api-client.js`).
- **Immutability:** Treat state as immutable. Use functional array methods (`map`, `filter`, `reduce`) instead of mutating arrays.
- **DRY & SOLID:** Do Not Repeat Yourself. Ensure classes/modules have a single responsibility.
- **Linting & Formatting:** Always run ESLint and Prettier before committing code to ensure uniform syntax and formatting.

## 3. Frontend Guidelines (React & Tailwind)
- **State Management:** Use local state (`useState`, `useReducer`) for component-specific state. Use Context API for global state (e.g., Theme, Auth). Avoid over-engineering with complex state libraries unless strictly necessary.
- **Tailwind CSS:** Use Tailwind utility classes for styling. Avoid writing custom CSS in `index.css` unless defining base theme variables, complex animations, or overriding third-party library styles.
- **Responsive Design:** Follow a mobile-first approach. Ensure all UI components render perfectly on mobile, tablet, and desktop viewports.
- **Accessibility (a11y):** Use semantic HTML. Include `aria-labels` for icon buttons, `alt` text for images, and ensure keyboard navigability.

## 4. Backend & API Guidelines (Node.js & Express)
- **RESTful API Design:** Use appropriate HTTP methods (GET, POST, PUT, DELETE). Return standard HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error).
- **Validation:** Always validate and sanitize incoming request payloads (e.g., using `zod` or `express-validator`) before processing them. Never trust client input.
- **Pagination & Filtering:** Any endpoint returning a list of items must support pagination, sorting, and filtering to prevent performance degradation with large datasets.

## 5. Security Best Practices
- **Authentication & Authorization:** Use secure, HttpOnly cookies or short-lived JWTs for authentication. Implement strict Role-Based Access Control (RBAC) on backend routes.
- **Data Protection:** Never log sensitive information (passwords, PII, tokens). Hash passwords using robust algorithms (e.g., `bcrypt` or `argon2`) before storing them.
- **Headers & Protection:** Use middleware like `helmet` to set secure HTTP headers. Ensure CORS is strictly configured to only allow trusted origins.
- **SQL Injection Prevention:** Always use parameterized queries (via `pg` pool parameterized arrays) to prevent SQL injection.

## 6. Error Handling & Logging
- **Global Error Handling:** Use a centralized Express error-handling middleware. Do not leak stack traces in production responses.
- **Frontend Fallbacks:** Implement React Error Boundaries to prevent the entire app from crashing due to a component error.
- **Meaningful Logs:** Log actionable, structured data on the backend. Distinguish between `info`, `warn`, and `error` levels.

## 7. Performance Optimization
- **Asset Optimization:** Compress images (WebP format preferred). Lazy load heavy images or components that are below the fold.
- **Database Indexing:** Add indexes to PostgreSQL columns that are frequently used in `WHERE`, `ORDER BY`, or `JOIN` clauses.
- **Query Optimization:** Avoid `SELECT *`. Only fetch the columns required by the client. Avoid N+1 query problems.

## 8. Version Control & Git Workflow
- **Commit Messages:** Write descriptive, imperative commit messages (e.g., "Add user authentication middleware").
- **Branching Strategy:** Use feature branching (e.g., `feature/login-page`, `bugfix/header-alignment`).
- **Pull Requests:** All code must be reviewed via a PR before merging to the `main` branch. Ensure CI checks (linting, build, tests) pass before merging.
