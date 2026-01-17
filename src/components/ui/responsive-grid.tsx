import { cn } from "@/lib/utils";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  mobileCols?: 1 | 2 | 3 | 4;
  tabletCols?: 1 | 2 | 3 | 4 | 5 | 6;
  desktopCols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  gap?: string;
}

export function ResponsiveGrid({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 4,
  gap = "gap-4",
  className,
  ...props
}: ResponsiveGridProps) {
  const { isMobile, isTablet } = useMobileOptimization();
  
  const getGridCols = () => {
    if (isMobile) return `grid-cols-${mobileCols}`;
    if (isTablet) return `grid-cols-${tabletCols}`;
    return `grid-cols-${desktopCols}`;
  };

  const getGap = () => {
    if (isMobile) return "gap-2";
    if (isTablet) return "gap-3";
    return gap;
  };

  return (
    <div
      className={cn(
        "grid",
        getGridCols(),
        getGap(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
