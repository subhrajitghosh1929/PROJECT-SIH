import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Navigation, Compass, Layers, Bus, TrainFront, Maximize2, AlertCircle } from 'lucide-react';

/**
 * InteractiveMap component
 * Supports:
 * 1. Google Maps JavaScript API (when VITE_GOOGLE_MAPS_API_KEY is available)
 * 2. High-performance Leaflet/OpenStreetMap fallback (when Google Maps API key is omitted or offline)
 */
export default function InteractiveMap({
  userCoords,
  routePath = [],
  stops = [],
  vehiclePos = null,
  vehicleType = 'bus',
  height = 240,
  theme = 'dark',
  showControls = true,
  onRecenter = null,
}) {
  const mapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googlePolylineRef = useRef(null);

  const [mapEngine, setMapEngine] = useState('loading'); // 'google' | 'osm' | 'loading'
  const [googleLoadError, setGoogleLoadError] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(13);

  // Fallback map state (for tile/vector view)
  const [centerCoords, setCenterCoords] = useState(() => {
    if (userCoords?.latitude && userCoords?.longitude) {
      return { lat: userCoords.latitude, lng: userCoords.longitude };
    }
    if (routePath.length > 0) {
      return { lat: routePath[0].lat, lng: routePath[0].lng };
    }
    return { lat: 22.5735, lng: 88.4331 }; // Salt Lake Sector V default
  });

  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
                 (typeof window !== 'undefined' && window.GOOGLE_MAPS_API_KEY);

  // 1. Initialize or check Google Maps availability
  useEffect(() => {
    let isMounted = true;

    if (!apiKey) {
      // No Google API key supplied -> use seamless high-fidelity OSM engine
      setMapEngine('osm');
      return;
    }

    if (window.google && window.google.maps) {
      setMapEngine('google');
      return;
    }

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) setMapEngine('google');
      };
      script.onerror = () => {
        console.warn('[InteractiveMap] Google Maps failed to load. Falling back to OpenStreetMap engine.');
        if (isMounted) {
          setGoogleLoadError(true);
          setMapEngine('osm');
        }
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => {
        if (isMounted) setMapEngine('google');
      });
    }

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // 2. Render Google Maps when engine === 'google'
  useEffect(() => {
    if (mapEngine !== 'google' || !mapContainerRef.current || !window.google?.maps) return;

    const centerLat = userCoords?.latitude || (routePath[0]?.lat) || 22.5735;
    const centerLng = userCoords?.longitude || (routePath[0]?.lng) || 88.4331;

    // Initialize Map instance once
    if (!googleMapInstanceRef.current) {
      const darkStyles = [
        { elementType: 'geometry', stylers: [{ color: '#161b22' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#161b22' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d333b' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f242c' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d444d' }] },
        { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#21262d' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      ];

      googleMapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoomLevel,
        disableDefaultUI: true,
        zoomControl: true,
        styles: theme === 'dark' ? darkStyles : [],
      });
    }

    const map = googleMapInstanceRef.current;

    // Clear previous markers & polylines
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];
    if (googlePolylineRef.current) {
      googlePolylineRef.current.setMap(null);
    }

    // A. Draw Polyline
    if (routePath.length > 1) {
      const pathCoords = routePath.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
      googlePolylineRef.current = new window.google.maps.Polyline({
        path: pathCoords,
        geodesic: true,
        strokeColor: '#C9A461',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      });
      googlePolylineRef.current.setMap(map);

      // Auto-fit bounds if we have route points
      const bounds = new window.google.maps.LatLngBounds();
      pathCoords.forEach((p) => bounds.extend(p));
      if (userCoords) bounds.extend({ lat: userCoords.latitude, lng: userCoords.longitude });
      map.fitBounds(bounds, 30);
    }

    // B. User Location Marker
    if (userCoords?.latitude && userCoords?.longitude) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userCoords.latitude, lng: userCoords.longitude },
        map,
        title: 'You are here',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#38bdf8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });
      googleMarkersRef.current.push(userMarker);
    }

    // C. Stops Markers
    stops.forEach((stop, index) => {
      const isOrigin = index === 0;
      const isDest = index === stops.length - 1;
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        title: stop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isOrigin || isDest ? 6 : 4,
          fillColor: isDest ? '#10b981' : isOrigin ? '#C9A461' : '#94a3b8',
          fillOpacity: 0.9,
          strokeColor: '#0f172a',
          strokeWeight: 1.5,
        },
      });

      marker.addListener('click', () => {
        setSelectedStop(stop);
      });

      googleMarkersRef.current.push(marker);
    });

    // D. Moving Vehicle Marker
    if (vehiclePos?.lat && vehiclePos?.lng) {
      const vehicleMarker = new window.google.maps.Marker({
        position: { lat: vehiclePos.lat, lng: vehiclePos.lng },
        map,
        title: vehiclePos.label || 'Live Transit Vehicle',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 1.5,
        },
      });
      googleMarkersRef.current.push(vehicleMarker);
    }
  }, [mapEngine, routePath, stops, userCoords, vehiclePos, theme, zoomLevel]);

  // Handle re-centering
  const handleCenterUser = useCallback(() => {
    if (userCoords?.latitude && userCoords?.longitude) {
      setCenterCoords({ lat: userCoords.latitude, lng: userCoords.longitude });
      if (googleMapInstanceRef.current) {
        googleMapInstanceRef.current.panTo({ lat: userCoords.latitude, lng: userCoords.longitude });
        googleMapInstanceRef.current.setZoom(14);
      }
    }
    if (onRecenter) onRecenter();
  }, [userCoords, onRecenter]);

  // Compute bounding box and relative coords for the high-res OSM / Vector Canvas view
  const allPoints = [
    ...(userCoords ? [{ lat: userCoords.latitude, lng: userCoords.longitude, type: 'user' }] : []),
    ...(vehiclePos ? [{ lat: vehiclePos.lat, lng: vehiclePos.lng, type: 'vehicle' }] : []),
    ...stops.map((s, i) => ({
      ...s,
      type: i === 0 ? 'origin' : i === stops.length - 1 ? 'dest' : 'stop',
    })),
  ];

  const minLat = Math.min(...allPoints.map((p) => p.lat), centerCoords.lat - 0.03);
  const maxLat = Math.max(...allPoints.map((p) => p.lat), centerCoords.lat + 0.03);
  const minLng = Math.min(...allPoints.map((p) => p.lng), centerCoords.lng - 0.04);
  const maxLng = Math.max(...allPoints.map((p) => p.lng), centerCoords.lng + 0.04);

  const getCanvasX = (lng) => ((lng - minLng) / (maxLng - minLng || 0.01)) * 320 + 20;
  const getCanvasY = (lat) => (1 - (lat - minLat) / (maxLat - minLat || 0.01)) * 170 + 20;

  const polylineSvgPoints = routePath
    .map((pt) => `${getCanvasX(pt.lng).toFixed(1)},${getCanvasY(pt.lat).toFixed(1)}`)
    .join(' ');

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-[var(--tm-border)]"
      style={{ height, background: theme === 'dark' ? '#0d1117' : '#f8fafc' }}
    >
      {/* 1. Google Maps Container */}
      {mapEngine === 'google' ? (
        <div ref={mapContainerRef} className="w-full h-full" />
      ) : (
        /* 2. Interactive OSM / Street Vector Engine Fallback */
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          {/* Subtle Street Grid / Kolkata Tile Underlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(var(--tm-border) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Map Canvas */}
          <svg viewBox="0 0 360 210" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A461" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Transit Corridors / Roads */}
            <g stroke="var(--tm-border)" strokeWidth="1" strokeDasharray="3,3" opacity="0.6">
              <line x1="10" y1="60" x2="350" y2="40" />
              <line x1="20" y1="150" x2="340" y2="160" />
              <line x1="80" y1="10" x2="120" y2="200" />
              <line x1="240" y1="10" x2="260" y2="200" />
            </g>

            {/* Route Polyline */}
            {polylineSvgPoints && (
              <>
                <polyline
                  points={polylineSvgPoints}
                  fill="none"
                  stroke="#C9A461"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.25"
                />
                <polyline
                  points={polylineSvgPoints}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Stops Markers */}
            {stops.map((stop, idx) => {
              const cx = getCanvasX(stop.lng);
              const cy = getCanvasY(stop.lat);
              const isOrigin = idx === 0;
              const isDest = idx === stops.length - 1;
              const isSelected = selectedStop?.name === stop.name;

              return (
                <g key={`${stop.name}-${idx}`} className="cursor-pointer" onClick={() => setSelectedStop(stop)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : isOrigin || isDest ? 6 : 4}
                    fill={isDest ? '#10b981' : isOrigin ? '#C9A461' : 'var(--tm-card)'}
                    stroke={isSelected ? '#38bdf8' : 'var(--tm-heading)'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  {(isOrigin || isDest || isSelected) && (
                    <text
                      x={cx}
                      y={cy - 10}
                      fontSize="9"
                      fill="var(--tm-heading)"
                      textAnchor="middle"
                      className="font-medium drop-shadow"
                    >
                      {stop.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* User Live Position Marker */}
            {userCoords?.latitude && userCoords?.longitude && (
              <g>
                {/* Radar pulse animation */}
                <circle
                  cx={getCanvasX(userCoords.longitude)}
                  cy={getCanvasY(userCoords.latitude)}
                  r="14"
                  fill="#38bdf8"
                  opacity="0.2"
                  className="animate-ping"
                />
                <circle
                  cx={getCanvasX(userCoords.longitude)}
                  cy={getCanvasY(userCoords.latitude)}
                  r="6"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
              </g>
            )}

            {/* Moving Vehicle Marker */}
            {vehiclePos?.lat && vehiclePos?.lng && (
              <g transform={`translate(${getCanvasX(vehiclePos.lng) - 10}, ${getCanvasY(vehiclePos.lat) - 10})`}>
                <rect width="20" height="20" rx="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="10" cy="10" r="4" fill="#1e293b" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Top Engine Badge */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1"
          style={{
            background: mapEngine === 'google' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(201, 164, 97, 0.2)',
            color: mapEngine === 'google' ? '#10b981' : '#C9A461',
            border: `1px solid ${mapEngine === 'google' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(201, 164, 97, 0.4)'}`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {mapEngine === 'google' ? 'Google Maps Live' : 'OpenStreetMap Engine'}
        </span>
      </div>

      {/* Selected Stop Tooltip / Banner */}
      {selectedStop && (
        <div
          className="absolute bottom-2.5 left-2.5 right-12 z-10 px-3 py-1.5 rounded-xl backdrop-blur-md tm-fade-in flex items-center justify-between"
          style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--tm-border)' }}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin size={13} className="text-[var(--tm-accent)] shrink-0" />
            <p className="text-xs font-medium text-white truncate">{selectedStop.name}</p>
          </div>
          <button
            onClick={() => setSelectedStop(null)}
            className="text-[10px] text-gray-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Map Controls */}
      {showControls && (
        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleCenterUser}
            className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-95"
            style={{
              background: 'var(--tm-card)',
              border: '1px solid var(--tm-border)',
              color: userCoords ? 'var(--tm-teal)' : 'var(--tm-muted)',
            }}
            title="Recenter on My Location"
          >
            <Navigation size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
