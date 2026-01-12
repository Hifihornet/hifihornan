import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RealtimeChannel } from "@supabase/supabase-js";

interface OnlineUser {
  id: string;
  online_at: string;
}

// Hook for tracking current user's presence
export const useOnlinePresence = () => {
  const { user } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel("online-users", {
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

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  return channel;
};

// Hook for checking if specific users are online
export const useOnlineUsers = (userIds: string[]) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userIds.length === 0) return;

    const channel = supabase.channel("online-users");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const online = new Set<string>();
        
        Object.keys(state).forEach((key) => {
          if (userIds.includes(key)) {
            online.add(key);
          }
        });
        
        setOnlineUsers(online);
      })
      .subscribe();

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

    const channel = supabase.channel("online-users");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        setIsOnline(userId in state);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return isOnline;
};
