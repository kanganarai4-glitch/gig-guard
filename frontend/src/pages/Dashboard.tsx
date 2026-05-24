import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CloudRain, Wind, ShieldAlert, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getDashboard, DashboardData, PaymentData } from "@/services/dashboard";
import { getStoredUser } from "@/services/auth";
import { connectSocket, onRiskUpdate, onPaymentReceived, removeSocketListeners } from "@/services/socket";
import { useToast } from "@/hooks/use-toast";

// Map claim type to icon
const typeIcon = (type: string) => {
  switch (type) {
    case "rain": return <CloudRain size={16} className="text-[hsl(var(--primary))]" />;
    case "aqi": return <Wind size={16} className="text-[hsl(var(--primary))]" />;
    case "curfew": return <ShieldAlert size={16} className="text-[hsl(var(--primary))]" />;
    default: return <CloudRain size={16} className="text-[hsl(var(--primary))]" />;
  }
};

const typeLabel = (type: string) => {
  switch (type) {
    case "rain": return "Rain alert";
    case "aqi": return "AQI warning";
    case "curfew": return "Curfew zone";
    default: return type;
  }
};

const riskColor = (level: string) => {
  switch (level) {
    case "LOW": return "#22c55e";
    case "MODERATE": return "#f59e0b";
    case "HIGH": return "#f59e0b";
    case "CRITICAL": return "#ef4444";
    default: return "#f59e0b";
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const Dashboard = () => {
  const greetRef = useScrollReveal<HTMLDivElement>();
  const statsRef = useScrollReveal<HTMLDivElement>(100);
  const colsRef = useScrollReveal<HTMLDivElement>(200);
  const { toast } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskScore, setRiskScore] = useState<{ score: number; level: string; message: string } | null>(null);
  const [livePayments, setLivePayments] = useState<PaymentData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("Loading...");

  const storedUser = getStoredUser();

  // ── Fetch dashboard data ──────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const dash = await getDashboard();
      setData(dash);
      setRiskScore(dash.risk);
      setLivePayments(dash.payments);
      setLastUpdated("just now");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast({
        title: "Could not load dashboard",
        description: "Make sure the backend server is running on port 5000.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Connect socket + listen for real-time events ──────────────────────────
  useEffect(() => {
    const userId = storedUser?._id;

    // Always remove old listeners first to prevent duplicates on re-render
    removeSocketListeners();

    if (userId) {
      connectSocket(userId);

      // Live risk score update from INDRA cron
      onRiskUpdate((newRisk) => {
        setRiskScore(newRisk);
        setLastUpdated("just now");
        toast({
          title: `Risk updated: ${newRisk.score} [${newRisk.level}]`,
          description: newRisk.message,
        });
      });

      // Auto-payment received
      onPaymentReceived((payment) => {
        const newPay: PaymentData = {
          _id: Date.now().toString(),
          amount: payment.amount,
          status: "completed",
          upiRef: payment.upiRef,
          description: payment.description,
          paidAt: payment.paidAt,
        };
        setLivePayments((prev) => [newPay, ...prev].slice(0, 10));
        toast({
          title: `₹${payment.amount} auto-paid! 💸`,
          description: `${payment.description} — Ref: ${payment.upiRef}`,
        });
      });
    }

    fetchDashboard();

    // Cleanup listeners on unmount
    return () => removeSocketListeners();
  }, []); // Empty deps — run once on mount only

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const risk = riskScore ?? data?.risk;
  const payments = livePayments.length > 0 ? livePayments : data?.payments ?? [];
  const summary = data?.summary;
  const circumference = 2 * Math.PI * 50; // r=50
  const dashOffset = circumference - (circumference * (risk?.score ?? 0)) / 100;

  const statCards = [
    { label: "This week's earnings", value: `₹${(data?.totalEarnings ?? 0).toLocaleString("en-IN")}`, color: "text-[hsl(var(--navy))]" },
    { label: "Protected amount", value: `₹${(data?.protectedAmount ?? 0).toLocaleString("en-IN")}`, color: "text-[hsl(var(--primary))]" },
    { label: "Active policy", value: "Active", badge: true },
    { label: "WhatsApp", value: user?.whatsappConnected ? "Connected" : "Not linked", dot: true },
  ];

  return (
    <div className="space-y-0">
      {/* Top banner */}
      <div className="bg-[#fff9f0] border-b border-[hsl(var(--primary))] px-5 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--navy))]">
          <Shield size={16} className="text-[hsl(var(--primary))]" />
          <span className="font-medium">Protection Active</span>
          <span className="text-muted-foreground">· {user?.zone}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          INDRA monitoring · Last updated {lastUpdated}
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Greeting */}
        <div ref={greetRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--navy))]">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] ?? storedUser?.name?.split(" ")[0] ?? "Partner"} 👋
            </h1>
            <p className="text-sm text-muted-foreground">{user?.city} · {user?.zone}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Protection Active
          </span>
        </div>

        {/* Stat cards */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {statCards.map((card) => (
            <div key={card.label} className="glass-card hover-lift rounded-xl p-4 space-y-1">
              <div className="text-xs text-muted-foreground">{card.label}</div>
              {card.badge ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[hsl(var(--navy))]">{card.value}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <span className="inline-block text-[11px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-[20px]">₹{user?.plan?.weeklyFee ?? 49}/week</span>
                </div>
              ) : card.dot ? (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user?.whatsappConnected ? "bg-emerald-500" : "bg-gray-400"}`} />
                  <span className="text-sm font-semibold text-[hsl(var(--navy))]">{card.value}</span>
                </div>
              ) : (
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div ref={colsRef} className="grid lg:grid-cols-2 gap-6">
          {/* Left: Risk + Shield */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-[hsl(var(--navy))]">Today's risk score</h2>
                <p className="text-xs text-muted-foreground">Powered by INDRA · Updated {lastUpdated}</p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-[120px] h-[120px]">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke={riskColor(risk?.level ?? "LOW")}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: riskColor(risk?.level ?? "LOW") }}>
                      {risk?.score ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm font-semibold" style={{ color: riskColor(risk?.level ?? "LOW") }}>
                {risk?.level ?? "LOW"}
              </div>
              {risk?.message && (
                <div className="bg-emerald-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-emerald-800 leading-relaxed">
                  {risk.message}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-6 space-y-3">
              <div>
                <h2 className="font-semibold text-[hsl(var(--navy))]">This week's shield</h2>
                <p className="text-xs text-muted-foreground">Hours your income was protected</p>
              </div>
              <Progress value={summary?.shieldPercent ?? 0} className="h-3 bg-[hsl(var(--border))]" />
              <p className="text-xs text-muted-foreground">
                {summary?.protectedHours ?? 0} hrs protected of {summary?.totalHours ?? 8} hrs worked
              </p>
            </div>
          </div>

          {/* Right: Payouts */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-[hsl(var(--navy))]">Recent payouts</h2>
            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No payouts yet. INDRA is watching for disruptions.</p>
              ) : (
                payments.slice(0, 5).map((p) => (
                  <div key={p._id} className="border-l-[3px] border-l-emerald-500 bg-[hsl(var(--background))]/60 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 hover-lift">
                    <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center shrink-0">
                      <CloudRain size={16} className="text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[hsl(var(--navy))]">{p.description || "Auto payout"}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(p.paidAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">₹{p.amount}</div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full">Approved</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Link to="/claims" className="flex-1 text-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] py-2.5 rounded-lg text-sm font-medium hover:bg-[hsl(var(--primary))]/5 transition-colors active:scale-[0.97]">
                View all claims
              </Link>
              <Link to="/settings" className="flex-1 text-center bg-[hsl(var(--primary))] text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]">
                Manage plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
