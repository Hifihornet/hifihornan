// Lovable Cloud backend function: create store accounts
// Verifies caller is admin, then creates a new user + assigns 'store' role.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateStorePayload = {
  email: string;
  password: string;
  store_name: string;
};

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

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Client bound to caller JWT (only for identifying caller)
  const callerClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Pure service client (for admin actions)
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);

  // 1) Identify caller
  const { data: userData, error: userError } = await callerClient.auth.getUser();
  const caller = userData?.user;

  if (userError || !caller) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2) Check admin role
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

  // 3) Validate input
  let payload: CreateStorePayload | null = null;
  try {
    payload = (await req.json()) as CreateStorePayload;
  } catch {
    payload = null;
  }

  const email = payload?.email?.trim() ?? "";
  const password = payload?.password ?? "";
  const storeName = payload?.store_name?.trim() ?? "";

  if (!email || !password || !storeName) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (password.length < 6) {
    return new Response(JSON.stringify({ error: "Password too short" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (email.length > 255 || storeName.length > 80) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 4) Create user
  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: storeName },
  });

  const newUserId = created?.user?.id;

  if (createError || !newUserId) {
    return new Response(
      JSON.stringify({
        error: createError?.message ?? "Could not create user",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // 5) Create profile row (best-effort)
  await serviceClient.from("profiles").insert({
    user_id: newUserId,
    display_name: storeName,
  });

  // 6) Assign store role
  const { error: roleInsertError } = await serviceClient.from("user_roles").insert({
    user_id: newUserId,
    role: "store",
  });

  if (roleInsertError) {
    return new Response(
      JSON.stringify({ error: "User created but role assignment failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify({ user_id: newUserId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
