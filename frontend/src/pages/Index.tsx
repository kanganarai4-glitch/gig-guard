import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, type ReactNode } from "react";
import { CloudRain, Brain, Zap, CheckCircle, Shield, IndianRupee } from "lucide-react";
import GigGuardLogo from "@/components/GigGuardLogo";

const ScrollReveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("sr-visible"), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`sr-hidden ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Navbar = () => (
  <header className="bg-[hsl(var(--navy))] text-white h-16 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
    <GigGuardLogo variant="dark" size="sm" />
    <div className="flex items-center gap-3">
      <Link
        to="/login"
        className="border border-white/30 text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors active:scale-[0.97]"
      >
        Login
      </Link>
      <Link
        to="/login"
        className="bg-[hsl(var(--primary))] text-white text-sm px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity active:scale-[0.97]"
      >
        Get Protected
      </Link>
    </div>
  </header>
);

const TickerBar = () => (
  <div className="bg-[hsl(var(--primary))] text-white overflow-hidden h-10 flex items-center">
    <div className="animate-ticker flex whitespace-nowrap">
      {[1, 2].map((i) => (
        <span key={i} className="text-sm font-medium px-8">
          ⚠ Heavy rain in Andheri · Risk HIGH · 47 workers protected today · AQI 312 in Dharavi · 23 claims auto-paid this week · ₹2.4L paid to workers this month&nbsp;&nbsp;&nbsp;
        </span>
      ))}
    </div>
  </div>
);

const HeroSection = () => (
  <section className="bg-[hsl(var(--navy))] text-white py-16 md:py-24 px-6 md:px-10">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-0 md:w-[55%]">
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--primary))] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--primary))]" />
          </span>
          Live · Heavy rain alert · Andheri
        </div>

        <h1 className="text-[42px] font-medium leading-[1.08] tracking-tight">
          Your income.<br />Protected.
        </h1>

        <p className="text-white/70 text-base mt-2">Work stops. Income doesn't.</p>

        <p className="text-white/50 text-sm max-w-md leading-relaxed mt-4">
          When rain, pollution or curfews stop you from working, GigGuard automatically pays you. No paperwork. No waiting. No forms.
        </p>

        <div className="flex flex-wrap gap-3 mt-7">
          <Link
            to="/login"
            className="bg-[hsl(var(--primary))] text-white px-7 py-3.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            Get Protected — ₹49/week
          </Link>
          <a
            href="#how-it-works"
            className="border border-white/30 text-white px-7 py-3.5 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors active:scale-[0.97]"
          >
            See how it works ↓
          </a>
        </div>

        <p className="text-white/40 text-xs mt-5">
          47 workers protected today · ₹2.4L paid this month · 0 claim rejections
        </p>
      </div>

      {/* Floating card */}
      <div className="w-full max-w-xs md:w-[45%]">
        <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl">
          {/* Row 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--navy))]">Live protection</span>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div className="border-t border-[hsl(var(--border))]" />

          {/* Row 2 — Risk */}
          <div>
            <p className="text-xs text-[hsl(var(--navy))]/60">Today's risk · Andheri</p>
            <p className="text-[32px] font-bold text-[hsl(var(--primary))] leading-tight">74</p>
            <span className="text-xs font-semibold text-[hsl(var(--primary))] uppercase tracking-wide">HIGH RISK</span>
          </div>

          <div className="border-t border-[hsl(var(--border))]" />

          {/* Row 3 — Payout */}
          <div className="bg-emerald-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
              <CheckCircle size={14} />
              ₹320 credited to Kangana's UPI
            </div>
            <p className="text-xs text-emerald-600/70">Mar 18 · 2:16 PM · Auto-paid · 60 seconds</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const howItWorksData = [
  {
    icon: CloudRain,
    iconBg: "bg-[hsl(var(--primary))]/10",
    iconColor: "text-[hsl(var(--primary))]",
    title: "We monitor",
    desc: "Rain, AQI, curfews and local strikes tracked 24/7 in your exact delivery zone.",
    chip: null,
  },
  {
    icon: Brain,
    iconBg: "bg-[#e0fdf4]",
    iconColor: "text-[#0f766e]",
    title: "INDRA predicts",
    desc: "Our AI calculates your disruption risk score every hour using live weather data.",
    chip: { label: "Powered by INDRA", bg: "bg-[#e0fdf4]", text: "text-[#0f766e]" },
  },
  {
    icon: IndianRupee,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Auto paid",
    desc: "₹ credited to your UPI the moment risk crosses the threshold. 60 seconds flat.",
    chip: { label: "Verified by KAVACH", bg: "bg-[#f5f3ff]", text: "text-[#7C6FF7]" },
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="bg-white py-16 px-6 md:px-10">
    <div className="max-w-5xl mx-auto">
      <p className="text-[11px] uppercase tracking-widest text-[hsl(var(--primary))] font-semibold mb-2">HOW IT WORKS</p>
      <h2 className="text-[26px] font-medium text-[hsl(var(--navy))] mb-1">Protection that runs itself</h2>
      <p className="text-sm text-muted-foreground mb-12 max-w-lg">
        Three things happen automatically every time a disruption hits your zone
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {howItWorksData.map((item) => (
          <div
            key={item.title}
            className="glass-card hover-lift rounded-xl p-5 space-y-3"
          >
            <div className={`w-11 h-11 rounded-full ${item.iconBg} flex items-center justify-center`}>
              <item.icon size={20} className={item.iconColor} />
            </div>
            <h3 className="font-semibold text-sm text-[hsl(var(--navy))]">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            {item.chip && (
              <span className={`inline-block text-[10px] font-medium ${item.chip.bg} ${item.chip.text} px-2 py-0.5 rounded-full`}>
                {item.chip.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonial = () => (
  <section className="bg-[#f0f4ff] py-16 px-6 md:px-10">
    <div className="max-w-4xl mx-auto">
      <div className="glass-card rounded-2xl border-l-4 border-l-[hsl(var(--primary))] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--navy))] text-white flex items-center justify-center font-bold text-base shrink-0">
              KD
            </div>
            <div>
              <div className="font-semibold text-[15px] text-[hsl(var(--navy))]">Kangana Devi</div>
              <div className="text-xs text-muted-foreground">Zomato delivery partner · Andheri, Mumbai</div>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--navy))] italic leading-relaxed mt-3">
            "Last monsoon I lost ₹3,200 in just one week. GigGuard would have paid ₹2,800 of that automatically. No forms. No calls. Just money in my account."
          </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          {[
            { val: "₹2,800", label: "Would be protected", color: "text-[hsl(var(--primary))]" },
            { val: "4", label: "Auto-claims triggered", color: "text-[hsl(var(--primary))]" },
            { val: "0", label: "Claim rejections", color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-center min-w-[140px]">
              <div className={`text-xl font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PlanCard = () => (
  <section className="bg-white py-16 px-6 md:px-10">
    <div className="max-w-[480px] mx-auto glass-card hover-lift rounded-2xl border-t-4 border-t-[hsl(var(--primary))] p-7 text-center space-y-5">
      <h2 className="text-xl font-medium text-[hsl(var(--navy))]">Weekly Protection Plan</h2>
      <div>
        <span className="text-[40px] font-bold text-[hsl(var(--primary))]">₹49</span>
        <span className="text-base text-muted-foreground ml-1">/week</span>
      </div>
      <p className="text-xs text-muted-foreground">Cancel anytime · No paperwork · Instant setup</p>

      <div className="space-y-2.5 text-left text-sm">
        {["Heavy rain disruption covered", "High AQI shutdown covered", "Curfew zone blocks covered", "Local strikes covered"].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <span className="text-[hsl(var(--navy))]">{item}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-[hsl(var(--border))] pt-4 space-y-1">
        <p className="text-sm font-semibold text-[hsl(var(--navy))]">Max payout: ₹1,200/week</p>
        <p className="text-[11px] text-muted-foreground">Calculated by DHAN model every Monday</p>
      </div>

      <Link
        to="/login"
        className="block w-full bg-[hsl(var(--primary))] text-white py-3.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
      >
        Activate protection now
      </Link>
    </div>
  </section>
);

const PartnerStrip = () => (
  <section className="bg-[#f8fafc] py-8 px-6">
    <div className="max-w-4xl mx-auto text-center space-y-5">
      <p className="text-xs text-muted-foreground">Trusted by workers on</p>
      <div className="flex justify-center gap-10 items-center">
        <span className="text-base font-medium text-[#E23744]">Zomato</span>
        <span className="text-base font-medium text-[#FC8019]">Swiggy</span>
        <span className="text-base font-medium text-muted-foreground">Zepto</span>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[hsl(var(--navy))] text-white py-10 px-6 md:px-10">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
      <div className="space-y-1">
        <GigGuardLogo variant="dark" showTagline size="md" />
      </div>
      <div className="flex gap-8 text-sm text-white/60">
        {["About", "How it works", "Claims", "Contact"].map((l) => (
          <a key={l} href="#" className="hover:text-white transition-colors">
            {l}
          </a>
        ))}
      </div>
      <div className="text-sm text-white/40">© 2026 GigGuard</div>
    </div>
    <div className="max-w-5xl mx-auto mt-6 pt-5 border-t border-white/10 text-xs text-white/30">
      IRDAI compliant · 256-bit encrypted · Built for India's gig workers
    </div>
  </footer>
);

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("gg_token");
    const user = localStorage.getItem("gg_user");
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar />
      <TickerBar />
      <ScrollReveal>
        <HeroSection />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonial />
      </ScrollReveal>
      <ScrollReveal>
        <PlanCard />
      </ScrollReveal>
      <ScrollReveal>
        <PartnerStrip />
      </ScrollReveal>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </div>
  );
};

export default Index;
