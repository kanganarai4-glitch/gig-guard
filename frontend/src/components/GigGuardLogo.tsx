import { Link } from "react-router-dom";

interface GigGuardLogoProps {
  variant?: "dark" | "light";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const GigGuardLogo = ({ variant = "light", showTagline = false, size = "md" }: GigGuardLogoProps) => {
  const shieldSize = size === "sm" ? 24 : size === "md" ? 32 : 40;
  const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";

  return (
    <Link to="/" className="flex items-center gap-2 no-underline">
      <svg width={shieldSize} height={shieldSize} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2L4 8V16C4 23.2 9.2 29.6 16 31C22.8 29.6 28 23.2 28 16V8L16 2Z" stroke="#F5A623" strokeWidth="2" strokeLinejoin="round" fill="none"/>
        <path d="M11 16L14.5 19.5L21 13" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      <div className="flex flex-col">
        <span className={`${textSize} font-bold leading-tight tracking-tight`}>
          <span style={{ color: "#F5A623" }}>Gig</span>
          <span className={variant === "dark" ? "text-white" : "text-[hsl(var(--navy))]"}>Guard</span>
        </span>
        {showTagline && (
          <span className={`text-xs ${variant === "dark" ? "text-white/60" : "text-muted-foreground"}`}>
            Work stops. Income doesn't.
          </span>
        )}
      </div>
    </Link>
  );
};

export default GigGuardLogo;
