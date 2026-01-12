import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface OnlineIndicatorProps {
  isOnline: boolean;
  lastSeen?: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const OnlineIndicator = ({ 
  isOnline, 
  lastSeen,
  size = "md", 
  showLabel = false,
  className 
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const getStatusText = () => {
    if (isOnline) return "Online";
    if (lastSeen) {
      return `Online ${formatDistanceToNow(new Date(lastSeen), { 
        addSuffix: true, 
        locale: sv 
      })}`;
    }
    return "Offline";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-full shrink-0",
          sizeClasses[size],
          isOnline ? "bg-primary shadow-sm" : "bg-muted-foreground/40"
        )}
        title={getStatusText()}
      />
      {showLabel && (
        <span
          className={cn(
            "text-sm",
            isOnline ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;
