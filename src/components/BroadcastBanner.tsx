import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const BroadcastBanner = () => {
  const { user } = useAuth();
  const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed broadcasts from localStorage
    const stored = localStorage.getItem("dismissed_broadcasts");
    if (stored) {
      setDismissed(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const fetchLatestBroadcast = async () => {
      const { data, error } = await supabase
        .from("broadcast_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // Only show if not dismissed and less than 7 days old
        const isRecent = new Date(data.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (isRecent && !dismissed.includes(data.id)) {
          setBroadcast(data);
        }
      }
    };

    fetchLatestBroadcast();
  }, [dismissed]);

  const handleDismiss = () => {
    if (broadcast) {
      const newDismissed = [...dismissed, broadcast.id];
      setDismissed(newDismissed);
      localStorage.setItem("dismissed_broadcasts", JSON.stringify(newDismissed));
      setBroadcast(null);
    }
  };

  if (!broadcast) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm">{broadcast.title}</span>
              <span className="text-xs opacity-70">
                {formatDistanceToNow(new Date(broadcast.created_at), {
                  addSuffix: true,
                  locale: sv,
                })}
              </span>
            </div>
            <p className="text-sm opacity-90">{broadcast.content}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-foreground/20 rounded transition-colors shrink-0"
            aria-label="Stäng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastBanner;
