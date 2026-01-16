import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnlineUser {
  id: string;
  online_at: string;
}

const PRESENCE_CHANNEL = "online-users";
const LAST_SEEN_UPDATE_INTERVAL = 60000; // Update last_seen every 60 seconds

// Hook for tracking current user's presence
export const useOnlinePresence = () => {
  const { user } = useAuth();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Update last_seen in database
    const updateLastSeen = async () => {
      // await supabase.rpc("update_user_last_seen", { _user_id: user.id });
    };

    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          id: user.id,
          online_at: new Date().toISOString(),
        });
        // Update last_seen immediately on connect
        updateLastSeen();
      }
    });

    // Periodically update last_seen while online
    intervalRef.current = window.setInterval(updateLastSeen, LAST_SEEN_UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      presenceChannel.unsubscribe();
    };
  }, [user]);
};

// Hook for checking if specific users are online
export const useOnlineUsers = (userIds: string[]) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [observerKey] = useState(
    () => `observer-${Math.random().toString(36).slice(2)}`
  );

  const userIdsKey = useMemo(() => userIds.join(","), [userIds]);

  useEffect(() => {
    if (userIds.length === 0) return;

    // Presence requires a key even for observers
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: observerKey,
        },
      },
    });

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
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Ensure we're part of the presence set so we receive updates reliably
          await channel.track({
            id: observerKey,
            online_at: new Date().toISOString(),
          });
          setTimeout(handleSync, 0);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [observerKey, userIds, userIdsKey]);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { onlineUsers, isOnline };
};

// Hook for checking if a single user is online
export const useIsUserOnline = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(false);
  const [observerKey] = useState(
    () => `observer-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: observerKey,
        },
      },
    });

    const handleSync = () => {
      const state = channel.presenceState<OnlineUser>();
      setIsOnline(userId in state);
    };

    channel
      .on("presence", { event: "sync" }, handleSync)
      .on("presence", { event: "join" }, handleSync)
      .on("presence", { event: "leave" }, handleSync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: observerKey,
            online_at: new Date().toISOString(),
          });
          setTimeout(handleSync, 0);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [observerKey, userId]);

  return isOnline;
};
