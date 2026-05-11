# UX Infotech - Project Standard Rules

## 🚀 Deployment Workflow
Follow this exact sequence for production updates:
1. **Build:** `npm run build` (Generates assets for both Frontend and Admin).
2. **Prepare:** `.\copy-to-publish.ps1` (Copies assets to `C:\Temp\uxinfotech-publish` excluding user uploads).
3. **Deploy:** `.\deploy.ps1` (Zips, uploads, and restarts the PM2 process).

**Critical:** The production directory is `/home/ubuntu/uxinfotech/`. Do not deploy files directly to `/home/ubuntu/`.

## 💻 Local Development
- **Frontend (Port 3000):** Run `npm run dev`.
- **Admin Dashboard (Port 3001):** Run `npm run admin-dev`.
- **Backend API (Port 5000):** Run `npm run server`.
- **Static Assets:** Local images must be served from `public/uploads`. Use `path.resolve(__dirname, 'public/uploads')` in `server.js` for Windows compatibility.

## 🏗️ Technical Stack
- **Frontend:** React 18 + Vite + Tailwind CSS.
- **Backend:** Node.js + Express 5 + PostgreSQL (Supabase).
- **Process Manager:** PM2 (Service name: `uxinfotech-backend`).
- **CDN/Security:** Cloudflare (Always perform a "Purge Cache" after major UI deployments).

## 📁 File Structure Rules
- **Public Assets:** All user-uploaded content must stay in `public/uploads`.
- **Admin Assets:** Admin-specific code lives in `src/admin/`.
- **Deployment Artifacts:** Keep `deploy.ps1` and `copy-to-publish.ps1` in the root and updated with correct environment paths.

## 🤖 Assistant Interaction
- Always verify pathing before deployment.
- Preserve comments and existing logic when modifying `server.js`.
- Confirm local functionality before proposing production pushes.
