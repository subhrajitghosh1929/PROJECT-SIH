# 🏆 Smart India Hackathon (SIH) Demo & Pitch Guide
## Project: **TransitMate** — Smart Urban Transit Companion & Crowd Intelligence

---

## 🎯 1. Problem Statement & SIH Objective
- **Problem:** Urban public transit commuters in dense Indian cities (like Kolkata, Delhi, Mumbai, Bengaluru) face severe uncertainties: unpredictably crowded buses/metro coaches, station platform bottleneck delays, dynamic route trade-offs, and lack of real-time verified ground updates.
- **Solution (TransitMate):** An end-to-end full-stack smart transit platform featuring **multi-criteria routing** (Fastest vs Cheapest vs Least Crowded), **coach-by-coach platform gate crowd intelligence**, **AI-driven rush-hour advisories**, **real-time GTFS/GPS vehicle simulation**, and **crowdsourced commuter verification**.

---

## 🚀 2. How to Run for Demo (One Command)

From the root project directory:
```bash
# Start both Backend and Frontend concurrently
npm run dev:all
```
- **Frontend URL:** `http://localhost:5173`
- **Protected Admin Portal:** `http://localhost:5000/admin`
- **Backend API & WebSockets:** `http://localhost:5000`
- **Unique Admin Gmail:** `transitmate.sih.admin@gmail.com`
- **Admin Password:** `TransitAdmin#2026!SIH`
- **Security:** Role-Based Access Control (RBAC) — only verified admin accounts can access the admin portal and controls.

*(Alternatively, run in separate terminals: `npm run backend` and `npm run dev`)*

---

## 💡 3. Step-by-Step Live Demo Flow for SIH Judges

### Step 1: Authentication & User Preferences (60 seconds)
1. Open the app in browser. Point out the top status badge showing **🟢 Backend Live (Port 5000)**.
2. Sign in as demo user or create a new account (handled via JWT + bcrypt on backend `POST /api/auth/register`).
3. Mention that guest sessions and user preferences (distance in meters/feet, default route priority, dark/light theme) are stored in the backend database.

### Step 2: Smart Multi-Modal Route Recommender (60 seconds)
1. On Home Screen, search `"Park Street"` or tap one of the frequent trips (**Home**, **Office**, **Esplanade**).
2. Show the **3 compared transit options**:
   - **Fastest:** Direct Metro / Bus with lowest duration.
   - **Cheapest:** Budget-friendly bus route with fare savings in ₹.
   - **Least Crowded (Calm):** Route with guaranteed seating and lower coach density.
3. Highlight that options automatically resort based on the user's default transit priority setting.

### Step 3: Real-Time Live Tracking & GPS Simulation (90 seconds)
1. Tap on a route (e.g. **Route 12** or **Metro Blue Line**).
2. Show the live **Approach Phase**:
   - Live mini-map showing the simulated bus/train moving along the corridor towards the passenger.
   - Real-time ETA to board and dynamic "stops away" counter streaming from the backend.
3. Tap **"Check coach crowd levels"** to open **Seat & Crowd Intelligence**:
   - For Metro: Displays **Coach 1 to Coach 6** with live crowd levels (Low, Medium, High).
   - **Platform Gate Proximity:** Calculates the exact walking distance (e.g., Gate 3 -> 0m, Gate 2 -> 24m) and automatically recommends the least crowded coach closest to the commuter's platform entry point.
4. Tap **"I've boarded"** to transition to the **Boarded Phase**:
   - Live stop-by-stop checkpoint progression (e.g., Sector V -> Karunamoyee -> Nicco Park).
   - Dynamic arrival detection dialog saving trip to the user's backend commute analytics.

### Step 4: AI Habit Analyzer & Cab Savings (60 seconds)
1. Navigate to the **Habits screen** (tap the profile avatar on Home).
2. Show the dynamic **Recharts Weekly Minutes Bar Chart** (`GET /api/habits/stats`).
3. Highlight **₹340 Saved vs. Cab** and the **AI Rush-Hour Advisory** ("Beat the rush: head out in the next 8 min to avoid the 7:00 PM Route 12 crowd surge").

### Step 5: Crowdsourced Commuter Reports & Live Verification (60 seconds)
1. Switch to the **Community screen**.
2. Tap a quick report button (e.g., **Delay**, **Crowd**, **Platform**) or write a custom report.
3. The report is submitted to the backend (`POST /api/community/posts`) and instantly appears in the feed.
4. Tap **"Still happening"** to demonstrate live upvoting/confirmation counter.

### Step 6: SIH Jury "Wow Factor" — Delay Injection Simulation
Open a browser tab or Postman and hit:
```bash
# Inject a 10-minute traffic delay to Route 12
curl -X POST http://localhost:5000/api/admin/inject-delay \
  -H "Content-Type: application/json" \
  -d '{"tripKey": "home", "delayMinutes": 10, "reason": "Waterlogging near Nicco Park"}'
```
Show judges that the vehicle ETA dynamically updates, a disruption alert is automatically generated, and the system recommends alternate metro routes!

---

## 🛠️ 4. Technical Architecture Summary
- **Backend Framework:** Node.js, Express.js (ES Modules)
- **Real-Time Layer:** Socket.IO WebSocket Engine
- **Database & Storage:** Persistent disk database with pre-seeded transit network (`backend/data/database.json`)
- **Security:** JSON Web Tokens (JWT), bcryptjs password hashing, CORS security headers
- **Frontend:** React 18, Tailwind CSS, Lucide Icons, Recharts, Vite

---

## 🎤 5. Pitch One-Liner
> *"TransitMate transforms unpredictable urban commuting into a seamless, data-driven experience by merging multi-criteria routing, coach-level platform intelligence, and real-time crowdsourced verification."*
