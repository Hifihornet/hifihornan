import { Link } from "react-router-dom";
import { MapPin, Calendar, Eye } from "lucide-react";
import { Listing, categories, conditions } from "@/data/listings";
import StoreBadge from "./StoreBadge";

interface ListingCardProps {
  listing: Listing;
  isStoreAccount?: boolean;
}

const ListingCard = ({ listing, isStoreAccount = false }: ListingCardProps) => {
  const category = categories.find((c) => c.id === listing.category);
  const condition = conditions.find((c) => c.id === listing.condition);

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
