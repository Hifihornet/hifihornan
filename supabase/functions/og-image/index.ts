import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get("id");

    if (!listingId) {
      return new Response("Missing listing ID", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching listing:", listingId);

    const { data: listing, error } = await supabase
      .from("listings")
      .select("id, title, description, price, images, brand, location")
      .eq("id", listingId)
      .single();

    if (error || !listing) {
      console.error("Listing not found:", error);
      return new Response("Listing not found", { status: 404, headers: corsHeaders });
    }

    const baseUrl = "https://hifihornan.se";
    const listingUrl = `${baseUrl}/listing/${listing.id}`;
    const imageUrl = listing.images?.[0] || `${baseUrl}/og-image.png`;
    const title = escapeHtml(listing.title);
    const description = escapeHtml(`${listing.brand} - ${listing.price.toLocaleString("sv-SE")} kr - ${listing.location}. ${listing.description?.substring(0, 100) || ""}`);

    console.log("Generating OG for:", { title, imageUrl, listingUrl });

    // Return HTML with OG meta tags for social media crawlers
    const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Hifihörnan</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${listingUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:site_name" content="Hifihörnan">
  <meta property="og:locale" content="sv_SE">
  <meta property="product:price:amount" content="${listing.price}">
  <meta property="product:price:currency" content="SEK">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${listingUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Redirect to actual listing -->
  <meta http-equiv="refresh" content="0;url=${listingUrl}">
  <link rel="canonical" href="${listingUrl}">
</head>
<body>
  <p>Redirecting to <a href="${listingUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}