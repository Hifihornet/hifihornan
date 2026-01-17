import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { User, MapPin, Calendar, Loader2, Trash2, Upload, X, MessageCircle, Trophy, Star, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CreatorBadge from "@/components/CreatorBadge";
import StoreBadge from "@/components/StoreBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import AdminBadge from "@/components/AdminBadge";
import OnlineIndicator from "@/components/OnlineIndicator";
import ProfileSettingsDialog from "@/components/ProfileSettingsDialog";
import SellerRating from "@/components/SellerRating";
import ReviewList from "@/components/ReviewList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import useUserRoles from "@/hooks/useUserRoles";
import { useIsUserOnline } from "@/hooks/useOnlinePresence";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { MobileOptimizedButton } from "@/components/ui/mobile-optimized-button";
import { useErrorToast } from "@/hooks/useErrorToast";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Listing } from "@/data/listings";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  location: string | null;
  bio: string | null;
  setup_images: string[] | null;
  avatar_url: string | null;
  created_at: string;
  last_seen: string | null;
  is_searchable?: boolean;
  allow_direct_messages?: boolean;
  is_verified_seller?: boolean;
}

interface ListingWithStatus extends Listing {
  status?: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { isCreator, isStore, isAdmin, isModerator } = useUserRoles(userId);
  const isUserOnline = useIsUserOnline(userId);
  
  // Scroll to top on route change
  useScrollToTop();
  
  // Mobile optimization
  const { isMobile, isTablet, getResponsiveClass, getResponsiveValue } = useMobileOptimization();
  
  // Error handling
  const { showError, showSuccess } = useErrorToast();
  
  // Gamification
  const { stats, achievements, loading: gamificationLoading } = useGamification();
  
  // Helper function for achievement progress
  const getAchievementProgress = (achievement: any, userStats: any) => {
    if (achievement.unlocked) return 100;
    
    switch (achievement.type) {
      case 'listing':
        return Math.min(100, (userStats?.totalListings || 0) / achievement.requirement * 100);
      case 'sale':
        return Math.min(100, (userStats?.totalSales || 0) / achievement.requirement * 100);
      case 'purchase':
        return Math.min(100, (userStats?.totalPurchases || 0) / achievement.requirement * 100);
      case 'rating':
        return Math.min(100, (userStats?.averageRating || 0) / achievement.requirement * 100);
      default:
        return 0;
    }
  };

  // Fallback data om gamification misslyckas
  const safeStats = stats || {
    level: 1,
    points: 0,
    totalListings: 0,
    totalSales: 0,
    totalPurchases: 0,
    averageRating: 0,
    badges: [],
    nextLevelPoints: 500,
    progressToNextLevel: 0
  };

  const safeAchievements = achievements || [];
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<ListingWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [canSendDirectMessage, setCanSendDirectMessage] = useState(false);
  const [isTargetAdmin, setIsTargetAdmin] = useState(false);
  const [deletingListing, setDeletingListing] = useState<string | null>(null);

  // Dynamisk data för achievements baserat på användarens faktiska aktivitet
  const userAchievements = [
    {
      id: 'first_listing',
      name: 'Första annons',
      description: 'Skapa din första annons',
      icon: '🎯',
      unlocked: false, // Återställd till false
      points: 50
    },
    {
      id: 'first_sale',
      name: 'Första försäljningen',
      description: 'Sälj din första vara',
      icon: '💰',
      unlocked: false, // Återställd till false
      points: 75
    },
    {
      id: 'first_purchase',
      name: 'Första köpet',
      description: 'Köp din första vara',
      icon: '🛒',
      unlocked: false, // Återställd till false
      points: 50
    },
    {
      id: 'perfect_rating',
      name: 'Perfekt rating',
      description: 'Få 5 stjärnor i betyg',
      icon: '⭐',
      unlocked: false, // Återställd till false
      points: 100
    },
    {
      id: 'five_listings',
      name: '5 annonser',
      description: 'Skapa 5 annonser',
      icon: '📝',
      unlocked: false, // Återställd till false
      points: 100
    },
    {
      id: 'five_sales',
      name: '5 försäljningar',
      description: 'Sälj 5 varor',
      icon: '💵',
      unlocked: false, // Återställd till false
      points: 125
    },
    {
      id: 'five_purchases',
      name: '5 köp',
      description: 'Köp 5 varor',
      icon: '🛒',
      unlocked: false, // Återställd till false
      points: 75
    },
    {
      id: 'ten_listings',
      name: '10 annonser',
      description: 'Skapa 10 annonser',
      icon: '📈',
      unlocked: false, // Återställd till false
      points: 150
    },
    {
      id: 'ten_sales',
      name: '10 försäljningar',
      description: 'Sälj 10 varor',
      icon: '💎',
      unlocked: false, // Återställd till false
      points: 200
    }
  ];

