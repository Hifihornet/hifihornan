import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

interface MobileOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  mobileSize?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export function MobileOptimizedButton({
  variant = "default",
  size = "default",
  mobileSize = "default",
  className,
  children,
  ...props
}: MobileOptimizedButtonProps) {
  const { isMobile } = useMobileOptimization();
  
  const actualSize = isMobile ? mobileSize : size;
  
  const responsiveClasses = cn(
    "transition-all duration-200",
    {
      "min-h-[44px] min-w-[44px]": isMobile && actualSize !== "icon", // iOS touch target minimum
      "text-sm": isMobile && actualSize === "default",
      "text-xs": isMobile && actualSize === "sm",
      "text-lg": isMobile && actualSize === "lg",
      "hover:-translate-y-0.5": !isMobile,
      "active:scale-95": isMobile, // Mobile touch feedback
    },
    className
  );

  return (
    <Button
      variant={variant}
      size={actualSize}
      className={responsiveClasses}
      {...props}
    >
      {children}
    </Button>
  );
}
