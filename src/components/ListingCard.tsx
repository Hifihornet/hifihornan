import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Eye, Share2, Link as LinkIcon, Facebook } from "lucide-react";
import { Listing, categories, conditions } from "@/data/listings";
import StoreBadge from "./StoreBadge";
import VerifiedBadge from "./VerifiedBadge";
import FavoriteButton from "./FavoriteButton";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListingCardProps {
  listing: Listing;
  isStoreAccount?: boolean;
  isVerifiedSeller?: boolean;
  status?: string;
}

const ListingCard = ({ listing, isStoreAccount = false, isVerifiedSeller = false, status = "active" }: ListingCardProps) => {
  const navigate = useNavigate();
  const category = categories.find((c) => c.id === listing.category);
  const condition = conditions.find((c) => c.id === listing.condition);
  const isSold = status === "sold";
  const isHidden = status === "hidden";
  
  const listingUrl = `${window.location.origin}/listing/${listing.id}`;

  // För sociala medier behöver vi en server-renderad OG-sida.
  const previewUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-image?id=${listing.id}`;
  const encodedUrl = encodeURIComponent(previewUrl);
  const encodedTitle = encodeURIComponent(listing.title);

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}`);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success("Förhandsvisningslänk kopierad!");
    } catch {
      toast.error("Kunde inte kopiera länken");
    }
  };

  const copyPlainLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(listingUrl);
      toast.success("Vanlig länk kopierad!");
    } catch {
      toast.error("Kunde inte kopiera länken");
    }
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=400");
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank");
  };

  return (
    <article 
      onClick={handleCardClick}
      className={`group bg-card rounded-xl border border-border overflow-hidden hover-lift cursor-pointer ${isSold || isHidden ? "opacity-60" : ""}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSold ? "grayscale" : ""}`}
        />
        
        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-destructive/90 text-destructive-foreground px-6 py-2 rounded-lg font-bold text-lg uppercase tracking-wider transform -rotate-12 shadow-lg">
              Såld
            </div>
          </div>
        )}
        
        {/* Hidden overlay */}
        {isHidden && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-muted/90 text-muted-foreground px-6 py-2 rounded-lg font-bold text-lg uppercase tracking-wider transform -rotate-12 shadow-lg">
              Dold
            </div>
          </div>
        )}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2 flex-wrap">
          <span className="glass px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium">
            {category?.icon} {category?.label}
          </span>
          {isStoreAccount && (
            <StoreBadge showLabel size="sm" />
          )}
          {isVerifiedSeller && !isStoreAccount && (
            <VerifiedBadge showLabel size="sm" />
          )}
        </div>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 items-end">
          <span className="bg-primary text-primary-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold">
            {condition?.label}
          </span>
          {listing.viewCount !== undefined && (
            <span className="glass px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.viewCount}
            </span>
          )}
        </div>
        
        {/* Favorite and Share buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <FavoriteButton listingId={listing.id} size="sm" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="glass px-2 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={shareToFacebook}>
                <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareToWhatsApp}>
                <svg className="w-4 h-4 mr-2 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Kopiera länk (förhandsvisning)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyPlainLink}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Kopiera vanlig länk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
          <h3 className="font-display text-sm sm:text-base lg:text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs lg:text-sm text-muted-foreground mb-2 sm:mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(listing.createdAt).toLocaleDateString("sv-SE")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg lg:text-xl font-display font-bold text-gradient">
            {listing.price.toLocaleString("sv-SE")} kr
          </span>
          <span className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
            {listing.brand} {listing.year && `• ${listing.year}`}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
