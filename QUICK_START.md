# 🚀 TransitMate — How to Run on ANY Computer (Zero-Setup)

> **No Antigravity or special software required!**  
> You can copy this folder to any computer (Windows, Mac, Linux) and run it using the simple steps below.

---

## ⚡ Option 1: Instant 1-Click Launch (Zero Node.js Required)

If the computer **does NOT have Node.js** installed, or you just want to demo immediately:

- **Windows:** Double-click **`transitmate-singlefile.html`** or **`START_OFFLINE_APP.bat`**.
- **Mac / Linux:** Double-click or open **`transitmate-singlefile.html`** in any browser (Chrome, Edge, Safari, Firefox).

*Everything (UI, simulation, routing, crowd maps, habit charts, alerts, community reports, admin console) is self-contained in that single file.*

---

## 💻 Option 2: Full-Stack Mode (With Live Backend & API)

If the computer has **Node.js** installed and you want to run the live backend and WebSocket server:

### On Windows:
1. Double-click **`START_APP_WINDOWS.bat`**
2. It will automatically check dependencies and launch both the backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) in your browser!

### On Mac / Linux:
1. Open Terminal in this folder.
2. Run:
   ```bash
   chmod +x start_app_mac_linux.sh
   ./start_app_mac_linux.sh
   ```

### Manual Command-Line Run (Any OS):
```bash
# 1. Install dependencies (first time only)
npm install
cd backend && npm install && cd ..

# 2. Start Full-Stack
npm run dev:all
```

- **Commuter App:** `http://localhost:5173` (or `http://localhost:5174`)
- **Restricted Admin Portal:** `http://localhost:5000/admin`
- **Unique Admin Gmail:** `transitmate.sih.admin@gmail.com`
- **Admin Password:** `TransitAdmin#2026!SIH`
- *(Access is restricted exclusively to Admin accounts. Regular commuters and guests cannot access admin tools).*

---

## 📂 Project Directory Breakdown

```
transitmate-full-source/
│
├── 🚀 1-CLICK LAUNCHERS
│   ├── transitmate-singlefile.html  <- 100% Standalone Offline File (Double-click to open)
│   ├── START_APP_WINDOWS.bat        <- 1-Click Full-Stack Launcher for Windows
│   ├── START_OFFLINE_APP.bat        <- 1-Click Offline Launcher for Windows
│   └── start_app_mac_linux.sh       <- 1-Click Launcher for Mac & Linux
│
├── 📁 backend/                      <- Complete Node.js + Express + Socket.IO Backend
│   ├── data/database.json           <- Persistent storage (Kolkata routes, users, trips)
│   ├── public/admin.html            <- Transit Authority Operations Web Portal
│   ├── routes/                      <- Auth, Routes, Tracking, Alerts, Habits, Community, Admin
│   ├── simulation.js                <- Real-time vehicle physics & crowd ticker
│   ├── server.js                    <- Main Express & Socket.IO server (Port 5000)
│   └── package.json                 <- Backend dependencies
│
├── 📁 src/                          <- React + Vite Full-Stack Frontend
│   ├── services/api.js              <- REST API client layer
│   └── App.jsx                      <- Connected UI with Admin Console
│
├── 📖 DOCUMENTATION
│   ├── QUICK_START.md               <- This guide
│   ├── SIH_DEMO_GUIDE.md            <- Hackathon pitch script for judges
│   └── backend/README.md            <- API reference and endpoints
```

---

## 🏆 For Smart India Hackathon (SIH) Judges
- **Pitch Script & Live Walkthrough:** Open [**`SIH_DEMO_GUIDE.md`**](file:///c:/Users/Subhrajit/Downloads/transitmate-full-source/SIH_DEMO_GUIDE.md).
- **Live Delay Injection:** Open the **Transit Authority Admin Console** at `http://localhost:5000/admin` to trigger live traffic delays during the presentation!
