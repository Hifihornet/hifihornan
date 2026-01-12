import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnlineIndicator from "@/components/OnlineIndicator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineUsers } from "@/hooks/useOnlinePresence";
import { format, formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import ChatDialog from "@/components/ChatDialog";
import logoImage from "@/assets/logo.png";

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_image?: string;
  other_user_id?: string;
  other_user_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  is_system_conversation?: boolean;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Get list of other user IDs for online status
  const otherUserIds = useMemo(() => 
    conversations.map(c => c.other_user_id).filter(Boolean) as string[],
    [conversations]
  );
  const { isOnline } = useOnlineUsers(otherUserIds);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch conversations where user is buyer or seller
      const { data: convs, error: convsError } = await supabase
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (convsError) {
        console.error("Error fetching conversations:", convsError);
        return;
      }

      // Enrich with listing info and other user name
      const enrichedConversations = await Promise.all(
        (convs || []).map(async (conv) => {
          // Get listing info
          const { data: listing } = await supabase
            .from("listings")
            .select("title, images, status")
            .eq("id", conv.listing_id)
            .single();

          // Check if this is a system/admin conversation
          const isSystemConversation = listing?.status === "system";

          // Get other user's name - for system conversations, show "HiFihörnet"
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          let otherUserName = "Användare";
          
          if (isSystemConversation) {
            otherUserName = "HiFihörnet";
          } else {
            const { data: fetchedName } = await supabase.rpc("get_seller_display_name", {
              _user_id: otherUserId,
            });
            otherUserName = fetchedName || "Användare";
          }

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, is_system_message")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages not from current user without read_at)
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", user.id)
            .is("read_at", null);

          return {
            ...conv,
            listing_title: isSystemConversation ? "Meddelande från HiFihörnet" : (listing?.title || "Annons borttagen"),
            listing_image: listing?.images?.[0] || null,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: lastMsg?.content,
            last_message_at: lastMsg?.created_at,
            unread_count: unreadCount || 0,
            is_system_conversation: isSystemConversation,
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (conv: Conversation) => {
    setSelectedConversation(conv);
    setChatOpen(true);
  };

  if (authLoading) {
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

  if (!user) {
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
            <h1 className="font-display text-3xl font-bold text-foreground">
              Mina meddelanden
            </h1>
            <p className="text-muted-foreground mt-2">
              Dina konversationer med säljare och köpare
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                Inga meddelanden ännu
              </h2>
              <p className="text-muted-foreground mb-6">
                När du kontaktar en säljare eller får meddelanden om dina annonser ser du dem här.
              </p>
              <Button asChild>
                <Link to="/browse">Bläddra bland annonser</Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openChat(conv)}
                      className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex gap-4 items-start text-left"
                    >
                      {/* Listing Image or Logo for system conversations */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                        {conv.is_system_conversation ? (
                          <img
                            src={logoImage}
                            alt="HiFihörnet"
                            className="w-12 h-12 object-contain"
                          />
                        ) : conv.listing_image ? (
                          <img
                            src={conv.listing_image}
                            alt={conv.listing_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MessageCircle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground truncate">
                                {conv.other_user_name}
                              </h3>
                              {!conv.is_system_conversation && conv.other_user_id && (
                                <OnlineIndicator isOnline={isOnline(conv.other_user_id)} size="sm" />
                              )}
                            </div>
                            {!conv.is_system_conversation && (
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.listing_title}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            {conv.last_message_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.last_message_at), {
                                  addSuffix: true,
                                  locale: sv,
                                })}
                              </span>
                            )}
                            {conv.unread_count && conv.unread_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                        {conv.last_message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {conv.last_message}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Chat Dialog */}
      {selectedConversation && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          listingId={selectedConversation.listing_id}
          listingTitle={selectedConversation.listing_title || ""}
          sellerId={
            selectedConversation.buyer_id === user.id
              ? selectedConversation.seller_id
              : selectedConversation.buyer_id
          }
          sellerName={selectedConversation.other_user_name || ""}
          existingConversationId={selectedConversation.id}
          isSystemConversation={selectedConversation.is_system_conversation}
        />
      )}
    </div>
  );
};

export default Messages;
