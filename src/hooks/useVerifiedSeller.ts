import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useVerifiedSeller = (userId: string | undefined) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_verified_seller")
          .eq("user_id", userId)
          .maybeSingle();

        if (!error && data) {
          setIsVerified(data.is_verified_seller);
        }
      } catch (err) {
        console.error("Error checking verification status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
  }, [userId]);

  return { isVerified, isLoading };
};

export default useVerifiedSeller;