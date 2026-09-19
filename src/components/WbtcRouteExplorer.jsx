import React, { useState, useEffect, useMemo } from 'react';
import {
  Bus,
  Search,
  MapPin,
  Compass,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Navigation,
  Wind,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../services/api.js';

export default function WbtcRouteExplorer({
  userCoords,
  onSelectRouteForMap,
  onToast
}) {
  const [routes, setRoutes] = useState([]);
  const [nearbyRoutes, setNearbyRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'nearby' | 'ac'
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  // Load WBTC routes from backend
  const loadRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.routes.getWbtcRoutes({ limit: 150 });
      if (res && res.routes) {
        setRoutes(res.routes);
      }
    } catch (err) {
      console.warn('[WBTC Explorer] Failed to load routes:', err);
      if (onToast) onToast('Failed to load WBTC routes. Using cached state.');
    } finally {
      setLoading(false);
    }
  };

  // Load nearby routes when user coordinates change
  useEffect(() => {
    if (!userCoords?.latitude || !userCoords?.longitude) return;

    const fetchNearby = async () => {
      try {
        const res = await api.routes.getNearby(userCoords.latitude, userCoords.longitude, 3.5);
        if (res && res.nearby) {
          setNearbyRoutes(res.nearby);
        }
      } catch (err) {
        console.warn('[WBTC Explorer] Failed to fetch nearby:', err);
      }
    };

    fetchNearby();
  }, [userCoords?.latitude, userCoords?.longitude]);

  useEffect(() => {
    loadRoutes();
  }, []);

  // Handle on-demand sync from official portal
  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.routes.syncWbtc();
      if (res && res.success) {
        if (onToast) onToast(`Synchronized ${res.count} live routes from WBTC!`);
        await loadRoutes();
      }
    } catch (err) {
      if (onToast) onToast('Sync failed. Please check internet connection.');
    } finally {
      setSyncing(false);
    }
  };

  // Filter routes
  const filteredRoutes = useMemo(() => {
    if (activeTab === 'nearby') {
      return nearbyRoutes.map(n => ({
        ...n.route,
        nearestStop: n.nearestStop,
        distanceKm: n.distanceKm,
        walkingTimeMin: n.walkingTimeMin
      }));
    }

    let list = routes;
    if (activeTab === 'ac') {
      list = list.filter(r => r.isAC);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(r =>
        r.routeNo.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        (r.rawStoppages && r.rawStoppages.toLowerCase().includes(q))
      );
    }

    return list;
  }, [routes, nearbyRoutes, activeTab, searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Sync Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--tm-heading)' }}>
            WBTC City Bus Network
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--tm-muted)' }}>
            Official Kolkata city bus routes & live corridor stops
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium tm-card-alt tm-hover transition-all"
          style={{ border: '1px solid var(--tm-border)', color: 'var(--tm-heading)' }}
          title="Fetch live updates from wbtconline.in"
        >
          <RefreshCw size={13} className={syncing ? 'animate-spin text-[var(--tm-accent)]' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync Live'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--tm-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search route (e.g., AC-1, 15, Sector V, Howrah)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs tm-card-alt"
          style={{
            border: '1px solid var(--tm-border)',
            color: 'var(--tm-heading)',
            outline: 'none',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--tm-muted)] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: activeTab === 'all' ? 'var(--tm-accent)' : 'var(--tm-card-alt)',
            color: activeTab === 'all' ? 'var(--tm-on-accent)' : 'var(--tm-muted)',
            border: `1px solid ${activeTab === 'all' ? 'transparent' : 'var(--tm-border)'}`,
          }}
        >
          All Routes ({routes.length})
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className="flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
          style={{
            background: activeTab === 'nearby' ? 'var(--tm-accent)' : 'var(--tm-card-alt)',
            color: activeTab === 'nearby' ? 'var(--tm-on-accent)' : 'var(--tm-muted)',
            border: `1px solid ${activeTab === 'nearby' ? 'transparent' : 'var(--tm-border)'}`,
          }}
        >
          <Navigation size={12} />
          Near Me ({nearbyRoutes.length})
        </button>

        <button
          onClick={() => setActiveTab('ac')}
          className="py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
          style={{
            background: activeTab === 'ac' ? 'var(--tm-accent)' : 'var(--tm-card-alt)',
            color: activeTab === 'ac' ? 'var(--tm-on-accent)' : 'var(--tm-muted)',
            border: `1px solid ${activeTab === 'ac' ? 'transparent' : 'var(--tm-border)'}`,
          }}
        >
          <Wind size={12} />
          AC Buses
        </button>
      </div>

      {/* Route List */}
      <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-0.5">
        {loading ? (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--tm-muted)' }}>
            Loading WBTC routes...
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--tm-muted)' }}>
            No matching WBTC routes found. Try a different search term.
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isExpanded = expandedRouteId === route.id;

            return (
              <div
                key={route.id}
                className="tm-card rounded-2xl p-4 transition-all"
                style={{ border: '1px solid var(--tm-border)' }}
              >
                {/* Main Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: route.isAC ? 'rgba(56, 189, 248, 0.15)' : 'rgba(201, 164, 97, 0.15)',
                        border: `1px solid ${route.isAC ? 'rgba(56, 189, 248, 0.3)' : 'rgba(201, 164, 97, 0.3)'}`,
                      }}
                    >
                      <Bus size={18} style={{ color: route.isAC ? '#38bdf8' : 'var(--tm-accent)' }} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: 'var(--tm-heading)' }}>
                          Route {route.routeNo}
                        </span>
                        {route.isAC && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-medium">
                            AC
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--tm-body)' }}>
                        <span>{route.origin}</span>
                        <ArrowRight size={11} style={{ color: 'var(--tm-muted)' }} />
                        <span>{route.destination}</span>
                      </p>
                    </div>
                  </div>

                  {/* Distance badge if nearby */}
                  {route.distanceKm !== undefined && (
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                        {route.distanceKm} km away
                      </span>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--tm-muted)' }}>
                        ~{route.walkingTimeMin}m walk
                      </p>
                    </div>
                  )}
                </div>

                {/* Sub-info */}
                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-[var(--tm-border)] text-[11px]" style={{ color: 'var(--tm-muted)' }}>
                  <span>{route.totalStops || route.stops?.length || 0} stops</span>
                  <span>•</span>
                  <span>Freq: {route.frequencyMin}</span>
                  <span>•</span>
                  <span>Fare: ₹{route.fareMin} - ₹{route.fareMax}</span>
                </div>

                {/* Nearest stop callout if available */}
                {route.nearestStop && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[var(--tm-card-alt)] flex items-center gap-2 text-xs">
                    <MapPin size={13} className="text-[var(--tm-accent)] shrink-0" />
                    <span className="truncate">
                      Closest boarding stop: <strong className="text-white">{route.nearestStop.name}</strong>
                    </span>
                  </div>
                )}

                {/* Actions: View on Map & Expand Stops */}
                <div className="flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => onSelectRouteForMap(route)}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: 'var(--tm-accent-soft)',
                      color: 'var(--tm-accent)',
                      border: '1px solid var(--tm-accent-border)',
                    }}
                  >
                    <Compass size={13} />
                    <span>Track on Live Map</span>
                  </button>

                  <button
                    onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                    className="p-1.5 rounded-xl tm-card-alt tm-hover"
                    style={{ border: '1px solid var(--tm-border)', color: 'var(--tm-muted)' }}
                    title={isExpanded ? 'Collapse stoppages' : 'View all stoppages'}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Stops Sequence */}
                {isExpanded && route.stops && (
                  <div className="mt-3 pt-3 border-t border-[var(--tm-border)] tm-fade-in">
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--tm-muted)' }}>
                      Complete Stop Sequence ({route.stops.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {route.stops.map((stop, sIdx) => (
                        <span
                          key={`${stop}-${sIdx}`}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--tm-card-alt)] border border-[var(--tm-border)]"
                          style={{ color: 'var(--tm-body)' }}
                        >
                          {sIdx + 1}. {stop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
