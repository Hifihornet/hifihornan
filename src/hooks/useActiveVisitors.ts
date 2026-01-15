import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useActiveVisitors = () => {
  const [activeCount, setActiveCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const channel = supabase.channel("active_visitors", {
      config: {
        presence: {
          key: user?.id || `anon_${Math.random().toString(36).substring(7)}`,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setActiveCount(count);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user?.id || null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return activeCount;
};
