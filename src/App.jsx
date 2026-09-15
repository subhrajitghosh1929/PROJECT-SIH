import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  MapPin,
  Search,
  Home as HomeIcon,
  Compass,
  Bell,
  Users,
  Sparkles,
  Briefcase,
  Building2,
  TrainFront,
  ArrowLeft,
  ArrowRight,
  Zap,
  Wallet,
  Wind,
  Bus,
  Clock,
  IndianRupee,
  CheckCircle2,
  Circle,
  Navigation,
  AlertTriangle,
  MessageCircle,
  ChevronRight,
  Armchair,
  ThumbsUp,
  Plus,
  Construction,
  Pencil,
  Send,
  Trash2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  Ruler,
  Server,
  RefreshCw,
  Shield,
  Activity,
  Radio,
  Sliders,
  Database,
} from "lucide-react";
import { api } from "./services/api.js";

const DEFAULT_QUICK_DESTINATIONS = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
    sub: "Salt Lake, Sector V",
    eta: "22 min",
    route: "Route 12",
  },
  {
    key: "office",
    label: "Office",
    icon: Briefcase,
    sub: "Park Street",
    eta: "18 min",
    route: "Metro · Blue",
  },
  {
    key: "esplanade",
    label: "Esplanade",
    icon: Building2,
    sub: "Metro Station",
    eta: "14 min",
    route: "Route 47",
  },
];

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "routes", label: "Routes", icon: Compass },
  { key: "track", label: "Track", icon: TrainFront },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "community", label: "Community", icon: Users },
];

const ROUTE_SETS = {
  home: {
    title: "Salt Lake, Sector V",
    options: [
      {
        key: "fastest",
        tag: "Fastest",
        icon: Zap,
        mode: "Bus · Route 12",
        time: "22 min",
        fare: "₹18",
        crowd: "High",
        detail: "Direct route, 3 stops. Next bus in 4 min.",
        vehicleType: "bus",
        tripKey: "home",
        stops: ["Sector V Bus Stand", "Karunamoyee", "Tank No. 4", "Nicco Park Gate"],
        approach: { stopsAway: 2, currentlyAt: "Approaching Karunamoyee", etaToBoardMin: 4 },
      },
      {
        key: "cheapest",
        tag: "Cheapest",
        icon: Wallet,
        mode: "Bus · Route 9A",
        time: "31 min",
        fare: "₹12",
        crowd: "Medium",
        detail: "One change at Karunamoyee. Next bus in 9 min.",
        vehicleType: "bus",
        tripKey: "home",
        stops: ["Sector V", "Karunamoyee (change)", "Baguiati", "Salt Lake Stadium"],
        approach: { stopsAway: 3, currentlyAt: "Leaving Baguiati", etaToBoardMin: 9 },
      },
      {
        key: "calm",
        tag: "Least crowded",
        icon: Wind,
        mode: "Metro · Blue + Route 3",
        time: "27 min",
        fare: "₹22",
        crowd: "Low",
        detail: "Metro leg is roomy this hour, short walk after.",
        vehicleType: "metro",
        tripKey: "home",
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
        icon: Zap,
        mode: "Metro · Blue",
        time: "18 min",
        fare: "₹15",
        crowd: "Medium",
        detail: "Direct metro, 5 stops. Next train in 3 min.",
        vehicleType: "metro",
        tripKey: "office",
        stops: ["Sector V", "City Centre", "Bidhannagar", "Phoolbagan", "Park Street"],
        approach: { stopsAway: 1, currentlyAt: "Approaching Sector V", etaToBoardMin: 3 },
      },
      {
        key: "cheapest",
        tag: "Cheapest",
        icon: Wallet,
        mode: "Bus · Route 21",
        time: "29 min",
        fare: "₹10",
        crowd: "Medium",
        detail: "Direct route, no change needed.",
        vehicleType: "bus",
        tripKey: "office",
        stops: ["Sector V", "Ultadanga", "Park Circus", "Park Street"],
        approach: { stopsAway: 2, currentlyAt: "Approaching Sector V", etaToBoardMin: 6 },
      },
      {
        key: "calm",
        tag: "Least crowded",
        icon: Wind,
        mode: "Metro · Blue (off-peak car)",
        time: "19 min",
        fare: "₹15",
        crowd: "Low",
        detail: "Board the last car — noticeably quieter.",
        vehicleType: "metro",
        tripKey: "office",
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
        icon: Zap,
        mode: "Bus · Route 47",
        time: "14 min",
        fare: "₹10",
        crowd: "Medium",
        detail: "Direct route, 2 stops. Next bus in 6 min.",
        vehicleType: "bus",
        tripKey: "esplanade",
        stops: ["Sector V", "Karunamoyee", "Esplanade"],
        approach: { stopsAway: 1, currentlyAt: "Leaving Karunamoyee", etaToBoardMin: 6 },
      },
      {
        key: "cheapest",
        tag: "Cheapest",
        icon: Wallet,
        mode: "Bus · Route 47",
        time: "14 min",
        fare: "₹10",
        crowd: "Medium",
        detail: "Same as fastest — this trip is already cheapest.",
        vehicleType: "bus",
        tripKey: "esplanade",
        stops: ["Sector V", "Karunamoyee", "Esplanade"],
        approach: { stopsAway: 1, currentlyAt: "Leaving Karunamoyee", etaToBoardMin: 6 },
      },
      {
        key: "calm",
        tag: "Least crowded",
        icon: Wind,
        mode: "Metro · Blue",
        time: "20 min",
        fare: "₹15",
        crowd: "Low",
        detail: "Longer, but seats are usually free this hour.",
        vehicleType: "metro",
        tripKey: "esplanade",
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
        icon: Zap,
        mode: "Bus · Route 15",
        time: "24 min",
        fare: "₹16",
        crowd: "Medium",
        detail: "Direct route, 4 stops. Next bus in 5 min.",
        vehicleType: "bus",
        tripKey: "default",
        stops: ["Sector V", "Karunamoyee", "Baguiati", "City Centre", "Your stop"],
        approach: { stopsAway: 2, currentlyAt: "Approaching Karunamoyee", etaToBoardMin: 5 },
      },
      {
        key: "cheapest",
        tag: "Cheapest",
        icon: Wallet,
        mode: "Bus · Route 8",
        time: "33 min",
        fare: "₹11",
        crowd: "Medium",
        detail: "One change midway. Next bus in 7 min.",
        vehicleType: "bus",
        tripKey: "default",
        stops: ["Sector V", "Ultadanga (change)", "Park Circus", "Your stop"],
        approach: { stopsAway: 2, currentlyAt: "Approaching Ultadanga", etaToBoardMin: 7 },
      },
      {
        key: "calm",
        tag: "Least crowded",
        icon: Wind,
        mode: "Metro · Blue",
        time: "26 min",
        fare: "₹20",
        crowd: "Low",
        detail: "A little longer, but comfortably seated.",
        vehicleType: "metro",
        tripKey: "default",
        stops: ["Sector V", "City Centre", "Bidhannagar", "Your stop"],
        approach: { stopsAway: 1, currentlyAt: "Approaching Sector V", etaToBoardMin: 4 },
      },
    ],
  },
};

const CROWD_STYLE = {
  Low: { color: "var(--tm-teal)", bg: "var(--tm-teal-soft)" },
  Medium: { color: "var(--tm-amber)", bg: "var(--tm-amber-soft)" },
  High: { color: "var(--tm-danger)", bg: "var(--tm-danger-soft)" },
};

const ALERT_TONE = {
  gold: { color: "var(--tm-accent)", bg: "var(--tm-accent-soft)" },
  amber: { color: "var(--tm-amber)", bg: "var(--tm-amber-soft)" },
  danger: { color: "var(--tm-danger)", bg: "var(--tm-danger-soft)" },
  teal: { color: "var(--tm-teal)", bg: "var(--tm-teal-soft)" },
};

const ALERT_FILTERS = [
  { key: "all", label: "All" },
  { key: "delay", label: "Delays" },
  { key: "crowd", label: "Crowd" },
  { key: "predictive", label: "Predictive" },
  { key: "community", label: "Community" },
];

const REPORT_TONE = {
  platform: { color: "var(--tm-teal)", bg: "var(--tm-teal-soft)", icon: MapPin },
  crowd: { color: "var(--tm-amber)", bg: "var(--tm-amber-soft)", icon: Users },
  delay: { color: "var(--tm-amber)", bg: "var(--tm-amber-soft)", icon: Clock },
  closure: { color: "var(--tm-danger)", bg: "var(--tm-danger-soft)", icon: Construction },
  tip: { color: "var(--tm-accent)", bg: "var(--tm-accent-soft)", icon: Sparkles },
  custom: { color: "var(--tm-body)", bg: "var(--tm-card-alt)", icon: MessageCircle },
};

const COMPOSE_ROUTE_OPTIONS = ["General", "Route 12", "Metro · Blue", "Route 47"];

const REPORT_TYPES = [
  { type: "delay", label: "Delay" },
  { type: "crowd", label: "Crowd" },
  { type: "closure", label: "Closure" },
  { type: "platform", label: "Platform" },
];

function matchDestination(text) {
  const t = text.trim().toLowerCase();
  if (!t) return "default";
  const found = DEFAULT_QUICK_DESTINATIONS.find(
    (q) => t.includes(q.sub.toLowerCase()) || t.includes(q.label.toLowerCase())
  );
  return found ? found.key : "default";
}

