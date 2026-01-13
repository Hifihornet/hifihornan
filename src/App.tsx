import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";
import BroadcastBanner from "@/components/BroadcastBanner";
import SupportChat from "@/components/SupportChat";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useSiteVisit } from "@/hooks/useSiteVisit";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Showcase from "./pages/Showcase";
import SavedSearches from "./pages/SavedSearches";
import ResetPassword from "./pages/ResetPassword";
import CookieSettings from "./pages/CookieSettings";

const queryClient = new QueryClient();

// Component to track user's online presence and site visits
const OnlinePresenceTracker = () => {
  useOnlinePresence();
  return null;
};

// Component to track site visits (needs to be inside BrowserRouter)
const SiteVisitTracker = () => {
  useSiteVisit();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <OnlinePresenceTracker />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteVisitTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/create" element={<CreateListing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/integritetspolicy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/anvandarvillkor" element={<TermsOfService />} />
            <Route path="/om-oss" element={<AboutUs />} />
            <Route path="/profil/:userId" element={<Profile />} />
            <Route path="/meddelanden" element={<Messages />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/favoriter" element={<Favorites />} />
            <Route path="/blogg" element={<Blog />} />
            <Route path="/blogg/:slug" element={<BlogPost />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/bevakningar" element={<SavedSearches />} />
            <Route path="/aterstall-losenord" element={<ResetPassword />} />
            <Route path="/cookie-installningar" element={<CookieSettings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BroadcastBanner />
          <SupportChat />
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
