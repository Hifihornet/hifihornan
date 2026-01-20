import { Suspense, lazy } from "react";
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
import { HelmetProvider } from 'react-helmet-async';
// import { useSiteVisit } from "@/hooks/useSiteVisit";

const Index = lazy(() => import("./pages/Index"));
const Browse = lazy(() => import("./pages/Browse"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const Auth = lazy(() => import("./pages/Auth"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Business = lazy(() => import("./pages/Business"));
const Forum = lazy(() => import("./pages/Forum"));
const Showcase = lazy(() => import("./pages/Showcase"));
const Achievements = lazy(() => import("./pages/Achievements"));
const SavedSearches = lazy(() => import("./pages/SavedSearches"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const VinylHyllan = lazy(() => import("./pages/VinylHyllan"));
const VinylShop = lazy(() => import("./pages/VinylShop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));

const queryClient = new QueryClient();

// Component to track user's online presence and site visits
const OnlinePresenceTracker = () => {
  useOnlinePresence();
  return null;
};

// Component to track site visits (needs to be inside BrowserRouter)
// const SiteVisitTracker = () => {
//   useSiteVisit();
//   return null;
// };

const AppRoutes = () => (
  <Suspense
    fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Laddar...
      </div>
    }
  >
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/create" element={<CreateListing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/achievements" element={<Achievements />} />
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
      <Route path="/business" element={<Business />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="/bevakningar" element={<SavedSearches />} />
      <Route path="/vinylhyllan" element={<VinylHyllan />} />
      <Route path="/vinylshop" element={<VinylShop />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/aterstall-losenord" element={<ResetPassword />} />
      <Route path="/cookie-installningar" element={<CookieSettings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
            <SupportChat />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
