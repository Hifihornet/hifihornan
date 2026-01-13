import { useState } from "react";
import { 
  Shield, 
  Trash2, 
  Download, 
  Search, 
  Loader2, 
  AlertTriangle,
  User,
  FileText,
  MessageSquare,
  Star,
  Heart,
  Eye,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface UserData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  listing_count: number;
  message_count?: number;
  review_count?: number;
  favorite_count?: number;
}

interface DeleteOptions {
  profile: boolean;
  listings: boolean;
  messages: boolean;
  reviews: boolean;
  favorites: boolean;
  recentlyViewed: boolean;
  savedSearches: boolean;
}

const AdminGdprTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({
    profile: true,
    listings: true,
    messages: true,
    reviews: true,
    favorites: true,
    recentlyViewed: true,
    savedSearches: true,
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Ange ett sökord");
      return;
    }

    setSearching(true);
    try {
      // Search for users by display name or email
      const { data: profiles, error } = await supabase.rpc("search_profiles", {
        _search_term: searchTerm.trim(),
      });

      if (error) throw error;

      // Enrich with counts
      const enrichedProfiles = await Promise.all(
        (profiles || []).map(async (profile: any) => {
          const { count: listingCount } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id);

          const { count: messageCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", profile.user_id);

          const { count: reviewCount } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("reviewer_id", profile.user_id);

          const { count: favoriteCount } = await supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.user_id);

          return {
            user_id: profile.user_id,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            created_at: profile.last_seen || new Date().toISOString(),
            listing_count: listingCount || 0,
            message_count: messageCount || 0,
            review_count: reviewCount || 0,
            favorite_count: favoriteCount || 0,
          } as UserData;
        })
      );

      setSearchResults(enrichedProfiles);
      
      if (enrichedProfiles.length === 0) {
        toast.info("Inga användare hittades");
      }
    } catch (err) {
      console.error("Error searching users:", err);
      toast.error("Kunde inte söka efter användare");
    } finally {
      setSearching(false);
    }
  };

  const handleExportUserData = async (userData: UserData) => {
    setExportingData(true);
    try {
      // Fetch all user data
      const [
        { data: profile },
        { data: listings },
        { data: messages },
        { data: reviews },
        { data: favorites },
        { data: savedSearches },
      ] = await Promise.all([
        supabase.rpc("get_public_profile_by_user_id", { _user_id: userData.user_id }),
        supabase.from("listings").select("*").eq("user_id", userData.user_id),
        supabase.from("messages").select("*").eq("sender_id", userData.user_id),
        supabase.from("reviews").select("*").eq("reviewer_id", userData.user_id),
        supabase.from("favorites").select("*").eq("user_id", userData.user_id),
        supabase.from("saved_searches").select("*").eq("user_id", userData.user_id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: userData.user_id,
        profile: profile?.[0] || null,
        listings: listings || [],
        messages: messages || [],
        reviews: reviews || [],
        favorites: favorites || [],
        saved_searches: savedSearches || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gdpr-export-${userData.user_id}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exporterad");
    } catch (err) {
      console.error("Error exporting user data:", err);
      toast.error("Kunde inte exportera data");
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteUserData = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    try {
      // Delete data based on selected options
      if (deleteOptions.favorites) {
        await supabase.from("favorites").delete().eq("user_id", selectedUser.user_id);
      }

      if (deleteOptions.recentlyViewed) {
        await supabase.from("recently_viewed").delete().eq("user_id", selectedUser.user_id);
      }

      if (deleteOptions.savedSearches) {
        await supabase.from("saved_searches").delete().eq("user_id", selectedUser.user_id);
      }

      if (deleteOptions.reviews) {
        await supabase.from("reviews").delete().eq("reviewer_id", selectedUser.user_id);
      }

      // If deleting everything including profile, use the admin delete function
      if (deleteOptions.profile && deleteOptions.listings && deleteOptions.messages) {
        const { error } = await supabase.rpc("admin_delete_user", {
          _user_id: selectedUser.user_id,
        });
        if (error) throw error;
        
        // Remove from search results
        setSearchResults((prev) => prev.filter((u) => u.user_id !== selectedUser.user_id));
      } else {
        // Delete specific items
        if (deleteOptions.messages) {
          // Delete user's messages from conversations
          await supabase.from("messages").delete().eq("sender_id", selectedUser.user_id);
        }

        if (deleteOptions.listings) {
          // Delete all user listings
          const { data: userListings } = await supabase
            .from("listings")
            .select("id")
            .eq("user_id", selectedUser.user_id);
          
          for (const listing of userListings || []) {
            await supabase.rpc("admin_delete_listing", { _listing_id: listing.id });
          }
        }
      }

      // Log the GDPR action
      await supabase.from("admin_activity_log").insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: "gdpr_delete",
        target_type: "user",
        target_id: selectedUser.user_id,
        details: {
          user_name: selectedUser.display_name,
          deleted_items: Object.entries(deleteOptions)
            .filter(([_, v]) => v)
            .map(([k]) => k),
        },
      });

      toast.success("Användardata raderad enligt GDPR");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh search results
      if (searchTerm) {
        handleSearch();
      }
    } catch (err) {
      console.error("Error deleting user data:", err);
      toast.error("Kunde inte radera användardata");
    } finally {
      setDeleting(false);
    }
  };

  const toggleDeleteOption = (key: keyof DeleteOptions) => {
    setDeleteOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllOptions = () => {
    setDeleteOptions({
      profile: true,
      listings: true,
      messages: true,
      reviews: true,
      favorites: true,
      recentlyViewed: true,
      savedSearches: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            GDPR-hantering
          </CardTitle>
          <CardDescription>
            Hantera användardata enligt GDPR. Exportera eller radera användarinformation på begäran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Sök användare (namn eller e-post)..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sök"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sökresultat ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {searchResults.map((userData) => (
                  <div
                    key={userData.user_id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                          {userData.avatar_url ? (
                            <img
                              src={userData.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {userData.display_name || "Okänd användare"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {userData.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Data counts */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1" title="Annonser">
                            <FileText className="w-4 h-4" />
                            {userData.listing_count}
                          </span>
                          <span className="flex items-center gap-1" title="Meddelanden">
                            <MessageSquare className="w-4 h-4" />
                            {userData.message_count}
                          </span>
                          <span className="flex items-center gap-1" title="Omdömen">
                            <Star className="w-4 h-4" />
                            {userData.review_count}
                          </span>
                          <span className="flex items-center gap-1" title="Favoriter">
                            <Heart className="w-4 h-4" />
                            {userData.favorite_count}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportUserData(userData)}
                            disabled={exportingData}
                            className="gap-1"
                          >
                            {exportingData ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Exportera
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(userData);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Radera
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* GDPR Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            GDPR-information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Rätt till tillgång (Art. 15):</strong> Användare har rätt att få en kopia av all 
            personlig data som lagras om dem. Använd "Exportera"-funktionen.
          </p>
          <p>
            <strong>Rätt till radering (Art. 17):</strong> Användare har rätt att begära radering 
            av sin personliga data ("rätten att bli glömd"). Använd "Radera"-funktionen.
          </p>
          <p>
            <strong>Viktigt:</strong> Dokumentera alltid GDPR-förfrågningar och svarsåtgärder. 
            Radering loggas automatiskt i aktivitetsloggen.
          </p>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Radera användardata
            </AlertDialogTitle>
            <AlertDialogDescription>
              Välj vilken data som ska raderas för{" "}
              <strong>{selectedUser?.display_name || "användaren"}</strong>.
              Detta kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Välj data att radera:</span>
              <Button variant="ghost" size="sm" onClick={selectAllOptions}>
                Markera alla
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.profile}
                  onCheckedChange={() => toggleDeleteOption("profile")}
                />
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Profil och kontoinformation</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.listings}
                  onCheckedChange={() => toggleDeleteOption("listings")}
                />
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Annonser ({selectedUser?.listing_count || 0})</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.messages}
                  onCheckedChange={() => toggleDeleteOption("messages")}
                />
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Meddelanden ({selectedUser?.message_count || 0})</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.reviews}
                  onCheckedChange={() => toggleDeleteOption("reviews")}
                />
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Omdömen ({selectedUser?.review_count || 0})</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.favorites}
                  onCheckedChange={() => toggleDeleteOption("favorites")}
                />
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Favoriter ({selectedUser?.favorite_count || 0})</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.recentlyViewed}
                  onCheckedChange={() => toggleDeleteOption("recentlyViewed")}
                />
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Senast visade</span>
              </label>
              
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={deleteOptions.savedSearches}
                  onCheckedChange={() => toggleDeleteOption("savedSearches")}
                />
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Sparade sökningar</span>
              </label>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUserData}
              disabled={deleting || !Object.values(deleteOptions).some(Boolean)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Radera vald data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGdprTab;