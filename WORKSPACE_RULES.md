# UX Infotech Workspace Rules & Best Practices

## 1. Visual & UX Standards
- **Banner Height**: The homepage banner MUST have a reduced height (`min-h-[30vh]` on mobile, `min-h-[35vh]` on desktop) to ensure the `ContactInfoBar` is visible "above the fold" on page load.
- **Aesthetics**: Maintain a premium, "shiny," and professional look. Use vibrant branding colors (Blue: `#0971C8`, Orange: `#ea580c`).
- **Animations**: Include subtle shine effects and decorative element rotations. Always respect `prefers-reduced-motion`.

## 2. Media & Asset Management
- **Image Resolution**: NEVER hardcode image paths. Always use the `resolveImageUrl` utility from `src/utils/media.js`.
- **Storage**: Local assets are stored in `public/uploads/`. References in the database and code should be prefixed with `/uploads/`.
- **Vite Proxy**: Do NOT proxy `/uploads` to the backend. Serve them locally via Vite to ensure high-performance loading during development.

## 3. Backend & Security
- **CORS/Helmet**: In `server.js`, Helmet's `crossOriginResourcePolicy` MUST be set to `{ policy: "cross-origin" }` to allow the frontend (port 3000) to load images from the backend (port 5000) if needed.
- **Static Serving**: The backend serves `public/uploads` via `app.use('/uploads', express.static(uploadDir))`.

## 4. Coding Practices
- **Persistence**: When refactoring, do NOT break existing logic (e.g., banner readability, image loading).
- **Decoupling**: Keep complex systems like particle overlays or confetti systems in separate components (e.g., `ConfettiOverlay.jsx`).
- **Data Fetching**: Use cache-busting queries for settings and banners (e.g., adding `?_t=timestamp`) to ensure the latest admin changes are reflected immediately.

## 5. Deployment
- Use the provided deployment scripts (`.\deploy.ps1`, `.\copy-to-publish.ps1`) to ensure consistent build artifacts.
