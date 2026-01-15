-- Add explicit deny policies for anonymous users on sensitive tables
-- This provides defense-in-depth even though RLS already denies by default

-- Profiles: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.profiles
FOR SELECT TO anon USING (false);

-- Newsletter subscribers: deny anonymous SELECT  
CREATE POLICY "deny_anon_access" ON public.newsletter_subscribers
FOR SELECT TO anon USING (false);

-- Conversations: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.conversations
FOR SELECT TO anon USING (false);

-- Messages: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.messages
FOR SELECT TO anon USING (false);

-- Favorites: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.favorites
FOR SELECT TO anon USING (false);

-- Recently viewed: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.recently_viewed
FOR SELECT TO anon USING (false);

-- Saved searches: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.saved_searches
FOR SELECT TO anon USING (false);

-- Reports: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.reports
FOR SELECT TO anon USING (false);

-- User roles: deny anonymous SELECT
CREATE POLICY "deny_anon_access" ON public.user_roles
FOR SELECT TO anon USING (false);

-- Site visits: already has admin-only SELECT, add explicit anon deny
CREATE POLICY "deny_anon_access" ON public.site_visits
FOR SELECT TO anon USING (false);

-- Listing views: add explicit anon deny
CREATE POLICY "deny_anon_access" ON public.listing_views
FOR SELECT TO anon USING (false);

-- Admin activity log: add explicit anon deny
CREATE POLICY "deny_anon_access" ON public.admin_activity_log
FOR SELECT TO anon USING (false);