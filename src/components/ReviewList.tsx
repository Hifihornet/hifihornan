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

// Temporarily disabled due to missing reviews table
const ReviewList = ({ sellerId }: { sellerId: string }) => {
  // Return empty component temporarily
  return null;
};

export default ReviewList;
