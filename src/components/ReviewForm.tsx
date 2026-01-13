import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  sellerId: string;
  listingId?: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ sellerId, listingId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du måste logga in för att lämna omdöme");
      return;
    }

    if (rating === 0) {
      toast.error("Välj ett betyg");
      return;
    }

    if (user.id === sellerId) {
      toast.error("Du kan inte lämna omdöme på dig själv");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId || null,
        rating,
        comment: comment || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Du har redan lämnat ett omdöme för denna annons");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Tack för ditt omdöme!");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Kunde inte skicka omdömet");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-lg bg-card border border-border">
      <h4 className="font-medium">Lämna ett omdöme</h4>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                (hoveredRating || rating) >= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating} av 5 stjärnor` : "Välj betyg"}
        </span>
      </div>

      <Textarea
        placeholder="Beskriv din upplevelse (valfritt)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Skicka omdöme
      </Button>
    </div>
  );
};

export default ReviewForm;
