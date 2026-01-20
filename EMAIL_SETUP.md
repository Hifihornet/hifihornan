# Email Setup Guide

## 1. Deploy Supabase Function

```bash
# Deploy the email function
supabase functions deploy send-email
```

## 2. Configure Resend API Key

### Option A: Via Supabase Dashboard
1. Gå till din Supabase project
2. Settings → Edge Functions
3. Lägg till environment variable: `RESEND_API_KEY`
4. Värde: Din Resend API key

### Option B: Via CLI
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

## 3. Get Resend API Key

1. Gå till [resend.com](https://resend.com)
2. Skapa konto (eller logga in)
3. Settings → API Keys
4. Skapa ny API key
5. Kopiera key

## 4. Verify Domain (Required by Resend)

1. I Resend dashboard → Domains
2. Lägg till `hifihornet.se`
3. Följ DNS-instruktionerna (TXT/ MX records)

## 5. Test

När admin godkänner en företagsansökan kommer:
- Mail skickas automatiskt till företaget
- Inbjudningslänk är giltig i 7 dagar
- Företaget kan registrera sig via länken

## Fallback

Om RESEND_API_KEY inte är konfigurerad:
- Mail loggas i console (development mode)
- Systemet fortsätter fungera
- Admin ser att mail inte kunde skickas
