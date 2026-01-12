import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, MapPin, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import OnlineIndicator from "@/components/OnlineIndicator";
import { toast } from "sonner";

interface SearchProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  last_seen: string | null;
}

interface ProfileSearchDialogProps {
  trigger?: React.ReactNode;
}

const ProfileSearchDialog = ({ trigger }: ProfileSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState<{ [key: string]: string }>({});
  const [showMessageInput, setShowMessageInput] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setResults([]);
      setShowMessageInput(null);
      setMessageContent({});
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("search_profiles", {
        _search_term: searchTerm.trim(),
      });

      if (error) throw error;
      
      // Filter out own profile from results
      const filteredData = (data || []).filter(
        (profile: SearchProfile) => profile.user_id !== user?.id
      );
      
      setResults(filteredData);
    } catch (err) {
      console.error("Error searching profiles:", err);
      toast.error("Kunde inte söka efter profiler");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDirectMessage = async (recipientUserId: string) => {
    const content = messageContent[recipientUserId]?.trim();
    if (!content) {
      toast.error("Skriv ett meddelande först");
      return;
    }

    if (!user) {
      toast.error("Du måste vara inloggad för att skicka meddelanden");
      return;
    }

    setSendingMessage(recipientUserId);
    try {
      const { error } = await supabase.rpc("send_direct_message_to_user", {
        _recipient_user_id: recipientUserId,
        _content: content,
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
      setMessageContent((prev) => ({ ...prev, [recipientUserId]: "" }));
      setShowMessageInput(null);
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Kunde inte skicka meddelandet");
    } finally {
      setSendingMessage(null);
    }
  };

  const handleProfileClick = (userId: string) => {
    setOpen(false);
    navigate(`/profil/${userId}`);
  };

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    const lastSeenDate = new Date(lastSeen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeenDate > fiveMinutesAgo;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <Search className="w-4 h-4 mr-2" />
            Sök profiler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sök profiler</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sök på namn eller ort..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="max-h-[400px]">
          {results.length === 0 && searchTerm && !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Inga profiler hittades</p>
              <p className="text-sm mt-1">Endast användare som valt att vara sökbara visas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((profile) => (
                <div
                  key={profile.id}
                  className="p-4 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleProfileClick(profile.user_id)}
                      className="shrink-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.display_name || "Profil"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary-foreground" />
                        )}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleProfileClick(profile.user_id)}
                        className="text-left"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground hover:text-primary transition-colors">
                            {profile.display_name || "Användare"}
                          </span>
                          <OnlineIndicator
                            isOnline={isOnline(profile.last_seen)}
                            lastSeen={profile.last_seen}
                            size="sm"
                          />
                        </div>
                      </button>

                      {profile.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </div>
                      )}

                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}

                      {user && showMessageInput === profile.user_id ? (
                        <div className="mt-3 space-y-2">
                          <Input
                            value={messageContent[profile.user_id] || ""}
                            onChange={(e) =>
                              setMessageContent((prev) => ({
                                ...prev,
                                [profile.user_id]: e.target.value,
                              }))
                            }
                            placeholder="Skriv ett meddelande..."
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleSendDirectMessage(profile.user_id)
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSendDirectMessage(profile.user_id)}
                              disabled={sendingMessage === profile.user_id}
                            >
                              {sendingMessage === profile.user_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Skicka"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowMessageInput(null)}
                            >
                              Avbryt
                            </Button>
                          </div>
                        </div>
                      ) : (
                        user && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() => setShowMessageInput(profile.user_id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Skicka meddelande
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSearchDialog;
