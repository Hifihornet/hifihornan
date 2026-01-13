import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageCircle, X, Inbox, GripVertical } from "lucide-react";
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  
  // Dragging state
  const [position, setPosition] = useState({ x: 24, y: 24 }); // Distance from bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Show tooltip for new visitors after a delay
  useEffect(() => {
    const hasSeenBefore = localStorage.getItem("support-chat-seen");
    if (!hasSeenBefore && !isOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasSeenTooltip(true);
        localStorage.setItem("support-chat-seen", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Hide tooltip after 8 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  // Check for unread support messages periodically
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const checkUnread = async () => {
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

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX + position.x,
      y: e.clientY + position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartPos.current = {
      x: touch.clientX + position.x,
      y: touch.clientY + position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = dragStartPos.current.x - e.clientX;
      const newY = dragStartPos.current.y - e.clientY;
      
      // Constrain to viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.min(Math.max(16, newX), maxX),
        y: Math.min(Math.max(16, newY), maxY),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newX = dragStartPos.current.x - touch.clientX;
      const newY = dragStartPos.current.y - touch.clientY;
      
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      setPosition({
        x: Math.min(Math.max(16, newX), maxX),
        y: Math.min(Math.max(16, newY), maxY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const sendMessage = async () => {
    if (!user) return;

    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setNewMessage("");

    try {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .is("listing_id", null)
        .eq("buyer_id", user.id)
        .maybeSingle();

      let convId = existing?.id ?? null;

      if (!convId) {
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            listing_id: null,
            buyer_id: user.id,
            seller_id: user.id,
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
    setShowTooltip(false);
    setIsOpen(true);
  };

  const goToInbox = () => {
    setIsOpen(false);
    navigate("/messages");
  };

  return (
    <>
      {/* Floating chat button with drag handle */}
      <div
        className="fixed z-50 flex items-center gap-1"
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
      >
        {/* Tooltip for new visitors */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full right-0 mb-3 w-48 animate-fade-in">
            <div className="relative bg-card border border-border rounded-lg p-3 shadow-lg">
              <p className="text-sm text-foreground font-medium">Behöver du hjälp? 💬</p>
              <p className="text-xs text-muted-foreground mt-1">Klicka här för att chatta med oss!</p>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border transform rotate-45" />
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`h-14 w-6 rounded-l-full bg-primary/80 hover:bg-primary flex items-center justify-center cursor-grab active:cursor-grabbing transition-all ${
            isDragging ? "cursor-grabbing" : ""
          }`}
        >
          <GripVertical className="h-4 w-4 text-primary-foreground/70" />
        </div>

        {/* Main button */}
        <Button
          ref={buttonRef}
          onClick={handleOpen}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 relative"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          
          {/* Subtle glow effect for attention */}
          {!hasSeenTooltip && !isOpen && (
            <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse" style={{ animationDuration: "3s" }} />
          )}
        </Button>
      </div>

      {/* Chat panel */}
      {isOpen && (
        <div 
          className="fixed z-50 w-[360px] max-w-[calc(100vw-48px)] h-[400px] max-h-[calc(100vh-150px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          style={{
            right: `${position.x}px`,
            bottom: `${position.y + 70}px`,
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center shrink-0">
              <img
                src={logoImage}
                alt="HiFiHörnet"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-foreground">
                HiFiHörnet Support
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

          {/* Input */}
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
