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
          isOnline ? "bg-primary shadow-sm" : "bg-muted-foreground/40"
        )}
        title={isOnline ? "Online" : "Offline"}
      />
      {showLabel && (
        <span
          className={cn(
            "text-sm",
            isOnline ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;
