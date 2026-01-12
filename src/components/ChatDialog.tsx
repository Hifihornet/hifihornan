import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsUserOnline } from "@/hooks/useOnlinePresence";
import OnlineIndicator from "@/components/OnlineIndicator";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import logoImage from "@/assets/logo.png";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_system_message?: boolean;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  sellerName: string;
  existingConversationId?: string;
  isSystemConversation?: boolean;
}

const ChatDialog = ({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  sellerId,
  sellerName,
  existingConversationId,
  isSystemConversation = false,
}: ChatDialogProps) => {
  const { user } = useAuth();
  const isSellerOnline = useIsUserOnline(sellerId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSystemChat, setIsSystemChat] = useState(isSystemConversation);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open && user) {
      fetchOrCreateConversation();
    }
  }, [open, user, listingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Check if this is a system message
          if (newMsg.is_system_message) {
            setIsSystemChat(true);
          }
          
          // Mark message as read if it's from the other user and chat is open
          if (newMsg.sender_id !== user.id && !newMsg.read_at) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const fetchOrCreateConversation = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let convId = existingConversationId;

      if (!convId) {
        // Check if conversation exists - user could be buyer OR seller
        const { data: existing, error: fetchError } = await supabase
          .from("conversations")
          .select("id")
          .eq("listing_id", listingId)
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching conversation:", fetchError);
          toast.error("Kunde inte ladda konversation");
          setLoading(false);
          return;
        }

        convId = existing?.id;

        if (!convId) {
          // Create new conversation - current user is the buyer (initiating contact)
          const { data: newConv, error: createError } = await supabase
            .from("conversations")
            .insert({
              listing_id: listingId,
              buyer_id: user.id,
              seller_id: sellerId,
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Error creating conversation:", createError);
            toast.error("Kunde inte skapa konversation");
            setLoading(false);
            return;
          }

          convId = newConv.id;
        }
      }

      setConversationId(convId);

      // Fetch messages
      const { data: msgs, error: msgsError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgsError) {
        console.error("Error fetching messages:", msgsError);
      } else {
        setMessages(msgs || []);
        
        // Check if any message is a system message
        const hasSystemMessage = (msgs || []).some(m => m.is_system_message);
        if (hasSystemMessage) {
          setIsSystemChat(true);
        }
        
        // Mark unread messages from other user as read
        const unreadMessages = (msgs || []).filter(
          (m) => m.sender_id !== user.id && !m.read_at
        );
        
        if (unreadMessages.length > 0) {
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", unreadMessages.map((m) => m.id));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Kunde inte skicka meddelande");
        setNewMessage(content);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod");
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Determine display name and whether to show online status
  const displayName = isSystemChat ? "HiFiHörnan" : sellerName;
  const showOnlineStatus = !isSystemChat;
  const showListingInfo = !isSystemChat;
  const canReply = !isSystemChat;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            {isSystemChat && (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
                <img 
                  src={logoImage} 
                  alt="HiFiHörnan" 
                  className="w-8 h-8 object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-display">
                  {displayName}
                </DialogTitle>
                {showOnlineStatus && (
                  <OnlineIndicator isOnline={isSellerOnline} size="sm" showLabel />
                )}
              </div>
              {showListingInfo && (
                <p className="text-sm text-muted-foreground truncate">
                  Angående: {listingTitle}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">
                Inga meddelanden ännu
              </p>
              {canReply && (
                <p className="text-sm text-muted-foreground">
                  Skriv ett meddelande för att starta konversationen
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id && !msg.is_system_message;
                const isSystemMessage = msg.is_system_message;
                const senderLabel = isSystemMessage ? "HiFiHörnan" : null;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : isSystemMessage
                          ? "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground rounded-bl-sm border border-primary/30"
                          : "bg-secondary text-foreground rounded-bl-sm"
                      }`}
                    >
                      {senderLabel && (
                        <p className="text-xs font-semibold text-primary mb-1">
                          {senderLabel}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(msg.created_at), "HH:mm", {
                          locale: sv,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {canReply ? (
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv ett meddelande..."
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="icon"
                className="shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              Detta är ett meddelande från HiFiHörnan och kan inte besvaras.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;