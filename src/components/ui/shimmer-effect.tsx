import { cn } from "@/lib/utils";

interface ShimmerEffectProps {
  className?: string;
  variant?: "default" | "card" | "text" | "button";
}

export const ShimmerEffect = ({ className = "", variant = "default" }: ShimmerEffectProps) => {
  const variants = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-xl",
    text: "h-4 w-3/4 rounded",
    button: "h-10 w-20 rounded-lg"
  };

  return (
    <div className={cn("relative overflow-hidden", variants[variant], className)}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
      <div className="bg-muted/50 h-full w-full rounded" />
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard = ({ className = "" }: LoadingCardProps) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="space-y-3">
        <ShimmerEffect variant="text" className="h-6 w-3/4" />
        <ShimmerEffect variant="text" className="h-4 w-full" />
        <ShimmerEffect variant="text" className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <ShimmerEffect variant="button" />
        <ShimmerEffect variant="button" className="w-16" />
      </div>
    </div>
  );
};

interface FloatingBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingBadge = ({ children, className = "" }: FloatingBadgeProps) => {
  return (
    <div className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",
      "animate-pulse hover:bg-primary/20 transition-colors",
      className
    )}>
      {children}
    </div>
  );
};

interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: "primary" | "blue" | "green" | "purple";
}

export const GlowEffect = ({ 
  children, 
  className = "", 
  color = "primary" 
}: GlowEffectProps) => {
  const colors = {
    primary: "shadow-primary/50",
    blue: "shadow-blue-500/50", 
    green: "shadow-green-500/50",
    purple: "shadow-purple-500/50"
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "absolute inset-0 rounded-lg blur-xl opacity-50 animate-pulse",
        colors[color]
      )} />
      <div className="relative">{children}</div>
    </div>
  );
};
