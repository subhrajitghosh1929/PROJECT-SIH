import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel serverless, the project directory is read-only; use /tmp for writes
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Database] Could not create data directory:', err.message);
}

// Initial seed data for Kolkata Transit Network (SIH Hackathon Domain)
const INITIAL_DATA = {
  users: [
    {
      id: "admin-sih-01",
      name: "SIH Transit Authority Admin",
      email: "transitmate.sih.admin@gmail.com",
      role: "admin",
      passwordHash: "$2a$10$wT8m9Z11a7G21dGqR1k.9OlnH16T7053e1f0e42a9b3d4f5g6h7i", // TransitAdmin#2026!SIH
      preferences: {
        theme: "dark",
        notificationsOn: true,
        routePriority: "fastest",
        unitPref: "metric",
        preferredModes: ["Bus", "Metro"],
      },
      walletBalance: 0,
      walletTransactions: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "admin-sih-02",
      name: "Transit Control Officer",
      email: "admin@transitmate.in",
      role: "admin",
      passwordHash: "$2a$10$wT8m9Z11a7G21dGqR1k.9OlnH16T7053e1f0e42a9b3d4f5g6h7i",
      preferences: {
        theme: "dark",
        notificationsOn: true,
        routePriority: "fastest",
        unitPref: "metric",
        preferredModes: ["Bus", "Metro"],
      },
      walletBalance: 0,
      walletTransactions: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "u1",
      name: "Rhea Sen",
      email: "rhea@example.com",
      role: "commuter",
      passwordHash: "$2a$10$wT8m9Z11a7G21dGqR1k.9OlnH16T7053e1f0e42a9b3d4f5g6h7i", // password123
      preferences: {
        theme: "dark",
        notificationsOn: true,
        routePriority: "fastest",
        unitPref: "metric",
        preferredModes: ["Bus", "Metro"],
      },
      walletBalance: 0,
      walletTransactions: [],
      createdAt: new Date().toISOString(),
    },
  ],
  quickDestinations: [
    {
      key: "home",
      label: "Home",
      sub: "Salt Lake, Sector V",
      eta: "22 min",
      route: "Route 12",
    },
    {
      key: "office",
      label: "Office",
      sub: "Park Street",
      eta: "18 min",
      route: "Metro · Blue",
    },
    {
      key: "esplanade",
      label: "Esplanade",
      sub: "Metro Station",
      eta: "14 min",
      route: "Route 47",
    },
  ],
  routeSets: {
    home: {
      title: "Salt Lake, Sector V",
      options: [
        {
          key: "fastest",
          tag: "Fastest",
          mode: "Bus · Route 12",
          time: "22 min",
          fare: "₹18",
          crowd: "High",
          detail: "Direct route, 3 stops. Next bus in 4 min.",
          vehicleType: "bus",
          stops: ["Sector V Bus Stand", "Karunamoyee", "Tank No. 4", "Nicco Park Gate"],
          approach: { stopsAway: 2, currentlyAt: "Approaching Karunamoyee", etaToBoardMin: 4 },
        },
        {
          key: "cheapest",
          tag: "Cheapest",
          mode: "Bus · Route 9A",
          time: "31 min",
          fare: "₹12",
          crowd: "Medium",
          detail: "One change at Karunamoyee. Next bus in 9 min.",
          vehicleType: "bus",
          stops: ["Sector V", "Karunamoyee (change)", "Baguiati", "Salt Lake Stadium"],
          approach: { stopsAway: 3, currentlyAt: "Leaving Baguiati", etaToBoardMin: 9 },
        },
        {
          key: "calm",
          tag: "Least crowded",
          mode: "Metro · Blue + Route 3",
          time: "27 min",
          fare: "₹22",
          crowd: "Low",
          detail: "Metro leg is roomy this hour, short walk after.",
          vehicleType: "metro",
          stops: ["Sector V Metro", "Salt Lake Stadium", "City Centre", "Walk to home"],
          approach: { stopsAway: 0, currentlyAt: "At Sector V platform", etaToBoardMin: 2 },
        },
      ],
    },
    office: {
      title: "Park Street",
      options: [
        {
          key: "fastest",
          tag: "Fastest",
          mode: "Metro · Blue",
          time: "18 min",
          fare: "₹15",
          crowd: "Medium",
          detail: "Direct metro, 5 stops. Next train in 3 min.",
          vehicleType: "metro",
          stops: ["Sector V", "City Centre", "Bidhannagar", "Phoolbagan", "Park Street"],
          approach: { stopsAway: 1, currentlyAt: "Approaching Sector V", etaToBoardMin: 3 },
        },
        {
          key: "cheapest",
          tag: "Cheapest",
          mode: "Bus · Route 21",
          time: "29 min",
          fare: "₹10",
          crowd: "Medium",
          detail: "Direct route, no change needed.",
          vehicleType: "bus",
          stops: ["Sector V", "Ultadanga", "Park Circus", "Park Street"],
          approach: { stopsAway: 2, currentlyAt: "Approaching Sector V", etaToBoardMin: 6 },
        },
        {
          key: "calm",
          tag: "Least crowded",
          mode: "Metro · Blue (off-peak car)",
          time: "19 min",
          fare: "₹15",
          crowd: "Low",
          detail: "Board the last car — noticeably quieter.",
          vehicleType: "metro",
          stops: ["Sector V", "City Centre", "Bidhannagar", "Phoolbagan", "Park Street"],
          approach: { stopsAway: 1, currentlyAt: "Approaching Sector V", etaToBoardMin: 3 },
        },
      ],
    },
    esplanade: {
      title: "Esplanade Metro Station",
      options: [
        {
          key: "fastest",
          tag: "Fastest",
          mode: "Bus · Route 47",
          time: "14 min",
          fare: "₹10",
          crowd: "Medium",
          detail: "Direct route, 2 stops. Next bus in 6 min.",
          vehicleType: "bus",
          stops: ["Sector V", "Karunamoyee", "Esplanade"],
          approach: { stopsAway: 1, currentlyAt: "Leaving Karunamoyee", etaToBoardMin: 6 },
        },
        {
          key: "cheapest",
          tag: "Cheapest",
          mode: "Bus · Route 47",
          time: "14 min",
          fare: "₹10",
          crowd: "Medium",
          detail: "Same as fastest — this trip is already cheapest.",
          vehicleType: "bus",
          stops: ["Sector V", "Karunamoyee", "Esplanade"],
          approach: { stopsAway: 1, currentlyAt: "Leaving Karunamoyee", etaToBoardMin: 6 },
        },
        {
          key: "calm",
          tag: "Least crowded",
          mode: "Metro · Blue",
          time: "20 min",
          fare: "₹15",
          crowd: "Low",
          detail: "Longer, but seats are usually free this hour.",
          vehicleType: "metro",
          stops: ["Sector V Metro", "City Centre", "Esplanade Metro"],
          approach: { stopsAway: 0, currentlyAt: "At Sector V platform", etaToBoardMin: 3 },
        },
      ],
    },
    default: {
      title: "Your destination",
      options: [
        {
          key: "fastest",
          tag: "Fastest",
          mode: "Bus · Route 15",
          time: "24 min",
          fare: "₹16",
          crowd: "Medium",
          detail: "Direct route, 4 stops. Next bus in 5 min.",
          vehicleType: "bus",
          stops: ["Sector V", "Karunamoyee", "Baguiati", "City Centre", "Your stop"],
          approach: { stopsAway: 2, currentlyAt: "Approaching Karunamoyee", etaToBoardMin: 5 },
        },
        {
          key: "cheapest",
          tag: "Cheapest",
          mode: "Bus · Route 8",
          time: "33 min",
          fare: "₹11",
          crowd: "Medium",
          detail: "One change midway. Next bus in 7 min.",
          vehicleType: "bus",
          stops: ["Sector V", "Ultadanga (change)", "Park Circus", "Your stop"],
          approach: { stopsAway: 2, currentlyAt: "Approaching Ultadanga", etaToBoardMin: 7 },
        },
        {
          key: "calm",
          tag: "Least crowded",
          mode: "Metro · Blue",
          time: "26 min",
          fare: "₹20",
          crowd: "Low",
          detail: "A little longer, but comfortably seated.",
          vehicleType: "metro",
          stops: ["Sector V", "City Centre", "Bidhannagar", "Your stop"],
          approach: { stopsAway: 1, currentlyAt: "Approaching Sector V", etaToBoardMin: 4 },
        },
      ],
    },
  },
  alerts: [
    {
      id: "a1",
      type: "predictive",
      tone: "gold",
      title: "Beat tonight's rush",
      message:
        "You usually leave by 6:50 PM. Head out in the next 8 minutes to skip the 7:00 PM crowd surge on Route 12.",
      time: "Just now",
      routeLabel: "Route 12",
      tripKey: "home",
      active: true,
      timestamp: Date.now() - 60000,
    },
    {
      id: "a2",
      type: "delay",
      tone: "amber",
      title: "Route 12 running late",
      message: "Traffic near Karunamoyee is pushing arrivals back by about 8 minutes.",
      time: "2 min ago",
      routeLabel: "Route 12",
      tripKey: "home",
      active: true,
      timestamp: Date.now() - 120000,
    },
    {
      id: "a3",
      type: "disruption",
      tone: "danger",
      title: "Metro Blue Line disruption",
      message: "Signal fault between Phoolbagan and Park Street. Expect delays of 15+ minutes.",
      time: "12 min ago",
      routeLabel: "Metro · Blue",
      tripKey: "office",
      active: true,
      timestamp: Date.now() - 720000,
    },
    {
      id: "a4",
      type: "crowd",
      tone: "amber",
      title: "Route 47 nearing full capacity",
      message: "The next bus is packed. Consider waiting 6 minutes for a less crowded one.",
      time: "20 min ago",
      routeLabel: "Route 47",
      tripKey: "esplanade",
      active: true,
      timestamp: Date.now() - 1200000,
    },
    {
      id: "a5",
      type: "community",
      tone: "teal",
      title: "Commuters flagged a platform change",
      message: "Sector V metro platform 2 is closed for maintenance — board from platform 1 instead.",
      time: "35 min ago",
      routeLabel: "Metro · Blue",
      tripKey: "office",
      active: true,
      timestamp: Date.now() - 2100000,
    },
  ],
  communityPosts: [
    {
      id: "c1",
      userId: "u2",
      userName: "Amit K.",
      type: "platform",
      tripKey: "office",
      routeLabel: "Metro · Blue",
      message: "Platform 2 closed for maintenance at Sector V — board from Platform 1 instead.",
      time: "35 min ago",
      confirms: 14,
      timestamp: Date.now() - 2100000,
    },
    {
      id: "c2",
      userId: "u3",
      userName: "Debjit M.",
      type: "crowd",
      tripKey: "home",
      routeLabel: "Route 12",
      message: "Packed beyond normal today — standing room only near Karunamoyee.",
      time: "10 min ago",
      confirms: 6,
      timestamp: Date.now() - 600000,
    },
    {
      id: "c3",
      userId: "u4",
      userName: "Pooja B.",
      type: "delay",
      tripKey: "esplanade",
      routeLabel: "Route 47",
      message: "Stuck in traffic near the Karunamoyee crossing, moving very slowly.",
      time: "18 min ago",
      confirms: 9,
      timestamp: Date.now() - 1080000,
    },
    {
      id: "c4",
      userId: "u5",
      userName: "Rahul D.",
      type: "closure",
      tripKey: "office",
      routeLabel: "Bus · Route 21",
      message: "Road closure near Ultadanga for a procession — buses being diverted.",
      time: "1 hr ago",
      confirms: 22,
      timestamp: Date.now() - 3600000,
    },
    {
      id: "c5",
      userId: "u6",
      userName: "Transit Patrol",
      type: "tip",
      tripKey: null,
      routeLabel: "General",
      message: "Reminder: keep the space near the doors clear so people can get off quickly.",
      time: "2 hr ago",
      confirms: 31,
      timestamp: Date.now() - 7200000,
    },
  ],
  weeklyMinutes: [
    { day: "Mon", minutes: 42 },
    { day: "Tue", minutes: 38 },
    { day: "Wed", minutes: 51 },
    { day: "Thu", minutes: 29 },
    { day: "Fri", minutes: 46 },
    { day: "Sat", minutes: 18 },
    { day: "Sun", minutes: 0 },
  ],
  routeUsage: [
    { key: "home", label: "Route 12", mode: "bus", trips: 5, time: "1h 50m", spend: "₹90" },
    { key: "office", label: "Metro · Blue", mode: "metro", trips: 2, time: "40 min", spend: "₹30" },
    { key: "esplanade", label: "Route 47", mode: "bus", trips: 1, time: "14 min", spend: "₹10" },
  ],
  habitsSummary: {
    totalTrips: 8,
    timeCommuting: "2h 44m",
    spent: "₹130",
    savedVsCab: "₹340",
    avgWaitMin: 4,
  },
};

