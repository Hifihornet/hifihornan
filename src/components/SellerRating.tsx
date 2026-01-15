import { Star } from "lucide-react";
import { useSellerRating } from "@/hooks/useSellerRating";
import { cn } from "@/lib/utils";

interface SellerRatingProps {
  sellerId: string | null;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SellerRating = ({ sellerId, showCount = true, size = "md", className }: SellerRatingProps) => {
  const { averageRating, reviewCount, loading } = useSellerRating(sellerId);

  if (loading || reviewCount === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1.5",
  };

  const starSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSizes[size],
              i < fullStars
                ? "fill-yellow-400 text-yellow-400"
                : i === fullStars && hasHalfStar
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
      {showCount && (
        <span className="text-muted-foreground">({reviewCount} omdömen)</span>
      )}
    </div>
  );
};

export default SellerRating;
