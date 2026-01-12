import { Sparkles } from "lucide-react";

interface CreatorBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const CreatorBadge = ({ className = "", size = "sm" }: CreatorBadgeProps) => {
  const sizeClasses = size === "sm" ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs";
  
  return (
    <div 
      className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground animate-pulse-glow ${sizeClasses} ${className}`}
      title="Skapare"
    >
      <Sparkles className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
    </div>
  );
};

export default CreatorBadge;
