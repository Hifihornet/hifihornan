import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageCircle, X, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logoImage from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageSent, setMessageSent] = useState(false);

  // Check for unread support messages periodically
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
      // Count unread messages in support conversations (listing_id is null)
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .is("listing_id", null)
        .eq("buyer_id", user.id);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c) => c.id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .neq("sender_id", user.id)
          .is("read_at", null);

        setUnreadCount(count || 0);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Reset messageSent when chat closes
  useEffect(() => {
    if (!isOpen) {
      setMessageSent(false);
      setNewMessage("");
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!user) return;

    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setNewMessage("");

    try {
      // Check if support conversation exists for this user
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .is("listing_id", null)
        .eq("buyer_id", user.id)
        .maybeSingle();

      let convId = existing?.id ?? null;

      if (!convId) {
        // Create new support conversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            listing_id: null,
            buyer_id: user.id,
            seller_id: user.id, // Self-reference for support chats
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating support conversation:", createError);
          toast.error("Kunde inte skapa supportärende");
          setNewMessage(content);
          return;
        }

        convId = newConv.id;
      }

      // Send the message
      const { error } = await supabase.from("messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        content,
      });

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Kunde inte skicka meddelande");
        setNewMessage(content);
      } else {
        // Show success state with auto-reply
        setMessageSent(true);
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

  const goToInbox = () => {
    setIsOpen(false);
    navigate("/messages");
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
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[400px] max-h-[calc(100vh-150px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
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

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            {messageSent ? (
              // Auto-reply after sending
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-foreground font-medium mb-2">
                    Tack för att du hör av dig! 🙏
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ditt meddelande har skickats och flyttats till din inkorg. Vi hör av oss så snart vi kan!
                  </p>
                </div>
                <Button onClick={goToInbox} className="gap-2">
                  <Inbox className="w-4 h-4" />
                  Gå till inkorgen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessageSent(false)}
                  className="text-muted-foreground"
                >
                  Skicka ett nytt meddelande
                </Button>
              </div>
            ) : (
              // Initial welcome message
              <div className="space-y-4 w-full">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">Hej! 👋</p>
                  <p className="text-sm text-muted-foreground">
                    Har du frågor? Skriv till oss så hjälper vi dig!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input - only show if message hasn't been sent */}
          {!messageSent && (
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
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;
