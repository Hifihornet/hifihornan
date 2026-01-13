import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { User, MapPin, Calendar, Loader2, Trash2, Upload, X, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CreatorBadge from "@/components/CreatorBadge";
import StoreBadge from "@/components/StoreBadge";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
}

interface ListingWithStatus extends Listing {
  status?: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { isCreator, isStore } = useUserRoles(userId);
  const isUserOnline = useIsUserOnline(userId);
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

  const isOwnProfile = user?.id === userId;

  const fetchProfileAndListings = useCallback(async () => {
    if (!userId) return;

    try {
      let profileData;
      
      if (user?.id === userId) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, user_id, display_name, location, bio, setup_images, avatar_url, created_at, last_seen, is_searchable, allow_direct_messages")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        profileData = data;
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
        .eq("user_id", userId)
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
  }, [userId, user?.id]);

  useEffect(() => {
    fetchProfileAndListings();
  }, [fetchProfileAndListings]);

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", listingId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setListings(prev => prev.filter(l => l.id !== listingId));
      toast.success("Annonsen har tagits bort");
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error("Kunde inte ta bort annonsen");
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
              <div className="relative">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name || "Profilbild"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-primary-foreground" />
                  )}
                </div>
                {isCreator && <CreatorBadge size="md" className="-top-1 -right-1" />}
                {isStore && !isCreator && <StoreBadge size="md" className="-bottom-0.5 -right-0.5" />}
              </div>
              
                <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {profile.display_name || "Användare"}
                  </h1>
                  {isStore && <StoreBadge showLabel size="md" />}
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
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="listings">Annonser ({listings.length})</TabsTrigger>
              <TabsTrigger value="reviews">Omdömen</TabsTrigger>
              <TabsTrigger value="about">Om mig</TabsTrigger>
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
                            >
                              <Trash2 className="w-4 h-4" />
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
                    Min setup 🎧
                  </h2>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(profile.setup_images || []).map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`Setup ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {isOwnProfile && (
                          <button
                            onClick={() => handleDeleteSetupImage(image)}
                            className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isOwnProfile && (
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Ladda upp bild</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadSetupImage}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  )}

                  {!isOwnProfile && (profile.setup_images || []).length === 0 && (
                    <p className="text-muted-foreground italic text-center py-8">
                      Inga setup-bilder uppladdade.
                    </p>
                  )}
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
