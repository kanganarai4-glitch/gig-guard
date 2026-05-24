import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, AlertTriangle, MapPin,
  Navigation, Layers, Shield, RefreshCw,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useToast } from "@/hooks/use-toast";
import {
  getUserLocation, updateLocation, getRiskZones, getClaimsMap,
  RiskZone, ClaimMapItem,
} from "@/services/location";
import { getSocket, onRiskUpdate } from "@/services/socket";
import { getStoredUser } from "@/services/auth";

// ─── Lazy-load MapView to avoid SSR import issues with Leaflet ────────────────
import MapView from "@/components/MapView";

// ─── Fraud Detection types / data ────────────────────────────────────────────
type Scenario = "normal" | "spoof" | "curfew";

const checksData: Record<Scenario, { label: string; desc: string; status: "pass" | "fail" | "warn" }[]> = {
  normal: [
    { label: "GPS location valid", desc: "Worker in claimed zone (Andheri)", status: "pass" },
    { label: "Movement pattern normal", desc: "Speed 18km/h consistent route", status: "pass" },
    { label: "No duplicate claim", desc: "No claim in last 4 hrs for zone", status: "pass" },
    { label: "Weather data matches", desc: "Rain 22mm/hr confirmed in zone", status: "pass" },
    { label: "App activity consistent", desc: "Order accepted 12 min ago", status: "pass" },
  ],
  spoof: [
    { label: "GPS location invalid", desc: "Claimed Andheri but cell tower shows Pune", status: "fail" },
    { label: "Movement anomaly", desc: "Teleported 148km in 3 minutes", status: "fail" },
    { label: "No duplicate claim", desc: "No claim in last 4 hrs for zone", status: "pass" },
    { label: "Weather data matches", desc: "Rain 22mm/hr confirmed in Andheri", status: "pass" },
    { label: "App activity mismatch", desc: "No orders accepted in claimed zone", status: "fail" },
  ],
  curfew: [
    { label: "GPS location valid", desc: "Worker in claimed zone (Andheri)", status: "pass" },
    { label: "Movement pattern normal", desc: "Speed 12km/h consistent route", status: "pass" },
    { label: "No duplicate claim", desc: "No claim in last 4 hrs for zone", status: "pass" },
    { label: "Weather data matches", desc: "No severe weather — curfew trigger", status: "warn" },
    { label: "App activity consistent", desc: "Order accepted 8 min ago", status: "pass" },
  ],
};

const verdicts: Record<Scenario, { text: string; color: string; bg: string }> = {
  normal: { text: "Claim approved — All fraud checks passed. Payout initiated.", color: "#166534", bg: "#dcfce7" },
  spoof: { text: "Fraud detected — Claim blocked. GPS location does not match cell tower data.", color: "#991b1b", bg: "#fee2e2" },
  curfew: { text: "Under review — Worker inside curfew boundary but claim trigger is borderline.", color: "#854d0e", bg: "#fef9c3" },
};

const StatusIcon = ({ status }: { status: "pass" | "fail" | "warn" }) => {
  if (status === "pass") return <CheckCircle size={18} className="text-emerald-500 shrink-0" />;
  if (status === "fail") return <XCircle size={18} className="text-red-500 shrink-0" />;
  return <AlertTriangle size={18} className="text-amber-500 shrink-0" />;
};

// ─── Legend pill ─────────────────────────────────────────────────────────────
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <div className="w-3 h-3 rounded-full border border-white/50" style={{ background: color }} />
    {label}
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const FraudMap = () => {
  const { toast } = useToast();
  const storedUser = getStoredUser();
  const headerRef = useScrollReveal<HTMLDivElement>();

  const [tab, setTab] = useState<"map" | "fraud">("map");
  const [scenario, setScenario] = useState<Scenario>("normal");

  // Map state
  const [userLat, setUserLat] = useState(19.076);
  const [userLng, setUserLng] = useState(72.8777);
  const [locationLabel, setLocationLabel] = useState("Mumbai, Maharashtra");
  const [locating, setLocating] = useState(false);

  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [staticZones, setStaticZones] = useState<RiskZone[]>([]);
  const [claims, setClaims] = useState<ClaimMapItem[]>([]);
  const [showRisk, setShowRisk] = useState(true);
  const [showClaims, setShowClaims] = useState(true);
  const [loading, setLoading] = useState(true);

  // ── Fetch map data ─────────────────────────────────────────────────────────
  const fetchMapData = useCallback(async () => {
    try {
      const [zones, claimsData] = await Promise.all([
        getRiskZones(),
        getClaimsMap(),
      ]);
      setRiskZones(zones.userZones);
      setStaticZones(zones.staticZones);
      setClaims(claimsData);
    } catch (err) {
      console.warn("Map data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Get user location & push to backend ───────────────────────────────────
  const locateMe = useCallback(async () => {
    setLocating(true);
    try {
      const { latitude, longitude, accuracy } = await getUserLocation();
      setUserLat(latitude);
      setUserLng(longitude);
      setLocationLabel(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

      // Push to backend (fire-and-forget)
      updateLocation({ latitude, longitude, accuracy }).catch(() => {});

      if (accuracy < 100) {
        toast({ title: "📍 Location updated", description: `Accuracy: ~${Math.round(accuracy)}m` });
      }
    } catch {
      toast({ title: "Location unavailable", description: "Using Mumbai as default", variant: "destructive" });
    } finally {
      setLocating(false);
    }
  }, [toast]);

  // ── Mount: get location + fetch data ──────────────────────────────────────
  useEffect(() => {
    locateMe();
    fetchMapData();
  }, [fetchMapData]);

  // ── Real-time: update risk zone on socket event ───────────────────────────
  useEffect(() => {
    onRiskUpdate((data: any) => {
      // Update the user's own zone in the list
      const uid = storedUser?._id;
      if (!uid) return;
      setRiskZones((prev) => {
        const updated = prev.filter((z) => z.id !== uid);
        return [{ ...data, id: uid, name: storedUser?.zone || "Your Zone", lat: userLat, lng: userLng }, ...updated];
      });
    });
  }, [userLat, userLng, storedUser]);

  const levelCounts = {
    LOW: staticZones.filter((z) => z.level === "LOW").length,
    MODERATE: staticZones.filter((z) => z.level === "MODERATE").length,
    HIGH: staticZones.filter((z) => z.level === "HIGH").length,
    CRITICAL: staticZones.filter((z) => z.level === "CRITICAL").length,
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--navy))]">Risk & Fraud Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live zone monitoring · {staticZones.length + riskZones.length} zones tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="tab-map"
            onClick={() => setTab("map")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "map" ? "bg-[hsl(var(--primary))] text-white" : "glass-card text-muted-foreground hover:text-[hsl(var(--navy))]"}`}
          >
            <span className="flex items-center gap-2"><MapPin size={14} /> Live Map</span>
          </button>
          <button
            id="tab-fraud"
            onClick={() => setTab("fraud")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "fraud" ? "bg-[hsl(var(--primary))] text-white" : "glass-card text-muted-foreground hover:text-[hsl(var(--navy))]"}`}
          >
            <span className="flex items-center gap-2"><Shield size={14} /> Fraud Engine</span>
          </button>
        </div>
      </div>

      {/* ── MAP TAB ───────────────────────────────────────────────────────── */}
      {tab === "map" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-4 flex-wrap">
            {/* Location info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1 min-w-0">
              <MapPin size={14} className="text-[hsl(var(--primary))] shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>

            {/* Layer toggles */}
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <Layers size={14} className="text-muted-foreground" />
              <button
                onClick={() => setShowRisk((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${showRisk ? "border-amber-400 bg-amber-50 text-amber-700" : "border-white/30 text-muted-foreground"}`}
              >
                <div className={`w-2 h-2 rounded-full ${showRisk ? "bg-amber-400" : "bg-gray-300"}`} />
                Risk Zones
              </button>
              <button
                onClick={() => setShowClaims((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${showClaims ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-white/30 text-muted-foreground"}`}
              >
                <div className={`w-2 h-2 rounded-full ${showClaims ? "bg-emerald-400" : "bg-gray-300"}`} />
                My Claims ({claims.length})
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                id="refresh-map"
                onClick={fetchMapData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 text-xs text-muted-foreground hover:text-[hsl(var(--navy))] transition-all"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                id="locate-me"
                onClick={locateMe}
                disabled={locating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--primary))] text-white text-xs font-medium hover:opacity-90 transition-all"
              >
                <Navigation size={12} className={locating ? "animate-spin" : ""} />
                {locating ? "Locating…" : "Locate Me"}
              </button>
            </div>
          </div>

          {/* MAP */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/20">
            <MapView
              userLat={userLat}
              userLng={userLng}
              riskZones={riskZones}
              staticZones={staticZones}
              claims={showClaims ? claims : []}
              showRiskZones={showRisk}
              showClaims={showClaims}
              height="520px"
            />
          </div>

          {/* Zone summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { level: "LOW", color: "#22c55e", bg: "#f0fdf4", label: "Low Risk", count: levelCounts.LOW },
              { level: "MODERATE", color: "#f59e0b", bg: "#fffbeb", label: "Moderate", count: levelCounts.MODERATE },
              { level: "HIGH", color: "#ef4444", bg: "#fef2f2", label: "High Risk", count: levelCounts.HIGH },
              { level: "CRITICAL", color: "#7c3aed", bg: "#f5f3ff", label: "Critical", count: levelCounts.CRITICAL },
            ].map((z) => (
              <div key={z.level} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background: z.bg }}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: z.color }} />
                <div>
                  <div className="text-xs text-muted-foreground">{z.label}</div>
                  <div className="text-lg font-bold" style={{ color: z.color }}>{z.count} zones</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
            <span className="text-xs font-medium text-[hsl(var(--navy))]">Legend:</span>
            <LegendItem color="#3b82f6" label="Your location" />
            <LegendItem color="#22c55e" label="Low risk zone" />
            <LegendItem color="#f59e0b" label="Moderate risk" />
            <LegendItem color="#ef4444" label="High risk" />
            <LegendItem color="#7c3aed" label="Critical" />
            <LegendItem color="#22c55e" label="Approved claim" />
            <LegendItem color="#f59e0b" label="Processing claim" />
          </div>
        </div>
      )}

      {/* ── FRAUD ENGINE TAB ─────────────────────────────────────────────── */}
      {tab === "fraud" && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* SVG map canvas */}
          <div className="lg:col-span-3">
            <FraudMapCanvas scenario={scenario} />
          </div>
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="font-bold text-[hsl(var(--navy))]">Fraud Detection Engine</h2>
              <p className="text-xs text-muted-foreground">{storedUser?.name ?? "Partner"} · {storedUser?.zone ?? "Andheri"}, Mumbai</p>
            </div>
            <div className="space-y-3">
              {checksData[scenario].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <StatusIcon status={c.status} />
                  <div>
                    <div className="text-sm font-medium text-[hsl(var(--navy))]">{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: verdicts[scenario].bg, color: verdicts[scenario].color }}>
              {verdicts[scenario].text}
            </div>
            <div className="space-y-2 pt-2">
              {(["normal", "spoof", "curfew"] as Scenario[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all active:scale-[0.98] ${
                    scenario === s
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 text-[hsl(var(--navy))] font-medium"
                      : "border-white/30 text-muted-foreground hover:border-[hsl(var(--primary))]/40"
                  }`}
                >
                  {{ normal: "Normal delivery route", spoof: "GPS spoofing attempt", curfew: "Claim during curfew zone" }[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Original SVG fraud map canvas (kept in Fraud Engine tab) ─────────────────
const FraudMapCanvas = ({ scenario }: { scenario: Scenario }) => {
  const zoneStroke = scenario === "curfew" ? "#F0A500" : "#00BFA6";
  const zoneDash = scenario === "curfew" ? "8 4" : "6 3";
  return (
    <div className="w-full h-full min-h-[360px] bg-[#0f1f3d] rounded-2xl overflow-hidden relative select-none">
      <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {[60, 120, 180, 240, 300, 360].map((x) => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={300} stroke="#1a2d5a" strokeWidth="1" />)}
        {[50, 100, 150, 200, 250].map((y) => <line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="#1a2d5a" strokeWidth="1" />)}
        <rect x={100} y={60} width={200} height={180} fill="none" stroke={zoneStroke} strokeWidth="2" strokeDasharray={zoneDash} rx={6} />
        <text x={105} y={54} fill={zoneStroke} fontSize="10" fontFamily="Inter" fontWeight="600">Andheri Zone</text>
        {scenario === "normal" && (<><polyline points="160,200 180,170 210,140 240,120 260,110" fill="none" stroke="#00BFA6" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" /><circle cx={260} cy={110} r={6} fill="#00BFA6"><animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" /></circle><circle cx={260} cy={110} r={3} fill="#fff" /><text x={268} y={114} fill="#00BFA6" fontSize="9" fontFamily="Inter">You</text></>)}
        {scenario === "spoof" && (<><circle cx={200} cy={140} r={6} fill="#00BFA6" /><text x={208} y={144} fill="#00BFA6" fontSize="9" fontFamily="Inter">Claimed</text><circle cx={50} cy={260} r={6} fill="#ef4444"><animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite" /></circle><text x={58} y={264} fill="#ef4444" fontSize="9" fontFamily="Inter">Actual (Pune)</text><line x1={200} y1={140} x2={50} y2={260} stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" /><rect x={110} y={200} width={180} height={28} rx={6} fill="#ef4444" opacity="0.9"><animate attributeName="opacity" values="0.9;0.5;0.9" dur="1s" repeatCount="indefinite" /></rect><text x={132} y={218} fill="#fff" fontSize="11" fontFamily="Inter" fontWeight="700">GPS SPOOF DETECTED</text></>)}
        {scenario === "curfew" && (<><polyline points="160,200 180,170 210,140 240,120 260,110" fill="none" stroke="#F0A500" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" /><circle cx={260} cy={110} r={6} fill="#F0A500"><animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" /></circle><circle cx={260} cy={110} r={3} fill="#fff" /><text x={268} y={114} fill="#F0A500" fontSize="9" fontFamily="Inter">You</text><text x={105} y={255} fill="#F0A500" fontSize="9" fontFamily="Inter" fontStyle="italic">Curfew zone active</text></>)}
      </svg>
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/70">
        <MapPin size={12} />Mumbai, Maharashtra
      </div>
    </div>
  );
};

export default FraudMap;
