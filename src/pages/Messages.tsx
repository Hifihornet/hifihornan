import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OnlineIndicator from "@/components/OnlineIndicator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineUsers } from "@/hooks/useOnlinePresence";
import { format, formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import ChatDialog from "@/components/ChatDialog";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";

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
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isSupportConversation, setIsSupportConversation] = useState(false);

  // Get list of other user IDs for online status
  const otherUserIds = useMemo(() => 
    conversations.map(c => c.other_user_id).filter(Boolean) as string[],
    [conversations]
  );
  const { isOnline } = useOnlineUsers(otherUserIds);

  const handleDeleteConversation = async (conversationId: string) => {
    // Find the conversation to check if it's a support conversation
    const conversation = conversations.find(conv => conv.id === conversationId);
    const isSupportConv = conversation?.listing_id === null;
    
    setIsSupportConversation(isSupportConv);
    
    // Always use the ConfirmDialog for both types
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete || !user) return;

    setDeletingConversationId(conversationToDelete);
    setDeleteDialogOpen(false);
    
    // Check if this is a support conversation
    const conversation = conversations.find(conv => conv.id === conversationToDelete);
    const isSupportConv = conversation?.listing_id === null;
    
    if (isSupportConv) {
      // Support conversation - remove from UI state only
      console.log("Hiding support conversation from UI:", conversationToDelete);
      
      // Remove from local state only
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
      
      // Close chat if it was the selected one
      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null);
        setChatOpen(false);
      }
      
      // Clear cache
      Object.keys(localStorage).forEach(key => {
        if (key.includes('messages') || key.includes('conversations') || key.includes('chat')) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success("Support-konversationen är nu dold från din inkorg");
      setDeletingConversationId(null);
      setConversationToDelete(null);
      return;
    }
    
    // Regular conversation - proceed with full deletion
    try {
      console.log("Deleting regular conversation:", conversationToDelete);
      
      // Delete all messages in the conversation first
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationToDelete);

      if (messagesError) {
        console.error("Error deleting messages:", messagesError);
        throw messagesError;
      }

      // Delete the conversation
      const { error: convError } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationToDelete);

      if (convError) {
        console.error("Error deleting conversation:", convError);
        console.error("Error details:", JSON.stringify(convError, null, 2));
        
        // If foreign key constraint error, try deleting messages first
        if (convError.code === '23503' || convError.message?.includes('foreign key')) {
          console.log("Foreign key constraint detected, deleting messages first...");
          
          // Delete all messages first
          const { error: retryMessagesError } = await supabase
            .from("messages")
            .delete()
            .eq("conversation_id", conversationToDelete);

          if (retryMessagesError) {
            console.error("Error deleting messages on retry:", retryMessagesError);
            throw retryMessagesError;
          }

          // Then delete the conversation
          const { error: retryConvError } = await supabase
            .from("conversations")
            .delete()
            .eq("id", conversationToDelete);

          if (retryConvError) {
            console.error("Error deleting conversation on retry:", retryConvError);
            throw retryConvError;
          }
        } else {
          throw convError;
        }
      }

      console.log("Successfully deleted regular conversation from DB");

      // VERIFY deletion was successful before proceeding
      console.log("Verifying deletion...");
      const { data: verifyConv, error: verifyError } = await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id, listing_id, created_at")
        .eq("id", conversationToDelete)
        .maybeSingle();

      console.log("Verification result:", { verifyConv, verifyError });

      if (verifyError) {
        console.error("Verification error:", verifyError);
        console.error("Verification error details:", JSON.stringify(verifyError, null, 2));
        throw new Error("Kunde inte verifiera radering: " + verifyError.message);
      }

      if (verifyConv) {
        console.error("Verification failed - conversation still exists:", verifyConv);
        console.error("Full conversation data:", JSON.stringify(verifyConv, null, 2));
        
        // Try to check if there are any messages left
        const { data: remainingMessages, error: msgCheckError } = await supabase
          .from("messages")
          .select("id, content, created_at")
          .eq("conversation_id", conversationToDelete)
          .limit(5);

        console.log("Remaining messages check:", { remainingMessages, msgCheckError });
        
        throw new Error("Konversationen kunde inte raderas från databasen - finns fortfarande kvar");
      }

      console.log("Verification successful - conversation is really deleted");

      // Remove from local state
      setConversations(prev => {
        const filtered = prev.filter(conv => conv.id !== conversationToDelete);
        console.log("Filtered conversations:", filtered.map(c => ({ id: c.id, other_user: c.other_user_name })));
        return filtered;
      });
      
      // Close chat if it was the selected one
      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null);
        setChatOpen(false);
      }
      
      // Clear ALL localStorage cache to prevent re-appearance
      console.log("Clearing all localStorage cache...");
      Object.keys(localStorage).forEach(key => {
        if (key.includes('messages') || key.includes('conversations') || key.includes('chat')) {
          console.log("Removing cache key:", key);
          localStorage.removeItem(key);
        }
      });
      
      // Force a complete page reload to clear all React state and cache
      console.log("Forcing complete page reload after successful verification...");
      toast.success("Konversationen har raderats permanent");
      
      // Small delay to show success message before reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Kunde inte radera konversationen");
    } finally {
      setDeletingConversationId(null);
      setConversationToDelete(null);
    }
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      console.log("Fetching conversations for user:", user.id);
      
      // Clear any potential cache before fetching
      console.log("Clearing cache keys...");
      Object.keys(localStorage).forEach(key => {
        if (key.includes('messages_cache_') || key.includes('conversations_cache_')) {
          console.log("Removing cache key:", key);
          localStorage.removeItem(key);
        }
      });

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

      console.log("Fetched conversations from DB:", convs?.length);

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

          // Get other user's name - for system conversations, show "HiFiHörnet"
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          let otherUserName = "Användare";

          if (isSystemConversation) {
            otherUserName = "HiFiHörnet";
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
            listing_title: isSystemConversation ? "Meddelande från HiFiHörnet" : (listing?.title || "Annons borttagen"),
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

      console.log("Setting conversations in state:", enrichedConversations.map(c => ({ id: c.id, other_user: c.other_user_name })));
      setConversations(enrichedConversations);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

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
  }, [user, fetchConversations]);

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
                            alt="HiFiHörnet"
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
                          <div className="shrink-0 flex items-center gap-2">
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
                            {/* Delete button for non-system conversations */}
                            {!conv.is_system_conversation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteConversation(conv.id)}
                                disabled={deletingConversationId === conv.id}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={isSupportConversation ? "Dölj support-konversation" : "Radera konversation"}
        description={isSupportConversation 
          ? "Vill du dölja denna support-konversation från din inkorg? Den kommer att finnas kvar i systemet men du ser den inte längre. Du kan alltid återställa den genom att skicka ett nytt meddelande via supportbotten."
          : "Är du säker på att du vill radera denna konversation? Allt innehåll kommer att tas bort permanent och detta går inte att ångra."}
        confirmText={isSupportConversation ? "Dölj från inkorg" : "Radera permanent"}
        cancelText="Avbryt"
        onConfirm={confirmDeleteConversation}
        loading={deletingConversationId !== null}
        destructive={!isSupportConversation}
      />
    </div>
  );
};

export default Messages;
