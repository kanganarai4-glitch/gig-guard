import { useState, useRef, useEffect } from "react";
import { Activity, Shield, Coins, MessageSquare, Send, Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import api from "@/config/api";
import { getStoredUser } from "@/services/auth";

type ModelKey = "indra" | "kavach" | "dhan" | "vaani";

const models: {
  key: ModelKey; label: string; color: string; bg: string; icon: typeof Activity;
  bullets: string[]; output1: string; output2: string; status: string; meaning: string;
}[] = [
  {
    key: "indra", label: "INDRA", color: "#00BFA6", bg: "rgba(0,191,166,0.08)", icon: Activity,
    bullets: ["Reads rain mm/hr, AQI, wind, visibility every hour", "Combines 10 features into disruption probability 0–1", "Converts to risk score 0–100 on Kangana's dashboard", "Auto-triggers KAVACH when score crosses 65"],
    output1: "74 · Risk score · HIGH · Andheri today", output2: "0.74 · Raw probability from model",
    status: "Running · updates every hour", meaning: "Indra — Vedic god of rain and storms",
  },
  {
    key: "kavach", label: "KAVACH", color: "#7C6FF7", bg: "rgba(124,111,247,0.08)", icon: Shield,
    bullets: ["GPS location vs claimed zone — 500m tolerance", "Movement speed — flags teleportation over 80km/h", "Weather cross-check — real API must confirm disruption", "Duplicate block — no second claim in 4hr event window"],
    output1: "0.08 · Fraud score · CLEAN · Approved", output2: "0.91 · Score if GPS spoof detected — blocked",
    status: "Runs per claim · last run 4 min ago", meaning: "Kavach — shield or armour in Hindi",
  },
  {
    key: "dhan", label: "DHAN", color: "#F06060", bg: "rgba(240,96,96,0.08)", icon: Coins,
    bullets: ["Uses 24-month zone flood and AQI history as base", "7-day forecast uplift applied every Monday", "Loyalty discount — 5% off per 6 months no fraud", "Output: ₹34–₹64/week · Kangana this week: ₹58"],
    output1: "₹58 · This week · monsoon · Andheri", output2: "₹44 · Same worker in January off-season",
    status: "Recalculates every Monday 6:00 AM", meaning: "Dhan — money or wealth in Hindi",
  },
  {
    key: "vaani", label: "VAANI", color: "#F0A500", bg: "rgba(240,165,0,0.08)", icon: MessageSquare,
    bullets: ["Receives top features from INDRA rain and AQI weights", "Writes plain Hindi-English WhatsApp message per payout", "Tone shifts: urgent for HIGH risk, calm for LOW risk", "Writes internal audit log for insurer compliance"],
    output1: "₹320 credited · WhatsApp sent · Mar 18 2:16 PM", output2: "Stay safe today · Tone when HIGH risk no claim",
    status: "Fires once per approved claim", meaning: "Vaani — voice or speech in Sanskrit",
  },
];

type ChatMsg = { sender: "vaani" | "kangana"; text: string; time: string };

const quickReplies: { label: string }[] = [
  { label: "Why did I get paid?" },
  { label: "Is tomorrow safe?" },
  { label: "How much this month?" },
];

const initialMessages: ChatMsg[] = [
  { sender: "vaani", text: "Hi Kangana! I am VAANI, your GigGuard assistant. Ask me anything about your claims, risk score, or protection plan.", time: "2:10 PM" },
  { sender: "kangana", text: "Why did I get ₹320 today?", time: "2:11 PM" },
  { sender: "vaani", text: "Heavy rain (22mm/hr) was detected in Andheri at 2:14 PM. Your risk score hit 74 which crossed the protection threshold of 65. KAVACH verified your GPS location and the ₹320 payout was sent to your UPI at 2:16 PM — just 60 seconds after the alert.", time: "2:11 PM" },
  { sender: "kangana", text: "Is tomorrow safe to work?", time: "2:12 PM" },
  { sender: "vaani", text: "Tomorrow looks moderate risk — score around 45. Light rain expected after 6 PM only. Morning slots 9 AM to 2 PM are safe to work. I will send you a WhatsApp alert if the forecast changes tonight.", time: "2:12 PM" },
];

const AskVaani = () => {
  const [activeModel, setActiveModel] = useState<ModelKey>("indra");
  const model = models.find((m) => m.key === activeModel)!;
  const [messages, setMessages] = useState<ChatMsg[]>([
    { sender: "vaani", text: "Hi! I am VAANI, your GigGuard assistant powered by Gemini AI. Ask me anything about your claims, risk score, or protection plan.", time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getStoredUser();

  const headerRef = useScrollReveal<HTMLDivElement>();
  const pipelineRef = useScrollReveal<HTMLDivElement>(100);
  const detailRef = useScrollReveal<HTMLDivElement>(200);
  const chatRef = useScrollReveal<HTMLDivElement>(300);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    
    const userMsg: ChatMsg = { sender: "kangana", text: text.trim(), time: timeStr };
    
    // Optimistic UI update
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Keep only last 10 messages for context window bounds
      const historyToPass = messages.slice(-10);
      
      const { data } = await api.post("/vaani/chat", { 
        message: text.trim(),
        history: historyToPass
      });

      if (data.success && data.text) {
        const botMsg: ChatMsg = { 
          sender: "vaani", 
          text: data.text, 
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) 
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Vaani Chat Error:", error);
      const errorMsg: ChatMsg = { 
        sender: "vaani", 
        text: "I am having trouble connecting to my Gemini brain right now. Please try again later.", 
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div ref={headerRef}>
        <h1 className="text-2xl font-bold text-[hsl(var(--navy))]">The GigGuard Intelligence Stack</h1>
        <p className="text-sm text-muted-foreground mt-1">4 AI models running in sequence to protect Kangana</p>
      </div>

      {/* Pipeline row */}
      <div ref={pipelineRef} className="flex items-center justify-center gap-2 flex-wrap">
        {models.map((m, i) => (
          <div key={m.key} className="flex items-center gap-2">
            <button
              onClick={() => setActiveModel(m.key)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.96]"
              style={{
                background: activeModel === m.key ? m.color : m.bg,
                color: activeModel === m.key ? "#fff" : m.color,
                border: `2px solid ${m.color}`,
              }}
            >
              {m.label}
            </button>
            {i < models.length - 1 && <span className="text-muted-foreground text-lg select-none">→</span>}
          </div>
        ))}
      </div>

      {/* Detail card */}
      <div ref={detailRef} className="glass-card rounded-2xl p-8 space-y-6" style={{ borderTop: `3px solid ${model.color}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: model.bg }}>
            <model.icon size={20} style={{ color: model.color }} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[hsl(var(--navy))]">{model.label}</h2>
            <p className="text-xs text-muted-foreground italic">{model.meaning}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[hsl(var(--navy))] uppercase tracking-wider">How it works</h3>
            <ul className="space-y-3">
              {model.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[hsl(var(--navy))]">
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: model.color }} />{b}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[hsl(var(--navy))] uppercase tracking-wider">Model output</h3>
            <div className="rounded-lg px-4 py-3 text-sm font-mono" style={{ background: model.bg, color: model.color }}>{model.output1}</div>
            <div className="rounded-lg px-4 py-3 text-sm font-mono" style={{ background: model.bg, color: model.color, opacity: 0.75 }}>{model.output2}</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: model.color }} />{model.status}
          </div>
          <span className="text-sm text-muted-foreground italic">{model.meaning}</span>
        </div>
      </div>

      {/* VAANI Chat Section */}
      <div ref={chatRef} className="space-y-3 pt-4">
        <div>
          <h2 className="text-xl font-bold text-[hsl(var(--navy))]">Ask VAANI anything</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your personal income protection assistant · Powered by AI</p>
        </div>
        <div className="glass-card rounded-xl flex flex-col" style={{ height: 360 }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) =>
              msg.sender === "vaani" ? (
                <div key={i} className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-[#7C6FF7] flex items-center justify-center shrink-0">
                    <Shield size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm" style={{ background: "#f5f3ff", color: "#1a2d5a" }}>{msg.text}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--navy))] flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                    {currentUser?.name?.substring(0,2).toUpperCase() || "ME"}
                  </div>
                  <div className="text-right">
                    <div className="rounded-xl rounded-tr-sm px-3.5 py-2.5 text-sm text-white" style={{ background: "#F5A623" }}>{msg.text}</div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">{msg.time}</span>
                  </div>
                </div>
              )
            )}
            {isLoading && (
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-7 h-7 rounded-full bg-[#7C6FF7] flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-white" />
                </div>
                <div>
                  <div className="rounded-xl rounded-tl-sm px-4 py-3 text-sm flex gap-1" style={{ background: "#f5f3ff" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C6FF7]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C6FF7]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C6FF7]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {quickReplies.map((q) => (
              <button
                key={q.label}
                onClick={() => { setInput(q.label); setTimeout(() => sendMessage(q.label), 50); }}
                className="text-xs px-3 py-1.5 rounded-full bg-[hsl(var(--background))]/60 backdrop-blur-sm text-[hsl(var(--navy))] hover:bg-border transition-colors active:scale-[0.97]"
              >
                {q.label}
              </button>
            ))}
          </div>
          <div className="border-t border-white/20 p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask VAANI about your claims, risk or plan..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-white/30 bg-white/40 backdrop-blur-sm text-[hsl(var(--navy))] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/30"
            />
            <button 
              onClick={() => sendMessage(input)} 
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-1.5 active:scale-[0.96] transition-transform disabled:opacity-50" 
              style={{ background: "#F5A623" }}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {isLoading ? "Thinking" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskVaani;