export default function TransitMateApp() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [routePriority, setRoutePriority] = useState("fastest");
  const [unitPref, setUnitPref] = useState("metric");
  const [preferredModes, setPreferredModes] = useState(["Bus", "Metro"]);
  const [screen, setScreen] = useState("home");
  const [destination, setDestination] = useState("");
  const [tripKey, setTripKey] = useState("default");
  const [trackingOption, setTrackingOption] = useState(null);
  const [hasNewAlerts, setHasNewAlerts] = useState(true);
  const [toast, setToast] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const toastTimer = useRef(null);

  const fireToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/health");
        if (res.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      api.auth.logout();
    } catch {}
    setAuthed(false);
    setScreen("home");
    setTrackingOption(null);
    setUserName("");
    setUserEmail("");
    setIsGuest(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.auth.deleteAccount();
    } catch {}
    fireToast("Your account has been deleted");
    handleLogout();
    setNotificationsOn(true);
    setRoutePriority("fastest");
    setUnitPref("metric");
    setPreferredModes(["Bus", "Metro"]);
  };

  const goToRoutes = (key, label) => {
    setTripKey(key);
    setDestination(label);
    setScreen("routes");
  };

  const handleSearch = () => {
    if (!destination.trim()) {
      fireToast("Enter a destination first");
      return;
    }
    goToRoutes(matchDestination(destination), destination);
  };

  const handleQuickPick = (item) => {
    goToRoutes(item.key, item.sub);
  };

  const handleNav = (item) => {
    if (item.key === "home") {
      setScreen("home");
      return;
    }
    if (item.key === "routes") {
      setScreen("routes");
      return;
    }
    if (item.key === "track") {
      if (trackingOption) {
        setScreen("track");
      } else {
        fireToast("Pick a route first to start tracking");
      }
      return;
    }
    if (item.key === "alerts") {
      setHasNewAlerts(false);
      setScreen("alerts");
      return;
    }
    if (item.key === "community") {
      setScreen("community");
      return;
    }
    fireToast(`${item.label} screen — coming in the next build`);
  };

  const handlePickRoute = (option) => {
    setTrackingOption(option);
    setScreen("track");
  };

  const tripSet = ROUTE_SETS[tripKey] || ROUTE_SETS.default;

  return (
    <div className={`tm-root ${theme === "light" ? "tm-light" : ""} min-h-screen w-full flex items-start justify-center p-6`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .tm-root {
          --tm-bg: #17161B;
          --tm-card: #1E1D23;
          --tm-card-alt: #26242C;
          --tm-border: rgba(255,255,255,0.08);
          --tm-heading: #F3EFE6;
          --tm-body: #B4B0A7;
          --tm-muted: #7C7970;

          --tm-accent: #C9A461;
          --tm-accent-soft: #C9A46126;
          --tm-accent-border: #C9A46145;
          --tm-accent-2: #E3C77E;

          --tm-teal: #45AD89;
          --tm-teal-soft: #45AD8926;
          --tm-teal-border: #45AD8945;

          --tm-amber: #D98B3F;
          --tm-amber-soft: #D98B3F26;
          --tm-amber-border: #D98B3F45;

          --tm-danger: #D9584A;
          --tm-danger-soft: #D9584A26;

          --tm-on-accent: #17161B;
          --tm-toast-bg: #0E0D11;
          --tm-toast-fg: #F3EFE6;

          background: var(--tm-bg);
          font-family: 'Inter', sans-serif;
          color: var(--tm-body);
        }
        .tm-root.tm-light {
          --tm-bg: #F5F4F1;
          --tm-card: #FFFFFF;
          --tm-card-alt: #F1F0EB;
          --tm-border: #E6E4DD;
          --tm-heading: #1B1A17;
          --tm-body: #5B5850;
          --tm-muted: #948F82;

          --tm-accent: #A6791F;
          --tm-accent-soft: #A6791F14;
          --tm-accent-border: #A6791F33;
          --tm-accent-2: #C99A3E;

          --tm-teal: #1E8F6F;
          --tm-teal-soft: #1E8F6F14;
          --tm-teal-border: #1E8F6F33;

          --tm-amber: #B8791F;
          --tm-amber-soft: #B8791F14;
          --tm-amber-border: #B8791F33;

          --tm-danger: #B7402E;
          --tm-danger-soft: #B7402E14;

          --tm-on-accent: #FFFFFF;
          --tm-toast-bg: #1B1A17;
          --tm-toast-fg: #FFFFFF;
        }
        .tm-root.tm-light .tm-phone-shadow {
          box-shadow: 0 24px 60px -24px rgba(22,22,27,0.18), 0 2px 10px rgba(22,22,27,0.06);
        }
        .tm-display { font-family: 'Inter', sans-serif; font-weight: 700; letter-spacing: -0.01em; color: var(--tm-heading); }
        .tm-mono { font-family: 'IBM Plex Mono', monospace; font-feature-settings: 'tnum' 1; }

        .tm-card { background: var(--tm-card); border: 1px solid var(--tm-border); }
        .tm-card-alt { background: var(--tm-card-alt); border: 1px solid var(--tm-border); }
        .tm-eyebrow { background: var(--tm-card-alt); color: var(--tm-body); letter-spacing: 0.06em; }

        .tm-phone-shadow { box-shadow: 0 28px 70px -24px rgba(0,0,0,0.65), 0 2px 12px rgba(0,0,0,0.4); }
        .tm-hover { transition: background-color 0.15s ease, border-color 0.15s ease; }
        .tm-hover:hover { background: var(--tm-card-alt); border-color: var(--tm-border); }

        .tm-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--tm-accent-2);
          box-shadow: 0 0 10px 2px rgba(201,164,97,0.55);
          animation: tm-travel 7s ease-in-out infinite;
          opacity: 0.9;
        }
        @keyframes tm-travel {
          0%   { transform: translate(4px, 30px); opacity: 0; }
          8%   { opacity: 0.9; }
          50%  { transform: translate(190px, 8px); }
          92%  { opacity: 0.9; }
          100% { transform: translate(372px, 30px); opacity: 0; }
        }

        .tm-fade-in { animation: tm-fade-in 0.5s ease-out both; }
        @keyframes tm-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tm-toast { animation: tm-toast-in 0.25s ease-out both; }
        @keyframes tm-toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .tm-nav-active { color: var(--tm-heading); }
        .tm-nav-inactive { color: var(--tm-muted); }
        .tm-input::placeholder { color: var(--tm-muted); }

        .tm-screen-fade { animation: tm-screen-fade 0.28s ease-out both; }
        @keyframes tm-screen-fade {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div
        className="relative w-full max-w-[420px] rounded-3xl overflow-hidden tm-phone-shadow tm-card flex flex-col"
        style={{ minHeight: "780px" }}
      >
        {/* Top Status Bar with Direct Admin Console Link */}
        <div
          onClick={() => setScreen("admin")}
          className="px-5 py-2.5 flex items-center justify-between text-[10px] font-medium cursor-pointer transition hover:opacity-90"
          style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--tm-border)" }}
          title="Click to open Transit Authority Admin Console"
        >
          <span className="flex items-center gap-1.5" style={{ color: "var(--tm-accent)" }}>
            <Shield size={12} /> SIH 2026 Admin Console
          </span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[9px]"
            style={{
              background: backendOnline ? "var(--tm-teal-soft)" : "var(--tm-card-alt)",
              color: backendOnline ? "var(--tm-teal)" : "var(--tm-muted)",
              border: `1px solid ${backendOnline ? "var(--tm-teal-border)" : "var(--tm-border)"}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: backendOnline ? "var(--tm-teal)" : "var(--tm-muted)" }}
            />
            {backendOnline ? "LIVE (Port 5000)" : "OFFLINE"}
          </span>
        </div>

        {!authed ? (
          <LoginScreen
            authMode={authMode}
            setAuthMode={setAuthMode}
            backendOnline={backendOnline}
            onAuthed={({ name, email, guest }) => {
              setAuthed(true);
              setUserName(name);
              setUserEmail(email || "");
              setIsGuest(!!guest);
              fireToast(
                guest
                  ? "Continuing as guest"
                  : authMode === "register"
                  ? `Welcome to TransitMate, ${name}!`
                  : "Welcome back!"
              );
            }}
            onError={(msg) => fireToast(msg)}
          />
        ) : (
          <>
            {screen === "home" && (
              <HomeScreen
                destination={destination}
                setDestination={setDestination}
                onSearch={handleSearch}
                onQuickPick={handleQuickPick}
                onOpenHabits={() => setScreen("habits")}
                onOpenSettings={() => setScreen("settings")}
                onOpenAdmin={() => setScreen("admin")}
                userName={userName}
              />
            )}

            {screen === "routes" && (
              <RoutesScreen
                title={tripSet.title}
                options={tripSet.options}
                routePriority={routePriority}
                onBack={() => setScreen("home")}
                onPick={handlePickRoute}
              />
            )}

            {screen === "track" && trackingOption && (
              <TrackingScreen
                option={trackingOption}
                destinationLabel={destination}
                unitPref={unitPref}
                backendOnline={backendOnline}
                onBack={() => setScreen("routes")}
                onDone={async () => {
                  try {
                    await api.habits.recordTrip({
                      tripKey: trackingOption.tripKey || "home",
                      routeLabel: trackingOption.mode,
                      durationMin: 22,
                      fare: 18,
                    });
                  } catch {}
                  setTrackingOption(null);
                  setScreen("home");
                }}
              />
            )}

            {screen === "alerts" && (
              <AlertsScreen
                onSelectRoute={(key, label) => goToRoutes(key, label)}
              />
            )}

            {screen === "habits" && (
              <HabitAnalyzerScreen
                onBack={() => setScreen("home")}
                onSelectRoute={(key, label) => goToRoutes(key, label)}
              />
            )}

            {screen === "community" && (
              <CommunityScreen
                userName={userName}
                onSelectRoute={(key, label) => goToRoutes(key, label)}
              />
            )}

            {screen === "admin" && (
              <AdminConsoleScreen
                onBack={() => setScreen("home")}
                onToast={fireToast}
              />
            )}

            {screen === "settings" && (
              <SettingsScreen
                userName={userName}
                userEmail={userEmail}
                isGuest={isGuest}
                theme={theme}
                setTheme={setTheme}
                notificationsOn={notificationsOn}
                setNotificationsOn={setNotificationsOn}
                routePriority={routePriority}
                setRoutePriority={async (p) => {
                  setRoutePriority(p);
                  try {
                    await api.auth.updatePreferences({ routePriority: p });
                  } catch {}
                }}
                unitPref={unitPref}
                setUnitPref={async (u) => {
                  setUnitPref(u);
                  try {
                    await api.auth.updatePreferences({ unitPref: u });
                  } catch {}
                }}
                preferredModes={preferredModes}
                setPreferredModes={async (m) => {
                  setPreferredModes(m);
                  try {
                    await api.auth.updatePreferences({ preferredModes: m });
                  } catch {}
                }}
                onOpenAdmin={() => setScreen("admin")}
                onBack={() => setScreen("home")}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {/* Bottom nav */}
            <div
              className="tm-card-alt border-t px-4 py-3 flex items-center justify-between"
              style={{ borderColor: "var(--tm-border)" }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.key === screen;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item)}
                    className={`relative flex flex-col items-center gap-1 flex-1 py-1 ${
                      active ? "tm-nav-active" : "tm-nav-inactive"
                    }`}
                  >
                    <span className="relative">
                      <Icon size={19} />
                      {item.key === "alerts" && hasNewAlerts && (
                        <span
                          className="absolute rounded-full"
                          style={{
                            top: "-2px",
                            right: "-3px",
                            width: "7px",
                            height: "7px",
                            background: "var(--tm-accent)",
                            boxShadow: "0 0 4px 0px rgba(201,164,97,0.8)",
                          }}
                        />
                      )}
                    </span>
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {toast && (
          <div
            className="tm-toast absolute bottom-24 left-1/2 px-4 py-2.5 rounded-full text-xs shadow-lg text-center"
            style={{
              background: "var(--tm-toast-bg)",
              color: "var(--tm-toast-fg)",
              transform: "translateX(-50%)",
              maxWidth: "88%",
              zIndex: 50,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminConsoleScreen({ onBack, onToast }) {
  const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
    return !!localStorage.getItem("tm_admin_token");
  });
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState("fleet");
  const [metrics, setMetrics] = useState(null);
  const [rawDb, setRawDb] = useState(null);
  const [delayTripKey, setDelayTripKey] = useState("home");
  const [delayMins, setDelayMins] = useState(8);
  const [delayReason, setDelayReason] = useState("Traffic bottleneck near Karunamoyee");
  const [alertTitle, setAlertTitle] = useState("Platform Maintenance");
  const [alertMsg, setAlertMsg] = useState("Sector V Platform 2 temporarily undergoing maintenance.");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await api.auth.adminLogin(adminEmailInput, adminPasswordInput);
      if (res.success && res.token) {
        setIsAdminAuthed(true);
        onToast("✅ Admin Authentication Verified");
        fetchAdminData();
      }
    } catch (err) {
      setAuthError(err.message || "Access Denied: Invalid Admin Credentials.");
      onToast("⛔ Access Denied");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    api.auth.logoutAdmin();
    setIsAdminAuthed(false);
    onToast("Admin session locked");
  };

  const fetchAdminData = async () => {
    try {
      const data = await api.admin.getMetrics();
      setMetrics(data);
    } catch {}
  };

  const fetchRawDb = async () => {
    try {
      const data = await api.admin.getDatabase();
      setRawDb(data.data);
    } catch {}
  };

  useEffect(() => {
    if (isAdminAuthed) {
      fetchAdminData();
      const timer = setInterval(fetchAdminData, 3000);
      return () => clearInterval(timer);
    }
  }, [isAdminAuthed]);

  const handleInjectDelay = async () => {
    setLoading(true);
    try {
      const res = await api.admin.injectDelay(delayTripKey, delayMins, delayReason);
      onToast(`Injected +${delayMins}m delay on ${delayTripKey.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      onToast("Failed to inject delay");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastAlert = async () => {
    setLoading(true);
    try {
      await api.admin.broadcastAlert({
        title: alertTitle,
        message: alertMsg,
        type: "disruption",
        tone: "danger",
        routeLabel: delayTripKey === "office" ? "Metro · Blue" : "Route 12",
        tripKey: delayTripKey,
      });
      onToast("City-wide transit alert broadcasted!");
      fetchAdminData();
    } catch (err) {
      onToast("Failed to broadcast alert");
    } finally {
      setLoading(false);
    }
  };

  const handleSetCrowd = async (level) => {
    try {
      await api.admin.setCrowd(delayTripKey, level);
      onToast(`Crowd set to ${level} on ${delayTripKey.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      onToast("Failed to set crowd");
    }
  };

  const handleResetSystem = async () => {
    if (window.confirm("Reset all vehicles, simulation, and seed data to default?")) {
      try {
        await api.admin.reset();
        onToast("Backend and simulation reset successfully");
        fetchAdminData();
      } catch {
        onToast("Failed to reset");
      }
    }
  };

  const vehicles = metrics?.simulationFleet ? Object.values(metrics.simulationFleet) : [];

  if (!isAdminAuthed) {
    return (
      <div className="tm-screen-fade flex flex-col flex-1 min-h-0 px-6 py-6">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>

        <div className="tm-card-alt rounded-2xl p-6 border" style={{ borderColor: "var(--tm-border)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--tm-accent-soft)", color: "var(--tm-accent)" }}>
            <Shield size={24} />
          </div>

          <p className="text-xs uppercase tm-mono font-semibold" style={{ color: "var(--tm-accent)" }}>
            RESTRICTED ACCESS
          </p>
          <h1 className="tm-display text-xl font-bold mt-1" style={{ color: "var(--tm-heading)" }}>
            Transit Authority Admin Login
          </h1>
          <p className="text-xs mt-2" style={{ color: "var(--tm-muted)", lineHeight: 1.5 }}>
            This portal is restricted exclusively to verified administrators. Commuters and guests cannot access live telemetry, delay injectors, or database tools.
          </p>

          {authError && (
            <div className="mt-4 p-3 rounded-xl text-xs font-mono border" style={{ background: "var(--tm-danger-soft)", color: "var(--tm-danger)", borderColor: "var(--tm-danger)" }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-5 flex flex-col gap-3.5">
            <div>
              <label className="text-[11px] uppercase tm-mono block mb-1.5" style={{ color: "var(--tm-muted)" }}>
                Admin Email / Gmail
              </label>
              <input
                type="email"
                required
                placeholder="transitmate.sih.admin@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                style={{
                  background: "var(--tm-card)",
                  borderColor: "var(--tm-border)",
                  color: "var(--tm-heading)",
                }}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tm-mono block mb-1.5" style={{ color: "var(--tm-muted)" }}>
                Admin Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none"
                style={{
                  background: "var(--tm-card)",
                  borderColor: "var(--tm-border)",
                  color: "var(--tm-heading)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full text-xs font-semibold py-3 rounded-xl mt-2 flex items-center justify-center gap-2"
              style={{
                background: "var(--tm-accent)",
                color: "var(--tm-on-accent)",
                opacity: authLoading ? 0.7 : 1,
              }}
            >
              <Shield size={14} />
              {authLoading ? "Verifying Credentials..." : "Authenticate as Admin"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt"
            aria-label="Back"
          >
            <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
          </button>

          <button
            onClick={handleAdminLogout}
            className="text-[11px] px-2.5 py-1 rounded-lg border tm-mono font-medium flex items-center gap-1"
            style={{ borderColor: "var(--tm-danger)", color: "var(--tm-danger)", background: "var(--tm-danger-soft)" }}
          >
            🔒 Lock Admin
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tm-mono flex items-center gap-1.5" style={{ color: "var(--tm-accent)" }}>
              <Shield size={12} /> TRANSIT AUTHORITY CONSOLE
            </p>
            <h1 className="tm-display text-xl font-semibold mt-0.5">Backend Admin</h1>
          </div>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-mono"
            style={{ background: "var(--tm-teal-soft)", color: "var(--tm-teal)", border: "1px solid var(--tm-teal-border)" }}
          >
            {metrics?.systemStatus || "Online"}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="px-6 pb-3 flex gap-2 overflow-x-auto">
        {[
          { key: "fleet", label: "Fleet Telemetry", icon: Radio },
          { key: "controls", label: "Simulation Controls", icon: Sliders },
          { key: "database", label: "Database & Stats", icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                if (t.key === "database") fetchRawDb();
              }}
              className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: active ? "var(--tm-accent)" : "var(--tm-card-alt)",
                color: active ? "var(--tm-on-accent)" : "var(--tm-body)",
                border: `1px solid ${active ? "transparent" : "var(--tm-border)"}`,
              }}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-4 overflow-y-auto">
        {tab === "fleet" && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Active Fleet</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-teal)" }}>
                  {metrics?.activeFleetCount || 4} Vehicles
                </p>
              </div>
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Carbon Saved</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-accent)" }}>
                  {metrics?.estimatedCarbonSavedKg || 34} kg CO₂
                </p>
              </div>
            </div>

            <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md">
              Live Vehicles (Ticking every 2.5s)
            </p>

            <div className="flex flex-col gap-2.5">
              {vehicles.map((v) => {
                const Icon = v.vehicleType === "metro" ? TrainFront : Bus;
                const crowd = CROWD_STYLE[v.crowdLevel] || CROWD_STYLE.Medium;
                return (
                  <div key={v.tripKey} className="tm-card rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--tm-accent-soft)" }}
                        >
                          <Icon size={15} style={{ color: "var(--tm-accent)" }} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--tm-heading)" }}>
                            {v.routeLabel}
                          </p>
                          <p className="text-[10px] tm-mono" style={{ color: "var(--tm-muted)" }}>
                            {v.vehicleId}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{ color: crowd.color, background: crowd.bg }}
                      >
                        {v.crowdLevel} Crowd
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 tm-card-alt rounded-xl p-2.5 text-center mt-1">
                      <div>
                        <p className="text-[9px]" style={{ color: "var(--tm-muted)" }}>Phase</p>
                        <p className="text-[11px] font-mono capitalize" style={{ color: "var(--tm-heading)" }}>
                          {v.phase}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px]" style={{ color: "var(--tm-muted)" }}>ETA Board</p>
                        <p className="text-[11px] font-mono" style={{ color: "var(--tm-teal)" }}>
                          {v.etaToBoardMin} min
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px]" style={{ color: "var(--tm-muted)" }}>Speed</p>
                        <p className="text-[11px] font-mono" style={{ color: "var(--tm-heading)" }}>
                          {v.speedKmH} km/h
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] truncate flex items-center gap-1.5" style={{ color: "var(--tm-body)" }}>
                      <Navigation size={12} style={{ color: "var(--tm-accent)" }} />
                      {v.currentStop}
                    </p>

                    {v.coachCrowds && (
                      <div className="flex items-center gap-1 pt-2" style={{ borderTop: "1px solid var(--tm-border)" }}>
                        <span className="text-[9px] mr-1" style={{ color: "var(--tm-muted)" }}>Coaches:</span>
                        {v.coachCrowds.map((lvl, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] px-1.5 py-0.5 rounded"
                            style={{
                              background: CROWD_STYLE[lvl]?.bg || "var(--tm-card-alt)",
                              color: CROWD_STYLE[lvl]?.color || "var(--tm-body)",
                            }}
                          >
                            C{idx + 1}:{lvl[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "controls" && (
          <>
            <div className="tm-card rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--tm-heading)" }}>
                <Sliders size={14} style={{ color: "var(--tm-accent)" }} /> SIH Delay Injection Simulator
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--tm-muted)" }}>
                Trigger simulated traffic delays during your pitch to show judges real-time rerouting!
              </p>

              <div>
                <label className="text-[10px] uppercase font-mono" style={{ color: "var(--tm-muted)" }}>Target Corridor</label>
                <select
                  value={delayTripKey}
                  onChange={(e) => setDelayTripKey(e.target.value)}
                  className="tm-input w-full mt-1 tm-card-alt p-2.5 rounded-xl text-xs outline-none"
                  style={{ color: "var(--tm-heading)", border: "1px solid var(--tm-border)" }}
                >
                  <option value="home">Route 12 (Salt Lake Sector V - Karunamoyee)</option>
                  <option value="office">Metro Blue Line (Sector V - Park Street)</option>
                  <option value="esplanade">Route 47 (Karunamoyee - Esplanade)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono" style={{ color: "var(--tm-muted)" }}>Delay Duration (Minutes)</label>
                <div className="flex gap-2 mt-1">
                  {[5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => setDelayMins(m)}
                      className="flex-1 py-2 rounded-lg text-xs font-mono"
                      style={{
                        background: delayMins === m ? "var(--tm-accent)" : "var(--tm-card-alt)",
                        color: delayMins === m ? "var(--tm-on-accent)" : "var(--tm-body)",
                        border: "1px solid var(--tm-border)",
                      }}
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleInjectDelay}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-medium mt-1"
                style={{ background: "var(--tm-amber)", color: "#FFFFFF" }}
              >
                Inject Simulated Delay
              </button>
            </div>

            <div className="tm-card rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--tm-heading)" }}>
                <Users size={14} style={{ color: "var(--tm-teal)" }} /> Crowd Level Modifier
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetCrowd("Low")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: "var(--tm-teal-soft)", color: "var(--tm-teal)", border: "1px solid var(--tm-teal-border)" }}
                >
                  Set Low (Calm)
                </button>
                <button
                  onClick={() => handleSetCrowd("High")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: "var(--tm-danger-soft)", color: "var(--tm-danger)", border: "1px solid var(--tm-danger-soft)" }}
                >
                  Set High (Rush Hour)
                </button>
              </div>
            </div>

            <div className="tm-card rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--tm-heading)" }}>
                <Bell size={14} style={{ color: "var(--tm-danger)" }} /> Broadcast Transit Authority Notice
              </p>
              <input
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="Alert title"
                className="tm-input w-full tm-card-alt p-2.5 rounded-xl text-xs outline-none"
                style={{ color: "var(--tm-heading)", border: "1px solid var(--tm-border)" }}
              />
              <textarea
                value={alertMsg}
                onChange={(e) => setAlertMsg(e.target.value)}
                placeholder="Alert details"
                rows={2}
                className="tm-input w-full tm-card-alt p-2.5 rounded-xl text-xs outline-none resize-none"
                style={{ color: "var(--tm-heading)", border: "1px solid var(--tm-border)" }}
              />
              <button
                onClick={handleBroadcastAlert}
                className="w-full py-2.5 rounded-xl text-xs font-medium"
                style={{ background: "var(--tm-danger)", color: "#FFFFFF" }}
              >
                Push Live Disruption Notice
              </button>
            </div>
          </>
        )}

        {tab === "database" && (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Registered Users</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-heading)" }}>
                  {metrics?.dbStats?.users || 1}
                </p>
              </div>
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Community Reports</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-heading)" }}>
                  {metrics?.dbStats?.posts || 5}
                </p>
              </div>
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Active Alerts</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-heading)" }}>
                  {metrics?.dbStats?.alerts || 5}
                </p>
              </div>
              <div className="tm-card-alt rounded-xl p-3">
                <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>Trips Recorded</p>
                <p className="tm-mono text-base font-semibold mt-0.5" style={{ color: "var(--tm-teal)" }}>
                  {metrics?.dbStats?.tripsRecorded || 8}
                </p>
              </div>
            </div>

            <div className="tm-card rounded-2xl p-4">
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--tm-heading)" }}>
                Database Persistence: <span className="font-mono text-[11px] text-teal-400">backend/data/database.json</span>
              </p>
              <div
                className="rounded-xl p-3 text-[10px] font-mono overflow-auto max-h-48"
                style={{ background: "rgba(0,0,0,0.4)", color: "var(--tm-body)" }}
              >
                <pre>{JSON.stringify(rawDb || metrics, null, 2)}</pre>
              </div>
            </div>

            <button
              onClick={handleResetSystem}
              className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 mt-2"
              style={{ background: "var(--tm-danger-soft)", color: "var(--tm-danger)", border: "1px solid var(--tm-danger-soft)" }}
            >
              <RefreshCw size={13} /> Reset Simulation &amp; Database to Default
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ authMode, setAuthMode, backendOnline, onAuthed, onError }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRegister = authMode === "register";

  const handleSubmit = async () => {
    if (isRegister && !name.trim()) {
      onError("Enter your name to create an account");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      onError("Enter a valid email address");
      return;
    }
    if (!password || password.length < 4) {
      onError("Password should be at least 4 characters");
      return;
    }
    if (isRegister && password !== confirmPassword) {
      onError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await api.auth.register(name.trim(), email.trim(), password);
      } else {
        res = await api.auth.login(email.trim(), password);
      }

      onAuthed({
        name: res.user?.name || name.trim() || email.split("@")[0],
        email: email.trim(),
        guest: false,
      });
    } catch (err) {
      if (!backendOnline) {
        onAuthed({
          name: isRegister ? name.trim() : email.split("@")[0],
          email: email.trim(),
          guest: false,
        });
      } else {
        onError(err.message || "Failed to authenticate");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await api.auth.guest();
    } catch {}
    onAuthed({ name: "Guest", email: "", guest: true });
    setLoading(false);
  };

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0 px-6 pt-10 pb-8 overflow-y-auto">
      <div className="text-center mb-7">
        <p className="tm-display text-2xl font-semibold" style={{ color: "var(--tm-accent)" }}>
          TransitMate
        </p>
        <p className="text-xs mt-1.5" style={{ color: "var(--tm-muted)" }}>
          Smart City Transit &amp; Seat Crowd Intelligence
        </p>
      </div>

      <div className="flex rounded-full tm-card-alt p-1 mb-5">
        {["login", "register"].map((mode) => {
          const active = authMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setAuthMode(mode)}
              className="flex-1 text-xs py-2 rounded-full font-medium transition"
              style={{
                background: active ? "var(--tm-accent)" : "transparent",
                color: active ? "var(--tm-on-accent)" : "var(--tm-muted)",
              }}
            >
              {mode === "login" ? "Sign In" : "Register"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {isRegister && (
          <div className="tm-card-alt rounded-2xl p-3.5 flex items-center gap-3">
            <User size={16} style={{ color: "var(--tm-accent)" }} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="tm-input flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--tm-heading)" }}
            />
          </div>
        )}

        <div className="tm-card-alt rounded-2xl p-3.5 flex items-center gap-3">
          <Mail size={16} style={{ color: "var(--tm-accent)" }} />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="tm-input flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--tm-heading)" }}
          />
        </div>

        <div className="tm-card-alt rounded-2xl p-3.5 flex items-center gap-3">
          <Lock size={16} style={{ color: "var(--tm-accent)" }} />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            className="tm-input flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--tm-heading)" }}
          />
          <button onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
            {showPassword ? (
              <EyeOff size={15} style={{ color: "var(--tm-muted)" }} />
            ) : (
              <Eye size={15} style={{ color: "var(--tm-muted)" }} />
            )}
          </button>
        </div>

        {isRegister && (
          <div className="tm-card-alt rounded-2xl p-3.5 flex items-center gap-3">
            <Lock size={16} style={{ color: "var(--tm-accent)" }} />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              type={showPassword ? "text" : "password"}
              className="tm-input flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--tm-heading)" }}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl py-3 text-sm font-medium mt-2 flex items-center justify-center gap-2"
          style={{
            background: "var(--tm-accent)",
            color: "var(--tm-on-accent)",
            boxShadow: "0 0 16px 1px rgba(201,164,97,0.35)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && <RefreshCw size={14} className="animate-spin" />}
          {isRegister ? "Create Account" : "Sign In"}
        </button>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: "var(--tm-border)" }} />
        <span className="text-[11px]" style={{ color: "var(--tm-muted)" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--tm-border)" }} />
      </div>

      <button
        onClick={handleGuest}
        className="tm-hover rounded-xl py-3 text-sm font-medium tm-card-alt"
        style={{ color: "var(--tm-body)", border: "1px solid var(--tm-border)" }}
      >
        Continue as guest
      </button>

      <p className="text-[11px] text-center mt-5" style={{ color: "var(--tm-muted)" }}>
        {isRegister ? "Already have an account?" : "New to TransitMate?"}{" "}
        <button
          onClick={() => setAuthMode(isRegister ? "login" : "register")}
          className="font-medium"
          style={{ color: "var(--tm-accent)" }}
        >
          {isRegister ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}

function HomeScreen({
  destination,
  setDestination,
  onSearch,
  onQuickPick,
  onOpenHabits,
  onOpenSettings,
  onOpenAdmin,
  userName,
}) {
  const [quickDestinations, setQuickDestinations] = useState(DEFAULT_QUICK_DESTINATIONS);
  const [habitSummary, setHabitSummary] = useState({ savedVsCab: "₹340", avgWaitMin: 4 });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const stats = await api.habits.getStats();
        if (stats.summary) {
          setHabitSummary(stats.summary);
        }
      } catch {}
    };
    loadHomeData();
  }, []);

  return (
    <>
      <div className="relative px-6 pt-6 pb-8 overflow-hidden">
        <svg
          className="absolute left-0 top-0 w-full h-full opacity-50 pointer-events-none"
          viewBox="0 0 380 90"
          preserveAspectRatio="none"
        >
          <path
            d="M 4,30 C 90,-10 140,60 190,8 C 250,-30 330,60 376,30"
            fill="none"
            stroke="var(--tm-accent)"
            strokeWidth="1.5"
            strokeDasharray="1 7"
            strokeLinecap="round"
          />
        </svg>
        <div className="tm-dot" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
              TUE · 6:42 PM
            </p>
            <h1 className="tm-display text-2xl font-semibold mt-1">
              Evening, {userName || "Rhea"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--tm-muted)" }}>
              Salt Lake, Sector V
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="w-9 h-9 rounded-full flex items-center justify-center tm-card-alt"
              style={{ color: "var(--tm-accent)" }}
              aria-label="Open Admin Console"
              title="Transit Authority Admin"
            >
              <Shield size={16} />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full flex items-center justify-center tm-card-alt"
              style={{ color: "var(--tm-muted)" }}
              aria-label="Open settings"
            >
              <SettingsIcon size={16} />
            </button>
            <button
              onClick={onOpenHabits}
              className="w-10 h-10 rounded-full flex items-center justify-center tm-card-alt text-sm font-semibold tm-display"
              style={{ color: "var(--tm-heading)", boxShadow: "0 0 0 1px var(--tm-accent-border), 0 0 10px 0px rgba(201,164,97,0.2)" }}
              aria-label="Open your commute habits"
            >
              {(userName || "R")[0].toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-6 overflow-y-auto">
        <div className="tm-card-alt tm-fade-in rounded-2xl p-4 flex items-center gap-3">
          <MapPin size={18} style={{ color: "var(--tm-accent)" }} />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Where are you headed?"
            className="tm-input flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--tm-heading)" }}
          />
          <button
            onClick={onSearch}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--tm-accent)", boxShadow: "0 0 14px 1px rgba(201,164,97,0.35)" }}
            aria-label="Search routes"
          >
            <Search size={15} color="var(--tm-on-accent)" />
          </button>
        </div>

        <div
          className="tm-fade-in rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: "var(--tm-amber-soft)", border: "1px solid var(--tm-amber-border)", animationDelay: "0.05s" }}
        >
          <Sparkles size={18} style={{ color: "var(--tm-amber)" }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
              Beat the rush today
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--tm-body)" }}>
              On Tuesdays you usually leave by 6:50 PM. Head out in the next{" "}
              <span className="tm-mono" style={{ color: "var(--tm-amber)" }}>
                8 min
              </span>{" "}
              to skip the 7:00 PM crowd surge on Route 12.
            </p>
          </div>
        </div>

        <div className="tm-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Frequent trips
          </p>
          <div className="flex flex-col gap-2.5">
            {quickDestinations.map((item) => {
              const Icon = item.icon || MapPin;
              return (
                <button
                  key={item.label}
                  onClick={() => onQuickPick(item)}
                  className="tm-card rounded-xl p-3.5 flex items-center gap-3 text-left tm-hover transition"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--tm-accent-soft)" }}
                  >
                    <Icon size={16} style={{ color: "var(--tm-accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
                      {item.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--tm-muted)" }}>
                      {item.sub}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm tm-mono" style={{ color: "var(--tm-teal)" }}>
                      {item.eta}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--tm-muted)" }}>
                      {item.route}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tm-fade-in grid grid-cols-2 gap-2.5" style={{ animationDelay: "0.15s" }}>
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Saved this week
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-teal)" }}>
              {habitSummary.savedVsCab}
            </p>
          </div>
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Avg. wait time
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-heading)" }}>
              {habitSummary.avgWaitMin} min
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const MAP_PATH = [
  { x: 24, y: 152 },
  { x: 72, y: 132 },
  { x: 62, y: 84 },
  { x: 118, y: 64 },
  { x: 170, y: 92 },
  { x: 216, y: 54 },
  { x: 268, y: 32 },
];
const MAP_STOP_INDEX = 2;

function pathMeta(points) {
  let total = 0;
  const cum = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
    cum.push(total);
  }
  return { total, cum };
}

function pointAtT(points, t) {
  const { total, cum } = pathMeta(points);
  const target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 1; i < points.length; i++) {
    if (target <= cum[i] || i === points.length - 1) {
      const segStart = cum[i - 1];
      const segLen = cum[i] - segStart || 1;
      const segT = (target - segStart) / segLen;
      const p0 = points[i - 1];
      const p1 = points[i];
      return { x: p0.x + (p1.x - p0.x) * segT, y: p0.y + (p1.y - p0.y) * segT };
    }
  }
  return points[points.length - 1];
}

const toPolyline = (points) => points.map((p) => `${p.x},${p.y}`).join(" ");

function RouteMiniMap({ progressPercent, segment, vehicleType, destinationLabel }) {
  const stopPoint = MAP_PATH[MAP_STOP_INDEX];
  const destPoint = MAP_PATH[MAP_PATH.length - 1];
  const activePoints =
    segment === "approach" ? MAP_PATH.slice(0, MAP_STOP_INDEX + 1) : MAP_PATH.slice(MAP_STOP_INDEX);
  const marker = pointAtT(activePoints, progressPercent / 100);
  const VehicleIcon = vehicleType === "metro" ? TrainFront : Bus;

  return (
    <div className="tm-card rounded-2xl overflow-hidden relative" style={{ height: 190 }}>
      <svg viewBox="0 0 300 190" className="w-full h-full" preserveAspectRatio="none">
        <g stroke="var(--tm-border)" strokeWidth="1">
          <line x1="0" y1="36" x2="300" y2="18" />
          <line x1="0" y1="112" x2="300" y2="128" />
          <line x1="40" y1="0" x2="86" y2="190" />
          <line x1="196" y1="0" x2="224" y2="190" />
        </g>
        <polyline
          points={toPolyline(MAP_PATH)}
          fill="none"
          stroke="var(--tm-border)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={toPolyline(activePoints)}
          fill="none"
          stroke="var(--tm-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <circle cx={stopPoint.x} cy={stopPoint.y} r="6" fill="var(--tm-card)" stroke="var(--tm-heading)" strokeWidth="2" />
        <circle
          cx={destPoint.x}
          cy={destPoint.y}
          r={segment === "onward" ? 7 : 5}
          fill={segment === "onward" ? "var(--tm-teal)" : "var(--tm-card)"}
          stroke={segment === "onward" ? "var(--tm-card)" : "var(--tm-border)"}
          strokeWidth="2"
        />
      </svg>
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 22,
          height: 22,
          left: `${(marker.x / 300) * 100}%`,
          top: `${(marker.y / 190) * 100}%`,
          transform: "translate(-50%, -50%)",
          background: "var(--tm-accent-2)",
          boxShadow: "0 0 10px 1px rgba(201,164,97,0.45)",
          transition: "left 0.4s linear, top 0.4s linear",
        }}
      >
        <VehicleIcon size={12} color="var(--tm-on-accent)" />
      </div>
      <span
        className="absolute left-2 bottom-2 text-[9px] px-1.5 py-0.5 rounded"
        style={{ background: "var(--tm-card-alt)", color: "var(--tm-muted)" }}
      >
        Your stop
      </span>
      {segment === "onward" && (
        <span
          className="absolute right-2 top-2 text-[9px] px-1.5 py-0.5 rounded max-w-[45%] truncate"
          style={{ background: "var(--tm-teal-soft)", color: "var(--tm-teal)" }}
        >
          {destinationLabel}
        </span>
      )}
    </div>
  );
}

function parseMinutes(timeText) {
  const match = timeText ? timeText.match(/\d+/) : null;
  return match ? parseInt(match[0], 10) : 20;
}

function TrackingScreen({ option, destinationLabel, unitPref, onBack, onDone }) {
  const totalMinutes = parseMinutes(option.time);
  const stops = option.stops || [];
  const approach = option.approach || { stopsAway: 0, currentlyAt: "Nearby", etaToBoardMin: 3 };

  const [phase, setPhase] = useState("waiting");
  const [waitProgress, setWaitProgress] = useState(0);
  const [progress, setProgress] = useState(0);
  const [crowdMapOpen, setCrowdMapOpen] = useState(false);

  useEffect(() => {
    setPhase("waiting");
    setWaitProgress(0);
    setProgress(0);
    setCrowdMapOpen(false);
  }, [option]);

  useEffect(() => {
    if (phase !== "waiting") return;
    const WAIT_SIM_SECONDS = 8;
    const stepMs = 400;
    const stepAmount = 100 / ((WAIT_SIM_SECONDS * 1000) / stepMs);
    const interval = setInterval(() => {
      setWaitProgress((p) => Math.min(100, p + stepAmount));
    }, stepMs);
    return () => clearInterval(interval);
  }, [phase, option]);

  useEffect(() => {
    if (phase !== "waiting" || waitProgress < 100) return;
    const timeout = setTimeout(() => setPhase("boarded"), 1800);
    return () => clearTimeout(timeout);
  }, [phase, waitProgress]);

  useEffect(() => {
    if (phase !== "boarded") return;
    const SIM_SECONDS = 22;
    const stepMs = 400;
    const stepAmount = 100 / ((SIM_SECONDS * 1000) / stepMs);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + stepAmount);
        if (next >= 100) {
          clearInterval(interval);
          setPhase("arrived");
        }
        return next;
      });
    }, stepMs);
    return () => clearInterval(interval);
  }, [phase, option]);

  const stopIndex = Math.min(stops.length - 1, Math.floor((progress / 100) * stops.length));
  const remainingStops = Math.max(0, stops.length - 1 - stopIndex);
  const remainingMinutes = Math.max(1, Math.round(totalMinutes * (1 - progress / 100)));
  const waitMinutesLeft = Math.max(0, Math.round(approach.etaToBoardMin * (1 - waitProgress / 100)));
  const waitStopsAway = Math.max(0, Math.round(approach.stopsAway * (1 - waitProgress / 100)));

  const VehicleIcon = option.vehicleType === "metro" ? TrainFront : Bus;

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0 relative">
      <div className="relative px-6 pt-7 pb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back to routes"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          {phase === "waiting" ? "BEFORE YOU BOARD" : "LIVE TRACKING"}
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1 truncate">{option.mode}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          {phase === "waiting"
            ? "Here's where it is right now"
            : `Heading to ${destinationLabel || stops[stops.length - 1]}`}
        </p>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
        {phase === "waiting" && (
          <>
            <div className="tm-card-alt rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
                  {waitProgress >= 100 ? "Bus is at your stop" : "Reaching your stop in"}
                </p>
                <p className="tm-display text-3xl font-semibold mt-1">
                  {waitProgress >= 100 ? "Here" : `${waitMinutesLeft} min`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
                  Stops away
                </p>
                <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-teal)" }}>
                  {waitProgress >= 100 ? 0 : waitStopsAway}
                </p>
              </div>
            </div>

            {waitProgress >= 100 && (
              <div
                className="tm-fade-in rounded-2xl p-3.5 flex items-center gap-2.5"
                style={{ background: "var(--tm-amber-soft)", border: "1px solid var(--tm-amber-border)" }}
              >
                <Navigation size={15} style={{ color: "var(--tm-amber)" }} className="shrink-0" />
                <p className="text-xs" style={{ color: "var(--tm-body)" }}>
                  Detecting movement — switching automatically once you're on the move.
                </p>
              </div>
            )}

            <div className="tm-card rounded-2xl p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--tm-accent-soft)" }}
              >
                <VehicleIcon size={16} style={{ color: "var(--tm-accent)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--tm-heading)" }}>
                  {approach.currentlyAt}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--tm-muted)" }}>
                  Live GPS telemetry updating from backend
                </p>
              </div>
            </div>

            <RouteMiniMap
              progressPercent={waitProgress}
              segment="approach"
              vehicleType={option.vehicleType}
              destinationLabel={destinationLabel}
            />

            <button
              onClick={() => setCrowdMapOpen(true)}
              className="tm-card tm-hover rounded-2xl p-4 flex items-center gap-3 text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--tm-teal-soft)" }}
              >
                <Armchair size={16} style={{ color: "var(--tm-teal)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
                  Check coach crowd levels
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--tm-muted)" }}>
                  See which coach or section has the most room
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "var(--tm-muted)" }} className="shrink-0" />
            </button>

            <button
              onClick={() => setPhase("boarded")}
              className="rounded-xl py-3 text-sm font-medium"
              style={{ background: "var(--tm-card-alt)", color: "var(--tm-heading)", border: "1px solid var(--tm-border)" }}
            >
              I've boarded — skip ahead
            </button>
          </>
        )}

        {phase !== "waiting" && (
          <>
            <div className="tm-card-alt rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
                  {phase === "arrived" ? "Trip complete" : "Arriving in"}
                </p>
                <p className="tm-display text-3xl font-semibold mt-1">
                  {phase === "arrived" ? "0 min" : `${remainingMinutes} min`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
                  Stops away
                </p>
                <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-teal)" }}>
                  {phase === "arrived" ? 0 : remainingStops}
                </p>
              </div>
            </div>

            <RouteMiniMap
              progressPercent={progress}
              segment="onward"
              vehicleType={option.vehicleType}
              destinationLabel={destinationLabel || stops[stops.length - 1]}
            />

            <div className="flex flex-col gap-2">
              {stops.map((stop, i) => {
                const passed = i < stopIndex;
                const current = i === stopIndex && phase !== "arrived";
                return (
                  <div
                    key={stop}
                    className="flex items-center gap-3 rounded-xl p-3"
                    style={{
                      background: current ? "var(--tm-accent-soft)" : "transparent",
                      border: current ? "1px solid var(--tm-accent-border)" : "1px solid transparent",
                    }}
                  >
                    {passed || phase === "arrived" ? (
                      <CheckCircle2 size={16} style={{ color: "var(--tm-teal)" }} />
                    ) : current ? (
                      <Navigation size={16} style={{ color: "var(--tm-accent)" }} />
                    ) : (
                      <Circle size={16} style={{ color: "var(--tm-muted)" }} />
                    )}
                    <span
                      className="text-sm"
                      style={{
                        color: passed || phase === "arrived" ? "var(--tm-muted)" : "var(--tm-heading)",
                        textDecoration: passed ? "line-through" : "none",
                      }}
                    >
                      {stop}
                    </span>
                    {current && (
                      <span className="text-[10px] ml-auto tm-mono" style={{ color: "var(--tm-accent)" }}>
                        NOW
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {phase === "arrived" && (
        <div
          className="absolute inset-0 flex items-center justify-center p-8"
          style={{ background: "rgba(6,6,8,0.65)", zIndex: 40 }}
        >
          <div
            className="tm-fade-in tm-card rounded-2xl p-6 text-center w-full"
            style={{ border: "1px solid var(--tm-teal-border)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--tm-teal-soft)" }}
            >
              <CheckCircle2 size={22} style={{ color: "var(--tm-teal)" }} />
            </div>
            <p className="tm-display text-lg font-semibold" style={{ color: "var(--tm-heading)" }}>
              You've arrived
            </p>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--tm-body)" }}>
              {destinationLabel || stops[stops.length - 1]} — trip saved to your backend habit analytics.
            </p>
            <button
              onClick={onDone}
              className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium"
              style={{
                background: "var(--tm-accent)",
                color: "var(--tm-on-accent)",
                boxShadow: "0 0 16px 1px rgba(201,164,97,0.35)",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {crowdMapOpen && (
        <CoachCrowdMap
          tripKey={option.tripKey || "home"}
          vehicleType={option.vehicleType}
          overallCrowd={option.crowd}
          mode={option.mode}
          minutesLeft={waitProgress >= 100 ? 0 : waitMinutesLeft}
          stopsAway={waitProgress >= 100 ? 0 : waitStopsAway}
          hasArrived={waitProgress >= 100}
          unitPref={unitPref}
          onBack={() => setCrowdMapOpen(false)}
        />
      )}
    </div>
  );
}

function CoachCrowdMap({
  tripKey,
  vehicleType,
  overallCrowd,
  mode,
  minutesLeft,
  stopsAway,
  hasArrived,
  unitPref,
  onBack,
}) {
  const [sections, setSections] = useState(() => {
    if (vehicleType === "metro") {
      return [
        { id: "Gate 1", subLabel: "Coach 1", level: "Low", distanceM: 48, direction: "behind" },
        { id: "Gate 2", subLabel: "Coach 2", level: "Low", distanceM: 24, direction: "behind" },
        { id: "Gate 3", subLabel: "Coach 3", level: "Low", distanceM: 0, direction: "here" },
        { id: "Gate 4", subLabel: "Coach 4", level: "Medium", distanceM: 24, direction: "ahead" },
        { id: "Gate 5", subLabel: "Coach 5", level: "Low", distanceM: 48, direction: "ahead" },
        { id: "Gate 6", subLabel: "Coach 6", level: "Medium", distanceM: 72, direction: "ahead" },
      ];
    }
    return [
      { id: "Front", subLabel: "Near the driver", level: "High" },
      { id: "Middle", subLabel: "Center of the bus", level: "High" },
      { id: "Back", subLabel: "Rear door", level: "Medium" },
    ];
  });

  useEffect(() => {
    const loadCrowdData = async () => {
      try {
        const res = await api.tracking.getCrowdMap(tripKey, 2, unitPref);
        if (res.crowdIntelligence?.sections) {
          setSections(res.crowdIntelligence.sections);
        }
      } catch {}
    };
    loadCrowdData();
  }, [tripKey, unitPref]);

  const formatDistance = (m) =>
    unitPref === "imperial" ? `${Math.round(m * 3.281)}ft` : `${m}m`;
  const priority = { Low: 0, Medium: 1, High: 2 };
  const recommended = sections.reduce((best, s) => {
    if (priority[s.level] < priority[best.level]) return s;
    if (priority[s.level] === priority[best.level] && (s.distanceM ?? Infinity) < (best.distanceM ?? Infinity)) {
      return s;
    }
    return best;
  });

  const directionLabel = (s) =>
    s.direction === "here" ? "right where you are" : s.direction === "ahead" ? "to your right" : "to your left";

  return (
    <div
      className="tm-screen-fade absolute inset-0 flex flex-col"
      style={{ background: "var(--tm-card)", zIndex: 45 }}
    >
      <div className="px-6 pt-7 pb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back to tracking"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          SEAT &amp; CROWD INTELLIGENCE
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1">{mode}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          {vehicleType === "metro"
            ? "Distance measured from where you usually enter"
            : "Here's where the room actually is"}
        </p>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
        <div className="tm-card-alt rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={14} style={{ color: "var(--tm-accent)" }} />
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              {hasArrived ? "It's here now" : "Still on the way"}
            </p>
          </div>
          <div className="text-right">
            <p className="tm-mono text-lg" style={{ color: "var(--tm-heading)" }}>
              {hasArrived ? "Here" : `${minutesLeft} min`}
            </p>
            <p className="text-[10px]" style={{ color: "var(--tm-muted)" }}>
              {hasArrived ? "0 stops away" : `${stopsAway} stops away`}
            </p>
          </div>
        </div>

        {vehicleType === "metro" && (
          <div className="flex items-center gap-2.5 -mt-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "var(--tm-accent-soft)" }}
            >
              <MapPin size={13} style={{ color: "var(--tm-accent)" }} />
            </div>
            <p className="text-[11px] leading-snug" style={{ color: "var(--tm-muted)" }}>
              You're standing near Gate 3 — TransitMate remembers this from your past trips.
            </p>
          </div>
        )}

        <div
          className={`grid gap-2.5 ${vehicleType === "metro" ? "grid-cols-3" : "grid-cols-1"}`}
        >
          {sections.map((s) => {
            const tone = CROWD_STYLE[s.level] || CROWD_STYLE.Medium;
            const isBest = s.id === recommended.id;
            const DirIcon = s.direction === "ahead" ? ArrowRight : s.direction === "behind" ? ArrowLeft : null;
            return (
              <div
                key={s.id}
                className="rounded-xl p-3.5 flex flex-col items-center gap-1.5 text-center relative"
                style={{
                  background: tone.bg,
                  border: `1px solid ${isBest ? "var(--tm-teal-border)" : "var(--tm-border)"}`,
                }}
              >
                {isBest && (
                  <span
                    className="absolute -top-2 text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "var(--tm-teal)", color: "var(--tm-on-accent)" }}
                  >
                    Best pick
                  </span>
                )}
                <Armchair size={18} style={{ color: tone.color }} />
                <p className="text-xs font-medium mt-1" style={{ color: "var(--tm-heading)" }}>
                  {s.id}
                </p>
                {s.subLabel && (
                  <p className="text-[9px] -mt-1" style={{ color: "var(--tm-muted)" }}>
                    {s.subLabel}
                  </p>
                )}
                <p className="text-[10px]" style={{ color: tone.color }}>
                  {s.level} crowd
                </p>
                {typeof s.distanceM === "number" && (
                  <>
                    <p className="text-[9px] flex items-center gap-0.5" style={{ color: "var(--tm-muted)" }}>
                      {DirIcon && <DirIcon size={9} />}
                      {s.distanceM === 0 ? "You're here" : formatDistance(s.distanceM)}
                    </p>
                    {s.distanceM > 0 && (
                      <p className="text-[8px]" style={{ color: "var(--tm-muted)" }}>
                        {s.direction === "ahead" ? "Right" : "Left"}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: "var(--tm-teal-soft)", border: "1px solid var(--tm-teal-border)" }}
        >
          <Armchair size={18} style={{ color: "var(--tm-teal)" }} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: "var(--tm-body)" }}>
            <span style={{ color: "var(--tm-heading)", fontWeight: 500 }}>{recommended.id}</span>{" "}
            has the lowest crowd
            {typeof recommended.distanceM === "number" &&
              (recommended.distanceM === 0
                ? " and it's right where you are — no walk needed."
                : ` — it's about ${formatDistance(recommended.distanceM)} ${directionLabel(recommended)}, worth the short walk.`)}
            {typeof recommended.distanceM !== "number" && " — worth heading there."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {["Low", "Medium", "High"].map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CROWD_STYLE[level].color }}
              />
              <span className="text-[11px]" style={{ color: "var(--tm-muted)" }}>
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsScreen({ onSelectRoute }) {
  const [filter, setFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await api.alerts.getAlerts(filter);
        if (res.alerts) setAlerts(res.alerts);
      } catch {}
    };
    loadAlerts();
  }, [filter]);

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-7 pb-4">
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          LIVE UPDATES
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1">Alerts</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          Predictive tips, delays, and reports from other commuters
        </p>
      </div>

      <div className="px-6 pb-3 flex gap-2 overflow-x-auto">
        {ALERT_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full"
              style={{
                background: active ? "var(--tm-accent)" : "var(--tm-card-alt)",
                color: active ? "var(--tm-on-accent)" : "var(--tm-body)",
                border: `1px solid ${active ? "transparent" : "var(--tm-border)"}`,
                fontWeight: active ? 600 : 400,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-3 overflow-y-auto">
        {alerts.length === 0 && (
          <p className="text-xs text-center mt-8" style={{ color: "var(--tm-muted)" }}>
            No alerts in this category right now.
          </p>
        )}
        {alerts.map((alert, i) => {
          const tone = ALERT_TONE[alert.tone] || ALERT_TONE.amber;
          return (
            <button
              key={alert.id}
              onClick={() => onSelectRoute(alert.tripKey || "home", alert.routeLabel || "Route 12")}
              className="tm-card tm-fade-in tm-hover rounded-2xl p-4 text-left"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: tone.bg }}
                >
                  <AlertTriangle size={16} style={{ color: tone.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--tm-heading)" }}>
                      {alert.title}
                    </p>
                    <ChevronRight size={14} style={{ color: "var(--tm-muted)" }} className="shrink-0" />
                  </div>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--tm-body)" }}>
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{ background: "var(--tm-card-alt)", color: "var(--tm-muted)" }}
                    >
                      {alert.routeLabel}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--tm-muted)" }}>
                      {alert.time}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HabitAnalyzerScreen({ onBack, onSelectRoute }) {
  const [weeklyMinutes, setWeeklyMinutes] = useState([
    { day: "Mon", minutes: 42 },
    { day: "Tue", minutes: 38 },
    { day: "Wed", minutes: 51 },
    { day: "Thu", minutes: 29 },
    { day: "Fri", minutes: 46 },
    { day: "Sat", minutes: 18 },
    { day: "Sun", minutes: 0 },
  ]);
  const [routeUsage, setRouteUsage] = useState([
    { key: "home", label: "Route 12", mode: "bus", trips: 5, time: "1h 50m", spend: "₹90" },
    { key: "office", label: "Metro · Blue", mode: "metro", trips: 2, time: "40 min", spend: "₹30" },
    { key: "esplanade", label: "Route 47", mode: "bus", trips: 1, time: "14 min", spend: "₹10" },
  ]);
  const [summary, setSummary] = useState({
    totalTrips: 8,
    timeCommuting: "2h 44m",
    spent: "₹130",
    savedVsCab: "₹340",
  });
  const [aiInsight, setAiInsight] = useState({
    title: "Route 12 is eating most of your time",
    description: "Switching to the Metro + Route 3 combo on your Home trip could save you roughly 12 minutes a week, based on your recent trips.",
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await api.habits.getStats();
        if (stats.weeklyMinutes) setWeeklyMinutes(stats.weeklyMinutes);
        if (stats.routeUsage) setRouteUsage(stats.routeUsage);
        if (stats.summary) setSummary(stats.summary);
        if (stats.aiInsight) setAiInsight(stats.aiInsight);
      } catch {}
    };
    loadStats();
  }, []);

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-7 pb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          THIS WEEK
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1">Habit Analyzer</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          How you've been commuting lately
        </p>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Trips taken
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-heading)" }}>
              {summary.totalTrips}
            </p>
          </div>
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Time commuting
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-heading)" }}>
              {summary.timeCommuting}
            </p>
          </div>
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Spent
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-heading)" }}>
              {summary.spent}
            </p>
          </div>
          <div className="tm-card-alt rounded-xl p-3.5">
            <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
              Saved vs. cab
            </p>
            <p className="tm-mono text-lg mt-1" style={{ color: "var(--tm-teal)" }}>
              {summary.savedVsCab}
            </p>
          </div>
        </div>

        <div className="tm-card rounded-2xl p-4">
          <p className="text-xs mb-2" style={{ color: "var(--tm-muted)" }}>
            Minutes commuting per day
          </p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyMinutes} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--tm-muted)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--tm-border)" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "var(--tm-card-alt)",
                    border: "1px solid var(--tm-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--tm-heading)" }}
                  itemStyle={{ color: "var(--tm-accent)" }}
                />
                <Bar dataKey="minutes" fill="var(--tm-accent)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="tm-fade-in rounded-2xl p-4 flex gap-3 items-start"
          style={{ background: "var(--tm-accent-soft)", border: "1px solid var(--tm-accent-border)" }}
        >
          <Sparkles size={18} style={{ color: "var(--tm-accent)" }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
              {aiInsight.title}
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--tm-body)" }}>
              {aiInsight.description}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            By route
          </p>
          <div className="flex flex-col gap-2.5">
            {routeUsage.map((r) => {
              const Icon = r.mode === "metro" ? TrainFront : Bus;
              return (
                <button
                  key={r.key}
                  onClick={() => onSelectRoute(r.key, r.label)}
                  className="tm-card tm-hover rounded-xl p-3.5 flex items-center gap-3 text-left"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--tm-accent-soft)" }}
                  >
                    <Icon size={16} style={{ color: "var(--tm-accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
                      {r.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--tm-muted)" }}>
                      {r.trips} {r.trips === 1 ? "trip" : "trips"} · {r.time}
                    </p>
                  </div>
                  <p className="text-sm tm-mono shrink-0" style={{ color: "var(--tm-heading)" }}>
                    {r.spend}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityScreen({ userName, onSelectRoute }) {
  const [posts, setPosts] = useState([]);
  const [justPosted, setJustPosted] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeRoute, setComposeRoute] = useState("General");

  const loadCommunityPosts = async () => {
    try {
      const res = await api.community.getPosts();
      if (res.posts) setPosts(res.posts);
    } catch {}
  };

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const handleQuickReport = async (type) => {
    const templates = {
      delay: "Held up near Tank No. 4 — a signal timing issue is causing minor traffic.",
      crowd: "Packed at Sector V during evening rush — expect standing room only.",
      closure: "Road partially restricted near Park Circus for repair work.",
      platform: "Metro Platform 2 escalator under maintenance — use stairs.",
    };

    const newPost = {
      userName: userName || "Commuter",
      type,
      tripKey: type === "platform" ? "office" : "home",
      routeLabel: type === "platform" ? "Metro · Blue" : "Route 12",
      message: templates[type] || "Transit update from commuter.",
    };

    try {
      const res = await api.community.createPost(newPost);
      if (res.post) {
        setPosts((prev) => [res.post, ...prev]);
      }
    } catch {
      setPosts((prev) => [
        { id: `local-${Date.now()}`, ...newPost, time: "Just now", confirms: 1 },
        ...prev,
      ]);
    }
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2000);
  };

  const handlePostCustom = async () => {
    const text = composeText.trim();
    if (!text) return;

    const newPost = {
      userName: userName || "Commuter",
      type: "custom",
      tripKey: composeRoute === "Metro · Blue" ? "office" : composeRoute === "Route 12" ? "home" : null,
      routeLabel: composeRoute,
      message: text,
    };

    try {
      const res = await api.community.createPost(newPost);
      if (res.post) {
        setPosts((prev) => [res.post, ...prev]);
      }
    } catch {
      setPosts((prev) => [
        { id: `local-${Date.now()}`, ...newPost, time: "Just now", confirms: 1 },
        ...prev,
      ]);
    }

    setComposeText("");
    setComposeRoute("General");
    setComposeOpen(false);
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2000);
  };

  const handleConfirm = async (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, confirms: p.confirms + 1 } : p))
    );
    try {
      await api.community.confirmPost(id);
    } catch {}
  };

  const handleDeletePost = async (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.community.deletePost(id);
    } catch {}
  };

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-7 pb-4">
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          COMMUNITY
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1">Commuter Reports</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          Real updates from people on the move right now
        </p>
      </div>

      <div className="px-6 pb-4">
        <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: "var(--tm-muted)" }}>
          <Plus size={12} /> Share what you're seeing
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {REPORT_TYPES.map((r) => {
            const tone = REPORT_TONE[r.type];
            const Icon = tone.icon;
            return (
              <button
                key={r.type}
                onClick={() => handleQuickReport(r.type)}
                className="tm-hover shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full"
                style={{ background: tone.bg, border: "1px solid var(--tm-border)", color: tone.color }}
              >
                <Icon size={13} />
                {r.label}
              </button>
            );
          })}
          <button
            onClick={() => setComposeOpen((v) => !v)}
            className="tm-hover shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-full"
            style={{
              background: composeOpen ? "var(--tm-accent-soft)" : "var(--tm-card-alt)",
              border: `1px solid ${composeOpen ? "var(--tm-accent-border)" : "var(--tm-border)"}`,
              color: composeOpen ? "var(--tm-accent)" : "var(--tm-body)",
            }}
          >
            <Pencil size={13} />
            Write your own
          </button>
        </div>

        {composeOpen && (
          <div className="tm-fade-in tm-card rounded-2xl p-4 mt-3 flex flex-col gap-3">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="What's happening on your route right now?"
              rows={3}
              className="tm-input w-full bg-transparent outline-none text-sm resize-none"
              style={{ color: "var(--tm-heading)" }}
            />
            <div className="flex gap-2 overflow-x-auto">
              {COMPOSE_ROUTE_OPTIONS.map((label) => {
                const active = composeRoute === label;
                return (
                  <button
                    key={label}
                    onClick={() => setComposeRoute(label)}
                    className="shrink-0 text-[11px] px-2.5 py-1 rounded-full"
                    style={{
                      background: active ? "var(--tm-accent)" : "var(--tm-card-alt)",
                      color: active ? "var(--tm-on-accent)" : "var(--tm-muted)",
                      border: `1px solid ${active ? "transparent" : "var(--tm-border)"}`,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setComposeOpen(false);
                  setComposeText("");
                }}
                className="flex-1 rounded-xl py-2 text-xs font-medium"
                style={{ background: "var(--tm-card-alt)", color: "var(--tm-body)", border: "1px solid var(--tm-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={handlePostCustom}
                disabled={!composeText.trim()}
                className="flex-1 rounded-xl py-2 text-xs font-medium flex items-center justify-center gap-1.5"
                style={{
                  background: "var(--tm-accent)",
                  color: "var(--tm-on-accent)",
                  opacity: composeText.trim() ? 1 : 0.5,
                }}
              >
                <Send size={13} />
                Post
              </button>
            </div>
          </div>
        )}

        {justPosted && (
          <p className="text-[11px] mt-2" style={{ color: "var(--tm-teal)" }}>
            Thanks — your report is live on the backend for other commuters.
          </p>
        )}
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-3 overflow-y-auto">
        {posts.map((post, i) => {
          const tone = REPORT_TONE[post.type] || REPORT_TONE.custom;
          const Icon = tone.icon || MessageCircle;
          return (
            <div
              key={post.id}
              className="tm-card tm-fade-in rounded-2xl p-4"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: tone.bg }}
                >
                  <Icon size={16} style={{ color: tone.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--tm-heading)" }}>
                    {post.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => post.tripKey && onSelectRoute(post.tripKey, post.routeLabel)}
                      disabled={!post.tripKey}
                      className="text-[10px] px-2 py-0.5 rounded-md"
                      style={{
                        background: "var(--tm-card-alt)",
                        color: post.tripKey ? "var(--tm-accent)" : "var(--tm-muted)",
                      }}
                    >
                      {post.routeLabel}
                    </button>
                    <span className="text-[10px]" style={{ color: "var(--tm-muted)" }}>
                      {post.time}
                    </span>
                    {post.userName && (
                      <span className="text-[10px]" style={{ color: "var(--tm-muted)" }}>
                        · {post.userName}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="tm-hover w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ color: "var(--tm-muted)" }}
                  aria-label="Delete this post"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <button
                onClick={() => handleConfirm(post.id)}
                className="tm-hover mt-3 w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg"
                style={{ background: "var(--tm-card-alt)", color: "var(--tm-body)", border: "1px solid var(--tm-border)" }}
              >
                <ThumbsUp size={13} />
                Still happening · {post.confirms}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoutesScreen({ title, options, routePriority, onBack, onPick }) {
  const sortedOptions = [...options].sort((a, b) => {
    if (a.key === routePriority) return -1;
    if (b.key === routePriority) return 1;
    return 0;
  });

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="relative px-6 pt-7 pb-5">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          SALT LAKE, SECTOR V →
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1 truncate">{title}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--tm-muted)" }}>
          3 ways to get there, compared
        </p>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-3 overflow-y-auto">
        {sortedOptions.map((option, i) => {
          const Icon = option.icon || Zap;
          const crowd = CROWD_STYLE[option.crowd] || CROWD_STYLE.Medium;
          const isDefault = option.key === routePriority;
          return (
            <button
              key={option.key}
              onClick={() => onPick(option)}
              className="tm-card tm-fade-in rounded-2xl p-4 text-left tm-hover transition"
              style={{
                animationDelay: `${i * 0.05}s`,
                border: isDefault ? "1px solid var(--tm-accent-border)" : "1px solid var(--tm-border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] uppercase px-2 py-1 rounded-md tm-eyebrow"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    {option.tag}
                  </span>
                  {isDefault && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--tm-accent)", color: "var(--tm-on-accent)" }}
                    >
                      Your default
                    </span>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--tm-accent-soft)" }}
                >
                  <Icon size={15} style={{ color: "var(--tm-accent)" }} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Bus size={14} style={{ color: "var(--tm-muted)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
                  {option.mode}
                </p>
              </div>

              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--tm-body)" }}>
                {option.detail}
              </p>

              <div className="flex items-center gap-4 pt-3" style={{ borderTop: "1px solid var(--tm-border)" }}>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} style={{ color: "var(--tm-muted)" }} />
                  <span className="text-xs tm-mono" style={{ color: "var(--tm-heading)" }}>
                    {option.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IndianRupee size={13} style={{ color: "var(--tm-muted)" }} />
                  <span className="text-xs tm-mono" style={{ color: "var(--tm-heading)" }}>
                    {option.fare.replace("₹", "")}
                  </span>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md ml-auto"
                  style={{ color: crowd.color, background: crowd.bg }}
                >
                  {option.crowd} crowd
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SettingsScreen({
  userName,
  userEmail,
  isGuest,
  theme,
  setTheme,
  notificationsOn,
  setNotificationsOn,
  routePriority,
  setRoutePriority,
  unitPref,
  setUnitPref,
  preferredModes,
  setPreferredModes,
  onOpenAdmin,
  onBack,
  onLogout,
  onDeleteAccount,
}) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const ROUTE_PRIORITY_OPTIONS = [
    { key: "fastest", label: "Fastest" },
    { key: "cheapest", label: "Cheapest" },
    { key: "calm", label: "Least crowded" },
  ];

  const toggleMode = (mode) => {
    setPreferredModes(
      preferredModes.includes(mode)
        ? preferredModes.filter((m) => m !== mode)
        : [...preferredModes, mode]
    );
  };

  return (
    <div className="tm-screen-fade flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-7 pb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center tm-card-alt mb-4"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} style={{ color: "var(--tm-heading)" }} />
        </button>
        <p className="text-xs tm-mono" style={{ color: "var(--tm-muted)" }}>
          YOUR ACCOUNT
        </p>
        <h1 className="tm-display text-xl font-semibold mt-1">Settings</h1>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col gap-6 overflow-y-auto">
        <div className="tm-card-alt rounded-2xl p-4 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center tm-display text-sm font-semibold shrink-0"
            style={{ background: "var(--tm-card)", color: "var(--tm-heading)", boxShadow: "0 0 0 1px var(--tm-accent-border)" }}
          >
            {(userName || "G")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--tm-heading)" }}>
              {isGuest ? "Guest session" : userName || "Guest"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--tm-muted)" }}>
              {isGuest ? "Sign in to save your trips and preferences" : userEmail}
            </p>
          </div>
        </div>

        {/* Transit Authority Admin Console Link */}
        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Hackathon Evaluator Tools
          </p>
          <button
            onClick={onOpenAdmin}
            className="w-full tm-card tm-hover rounded-2xl p-4 flex items-center justify-between text-left"
            style={{ border: "1px solid var(--tm-accent-border)" }}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} style={{ color: "var(--tm-accent)" }} />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--tm-heading)" }}>
                  Transit Authority Console
                </p>
                <p className="text-[11px]" style={{ color: "var(--tm-muted)" }}>
                  Fleet telemetry, delay injector, and database stats
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "var(--tm-accent)" }} />
          </button>
        </div>

        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Appearance
          </p>
          <div className="tm-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={16} style={{ color: "var(--tm-accent)" }} />
              ) : (
                <Sun size={16} style={{ color: "var(--tm-accent)" }} />
              )}
              <p className="text-sm" style={{ color: "var(--tm-heading)" }}>
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-11 h-6 rounded-full transition"
              style={{ background: theme === "dark" ? "var(--tm-accent)" : "var(--tm-border)" }}
              aria-label="Toggle dark mode"
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                style={{
                  background: "#FFFFFF",
                  left: theme === "dark" ? "22px" : "2px",
                }}
              />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Notifications
          </p>
          <div className="tm-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={16} style={{ color: "var(--tm-accent)" }} />
              <div>
                <p className="text-sm" style={{ color: "var(--tm-heading)" }}>
                  Push notifications
                </p>
                <p className="text-[11px]" style={{ color: "var(--tm-muted)" }}>
                  Delay alerts, predictive tips, community reports
                </p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsOn((v) => !v)}
              className="relative w-11 h-6 rounded-full transition shrink-0"
              style={{ background: notificationsOn ? "var(--tm-accent)" : "var(--tm-border)" }}
              aria-label="Toggle notifications"
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                style={{ background: "#FFFFFF", left: notificationsOn ? "22px" : "2px" }}
              />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Transit preferences
          </p>
          <div className="tm-card rounded-2xl p-4 flex flex-col gap-4">
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--tm-heading)" }}>
                Default route priority
              </p>
              <div className="flex gap-2 flex-wrap">
                {ROUTE_PRIORITY_OPTIONS.map((opt) => {
                  const active = routePriority === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setRoutePriority(opt.key)}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{
                        background: active ? "var(--tm-accent)" : "var(--tm-card-alt)",
                        color: active ? "var(--tm-on-accent)" : "var(--tm-body)",
                        border: `1px solid ${active ? "transparent" : "var(--tm-border)"}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--tm-border)" }} className="pt-4">
              <p className="text-sm mb-2" style={{ color: "var(--tm-heading)" }}>
                Modes you use
              </p>
              <div className="flex gap-2">
                {["Bus", "Metro"].map((mode) => {
                  const active = preferredModes.includes(mode);
                  return (
                    <button
                      key={mode}
                      onClick={() => toggleMode(mode)}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{
                        background: active ? "var(--tm-accent-soft)" : "var(--tm-card-alt)",
                        color: active ? "var(--tm-accent)" : "var(--tm-muted)",
                        border: `1px solid ${active ? "var(--tm-accent-border)" : "var(--tm-border)"}`,
                      }}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--tm-border)" }} className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler size={16} style={{ color: "var(--tm-accent)" }} />
                  <p className="text-sm" style={{ color: "var(--tm-heading)" }}>
                    Distance units
                  </p>
                </div>
                <div className="flex rounded-full tm-card-alt p-1">
                  {["metric", "imperial"].map((u) => {
                    const active = unitPref === u;
                    return (
                      <button
                        key={u}
                        onClick={() => setUnitPref(u)}
                        className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                        style={{
                          background: active ? "var(--tm-accent)" : "transparent",
                          color: active ? "var(--tm-on-accent)" : "var(--tm-muted)",
                        }}
                      >
                        {u === "metric" ? "m" : "ft"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tm-eyebrow inline-block px-2 py-1 rounded-md mb-3">
            Account actions
          </p>
          <div className="flex flex-col gap-2.5">
            {!logoutConfirm ? (
              <button
                onClick={() => setLogoutConfirm(true)}
                className="tm-card tm-hover rounded-xl p-3.5 flex items-center gap-3 text-left"
              >
                <LogOut size={16} style={{ color: "var(--tm-body)" }} />
                <p className="text-sm" style={{ color: "var(--tm-heading)" }}>
                  Log out
                </p>
              </button>
            ) : (
              <div className="tm-card rounded-xl p-3.5">
                <p className="text-xs mb-3" style={{ color: "var(--tm-body)" }}>
                  Log out of TransitMate?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLogoutConfirm(false)}
                    className="flex-1 rounded-lg py-2 text-xs font-medium"
                    style={{ background: "var(--tm-card-alt)", color: "var(--tm-body)", border: "1px solid var(--tm-border)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex-1 rounded-lg py-2 text-xs font-medium"
                    style={{ background: "var(--tm-accent)", color: "var(--tm-on-accent)" }}
                  >
                    Yes, log out
                  </button>
                </div>
              </div>
            )}

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="tm-hover rounded-xl p-3.5 flex items-center gap-3 text-left"
                style={{ background: "var(--tm-danger-soft)", border: "1px solid var(--tm-danger-soft)" }}
              >
                <Trash2 size={16} style={{ color: "var(--tm-danger)" }} />
                <p className="text-sm" style={{ color: "var(--tm-danger)" }}>
                  Delete account
                </p>
              </button>
            ) : (
              <div className="rounded-xl p-3.5" style={{ background: "var(--tm-danger-soft)", border: "1px solid var(--tm-danger-soft)" }}>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--tm-body)" }}>
                  This permanently deletes your account, saved trips, and habit history. This
                  can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 rounded-lg py-2 text-xs font-medium"
                    style={{ background: "var(--tm-card-alt)", color: "var(--tm-body)", border: "1px solid var(--tm-border)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDeleteAccount}
                    className="flex-1 rounded-lg py-2 text-xs font-medium"
                    style={{ background: "var(--tm-danger)", color: "#FFFFFF" }}
                  >
                    Delete everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
