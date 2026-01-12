import { Check } from "lucide-react";

interface CreatorBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

const CreatorBadge = ({ className = "", size = "sm" }: CreatorBadgeProps) => {
  const sizeClasses = size === "sm" 
    ? "w-4 h-4" 
    : "w-6 h-6";
  const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  
  return (
    <div 
      className={`absolute flex items-center justify-center rounded-full bg-[#1d9bf0] text-white shadow-md ${sizeClasses} ${className}`}
      title="Verifierad skapare"
    >
      <Check className={iconSize} strokeWidth={3} />
    </div>
  );
};

export default CreatorBadge;
