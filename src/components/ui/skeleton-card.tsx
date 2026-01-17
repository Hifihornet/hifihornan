import { cn } from "@/lib/utils";

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border p-4 animate-pulse",
        className
      )}
      {...props}
    >
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded-md animate-pulse" />
        <div className="h-4 bg-muted rounded-md animate-pulse w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("h-4 bg-muted rounded animate-pulse", className)}
      {...props}
    />
  );
}

export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-10 bg-muted rounded-lg animate-pulse",
        className
      )}
      {...props}
    />
  );
}
