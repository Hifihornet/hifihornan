import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const OnlineIndicator = ({ 
  isOnline, 
  size = "md", 
  showLabel = false,
  className 
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-full shrink-0",
          sizeClasses[size],
          isOnline 
            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
            : "bg-muted-foreground/40"
        )}
        title={isOnline ? "Online" : "Offline"}
      />
      {showLabel && (
        <span className={cn(
          "text-sm",
          isOnline ? "text-green-500" : "text-muted-foreground"
        )}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;
