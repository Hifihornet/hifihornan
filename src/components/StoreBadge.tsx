import { Store } from "lucide-react";

interface StoreBadgeProps {
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const StoreBadge = ({ className = "", size = "sm", showLabel = false }: StoreBadgeProps) => {
  const sizeClasses = size === "sm" 
    ? "w-4 h-4" 
    : "w-6 h-6";
  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  
  if (showLabel) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium shadow-sm ring-1 ring-border ${className}`}
        title="Officiell butik"
      >
        <Store className="w-3 h-3" strokeWidth={2.5} />
        <span>Butik</span>
      </div>
    );
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm ring-1 ring-border ${sizeClasses} ${className}`}
      title="Officiell butik"
    >
      <Store className={iconSize} strokeWidth={2.5} />
    </div>
  );
};

export default StoreBadge;