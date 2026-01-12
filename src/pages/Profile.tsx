import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User, MapPin, Calendar, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Listing } from "@/data/listings";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  location: string | null;
  created_at: string;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfileAndListings = async () => {
      if (!userId) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (!profileData) {
          setError("Profilen kunde inte hittas");
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch user's listings
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
    };

    fetchProfileAndListings();
  }, [userId]);

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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <div className="flex-1">
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
              </div>

              {isOwnProfile && (
                <Link to="/create">
                  <Button variant="glow">Lägg upp ny annons</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Listings Section */}
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-6">
              {isOwnProfile ? "Mina annonser" : `${profile.display_name || "Användarens"} annonser`}
              <span className="text-muted-foreground font-normal ml-2">({listings.length})</span>
            </h2>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
