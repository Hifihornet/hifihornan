import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnlineUser {
  id: string;
  online_at: string;
}

const PRESENCE_CHANNEL = "online-users";

// Hook for tracking current user's presence
export const useOnlinePresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);
};

// Hook for checking if specific users are online
export const useOnlineUsers = (userIds: string[]) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userIds.length === 0) return;

    const channel = supabase.channel(PRESENCE_CHANNEL);

    const handleSync = () => {
      const state = channel.presenceState<OnlineUser>();
      const online = new Set<string>();
      
      Object.keys(state).forEach((key) => {
        if (userIds.includes(key)) {
          online.add(key);
        }
      });
      
      setOnlineUsers(online);
    };

    channel
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, handleSync)
      .on("presence", { event: "leave" }, handleSync)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Initial check
          handleSync();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIds.join(",")]);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { onlineUsers, isOnline };
};

// Hook for checking if a single user is online
export const useIsUserOnline = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(PRESENCE_CHANNEL);

    const handleSync = () => {
      const state = channel.presenceState<OnlineUser>();
      setIsOnline(userId in state);
    };

    channel
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, handleSync)
      .on("presence", { event: "leave" }, handleSync)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          handleSync();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return isOnline;
};
