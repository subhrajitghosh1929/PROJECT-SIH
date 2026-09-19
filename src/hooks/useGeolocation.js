import { useState, useEffect, useCallback } from 'react';

export const KOLKATA_PRESETS = [
  { id: 'sector-v', name: 'Salt Lake, Sector V', lat: 22.5735, lng: 88.4331 },
  { id: 'esplanade', name: 'Esplanade Central', lat: 22.5645, lng: 88.3518 },
  { id: 'howrah', name: 'Howrah Station', lat: 22.5850, lng: 88.3426 },
  { id: 'park-street', name: 'Park Street', lat: 22.5510, lng: 88.3524 },
  { id: 'airport', name: 'Airport (CCU)', lat: 22.6547, lng: 88.4467 }
];

export function useGeolocation(initialPresetId = 'sector-v') {
  const [coords, setCoords] = useState(() => {
    const defaultPreset = KOLKATA_PRESETS.find(p => p.id === initialPresetId) || KOLKATA_PRESETS[0];
    return {
      latitude: defaultPreset.lat,
      longitude: defaultPreset.lng,
      accuracy: 10,
      heading: null,
      speed: null,
      source: 'preset',
      presetName: defaultPreset.name
    };
  });

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');

  // Check permission on mount if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => setPermissionState(result.state);
        })
        .catch(() => {});
    }
  }, []);

  const requestRealLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          source: 'gps',
          presetName: null
        });
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === 1) msg = 'Location permission denied by browser. Using Kolkata preset.';
        if (err.code === 2) msg = 'Location position unavailable. Using Kolkata preset.';
        if (err.code === 3) msg = 'Location request timed out. Using Kolkata preset.';
        setError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  }, []);

  const setPresetLocation = useCallback((presetId) => {
    const p = KOLKATA_PRESETS.find(item => item.id === presetId) || KOLKATA_PRESETS[0];
    setError(null);
    setCoords({
      latitude: p.lat,
      longitude: p.lng,
      accuracy: 15,
      heading: null,
      speed: null,
      source: 'preset',
      presetName: p.name
    });
  }, []);

  return {
    coords,
    isLocating,
    error,
    permissionState,
    requestRealLocation,
    setPresetLocation,
    presets: KOLKATA_PRESETS
  };
}
