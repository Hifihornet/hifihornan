import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import logoImage from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_system_message?: boolean;
}

const SUPPORT_LISTING_ID = "00000000-0000-0000-0000-000000000000";

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or create support conversation when chat opens
  useEffect(() => {
    if (isOpen && user) {
      fetchOrCreateConversation();
    }
  }, [isOpen, user]);

  // Check for unread messages periodically
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", SUPPORT_LISTING_ID)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (conversations?.id) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conversations.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        setUnreadCount(count || 0);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`support-messages-${conversationId}`)
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

          // Mark message as read if chat is open
          if (newMsg.sender_id !== user.id && !newMsg.read_at && isOpen) {
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
  }, [conversationId, user, isOpen]);

  const fetchOrCreateConversation = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Check if support conversation exists for this user
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", SUPPORT_LISTING_ID)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching support conversation:", fetchError);
        toast.error("Kunde inte ladda supportchatt");
        setLoading(false);
        return;
      }

      let convId = existing?.id;

      if (!convId) {
        // Create new support conversation - seller_id is a placeholder (admin will see all)
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            listing_id: SUPPORT_LISTING_ID,
            buyer_id: user.id,
            seller_id: user.id, // Self-reference for support chats
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating support conversation:", createError);
          toast.error("Kunde inte skapa supportchatt");
          setLoading(false);
          return;
        }

        convId = newConv.id;
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

        // Mark unread messages as read
        const unreadMessages = (msgs || []).filter(
          (m) => m.sender_id !== user.id && !m.read_at
        );

        if (unreadMessages.length > 0) {
          await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .in(
              "id",
              unreadMessages.map((m) => m.id)
            );
          setUnreadCount(0);
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

  const handleOpen = () => {
    if (!user) {
      toast.info("Logga in för att chatta med support");
      navigate("/auth");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-150px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
              <img
                src={logoImage}
                alt="HiFihörnet"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">
                HiFihörnet Support
              </h3>
              <p className="text-xs text-muted-foreground">
                Vi svarar så snart vi kan
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-1">
                  Hej! 👋
                </p>
                <p className="text-sm text-muted-foreground">
                  Har du frågor? Skriv till oss så hjälper vi dig!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  const isFromSupport = !isOwn;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm"
                        }`}
                      >
                        {isFromSupport && (
                          <p className="text-xs font-semibold text-primary mb-1">
                            HiFihörnet
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

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv ett meddelande..."
                className="min-h-[44px] max-h-[100px] resize-none"
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
        </div>
      )}
    </>
  );
};

export default SupportChat;
