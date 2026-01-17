import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Plus, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo.png";

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [forceNewConversation, setForceNewConversation] = useState(false);
  
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

  // Reset when chat closes
  useEffect(() => {
    if (!isOpen) {
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
    const content = newMessage.trim();
    if (!content) return;

    setSending(true);
    setNewMessage("");

    try {
      // Hitta admin användare - använd ditt user ID som fallback
      const adminUserId = "2998bdd8-41cf-41d3-a706-14ebd8ec7203"; // Ditt user ID

      // Hämta alla befintliga support-konversationer för denna användare
      console.log("Fetching all support conversations for user:", user.id);
      const { data: allConversations } = await supabase
        .from("conversations")
        .select("id, created_at")
        .is("listing_id", null)
        .eq("buyer_id", user.id)
        .eq("seller_id", adminUserId)
        .order("created_at", { ascending: false });

      console.log("Found conversations:", allConversations?.length, allConversations);

      let convId = null;
      
      if (!forceNewConversation && allConversations && allConversations.length > 0) {
        // Använd den senaste befintliga konversationen
        convId = allConversations[0].id;
        console.log("Using existing support conversation:", convId);
      } else {
        console.log("Creating new support conversation, forceNewConversation:", forceNewConversation);
        // Skapa ny konversation
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            listing_id: null,
            buyer_id: user.id,
            seller_id: adminUserId, // Admin som säljare/mottagare
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
        setForceNewConversation(false); // Reset flagga
        console.log("Created new support conversation:", convId);
      }

      // Skapa meddelande från användare
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        content: content,
        is_system_message: false,
      });

      if (messageError) {
        console.error("Error sending message:", messageError);
        toast.error("Kunde inte skicka meddelande");
        setNewMessage(content);
        return;
      }

      // Skapa system-meddelande för att markera som support-ärende
      const { error: systemError } = await supabase.from("messages").insert({
        conversation_id: convId,
        sender_id: adminUserId,
        content: `🎫 Support-ärende skapat från supportbott\nPrioritet: Normal\nStatus: Ny`,
        is_system_message: true,
      });

      if (systemError) {
        console.error("Error creating system message:", systemError);
      } else {
        console.log("System message created successfully");
      }

      console.log("Message sent to conversation:", convId);
      toast.success("Support-ärende skapat! Du hittar det under Meddelanden.");
      setNewMessage(""); // Rensa input efter skickat
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Något gick fel. Försök igen.");
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const fallbackToConversation = async (content: string) => {
    // Fallback om support_tickets tabellen inte finns
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
      content: content,
      is_system_message: false,
    });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Kunde inte skicka meddelande");
      setNewMessage(content);
      return;
    }

    toast.success("Meddelande skickat! Vi återkommer snart.");
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
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
          <div className="flex-1 p-4 flex flex-col">
            <div className="space-y-4 text-center mb-auto">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-foreground font-medium mb-1">Kundsupport 🛠️</p>
                <p className="text-sm text-muted-foreground">
                  Har du frågor eller problem? Vi hjälper dig direkt!
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Öppet vardagar 9-17, svar inom 24 timmar
                </p>
              </div>
              
              {/* Nytt ärende knapp */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setForceNewConversation(true);
                  setNewMessage("");
                  toast.info("Nytt support-ärende kommer att skapas när du skickar ditt meddelande");
                }}
                className="mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Starta nytt ärende
              </Button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Beskriv ditt problem eller fråga här..."
                className="flex-1 resize-none"
                rows={2}
              />
              <Button 
                onClick={sendMessage} 
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
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
