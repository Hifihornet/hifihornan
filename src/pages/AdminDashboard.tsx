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
  Eye,
  Send,
  Megaphone,
  Mail
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

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
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Broadcast form state
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Direct message form state
  const [directMessageDialogOpen, setDirectMessageDialogOpen] = useState(false);
  const [directMessageRecipient, setDirectMessageRecipient] = useState<AdminProfile | null>(null);
  const [directMessageContent, setDirectMessageContent] = useState("");
  const [sendingDirectMessage, setSendingDirectMessage] = useState(false);

  const hasAccess = isCreator || isAdmin || isModerator;
  const canDeleteUsers = isAdmin;
  const canSendBroadcasts = isAdmin;
  const canSendDirectMessages = isAdmin;

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
      fetchBroadcasts();
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

  const fetchBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from("broadcast_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setBroadcasts(data || []);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      toast.error("Fyll i både titel och meddelande");
      return;
    }

    setSendingBroadcast(true);
    try {
      const { error } = await supabase.rpc("admin_send_broadcast", {
        _title: broadcastTitle.trim(),
        _content: broadcastContent.trim(),
      });
      if (error) throw error;
      
      toast.success(`Meddelande skickat till alla ${profiles.length} användare`);
      setBroadcastDialogOpen(false);
      setBroadcastTitle("");
      setBroadcastContent("");
      fetchBroadcasts();
    } catch (err) {
      console.error("Error sending broadcast:", err);
      toast.error("Kunde inte skicka meddelande");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const openDirectMessageDialog = (profile: AdminProfile) => {
    setDirectMessageRecipient(profile);
    setDirectMessageContent("");
    setDirectMessageDialogOpen(true);
  };

  const handleSendDirectMessage = async () => {
    if (!directMessageContent.trim() || !directMessageRecipient) {
      toast.error("Skriv ett meddelande");
      return;
    }

    setSendingDirectMessage(true);
    try {
      const { error } = await supabase.rpc("admin_send_message_to_user", {
        _recipient_user_id: directMessageRecipient.user_id,
        _content: directMessageContent.trim(),
      });
      if (error) throw error;
      
      toast.success(`Meddelande skickat till ${directMessageRecipient.display_name || "användaren"}`);
      setDirectMessageDialogOpen(false);
      setDirectMessageRecipient(null);
      setDirectMessageContent("");
    } catch (err) {
      console.error("Error sending direct message:", err);
      toast.error("Kunde inte skicka meddelande");
    } finally {
      setSendingDirectMessage(false);
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

          {/* Admin Actions */}
          {canSendBroadcasts && (
            <div className="mb-8">
              <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="glow" className="gap-2">
                    <Megaphone className="w-4 h-4" />
                    Skicka meddelande till alla
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Skicka meddelande till alla användare</DialogTitle>
                    <DialogDescription>
                      Detta meddelande kommer att visas för alla {profiles.length} registrerade användare.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Titel
                      </label>
                      <Input
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="T.ex. Viktigt meddelande"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">
                        Meddelande
                      </label>
                      <Textarea
                        value={broadcastContent}
                        onChange={(e) => setBroadcastContent(e.target.value)}
                        placeholder="Skriv ditt meddelande här..."
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBroadcastDialogOpen(false)}
                      disabled={sendingBroadcast}
                    >
                      Avbryt
                    </Button>
                    <Button
                      variant="glow"
                      onClick={handleSendBroadcast}
                      disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastContent.trim()}
                    >
                      {sendingBroadcast ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Skicka
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Recent Broadcasts */}
          {canSendBroadcasts && broadcasts.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-card border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Senaste utskick
              </h3>
              <div className="space-y-2">
                {broadcasts.slice(0, 3).map((broadcast) => (
                  <div key={broadcast.id} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{broadcast.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(broadcast.created_at), {
                          addSuffix: true,
                          locale: sv,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {broadcast.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                          <div className="flex items-center gap-2">
                            {canSendDirectMessages && profile.user_id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDirectMessageDialog(profile)}
                                title="Skicka meddelande"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
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

      {/* Direct Message Dialog */}
      <Dialog open={directMessageDialogOpen} onOpenChange={setDirectMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Skicka meddelande till {directMessageRecipient?.display_name || "användare"}</DialogTitle>
            <DialogDescription>
              Detta meddelande kommer att visas som från "HiFiHörnan" i användarens inkorg.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Meddelande
              </label>
              <Textarea
                value={directMessageContent}
                onChange={(e) => setDirectMessageContent(e.target.value)}
                placeholder="Skriv ditt meddelande här..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDirectMessageDialogOpen(false)}
              disabled={sendingDirectMessage}
            >
              Avbryt
            </Button>
            <Button
              variant="glow"
              onClick={handleSendDirectMessage}
              disabled={sendingDirectMessage || !directMessageContent.trim()}
            >
              {sendingDirectMessage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Skicka som HiFiHörnan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