  const unlockedAchievements = userAchievements.filter(a => a.unlocked);
  const isHiFiLegend = false; // Återställd till false
  const totalPoints = 0; // Återställd till 0
  const userLevel = 1; // Återställd till 1

  // Debug logging
  console.log('ACHIEVEMENTS DEBUG:', {
    listings: listings.length,
    unlockedAchievements: unlockedAchievements.length,
    isHiFiLegend,
    userAchievements: userAchievements.map(a => ({ id: a.id, name: a.name, unlocked: a.unlocked }))
  });

  const isOwnProfile = user?.id === userId;

  const fetchProfileAndListings = useCallback(async () => {
    if (!userId) return;

    try {
      let profileData;
      
      if (user?.id === userId) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        profileData = data;
        console.log('Profile data received:', profileData);
      } else {
        const { data, error: profileError } = await supabase
          .rpc('get_public_profile_by_user_id', { _user_id: userId });

        if (profileError) throw profileError;
        profileData = data && data.length > 0 ? { ...data[0], location: null } : null;
      }
      
      if (!profileData) {
        setError("Profilen kunde inte hittas");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Check if we can send direct messages to this user
      if (user && user.id !== userId) {
        const { data: prefs } = await supabase.rpc("get_user_messaging_preferences", {
          _user_id: userId,
        });
        if (prefs && prefs.length > 0) {
          setCanSendDirectMessage(prefs[0].allow_direct_messages && !prefs[0].is_admin);
          setIsTargetAdmin(prefs[0].is_admin);
        }
      }

      // Fetch all user listings (including sold for own profile)
      const query = supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)  // Use user_id instead of seller_id
        .order("created_at", { ascending: false });
      
      // Show active and sold listings for own profile, only active for others
      if (user?.id === userId) {
        query.in("status", ["active", "sold"]);
      } else {
        query.eq("status", "active");
      }
      
      const { data: listingsData, error: listingsError } = await query;

      if (listingsError) throw listingsError;

      const formattedListings: ListingWithStatus[] = (listingsData || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        condition: item.condition,
        brand: item.brand,
        year: item.year || "",
        location: item.location,
        sellerName: profileData.display_name || "Säljare",
        sellerEmail: "",
        images: item.images || [],
        createdAt: item.created_at,
        status: item.status,
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Ett fel uppstod vid hämtning av profilen");
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchProfileAndListings();
  }, [fetchProfileAndListings]);

  const handleDeleteListing = async (listingId: string) => {
    if (!user || user.id !== userId) return;
    
    setDeletingListing(listingId);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId)
        .eq("user_id", user.id); // Use user_id instead of seller_id

      if (error) throw error;

      setListings(prev => prev.filter(l => l.id !== listingId));
      toast.success("Annonsen har tagits bort");
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error("Kunde inte ta bort annonsen");
    } finally {
      setDeletingListing(null);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!user || !userId || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.rpc("send_direct_message_to_user", {
        _recipient_user_id: userId,
        _content: messageContent.trim(),
      });

      if (error) {
        if (error.message.includes("does not accept direct messages")) {
          toast.error("Denna användare tar inte emot direktmeddelanden");
        } else if (error.message.includes("administrators")) {
          toast.error("Det går inte att skicka direktmeddelanden till administratörer");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Meddelandet har skickats!");
      setMessageContent("");
      setShowMessageInput(false);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Kunde inte skicka meddelandet");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUploadProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Endast bilder är tillåtna");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      toast.success("Profilbilden har uppdaterats");
    } catch (err) {
      console.error("Error uploading profile image:", err);
      toast.error("Kunde inte uppdatera profilbilden");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUploadSetupImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Endast bilder är tillåtna");
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("setup-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("setup-images")
        .getPublicUrl(fileName);

      const newImages = [...(profile?.setup_images || []), urlData.publicUrl];

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ setup_images: newImages })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, setup_images: newImages } : null);
      toast.success("Bilden har laddats upp");
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Kunde inte ladda upp bilden");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleDeleteSetupImage = async (imageUrl: string) => {
    if (!user || !profile) return;

    try {
      const urlParts = imageUrl.split("/setup-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("setup-images").remove([filePath]);
      }

      const newImages = (profile.setup_images || []).filter(img => img !== imageUrl);

      const { error } = await supabase
        .from("profiles")
        .update({ setup_images: newImages })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, setup_images: newImages } : null);
      toast.success("Bilden har tagits bort");
    } catch (err) {
      console.error("Error deleting image:", err);
      toast.error("Kunde inte ta bort bilden");
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold mb-2">Profil hittades inte</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/browse">
              <Button>Tillbaka till annonser</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name || "Profilbild"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary/50" />
                  )}
                  
                  {/* HiFi Legend Badge */}
                  {isOwnProfile && isHiFiLegend && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-background shadow-lg animate-pulse">
                      <span className="text-sm animate-bounce">👑</span>
                    </div>
                  )}
                  
                  {/* Guldram för HiFi Legend */}
                  {isOwnProfile && isHiFiLegend && (
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20 animate-spin-slow"></div>
                  )}
                  
                  {/* Upload knapp - bara synlig på hover */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 rounded-full">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadProfileImage}
                        />
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                          <Upload className="w-4 h-4 text-primary" />
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                {isCreator && <CreatorBadge size="md" className="-top-1 -right-1" />}
                {isStore && !isCreator && <StoreBadge size="md" className="-bottom-0.5 -right-0.5" />}
              </div>
              
                <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {profile.display_name || "Användare"}
                  </h1>
                  {isAdmin && <AdminBadge showLabel size="md" />}
                  {isCreator && !isAdmin && <CreatorBadge size="md" />}
                  {isStore && <StoreBadge showLabel size="md" labelType="profile" />}
                  {profile.is_verified_seller && !isStore && (
                    <VerifiedBadge showLabel size="md" />
                  )}
                  <OnlineIndicator 
                    isOnline={isUserOnline} 
                    lastSeen={profile.last_seen}
                    size="md" 
                    showLabel 
                  />
                </div>
                <SellerRating sellerId={userId || null} size="md" className="mb-2" />
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Medlem sedan {memberSince}
                  </span>
                </div>

                {/* Gamification Stats for own profile */}
                {isOwnProfile && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      Level {userLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary" />
                      {totalPoints} poäng
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-primary" />
                      {unlockedAchievements.length} badges
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {/* Settings button for own profile */}
                {isOwnProfile && (
                  <ProfileSettingsDialog 
                    profile={profile} 
                    onProfileUpdate={handleProfileUpdate} 
                  />
                )}
                {isOwnProfile && (
                  <Link to="/create">
                    <Button variant="glow">Lägg upp ny annons</Button>
                  </Link>
                )}
                {/* Send Direct Message Button - only show on other users' profiles */}
                {!isOwnProfile && user && !isTargetAdmin && canSendDirectMessage && (
                  <Button
                    variant="outline"
                    onClick={() => setShowMessageInput(true)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Skicka meddelande
                  </Button>
                )}
              </div>
            </div>

            {/* Direct Message Input */}
            {showMessageInput && !isOwnProfile && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-3">
                  <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Skriv ditt meddelande..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendDirectMessage()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSendDirectMessage}
                      disabled={sendingMessage || !messageContent.trim()}
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Skicka"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowMessageInput(false);
                        setMessageContent("");
                      }}
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="listings" key={userId} className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="listings">Annonser ({listings.length})</TabsTrigger>
              <TabsTrigger value="reviews">Omdömen</TabsTrigger>
              <TabsTrigger value="about">Om mig</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing.id} className="relative group">
                      <ListingCard listing={listing} status={listing.status} />
                      {isOwnProfile && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={deletingListing === listing.id}
                            >
                              {deletingListing === listing.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ta bort annons?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Är du säker på att du vill ta bort "{listing.title}"? 
                                Detta kan inte ångras.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Avbryt</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteListing(listing.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Ta bort
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Inga annonser än
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isOwnProfile 
                      ? "Du har inte lagt upp några annonser ännu." 
                      : "Denna användare har inga aktiva annonser."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/create">
                      <Button variant="glow">Lägg upp din första annons</Button>
                    </Link>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-display text-xl font-semibold mb-4">
                  Omdömen om {isOwnProfile ? "mig" : profile.display_name || "säljaren"}
                </h2>
                <SellerRating sellerId={userId || null} size="lg" className="mb-6" />
                {userId && <ReviewList sellerId={userId} />}
              </div>
            </TabsContent>

            <TabsContent value="about">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bio Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    Om {isOwnProfile ? "mig" : profile.display_name || "användaren"}
                  </h2>
                  
                  {profile.bio ? (
                    <p className="text-foreground/80 whitespace-pre-line">{profile.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {isOwnProfile 
                        ? "Du har inte skrivit något om dig själv än. Klicka på kugghjulet för att lägga till."
                        : "Ingen beskrivning tillagd."}
                    </p>
                  )}
                </div>

                {/* Setup Images Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    Min HiFi-setup
                  </h2>
                  
                  {profile.setup_images && profile.setup_images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile.setup_images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Setup bild ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          {isOwnProfile && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteSetupImage(image)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {isOwnProfile 
                          ? "Du har inte lagt till några bilder på din HiFi-setup än."
                          : "Inga setup-bilder tillagda."}
                      </p>
                    </div>
                  )}
                  
                  {isOwnProfile && (
                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSetupImage}
                        disabled={uploadingImage}
                        className="hidden"
                        id="setup-image-upload"
                      />
                      <label htmlFor="setup-image-upload">
                        <Button variant="outline" disabled={uploadingImage} asChild>
                          <span className="cursor-pointer">
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Laddar upp...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Ladda upp bild
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Achievements Tab - Snygg och interaktiv version */}
            <TabsContent value="achievements">
              <div className="space-y-6">
                {/* Header med stats */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl font-bold text-primary">Achievements</h2>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium text-primary">{unlockedAchievements.length}/9 Upplåsta</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {unlockedAchievements.length === 9 
                      ? "Du har låst upp alla achievements och är nu en HiFi Legend!" 
                      : `Lås upp ${9 - unlockedAchievements.length} till achievements för att bli en HiFi Legend!`}
                  </p>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userAchievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                        achievement.unlocked 
                          ? 'border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-primary/10' 
                          : 'border-border bg-muted/30 hover:shadow-muted/20 opacity-75'
                      }`}
                    >
                      <div className="absolute top-2 right-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.unlocked 
                            ? 'bg-primary/20' 
                            : 'bg-muted/50'
                        }`}>
                          {achievement.unlocked ? (
                            <Trophy className="w-4 h-4 text-primary" />
                          ) : (
                            <div className="w-4 h-4 text-muted-foreground">🔒</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          achievement.unlocked 
                            ? 'bg-primary/20' 
                            : 'bg-muted/50'
                        }`}>
                          <span className={`text-2xl ${achievement.unlocked ? '' : 'opacity-50'}`}>
                            {achievement.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className={`font-bold ${achievement.unlocked ? 'text-foreground' : 'text-foreground/70'}`}>
                            {achievement.name}
                          </h3>
                          <p className={`text-sm ${achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <span className={`font-medium ${
                            achievement.unlocked 
                              ? 'text-primary' 
                              : 'text-muted-foreground/70'
                          }`}>
                            {achievement.unlocked ? 'Upplåst!' : 'Låst'}
                          </span>
                        </div>
                        <div className={`w-full rounded-full h-3 overflow-hidden ${
                          achievement.unlocked 
                            ? 'bg-primary/20' 
                            : 'bg-muted/50'
                        }`}>
                          <div className={`h-3 rounded-full transition-all duration-500 ${
                            achievement.unlocked 
                              ? 'bg-gradient-to-r from-primary to-primary/80' 
                              : 'bg-gradient-to-r from-muted to-muted/60'
                          }`} style={{width: achievement.unlocked ? '100%' : '0%'}}></div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.unlocked 
                            ? `${achievement.points} poäng intjänad!`
                            : `Krav: ${achievement.points} poäng`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="bg-muted/50 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Tips!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fortsätt skapa annonser och interagera med communityt för att låsa upp fler achievements och samla poäng! Lås upp alla 9 achievements för att bli en HiFi Legend!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
