import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import GigGuardLogo from "@/components/GigGuardLogo";
import { loginWithProvider } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

type Provider = "zomato" | "swiggy" | "google";

interface ProviderConfig {
  title: string;
  sub: string;
  color: string;
  letter: string;
  provider: Provider;
}

const loginButtons: ProviderConfig[] = [
  { title: "Continue with Zomato", sub: "Use your Zomato delivery partner account", color: "#E23744", letter: "Z", provider: "zomato" },
  { title: "Continue with Swiggy", sub: "Use your Swiggy delivery partner account", color: "#FC8019", letter: "S", provider: "swiggy" },
];

// Modal to collect name + email + optional phone before calling backend
const LoginModal = ({
  config,
  onClose,
  onSubmit,
  loading,
}: {
  config: ProviderConfig | { provider: "google"; color: string; title: string };
  onClose: () => void;
  onSubmit: (name: string, email: string, phone?: string) => void;
  loading: boolean;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    // Auto-prefix +91 if user enters 10-digit number
    const formattedPhone = phone.trim()
      ? phone.trim().startsWith("+") ? phone.trim() : `+91${phone.trim()}`
      : undefined;
    onSubmit(name.trim(), email.trim().toLowerCase(), formattedPhone);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[hsl(var(--navy))]">{config.title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ravi@example.com"
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              WhatsApp number <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 border border-border rounded-lg text-sm text-muted-foreground bg-muted/30 shrink-0">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/40"
              />
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">📱 Get risk alerts & payment receipts on WhatsApp</p>
          </div>
          <button
            type="submit"
            disabled={loading || !name || !email}
            style={{ backgroundColor: config.color }}
            className="w-full text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Connecting…
              </>
            ) : (
              "Activate Protection →"
            )}
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          New here? Your account is created automatically.
        </p>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderConfig | { provider: "google"; color: string; title: string } | null>(null);

  // Auth bypass — redirect already-logged-in users to dashboard
  useEffect(() => {
    const token = localStorage.getItem("gg_token");
    const user = localStorage.getItem("gg_user");
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (name: string, email: string, phone?: string) => {
    if (!activeProvider) return;
    setLoading(true);
    try {
      await loginWithProvider({ name, email, provider: activeProvider.provider, phone });
      toast({ title: "Welcome to GigGuard! 🛡️", description: phone ? "Protection active. WhatsApp alerts enabled!" : "Protection is now active for your zone." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.data?.message || "Could not connect to server. Is the backend running on port 5000?",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {activeProvider && (
        <LoginModal
          config={activeProvider}
          onClose={() => !loading && setActiveProvider(null)}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      <header className="bg-[hsl(var(--navy))] h-14 flex items-center px-6">
        <GigGuardLogo variant="dark" showTagline size="sm" />
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px] glass-card rounded-2xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-[52px] h-[52px] rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L4 8V16C4 23.2 9.2 29.6 16 31C22.8 29.6 28 23.2 28 16V8L16 2Z" stroke="#F5A623" strokeWidth="2" strokeLinejoin="round" fill="none" />
                <path d="M11 16L14.5 19.5L21 13" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-[hsl(var(--navy))]">Welcome to GigGuard</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">Login with your delivery app account. Protection activates in under 2 minutes.</p>
          </div>

          <div className="space-y-3">
            {loginButtons.map((btn) => (
              <button
                key={btn.letter}
                id={`login-${btn.provider}`}
                onClick={() => setActiveProvider(btn)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/30 hover:border-current transition-all text-left group active:scale-[0.97] hover:-translate-y-0.5"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = btn.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: btn.color }}>
                  {btn.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[hsl(var(--navy))]">{btn.title}</div>
                  <div className="text-xs text-muted-foreground">{btn.sub}</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-white/20" /><span>or</span><div className="flex-1 h-px bg-white/20" />
          </div>

          <button
            id="login-google"
            onClick={() => setActiveProvider({ provider: "google", color: "#4285F4", title: "Continue with Google" })}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/30 hover:border-[#4285F4] transition-all text-left active:scale-[0.97] hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-white/30 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[hsl(var(--navy))]">Continue with Google</div>
              <div className="text-xs text-muted-foreground">For Zepto, Blinkit or other platforms</div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>

          <div className="text-center space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">New here? Your account is created automatically.</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-[hsl(var(--primary))] font-medium">₹49/week</span> · Cancel anytime · No paperwork
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 pb-10 flex-wrap px-4">
        {["256-bit encrypted", "IRDAI compliant", "Instant setup"].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />{t}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
