import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { User, MapPin, Calendar, Loader2, Trash2, Upload, X, Save, Edit2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import CreatorBadge from "@/components/CreatorBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import useUserRoles from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { isCreator } = useUserRoles(userId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwnProfile = user?.id === userId;

  const fetchProfileAndListings = useCallback(async () => {
    if (!userId) return;

    try {
      let profileData;
      
      // If viewing own profile, fetch full profile data
      // Otherwise, use public_profiles view to hide sensitive fields (phone, location for non-owners)
      if (user?.id === userId) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, user_id, display_name, location, bio, setup_images, avatar_url, created_at")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        profileData = data;
      } else {
        // Use secure function for other users (excludes phone, location)
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
      setEditBio(profileData.bio || "");
      setEditDisplayName(profileData.display_name || "");
      setEditLocation(profileData.location || "");

      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (listingsError) throw listingsError;

      const formattedListings: Listing[] = (listingsData || []).map((item) => ({
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
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Ett fel uppstod vid hämtning av profilen");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: editDisplayName || null,
          location: editLocation || null,
          bio: editBio || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        display_name: editDisplayName || null,
        location: editLocation || null,
        bio: editBio || null,
      } : null);
      
      setIsEditing(false);
      toast.success("Profilen har uppdaterats");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Kunde inte spara profilen");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Endast bilder är tillåtna");
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast.success("Profilbilden har uppdaterats");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Kunde inte ladda upp profilbilden");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    try {
      const oldPath = profile.avatar_url.split("/avatars/")[1]?.split("?")[0];
      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      toast.success("Profilbilden har tagits bort");
    } catch (err) {
      console.error("Error deleting avatar:", err);
      toast.error("Kunde inte ta bort profilbilden");
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
                    <User className="w-10 h-10 text-primary-foreground" />
                  )}
                </div>
                {isCreator && <CreatorBadge size="md" className="-top-1 -right-1" />}
                {isOwnProfile && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                      {uploadingAvatar ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-white" />
                      )}
                    </label>
                    {profile.avatar_url && (
                      <button
                        onClick={handleDeleteAvatar}
                        className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                        title="Ta bort profilbild"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Ditt namn"
                      className="max-w-xs"
                    />
                    <Input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Ort"
                      className="max-w-xs"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                      {profile.display_name || "Användare"}
                    </h1>
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
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile && (
                  <>
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={savingProfile}
                        >
                          Avbryt
                        </Button>
                        <Button 
                          variant="glow" 
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                        >
                          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Spara
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4" />
                        Redigera profil
                      </Button>
                    )}
                  </>
                )}
                {isOwnProfile && !isEditing && (
                  <Link to="/create">
                    <Button variant="glow">Lägg upp ny annons</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="listings">Annonser ({listings.length})</TabsTrigger>
              <TabsTrigger value="about">Om mig</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <div key={listing.id} className="relative group">
                      <ListingCard listing={listing} />
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

            <TabsContent value="about">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bio Section */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">
                    Om {isOwnProfile ? "mig" : profile.display_name || "användaren"}
                  </h2>
                  
                  {isEditing ? (
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Berätta lite om dig själv och ditt intresse för HiFi..."
                      rows={6}
                    />
                  ) : profile.bio ? (
                    <p className="text-foreground/80 whitespace-pre-line">{profile.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {isOwnProfile 
                        ? "Du har inte skrivit något om dig själv än. Klicka på 'Redigera profil' för att lägga till."
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
