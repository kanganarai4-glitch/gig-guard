import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useToast } from "@/hooks/use-toast";
import { createOrder, verifyPayment } from "@/services/payment";
import { getStoredUser } from "@/services/auth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Settings = () => {
  const profileRef = useScrollReveal<HTMLDivElement>();
  const planRef = useScrollReveal<HTMLDivElement>(100);
  const waRef = useScrollReveal<HTMLDivElement>(200);
  const notifRef = useScrollReveal<HTMLDivElement>(300);

  const { toast } = useToast();
  const user = getStoredUser();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      // 1. Create order on backend
      const data = await createOrder(49);
      if (!data.success || !data.order) throw new Error("Failed to create order");

      // 2. Configure Razorpay options
      const options = {
        key: data.key, // Your razorpay_key from backend
        amount: data.order.amount,
        currency: data.order.currency,
        name: "GigGuard",
        description: "Weekly Income Protection",
        image: "/shield-icon.png",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on backend
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: 49,
            });
            toast({
              title: "Payment Successful! 🎉",
              description: "Your weekly protection plan is now active.",
            });
          } catch (err: any) {
            toast({
              title: "Payment Verification Failed",
              description: err.response?.data?.message || err.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user?.name || "Delivery Partner",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#3b82f6" },
      };

      // 4. Open Razorpay Modal
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err: any) {
      toast({
        title: "Could not initiate payment",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[hsl(var(--navy))]">Settings</h1>

      <div ref={profileRef} className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[hsl(var(--navy))]">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[hsl(var(--navy))] text-white flex items-center justify-center font-bold text-lg">
            {user?.name?.substring(0, 2).toUpperCase() || "DP"}
          </div>
          <div className="space-y-0.5">
            <div className="font-semibold text-[hsl(var(--navy))]">{user?.name || "Delivery Partner"}</div>
            <div className="text-sm text-muted-foreground">Email: {user?.email || "partner@example.com"}</div>
            <div className="text-sm text-muted-foreground">Platform: {user?.provider || "zomato"} · Zone: {user?.zone || "Andheri West"}</div>
          </div>
        </div>
      </div>

      <div ref={planRef} className="glass-card rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-[hsl(var(--navy))]">Protection plan</h2>
        <div className="text-sm space-y-1">
          <div>Current plan: <span className="font-medium">Weekly ₹49/week</span></div>
          <div className="text-xs text-muted-foreground">Calculated by DHAN model every Monday</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            <span className="text-xs text-muted-foreground">Next renewal: Mar 25</span>
          </div>
        </div>
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="bg-[hsl(var(--primary))] text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? "Loading..." : "Pay ₹49 Now"}
        </button>
      </div>

      <div ref={waRef} className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-[hsl(var(--navy))]">WhatsApp alerts</h2>
        <div className="flex items-center gap-2 text-sm">
          <span>{user?.phone || "Not provided"}</span>
          {user?.phone ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 text-xs">Connected</span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">Add phone on login</span>
          )}
        </div>
        <div className="space-y-3">
          {["Rain alerts", "AQI warnings", "Curfew notices", "Weekly summary"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--navy))]">{label}</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[hsl(var(--navy))]" />
            </div>
          ))}
        </div>
      </div>

      <div ref={notifRef} className="glass-card rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-[hsl(var(--navy))]">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--navy))]">Email notifications</span>
            <Switch className="data-[state=checked]:bg-[hsl(var(--navy))]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--navy))]">Push notifications</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[hsl(var(--navy))]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
