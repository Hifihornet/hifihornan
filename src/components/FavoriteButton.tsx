import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const FavoriteButton = ({ listingId, className, size = "md" }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const favorited = isFavorite(listingId);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(listingId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200",
        "bg-background/80 backdrop-blur-sm border border-border hover:border-primary/50",
        "hover:scale-110 active:scale-95",
        sizeClasses[size],
        className
      )}
      aria-label={favorited ? "Ta bort från favoriter" : "Lägg till i favoriter"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          favorited ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        )}
      />
    </button>
  );
};

export default FavoriteButton;
