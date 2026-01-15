import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

interface ReviewListProps {
  sellerId: string;
}

const ReviewList = ({ sellerId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, reviewer_id")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        // Fetch reviewer names
        const reviewsWithNames = await Promise.all(
          (data || []).map(async (review) => {
            const { data: nameData } = await supabase.rpc("get_seller_display_name", {
              _user_id: review.reviewer_id,
            });
            return {
              ...review,
              reviewer_name: nameData || "Anonym",
            };
          })
        );

        setReviews(reviewsWithNames);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [sellerId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Laddar omdömen...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-sm text-muted-foreground">Inga omdömen ännu</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">{review.reviewer_name}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          )}
          <p className="text-xs text-muted-foreground/60 mt-2">
            {new Date(review.created_at).toLocaleDateString("sv-SE")}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
