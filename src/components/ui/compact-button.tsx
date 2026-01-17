import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

interface CompactButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "default" | "lg";
  mobileSize?: "sm" | "default" | "lg";
  square?: boolean;
  children: React.ReactNode;
}

export function CompactButton({
  variant = "default",
  size = "default",
  mobileSize = "sm",
  square = false,
  className,
  children,
  ...props
}: CompactButtonProps) {
  const { isMobile } = useMobileOptimization();
  
  const actualSize = isMobile ? mobileSize : size;
  
  const responsiveClasses = cn(
    "transition-all duration-200",
    {
      // Compact sizing
      "h-9 px-3 text-sm": actualSize === "sm",
      "h-10 px-4 text-sm": actualSize === "default", 
      "h-11 px-5 text-base": actualSize === "lg",
      
      // Square variant
      "w-9 p-0": square && actualSize === "sm",
      "w-10 p-0": square && actualSize === "default",
      "w-11 p-0": square && actualSize === "lg",
      
      // Mobile touch targets (minimum 44px)
      "min-h-[44px] min-w-[44px]": isMobile && !square,
      "min-h-[44px] min-w-[44px]": isMobile && square,
      
      // Interactions
      "hover:-translate-y-0.5": !isMobile,
      "active:scale-95": isMobile,
      "hover:shadow-md": !isMobile && variant === "default",
    },
    className
  );

  return (
    <Button
      variant={variant}
      size={square ? "icon" : (actualSize === "sm" ? "sm" : actualSize === "default" ? "default" : "lg")}
      className={responsiveClasses}
      {...props}
    >
      {children}
    </Button>
  );
}
