-- =====================================================
-- FAVORITES TABLE - Save listings users like
-- =====================================================
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- REVIEWS TABLE - Rate sellers after transactions
-- =====================================================
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, listing_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Users can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id AND auth.uid() != seller_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() = reviewer_id);

-- =====================================================
-- REPORTS TABLE - Report suspicious listings
-- =====================================================
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT 
USING (auth.uid() = reporter_id);

-- =====================================================
-- BLOG POSTS TABLE - Articles for SEO
-- =====================================================
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published blog posts are viewable by everyone" 
ON public.blog_posts FOR SELECT 
USING (published = true);

CREATE POLICY "Authors can manage their own posts" 
ON public.blog_posts FOR ALL 
USING (auth.uid() = author_id);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (true);

-- =====================================================
-- SAVED SEARCHES TABLE - Watch for specific items
-- =====================================================
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  min_price INTEGER,
  max_price INTEGER,
  location TEXT,
  keywords TEXT,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_notified_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved searches" 
ON public.saved_searches FOR ALL 
USING (auth.uid() = user_id);

-- =====================================================
-- RECENTLY VIEWED TABLE - Track viewed listings
-- =====================================================
CREATE TABLE public.recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history" 
ON public.recently_viewed FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their history" 
ON public.recently_viewed FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can clear their history" 
ON public.recently_viewed FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- SETUP SHOWCASE TABLE - User HiFi setups
-- =====================================================
CREATE TABLE public.setup_showcases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] NOT NULL,
  equipment TEXT[],
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.setup_showcases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Showcases are viewable by everyone" 
ON public.setup_showcases FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own showcases" 
ON public.setup_showcases FOR ALL 
USING (auth.uid() = user_id);

-- =====================================================
-- SHOWCASE LIKES TABLE
-- =====================================================
CREATE TABLE public.showcase_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  showcase_id UUID NOT NULL REFERENCES public.setup_showcases(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, showcase_id)
);

ALTER TABLE public.showcase_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
ON public.showcase_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.showcase_likes FOR ALL 
USING (auth.uid() = user_id);

-- =====================================================
-- PROMOTED LISTINGS TABLE - Paid promotion
-- =====================================================
CREATE TABLE public.promoted_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.promoted_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promoted listings are viewable by everyone" 
ON public.promoted_listings FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own promotions" 
ON public.promoted_listings FOR ALL 
USING (auth.uid() = user_id);

-- =====================================================
-- Add verified_seller column to profiles
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN NOT NULL DEFAULT false;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get seller rating
CREATE OR REPLACE FUNCTION public.get_seller_rating(_seller_id UUID)
RETURNS TABLE(average_rating NUMERIC, review_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as review_count
  FROM reviews
  WHERE seller_id = _seller_id;
END;
$$;

-- Get favorites count for a listing
CREATE OR REPLACE FUNCTION public.get_listing_favorites_count(_listing_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)::integer INTO count_result
  FROM favorites
  WHERE listing_id = _listing_id;
  RETURN count_result;
END;
$$;

-- Check if user has favorited a listing
CREATE OR REPLACE FUNCTION public.is_listing_favorited(_listing_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM favorites 
    WHERE listing_id = _listing_id AND user_id = _user_id
  ) INTO result;
  RETURN result;
END;
$$;

-- Update showcase likes count trigger
CREATE OR REPLACE FUNCTION public.update_showcase_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE setup_showcases SET likes_count = likes_count + 1 WHERE id = NEW.showcase_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE setup_showcases SET likes_count = likes_count - 1 WHERE id = OLD.showcase_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_showcase_likes_count_trigger
AFTER INSERT OR DELETE ON public.showcase_likes
FOR EACH ROW EXECUTE FUNCTION public.update_showcase_likes_count();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON public.reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);