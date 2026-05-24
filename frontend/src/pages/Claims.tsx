import { useState, useEffect } from "react";
import { Droplets, Wind, ShieldAlert, ShieldCheck, Check, ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getDashboard, ClaimData } from "@/services/dashboard";
import { useToast } from "@/hooks/use-toast";

const statusStyle: Record<string, string> = {
  approved: "bg-[#dcfce7] text-[#166534]",
  processing: "bg-[#fef9c3] text-[#854d0e]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
};

const disruptionIcon = (type: string) => {
  switch (type) {
    case "rain": return <Droplets size={16} />;
    case "aqi": return <Wind size={16} />;
    case "curfew": return <ShieldAlert size={16} />;
    default: return <Droplets size={16} />;
  }
};

const typeLabel = (type: string) =>
  ({ rain: "Rain", aqi: "AQI", curfew: "Curfew" }[type] ?? type);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });

const ClaimTimeline = ({ claim }: { claim: ClaimData }) => {
  const steps = [
    {
      color: "#00BFA6",
      label: "INDRA detected",
      icon: disruptionIcon(claim.type),
      sub: `${typeLabel(claim.type)} / ${claim.zone}`,
      time: formatDate(claim.date),
    },
    {
      color: "#F0A500",
      label: `Risk score: ${claim.riskScore ?? "—"}`,
      icon: <span className="text-[10px] font-bold">{claim.riskScore ?? "—"}</span>,
      sub: "HIGH threshold crossed",
      time: formatDate(claim.date),
    },
    {
      color: "#7C6FF7",
      label: "KAVACH: clean",
      icon: <ShieldCheck size={16} />,
      sub: "Location verified · No fraud",
      time: formatDate(claim.date),
    },
    {
      color: "#22c55e",
      label: `₹${claim.amount} to UPI`,
      icon: <Check size={16} />,
      sub: "Paid in 60 seconds",
      time: formatDate(claim.date),
    },
  ];

  return (
    <div className="px-4 py-6 bg-[hsl(var(--background))]/60 backdrop-blur-sm">
      <div className="flex items-start justify-between relative max-w-xl mx-auto">
        <div className="absolute top-[18px] left-[36px] right-[36px] h-[2px] bg-border z-0" />
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center relative z-10 w-1/4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: s.color }}>
              {s.icon}
            </div>
            <span className="text-xs font-semibold text-[hsl(var(--navy))] mt-2 leading-tight">{s.label}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.sub}</span>
            <span className="text-[10px] text-muted-foreground">{s.time}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4 italic">From disruption to payout in 60 seconds</p>
    </div>
  );
};

const Claims = () => {
  const [expandedId, setExpandedId] = useState<string>("");
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const titleRef = useScrollReveal<HTMLHeadingElement>();
  const summaryRef = useScrollReveal<HTMLDivElement>(100);
  const tableRef = useScrollReveal<HTMLDivElement>(200);

  useEffect(() => {
    const fetch = async () => {
      try {
        const dash = await getDashboard();
        setClaims(dash.claims);
        if (dash.claims.length > 0) setExpandedId(dash.claims[0]._id);
      } catch {
        toast({
          title: "Could not load claims",
          description: "Backend server may not be running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleRow = (id: string) => setExpandedId((prev) => (prev === id ? "" : id));

  const totalClaimed = claims.reduce((s, c) => s + c.amount, 0);
  const totalPaid = claims.filter((c) => c.status === "approved").reduce((s, c) => s + c.amount, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading claims…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      <h1 ref={titleRef} className="text-2xl font-bold text-[hsl(var(--navy))]">Claims</h1>

      {/* Summary */}
      <div ref={summaryRef} className="grid grid-cols-3 gap-4 stagger-children">
        {[
          { label: "Total claims", value: String(claims.length) },
          { label: "Total claimed", value: `₹${totalClaimed.toLocaleString("en-IN")}` },
          { label: "Paid out", value: `₹${totalPaid.toLocaleString("en-IN")}` },
        ].map((s) => (
          <div key={s.label} className="glass-card hover-lift rounded-xl p-4 text-center" style={{ borderColor: "rgba(245,166,35,0.2)", background: "rgba(245,166,35,0.06)" }}>
            <div className="text-2xl font-bold text-[hsl(var(--primary))]">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div ref={tableRef} className="glass-card rounded-xl overflow-hidden">
        {claims.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ShieldCheck size={40} className="mx-auto mb-3 text-emerald-500 opacity-50" />
            <p className="font-medium">No claims yet</p>
            <p className="text-sm mt-1">INDRA will auto-create claims when risk exceeds 70.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[hsl(var(--background))]/40">
                  {["Claim ID", "Date", "Disruption", "Zone", "Amount", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <>
                    <tr
                      key={c._id}
                      onClick={() => toggleRow(c._id)}
                      className="border-b border-border last:border-0 hover:bg-[hsl(var(--primary))]/[0.03] cursor-pointer select-none transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[hsl(var(--navy))]">{c.claimId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(c.date)}</td>
                      <td className="px-4 py-3">{typeLabel(c.type)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.zone}</td>
                      <td className="px-4 py-3 font-medium">₹{c.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[c.status] ?? statusStyle.processing}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <ChevronDown size={16} className={`transition-transform duration-200 ${expandedId === c._id ? "rotate-180" : ""}`} />
                      </td>
                    </tr>
                    {expandedId === c._id && (
                      <tr key={`${c._id}-timeline`}>
                        <td colSpan={7} className="p-0 border-b border-border">
                          <ClaimTimeline claim={c} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Claims;
