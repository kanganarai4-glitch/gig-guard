import { CloudRain, Wind, Lock, ArrowUp, RefreshCw, ArrowDown, Plus, CreditCard, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { value: "₹2,960", label: "Total paid", color: "text-[hsl(var(--primary))]" },
  { value: "8", label: "Claims", color: "text-[hsl(var(--navy))]" },
  { value: "6.2h", label: "Protected", color: "text-[hsl(var(--navy))]" },
  { value: "0", label: "Rejected", color: "text-[hsl(var(--success))]" },
];

const claims = [
  { icon: CloudRain, iconColor: "text-blue-500", iconBg: "bg-blue-50", type: "Heavy rain", zone: "Andheri", date: "Mar 18", time: "2:16 PM", amount: "₹320" },
  { icon: Wind, iconColor: "text-amber-500", iconBg: "bg-amber-50", type: "High AQI 312", zone: "Andheri", date: "Mar 15", time: "11:30 AM", amount: "₹180" },
  { icon: Lock, iconColor: "text-purple-500", iconBg: "bg-purple-50", type: "Curfew zone", zone: "Dharavi", date: "Mar 12", time: "4:00 PM", amount: "₹450" },
];

const actions = [
  { icon: ArrowUp, title: "Withdraw", sub: "To your bank" },
  { icon: RefreshCw, title: "Auto debit", sub: "Weekly ₹58" },
  { icon: ArrowDown, title: "Auto credit", sub: "Instant UPI" },
];

const plans = [
  {
    name: "Basic", price: "₹34", border: "border-[hsl(var(--border))]",
    covers: ["Rain only", "Max ₹600/week", "Safe zones only"],
    button: { label: "Switch plan", style: "border border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10" },
    active: false,
  },
  {
    name: "Standard", price: "₹58", border: "border-[hsl(var(--primary))] border-2",
    covers: ["Rain + AQI + Curfew", "Max ₹1,200/week", "All Mumbai zones"],
    button: { label: "Current plan", style: "bg-[hsl(var(--success))] text-white" },
    active: true,
  },
  {
    name: "Premium", price: "₹89", border: "border-[hsl(var(--navy))]",
    covers: ["All disruptions", "Max ₹2,000/week", "Priority payouts"],
    button: { label: "Upgrade", style: "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90" },
    active: false,
  },
];

const Vault = () => {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const claimsRef = useScrollReveal<HTMLElement>(100);
  const bankRef = useScrollReveal<HTMLElement>(200);
  const plansRef = useScrollReveal<HTMLElement>(300);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div ref={headerRef}>
          <h1 className="text-2xl font-semibold text-[hsl(var(--navy))]">My Vault</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Your earnings, payouts, bank and plan — all in one place</p>
        </div>

        {/* SECTION 1 — This Week's Claims */}
        <section ref={claimsRef} className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[hsl(var(--navy))]" />
            <h2 className="text-[13px] font-medium text-[hsl(var(--navy))]">This week's claims</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="glass-card hover-lift rounded-[10px] p-4 text-center">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-[10px] overflow-hidden">
            {claims.map((c, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--primary))]/[0.03] transition-colors ${i !== claims.length - 1 ? "border-b border-white/30" : ""}`}>
                <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                  <c.icon size={16} className={c.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[hsl(var(--navy))]">{c.type} · {c.zone}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{c.date} · {c.time} · Auto-paid</div>
                </div>
                <div className="text-sm font-semibold text-[hsl(var(--success))]">+{c.amount}</div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">Approved</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--background))]/40">
              <span className="text-sm font-medium text-[hsl(var(--navy))]">This week total</span>
              <span className="text-sm font-bold text-[hsl(var(--success))]">+₹950</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Bank Account */}
        <section ref={bankRef} className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-[hsl(var(--navy))]" />
            <h2 className="text-[13px] font-medium text-[hsl(var(--navy))]">Bank account</h2>
          </div>
          <div className="glass-card rounded-[10px] p-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--navy))] flex items-center justify-center">
                <CreditCard size={18} className="text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[hsl(var(--navy))]">SBI — State Bank of India</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">A/c •••• •••• 4821 · UPI linked</div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">Connected</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {actions.map((a) => (
                <button key={a.title} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-white/30 bg-white/40 backdrop-blur-sm hover:border-[hsl(var(--primary))] hover:-translate-y-0.5 transition-all active:scale-[0.97]">
                  <a.icon size={18} className="text-[hsl(var(--navy))]" />
                  <span className="text-xs font-medium text-[hsl(var(--navy))]">{a.title}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{a.sub}</span>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-[hsl(var(--navy))]">Auto debit weekly premium</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">₹58 debited every Monday · Next: Mar 25</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-[hsl(var(--navy))]">Instant payout to UPI</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">Claims credited automatically on approval</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <button className="flex items-center gap-3 w-full py-3 border-t border-white/20 hover:bg-[hsl(var(--background))]/50 transition-colors rounded-b-lg">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[hsl(var(--muted-foreground))]/40 flex items-center justify-center">
                <Plus size={16} className="text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-[hsl(var(--navy))]">Add another bank account</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Backup account for payouts</div>
              </div>
            </button>
          </div>
        </section>

        {/* SECTION 3 — Protection Plans */}
        <section ref={plansRef} className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[hsl(var(--navy))]" />
            <h2 className="text-[13px] font-medium text-[hsl(var(--navy))]">Protection plans</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.name} className={`glass-card hover-lift rounded-[10px] ${p.border} p-5 flex flex-col relative`}>
                {p.active && (
                  <span className="absolute -top-3 left-4 text-[10px] font-medium px-3 py-1 rounded-full bg-[hsl(var(--navy))] text-white">Your plan</span>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-base font-semibold text-[hsl(var(--navy))]">{p.name}</h3>
                  {p.active && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#166534]">Active</span>}
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-[hsl(var(--primary))]">{p.price}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">/week</span>
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.covers.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-[hsl(var(--navy))]">
                      <CheckCircle size={14} className="text-[hsl(var(--success))] shrink-0" />{c}
                    </li>
                  ))}
                </ul>
                <button className={`mt-5 w-full py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.97] ${p.button.style}`}>{p.button.label}</button>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-[hsl(var(--muted-foreground))]">Prices calculated by DHAN every Monday based on your zone risk · Cancel anytime</p>
        </section>
      </div>
    </div>
  );
};

export default Vault;
