# 💻 TransitMate — Terminal Commands & Cheatsheet Reference

This guide lists every terminal command available in the project, what it does, and when to use it during development and your **Smart India Hackathon (SIH)** live demonstration.

---

## 🚀 1. Primary Startup Commands

Run these from the root project folder: `transitmate-full-source subh/`

| Command | What It Does | When To Use |
| :--- | :--- | :--- |
| `npm run dev:all` | Starts **BOTH** Backend (Port 5000) and Frontend (Port 5173/5174) concurrently in a single terminal window. | **Recommended for complete full-stack demo & daily use.** |
| `npm run backend` | Starts only the Express.js + Socket.IO backend server on `http://localhost:5000`. | When you only want to test API endpoints or the Admin portal. |
| `npm run dev` | Starts only the Vite React frontend on `http://localhost:5173` (or `5174`). | When testing UI changes or front-end components. |
| `npm run build` | Builds the optimized production bundle in the `dist/` directory. | When preparing a production deploy or standalone build. |

---

## 🛠️ 2. First-Time Setup & Installation Commands

| Command | What It Does | When To Use |
| :--- | :--- | :--- |
| `npm install` | Installs root dependencies (React, Vite, Tailwind, Concurrently). | Run once when copying the project to a new computer. |
| `cd backend && npm install && cd ..` | Installs backend dependencies (Express, Socket.IO, JWT, bcryptjs). | Run once for backend setup on a new computer. |
| `node build-singlefile.js` | Generates the 100% standalone offline file `transitmate-singlefile.html`. | When you want to rebuild the single-file offline bundle. |

---

## 🧪 3. Automated Testing & Verification Commands

| Command | What It Does | When To Use |
| :--- | :--- | :--- |
| `node backend/test-server.js` | Runs an end-to-end automated test suite verifying all 7 backend API endpoints (Health, Auth, Routing, GPS, Crowd Map, Habits, Community). | To verify everything is working before presenting to judges. |
| `curl http://localhost:5000/api/health` | Performs an instant health check on the backend server. | To check if the backend is online and running. |

---

## 🎛️ 4. Live Hackathon (SIH) Admin & Demo Commands (cURL / Terminal)

Use these during your pitch to trigger real-time changes while the commuter app is open on screen!

### 1️⃣ Inject Simulated Traffic Delay (Demonstrates Dynamic Rerouting)
```bash
# Injects +10 min delay on Route 12 corridor
curl -X POST http://localhost:5000/api/admin/inject-delay \
  -H "Content-Type: application/json" \
  -d "{\"tripKey\": \"home\", \"delayMinutes\": 10, \"reason\": \"Waterlogging near Nicco Park Gate\"}"
```
* **Use:** Shows judges that the commuter app immediately increases ETA, broadcasts an alert, and suggests Metro alternatives.

### 2️⃣ Trigger Rush Hour / High Crowd Surge
```bash
curl -X POST http://localhost:5000/api/admin/set-crowd \
  -H "Content-Type: application/json" \
  -d "{\"tripKey\": \"home\", \"crowdLevel\": \"High\"}"
```
* **Use:** Demonstrates the Coach-by-Coach platform gate intelligence highlighting low-crowd coaches.

### 3️⃣ Broadcast City-Wide Emergency / Platform Notice
```bash
curl -X POST http://localhost:5000/api/admin/broadcast-alert \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Sector V Platform Maintenance\", \"message\": \"Platform 2 closed for repair — use Platform 1.\", \"routeLabel\": \"Metro · Blue\"}"
```
* **Use:** Demonstrates real-time broadcast push notifications to all commuters.

### 4️⃣ Inspect Live Fleet & System Metrics
```bash
curl http://localhost:5000/api/admin/metrics
```
* **Use:** Shows live active fleet telemetry, speeds, and aggregated carbon savings.

### 5️⃣ Reset Database & Fleet Simulation to Seed State
```bash
curl -X POST http://localhost:5000/api/admin/reset
```
* **Use:** Resets the whole system cleanly for the next round of presentation.

---

## 🖱️ 5. Zero-Terminal 1-Click Launchers (Double-Click in Windows Explorer)

If you don't want to type any commands in the terminal:

| File | What Happens When Double-Clicked |
| :--- | :--- |
| **`START_APP_WINDOWS.bat`** | Automatically installs packages if needed, starts backend & frontend, and opens the browser. |
| **`START_ADMIN_PORTAL.bat`** | Immediately opens the Transit Authority Admin Console. |
| **`START_OFFLINE_APP.bat`** | Opens the complete app offline (Zero Node.js required). |
| **`start_app_mac_linux.sh`** | 1-click startup script for macOS & Linux systems. |
