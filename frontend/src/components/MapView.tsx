import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RiskZone, ClaimMapItem } from '@/services/location';

// ─── Fix Leaflet default icon broken by Vite bundler ─────────────────────────
// Use CDN URLs so we avoid Vite's asset transformation issues with PNG imports
const DEFAULT_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DEFAULT_ICON;

// ─── Risk level → colour config ──────────────────────────────────────────────
const LEVEL_CONFIG = {
  LOW:      { color: '#22c55e', fill: '#22c55e', opacity: 0.15 },
  MODERATE: { color: '#f59e0b', fill: '#f59e0b', opacity: 0.20 },
  HIGH:     { color: '#ef4444', fill: '#ef4444', opacity: 0.25 },
  CRITICAL: { color: '#7c3aed', fill: '#7c3aed', opacity: 0.35 },
};

// ─── Custom divIcon for risk level markers ────────────────────────────────────
const riskIcon = (level: keyof typeof LEVEL_CONFIG) => {
  const { color } = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.LOW;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 0 0 3px ${color}40;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

// ─── Custom icon for claim markers ───────────────────────────────────────────
const claimIcon = (status: string) => {
  const bg = status === 'approved' ? '#22c55e' : status === 'rejected' ? '#ef4444' : '#f59e0b';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;border-radius:6px;
      background:${bg};border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:11px;color:white;font-weight:700;
    ">₹</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// ─── User location pulse icon ─────────────────────────────────────────────────
const userIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="position:relative;">
      <div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.6);z-index:2;position:relative;"></div>
      <div style="width:32px;height:32px;border-radius:50%;background:rgba(59,130,246,0.25);position:absolute;top:-8px;left:-8px;animation:pulse 2s ease-in-out infinite;"></div>
      <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:0.2}}</style>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

// ─── Props ────────────────────────────────────────────────────────────────────
interface MapViewProps {
  userLat: number;
  userLng: number;
  riskZones?: RiskZone[];
  staticZones?: RiskZone[];
  claims?: ClaimMapItem[];
  showRiskZones?: boolean;
  showClaims?: boolean;
  height?: string;
}

const MapView = ({
  userLat,
  userLng,
  riskZones = [],
  staticZones = [],
  claims = [],
  showRiskZones = true,
  showClaims = true,
  height = '500px',
}: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialise map
    const map = L.map(containerRef.current, {
      center: [userLat, userLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap tiles — free, no API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Compact attribution in corner
    L.control.attribution({ prefix: '© OpenStreetMap' }).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // mount only

  // ── Update user marker when coords change ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([userLat, userLng], map.getZoom());
    const marker = L.marker([userLat, userLng], { icon: userIcon(), zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<b>📍 Your Location</b>');
    return () => { marker.remove(); };
  }, [userLat, userLng]);

  // ── Risk zone circles (static reference zones) ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showRiskZones) return;
    const layers: L.Layer[] = [];

    const allZones = [...staticZones, ...riskZones];
    for (const z of allZones) {
      const cfg = LEVEL_CONFIG[z.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.LOW;
      const radius = z.radius ?? 600;

      const circle = L.circle([z.lat, z.lng], {
        radius,
        color: cfg.color,
        fillColor: cfg.fill,
        fillOpacity: cfg.opacity,
        weight: 2,
      }).bindPopup(`
        <div style="min-width:170px;font-family:Inter,sans-serif">
          <div style="font-weight:700;color:#1e3a5f;font-size:13px">${z.name}</div>
          <div style="margin:6px 0;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${cfg.color}"></span>
            <span style="font-size:12px;font-weight:600;color:${cfg.color}">${z.level}</span>
            <span style="font-size:13px;font-weight:800;margin-left:auto;color:#1e3a5f">Score: ${z.score}</span>
          </div>
          ${z.message ? `<div style="font-size:11px;color:#6b7280;margin-top:4px">${z.message}</div>` : ''}
          ${z.rain !== undefined ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">🌧 Rain: ${Number(z.rain).toFixed(1)}mm · AQI: ${Math.round(z.aqi ?? 0)}</div>` : ''}
        </div>
      `);

      const dot = L.marker([z.lat, z.lng], { icon: riskIcon(z.level as any) });
      layers.push(circle, dot);
      circle.addTo(map);
      dot.addTo(map);
    }

    return () => { layers.forEach((l) => l.remove()); };
  }, [riskZones, staticZones, showRiskZones]);

  // ── Claim markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showClaims) return;
    const markers: L.Layer[] = [];

    for (const c of claims) {
      const m = L.marker([c.lat, c.lng], { icon: claimIcon(c.status) })
        .bindPopup(`
          <div style="min-width:160px;font-family:Inter,sans-serif">
            <div style="font-weight:700;color:#1e3a5f;font-size:13px">${c.claimId}</div>
            <div style="font-size:11px;color:#6b7280;margin:3px 0">Type: ${c.type?.toUpperCase()}</div>
            <div style="font-size:13px;font-weight:700;color:#166534">₹${c.amount}</div>
            <span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:600;
              background:${c.status === 'approved' ? '#dcfce7' : c.status === 'rejected' ? '#fee2e2' : '#fef9c3'};
              color:${c.status === 'approved' ? '#166534' : c.status === 'rejected' ? '#991b1b' : '#854d0e'}">
              ${c.status.toUpperCase()}
            </span>
          </div>
        `)
        .addTo(map);
      markers.push(m);
    }

    return () => { markers.forEach((m) => m.remove()); };
  }, [claims, showClaims]);

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden' }} />;
};

export default MapView;
