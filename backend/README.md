# 🚆 TransitMate — Backend API & Real-time Transit Engine

> **Smart India Hackathon (SIH) Backend System**  
> An intelligent, multi-modal urban transit routing, coach-by-coach crowd estimation, and crowdsourced incident response platform.

---

## 🏗️ Architecture Overview

```
[ Frontend (React + Vite + Socket.IO Client) ]
                     │  ▲
       REST Requests │  │ WebSocket Events (Live GPS, Alerts, Upvotes)
                     ▼  │
        [ Express.js + Socket.IO Server (Port 5000) ]
        ├── /api/auth       -> JWT Auth, bcrypt, Profile & Preferences
        ├── /api/routes     -> Multi-criteria Route Engine (Fastest / Cheapest / Calm)
        ├── /api/track      -> Live Vehicle Telemetry & Coach-by-Coach Crowd Intelligence
        ├── /api/alerts     -> Disruption Feed & AI Rush-Hour Predictive Tips
        ├── /api/habits     -> Commuter Weekly Analytics & Cab Savings Predictor
        ├── /api/community  -> Crowdsourced Reporting & Live Confirmations
        └── /api/admin      -> Evaluator Demo Tools (Delay Injection & Metrics)
                     │
        [ Simulation Engine & Persistent Storage ]
        ├── GTFS/GPS Waypoint Ticker (Every 2.5s)
        └── Embedded JSON / SQLite Database (backend/data/database.json)
```

---

## ⚡ Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Run the Server
```bash
# Production / Standard run
npm start

# Or with live auto-reload
npm run dev
```

The server starts at `http://localhost:5000`.

---

## 📡 REST API Reference

### 🔐 1. Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new commuter (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Login and receive JWT token (`email`, `password`) |
| `POST` | `/api/auth/guest` | Instant one-click guest session |
| `GET`  | `/api/auth/me` | Fetch authenticated commuter profile (`Bearer <JWT>`) |
| `PUT`  | `/api/auth/preferences` | Update theme, route priority, unit preference, preferred modes |
| `DELETE` | `/api/auth/account` | Delete user account and habit history |

### 🗺️ 2. Routes & Transit Recommender (`/api/routes`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/routes/quick-destinations` | Quick-pick destinations (Home, Office, Esplanade) |
| `GET` | `/api/routes/search?destination=...&priority=...` | Dynamic multi-criteria routing (Fastest, Cheapest, Calm) |
| `GET` | `/api/routes/:tripKey` | Detailed route sets, stops, and approach metadata |

### 🛰️ 3. Live Tracking & Crowd Intelligence (`/api/track`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/track/:tripKey` | Real-time vehicle speed, stops away, ETA to board, and progress |
| `GET` | `/api/track/:tripKey/crowd-map?gate=2&unit=metric` | Coach-by-coach (1-6) crowd breakdown + distance from platform gate |
| `POST` | `/api/track/:tripKey/board` | Mark passenger boarded to advance route leg |

### 🔔 4. Alerts & Disruptions (`/api/alerts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/alerts?filter=all\|delay\|crowd\|predictive\|community` | Filtered live alerts |
| `POST` | `/api/alerts` | Broadcast transit disruption (Transit Authority) |

### 📊 5. Habits & Analytics (`/api/habits`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/habits/stats` | Weekly chart minutes, trips count, money spent, and ₹ savings vs cab |
| `POST` | `/api/habits/record-trip` | Record completed trip into user habit history |

### 👥 6. Commuter Community (`/api/community`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/community/posts` | Live incident reports feed |
| `POST` | `/api/community/posts` | Post incident report (`type`, `message`, `routeLabel`) |
| `POST` | `/api/community/posts/:id/confirm` | Upvote / "Still happening" confirmation counter |
| `DELETE` | `/api/community/posts/:id` | Delete user's own report |

### 🛠️ 7. SIH Evaluator & Demo Tools (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | City-wide fleet telemetry, carbon saved, active disruptions |
| `POST` | `/api/admin/inject-delay` | Inject artificial traffic delay for live jury demonstration |
| `POST` | `/api/admin/reset` | Reset simulation & database to seed state |

---

## 🔄 Real-Time WebSockets (Socket.IO)

The backend broadcasts events in real-time on `ws://localhost:5000`:
- `vehicles:update` -> Live telemetry of all active transit vehicles every 2.5s.
- `community:new_post` -> Broadcasts when any commuter posts a new incident.
- `community:confirm_post` -> Updates live upvote count across all connected devices.
- `alert:new` -> Instant push notification for city-wide transit disruptions.

---

## 🏆 Key SIH Hackathon Highlights to Present to Judges
1. **Multi-Criteria Optimization:** Solves commuter trade-offs by dynamically comparing Fastest, Cheapest, and Least-Crowded routes.
2. **Coach-by-Coach Platform Gate Intelligence:** Directs passengers to the exact coach with available seats closest to where they enter the station, reducing station dwell time.
3. **Crowdsourced Verification with Time Decay:** Empowers commuters to confirm live delays with fraud-resistant upvote mechanisms.
4. **Carbon & Cab Savings Analytics:** Visualizes environmental impact and economic savings against cab aggregators.