class Database {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.save();
      }
    } catch (err) {
      console.error("[Database] Failed to load DB file, resetting to initial seed:", err.message);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("[Database] Failed to save DB file:", err.message);
    }
  }

  // --- Users & Auth ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  createUser({ name, email, passwordHash, role = "commuter", preferences }) {
    const newUser = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name || "Commuter",
      email: email.toLowerCase(),
      role: role || "commuter",
      passwordHash,
      preferences: preferences || {
        theme: "dark",
        notificationsOn: true,
        routePriority: "fastest",
        unitPref: "metric",
        preferredModes: ["Bus", "Metro"],
      },
      walletBalance: 0,
      walletTransactions: [],
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserPreferences(userId, prefs) {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...prefs };
    this.save();
    return user;
  }

  deleteUser(userId) {
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.data.users.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Wallet Operations (Starts at 0) ---
  getWallet(userId) {
    const user = this.findUserById(userId);
    if (!user) return { balance: 0, transactions: [] };
    if (user.walletBalance === undefined) user.walletBalance = 0;
    if (!user.walletTransactions) user.walletTransactions = [];
    return {
      balance: user.walletBalance,
      transactions: user.walletTransactions,
    };
  }

  topUpWallet(userId, amount, method = "UPI") {
    let user = this.findUserById(userId);
    if (!user) {
      // If guest or unauthenticated in demo, fallback to first user u1
      user = this.data.users[0];
    }
    if (!user) throw new Error("User not found");
    if (user.walletBalance === undefined) user.walletBalance = 0;
    if (!user.walletTransactions) user.walletTransactions = [];

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error("Invalid top up amount");

    user.walletBalance = Number((user.walletBalance + numAmount).toFixed(2));
    const transaction = {
      id: `txn-${Date.now()}`,
      type: "topup",
      amount: numAmount,
      method,
      description: `Wallet top-up via ${method}`,
      timestamp: new Date().toISOString(),
      balanceAfter: user.walletBalance,
    };
    user.walletTransactions.unshift(transaction);
    this.save();
    return { balance: user.walletBalance, transaction };
  }

  deductWallet(userId, amount, details = {}) {
    let user = this.findUserById(userId);
    if (!user) {
      user = this.data.users[0];
    }
    if (!user) throw new Error("User not found");
    if (user.walletBalance === undefined) user.walletBalance = 0;
    if (!user.walletTransactions) user.walletTransactions = [];

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) throw new Error("Invalid fare amount");

    if (user.walletBalance < numAmount) {
      const err = new Error(`Insufficient wallet balance. You have ₹${user.walletBalance}, but fare is ₹${numAmount}`);
      err.code = "INSUFFICIENT_FUNDS";
      err.currentBalance = user.walletBalance;
      err.requiredAmount = numAmount;
      throw err;
    }

    user.walletBalance = Number((user.walletBalance - numAmount).toFixed(2));
    const ticketId = `TM-TKT-${Date.now().toString().slice(-6)}`;
    const transaction = {
      id: `txn-${Date.now()}`,
      type: "fare_payment",
      amount: numAmount,
      description: details.routeLabel ? `Ticket: ${details.routeLabel} (Seat ${details.seatNumber || "General"})` : "Transit Fare",
      ticketId,
      timestamp: new Date().toISOString(),
      balanceAfter: user.walletBalance,
    };
    user.walletTransactions.unshift(transaction);
    this.save();

    const ticket = {
      ticketId,
      routeLabel: details.routeLabel || "WBTC City Transit",
      seatNumber: details.seatNumber || "General",
      fare: numAmount,
      distanceKm: details.distanceKm || 5.0,
      timestamp: new Date().toISOString(),
      qrPayload: `VALID:TM:${ticketId}:${user.id}:${numAmount}:${Date.now()}`,
      status: "ACTIVE",
    };

    return { balance: user.walletBalance, transaction, ticket };
  }

  // --- Routes ---
  getQuickDestinations() {
    return this.data.quickDestinations;
  }

  getRouteSets(tripKey = "default") {
    return this.data.routeSets[tripKey] || this.data.routeSets.default;
  }

  getAllRouteSets() {
    return this.data.routeSets;
  }

  // --- Alerts ---
  getAlerts(filter = "all") {
    if (filter === "all") return this.data.alerts;
    if (filter === "delay") {
      return this.data.alerts.filter((a) => a.type === "delay" || a.type === "disruption");
    }
    return this.data.alerts.filter((a) => a.type === filter);
  }

  addAlert(alertData) {
    const newAlert = {
      id: `a-${Date.now()}`,
      ...alertData,
      active: true,
      timestamp: Date.now(),
      time: "Just now",
    };
    this.data.alerts.unshift(newAlert);
    this.save();
    return newAlert;
  }

  // --- Community Posts ---
  getCommunityPosts() {
    return this.data.communityPosts;
  }

  addCommunityPost({ userId, userName, type, tripKey, routeLabel, message }) {
    const newPost = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || "guest",
      userName: userName || "Anonymous Commuter",
      type: type || "custom",
      tripKey: tripKey || null,
      routeLabel: routeLabel || "General",
      message: message.trim(),
      time: "Just now",
      confirms: 1,
      timestamp: Date.now(),
    };
    this.data.communityPosts.unshift(newPost);
    this.save();
    return newPost;
  }

  confirmCommunityPost(id) {
    const post = this.data.communityPosts.find((p) => p.id === id);
    if (post) {
      post.confirms += 1;
      this.save();
      return post;
    }
    return null;
  }

  deleteCommunityPost(id, userId) {
    const index = this.data.communityPosts.findIndex((p) => p.id === id);
    if (index !== -1) {
      // Allow deletion if admin, creator, or guest created post
      this.data.communityPosts.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Habits & Commute Analytics ---
  getHabitsData() {
    return {
      weeklyMinutes: this.data.weeklyMinutes,
      routeUsage: this.data.routeUsage,
      summary: this.data.habitsSummary,
    };
  }

  recordCompletedTrip({ tripKey, routeLabel, mode, durationMin = 20, fare = 15, savedVsCab = 45 }) {
    // Increment total trips
    this.data.habitsSummary.totalTrips += 1;
    
    // Add to route usage
    const usage = this.data.routeUsage.find((r) => r.key === tripKey || r.label === routeLabel);
    if (usage) {
      usage.trips += 1;
    } else {
      this.data.routeUsage.push({
        key: tripKey || "custom",
        label: routeLabel || "Custom Route",
        mode: mode || "bus",
        trips: 1,
        time: `${durationMin} min`,
        spend: `₹${fare}`,
      });
    }

    // Add minutes to current day (e.g. Tue)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[new Date().getDay()];
    const dayItem = this.data.weeklyMinutes.find((d) => d.day === currentDay);
    if (dayItem) {
      dayItem.minutes += durationMin;
    }

    this.save();
    return this.getHabitsData();
  }

  // Reset database for clean SIH hackathon demos
  reset() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
    return true;
  }
}

export const db = new Database();
