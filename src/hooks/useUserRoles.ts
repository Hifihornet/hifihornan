import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "creator" | "admin" | "moderator" | "store";

export const useUserRoles = (userId: string | undefined) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchRoles = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      } else {
        setRoles(data?.map((r) => r.role as AppRole) || []);
      }
      setIsLoading(false);
    };

    fetchRoles();
  }, [userId]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isCreator = hasRole("creator");
  const isAdmin = hasRole("admin");
  const isModerator = hasRole("moderator");
  const isStore = hasRole("store");

  return { roles, isLoading, hasRole, isCreator, isAdmin, isModerator, isStore };
};

export default useUserRoles;
