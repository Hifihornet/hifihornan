import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  mobilePlaceholder?: string;
}

export function MobileOptimizedInput({
  placeholder,
  mobilePlaceholder,
  className,
  ...props
}: MobileOptimizedInputProps) {
  const { isMobile } = useMobileOptimization();
  
  const actualPlaceholder = isMobile && mobilePlaceholder ? mobilePlaceholder : placeholder;
  
  const responsiveClasses = cn(
    "transition-all duration-200",
    {
      "h-12 text-base": isMobile, // Larger touch targets
      "h-11 text-base": !isMobile,
      "text-lg": !isMobile,
      "focus:ring-2 focus:ring-primary/20": !isMobile,
      "focus:ring-2 focus:ring-primary/30": isMobile, // Stronger focus on mobile
    },
    className
  );

  return (
    <Input
      placeholder={actualPlaceholder}
      className={responsiveClasses}
      {...props}
    />
  );
}
