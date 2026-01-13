import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useSiteVisit = () => {
  const location = useLocation();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per session (on initial load)
    if (hasTracked.current) return;
    hasTracked.current = true;

    const recordVisit = async () => {
      try {
        await supabase.rpc("record_site_visit", {
          _page_path: location.pathname
        });
      } catch (err) {
        // Silently fail - don't disrupt user experience
        console.debug("Could not record site visit:", err);
      }
    };

    recordVisit();
  }, []);
};
