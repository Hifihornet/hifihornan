import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Users, 
  FileText, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  RefreshCw,
  User,
  Calendar,
  Eye
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import useUserRoles from "@/hooks/useUserRoles";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface AdminListing {
  id: string;
  title: string;
  user_id: string;
  status: string;
  created_at: string;
  seller_name: string;
}

interface AdminProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen: string | null;
  listing_count: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isCreator, isAdmin, isModerator, isLoading: rolesLoading } = useUserRoles(user?.id);
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const hasAccess = isCreator || isAdmin || isModerator;
  const canDeleteUsers = isAdmin;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!rolesLoading && user && !hasAccess) {
      toast.error("Du har inte behörighet att se denna sida");
      navigate("/");
    }
  }, [hasAccess, rolesLoading, user, navigate]);

  useEffect(() => {
    if (hasAccess) {
      fetchListings();
      fetchProfiles();
    }
  }, [hasAccess]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const { data, error } = await supabase.rpc("admin_get_all_listings");
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error("Error fetching listings:", err);
      toast.error("Kunde inte hämta annonser");
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase.rpc("admin_get_all_profiles");
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
      toast.error("Kunde inte hämta profiler");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    setDeletingId(listingId);
    try {
      const { error } = await supabase.rpc("admin_delete_listing", {
        _listing_id: listingId,
      });
      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      toast.success("Annonsen har raderats");
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error("Kunde inte radera annonsen");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      const { error } = await supabase.rpc("admin_delete_user", {
        _user_id: userId,
      });
      if (error) throw error;
      setProfiles((prev) => prev.filter((p) => p.user_id !== userId));
      setListings((prev) => prev.filter((l) => l.user_id !== userId));
      toast.success("Användaren har raderats");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Kunde inte radera användaren");
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Tillbaka
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Hantera annonser och användare
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{listings.length}</p>
                  <p className="text-sm text-muted-foreground">Totalt annonser</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
                  <p className="text-sm text-muted-foreground">Registrerade användare</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {listings.filter((l) => l.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Aktiva annonser</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="listings" className="gap-2">
                <FileText className="w-4 h-4" />
                Annonser
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Användare
              </TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Alla annonser</h2>
                  <Button variant="outline" size="sm" onClick={fetchListings} disabled={loadingListings}>
                    <RefreshCw className={`w-4 h-4 ${loadingListings ? "animate-spin" : ""}`} />
                    Uppdatera
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  {loadingListings ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      Inga annonser hittades
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                to={`/listing/${listing.id}`}
                                className="font-medium text-foreground hover:text-primary truncate"
                              >
                                {listing.title}
                              </Link>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  listing.status === "active"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {listing.status === "active" ? "Aktiv" : listing.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Link
                                to={`/profil/${listing.user_id}`}
                                className="hover:text-primary"
                              >
                                {listing.seller_name}
                              </Link>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(listing.created_at), {
                                  addSuffix: true,
                                  locale: sv,
                                })}
                              </span>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === listing.id}
                              >
                                {deletingId === listing.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Radera annons?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Är du säker på att du vill radera "{listing.title}"? Detta kan inte ångras.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Radera
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Alla användare</h2>
                  <Button variant="outline" size="sm" onClick={fetchProfiles} disabled={loadingProfiles}>
                    <RefreshCw className={`w-4 h-4 ${loadingProfiles ? "animate-spin" : ""}`} />
                    Uppdatera
                  </Button>
                </div>
                <ScrollArea className="h-[500px]">
                  {loadingProfiles ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      Inga användare hittades
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.display_name || "Avatar"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/profil/${profile.user_id}`}
                                className="font-medium text-foreground hover:text-primary truncate block"
                              >
                                {profile.display_name || "Okänd användare"}
                              </Link>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{profile.listing_count} annonser</span>
                                <span>•</span>
                                <span>
                                  {profile.last_seen
                                    ? `Online ${formatDistanceToNow(new Date(profile.last_seen), {
                                        addSuffix: true,
                                        locale: sv,
                                      })}`
                                    : "Aldrig online"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {canDeleteUsers && profile.user_id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === profile.user_id}
                                >
                                  {deletingId === profile.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Radera användare?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Är du säker på att du vill radera "{profile.display_name || "denna användare"}"? 
                                    Detta raderar alla deras annonser, meddelanden och all annan data. 
                                    Detta kan inte ångras.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(profile.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Radera användare
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
