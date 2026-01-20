// Email sending function for HiFiHörnet
// Sends business invitation emails via Resend

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, falling back to log only");
  }

  // Verify caller is admin (optional - you can remove this if you want public access)
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader) {
    const callerClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    const caller = userData?.user;

    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: adminRole, error: roleError } = await serviceClient
      .from("user_roles")
      .select("id")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Parse email payload
  let payload: EmailPayload | null = null;
  try {
    payload = (await req.json()) as EmailPayload;
  } catch {
    payload = null;
  }

  const { to, subject, html } = payload || {};

  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: "Missing required fields: to, subject, html" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return new Response(JSON.stringify({ error: "Invalid email format" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (resendApiKey) {
      // Send via Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "HiFiHörnet <noreply@hifihornet.se>",
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);

      return new Response(JSON.stringify({ success: true, messageId: result.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Fallback: Log email (for development)
      console.log("=== EMAIL WOULD BE SENT ===");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("HTML:", html);
      console.log("=============================");

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email logged (RESEND_API_KEY not configured)",
        logged: true 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send email" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
