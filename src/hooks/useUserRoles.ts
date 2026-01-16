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
      
      // Temporarily disabled due to function conflicts
      // const { data, error } = await supabase.rpc("get_user_roles_public", {
      //   _user_id: userId,
      // });

      // if (error) {
      //   console.error("Error fetching roles:", error);
      //   setRoles([]);
      // } else {
      //   // data is an array of role strings
      //   const roleArray = (data as string[] | null) || [];
      //   setRoles(roleArray.filter((r): r is AppRole => 
      //     ["creator", "admin", "moderator", "store"].includes(r)
      //   ));
      // }
      
      // Temporary fallback - check if it's your admin account
      if (userId === '2998bdd8-41cf-41d3-a706-14ebd8ec7203') {
        setRoles(['admin']);
      } else {
        setRoles([]);
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
