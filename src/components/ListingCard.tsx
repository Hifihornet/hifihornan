import { Link } from "react-router-dom";
import { MapPin, Calendar, Eye, Share2 } from "lucide-react";
import { Listing, categories, conditions } from "@/data/listings";
import StoreBadge from "./StoreBadge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface ListingCardProps {
  listing: Listing;
  isStoreAccount?: boolean;
}

const ListingCard = ({ listing, isStoreAccount = false }: ListingCardProps) => {
  const [shareOpen, setShareOpen] = useState(false);
  const category = categories.find((c) => c.id === listing.category);
  const condition = conditions.find((c) => c.id === listing.condition);
  
  const listingUrl = `${window.location.origin}/listing/${listing.id}`;
  const encodedUrl = encodeURIComponent(listingUrl);
  const encodedTitle = encodeURIComponent(listing.title);

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(listingUrl);
      toast.success("Länken kopierad!");
      setShareOpen(false);
    } catch {
      toast.error("Kunde inte kopiera länken");
    }
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=400");
    setShareOpen(false);
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank");
    setShareOpen(false);
  };

  return (
    <Link to={`/listing/${listing.id}`}>
      <article className="group bg-card rounded-xl border border-border overflow-hidden hover-lift cursor-pointer">
        <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="glass px-2 py-1 rounded-md text-xs font-medium">
              {category?.icon} {category?.label}
            </span>
            {isStoreAccount && (
              <StoreBadge showLabel size="sm" />
            )}
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold">
              {condition?.label}
            </span>
            {listing.viewCount !== undefined && (
              <span className="glass px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.viewCount}
              </span>
            )}
          </div>
          
          {/* Share button */}
          <div className="absolute bottom-3 right-3" onClick={handleShareClick}>
            <Popover open={shareOpen} onOpenChange={setShareOpen}>
              <PopoverTrigger asChild>
                <button 
                  className="glass px-2 py-2 rounded-md hover:bg-white/20 transition-colors"
                  onClick={handleShareClick}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end" onClick={handleShareClick}>
                <button
                  onClick={shareToFacebook}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                >
                  <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                >
                  <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Kopiera länk
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
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
            <span className="text-lg font-display font-bold text-gradient">
              {listing.price.toLocaleString("sv-SE")} kr
            </span>
            <span className="text-xs text-muted-foreground">
              {listing.brand} {listing.year && `• ${listing.year}`}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ListingCard;
