import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Lock, MessageCircle, Map, Settings, LogOut } from "lucide-react";
import GigGuardLogo from "./GigGuardLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStoredUser, logout } from "@/services/auth";
import { disconnectSocket } from "@/services/socket";

const sidebarLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/claims", icon: FileText, label: "Claims" },
  { to: "/vault", icon: Lock, label: "Vault" },
  { to: "/ask-vaani", icon: MessageCircle, label: "Ask VAANI" },
  { to: "/fraud-map", icon: Map, label: "Fraud Map" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const mobileLinks = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/claims", icon: FileText, label: "Claims" },
  { to: "/vault", icon: Lock, label: "Vault" },
  { to: "/ask-vaani", icon: MessageCircle, label: "VAANI" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const AppLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Read real user from localStorage (set during login)
  const user = getStoredUser();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GG";
  const providerLabel = user?.provider
    ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) + " Partner"
    : "Partner";

  const handleLogout = () => {
    logout();
    disconnectSocket();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-[220px] bg-[hsl(var(--navy))] text-white flex flex-col fixed inset-y-0 left-0 z-30">
          <div className="p-5 border-b border-white/10">
            <GigGuardLogo variant="dark" showTagline size="md" />
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1">
            {sidebarLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info + logout at bottom */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))]/80 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="text-sm flex-1 min-w-0">
                <div className="font-medium truncate">{user?.name ?? "Partner"}</div>
                <div className="text-white/50 text-xs truncate">{providerLabel}</div>
              </div>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className={`flex-1 ${!isMobile ? "ml-[220px]" : ""} ${isMobile ? "pb-20" : ""}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[hsl(var(--navy))] border-t border-white/10 flex justify-around items-center h-16 z-30">
          {mobileLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 ${
                  active ? "text-[hsl(var(--primary))]" : "text-white/60"
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
