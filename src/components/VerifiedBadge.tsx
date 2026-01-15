import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const VerifiedBadge = ({ 
  className = "", 
  size = "sm", 
  showLabel = false 
}: VerifiedBadgeProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  const iconSize = {
    sm: "w-2.5 h-2.5",
    md: "w-3.5 h-3.5",
    lg: "w-5 h-5",
  };

  if (showLabel) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium ring-1 ring-emerald-500/20 ${className}`}
        title="Verifierad säljare"
      >
        <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
        <span>Verifierad</span>
      </div>
    );
  }

  return (
    <div
      className={`absolute flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ${sizeClasses[size]} ${className}`}
      title="Verifierad säljare"
    >
      <BadgeCheck className={iconSize[size]} strokeWidth={2.5} />
    </div>
  );
};

export default VerifiedBadge;