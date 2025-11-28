# Complete API Keys Checklist for `.env.local`

This document lists **ALL** API keys and credentials needed to make every feature work.

## 🔴 REQUIRED (Core Functionality)

### 1. Supabase (Database & Storage)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
**What it enables:**
- Database storage (songs, artists, personal content, videos)
- File storage (audio files, images)
- Admin dashboard authentication
- All CRUD operations

**Where to get:** https://supabase.com/dashboard → Your Project → Settings → API

---

## 🟡 REQUIRED FOR AI SEARCH (Homepage Feature)

### 2. Google Gemini API (Primary AI)
```bash
GEMINI_API_KEY=your_gemini_api_key
```
**What it enables:**
- AI-powered search on homepage
- Generative responses about your projects, music, etc.
- RAG (Retrieval-Augmented Generation) responses

**Where to get:** https://makersuite.google.com/app/apikey
**Cost:** Free tier available

### 3. OpenAI API (Fallback - Optional but Recommended)
```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id  # Optional
```
**What it enables:**
- Fallback if Gemini fails
- Alternative AI model option

**Where to get:** https://platform.openai.com/api-keys
**Cost:** Pay-as-you-go

---

## 🟢 OPTIONAL BUT RECOMMENDED

### 4. Google Drive API (Enhanced RAG)
```bash
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_access_token
```
**What it enables:**
- Access to personal files in Google Drive for RAG
- Enhanced context for AI responses
- Personal content from your Drive

**Where to get:** 
- Quick test: https://developers.google.com/oauthplayground/
- Production: Google Cloud Console → OAuth 2.0 credentials

**Note:** This is optional - AI search works without it, but responses will be less personalized.

---

## 💰 PAYMENT PROCESSING

### 5. PayPal (Music Downloads & Albums)
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com  # Sandbox for testing
```
**What it enables:**
- $3 song downloads
- $15 custom album creation
- Payment processing

**Where to get:** https://developer.paypal.com/
**For production:** Change `PAYPAL_BASE_URL` to `https://api-m.paypal.com`

### 6. Stripe (Alternative Payment - Optional)
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```
**What it enables:**
- Alternative payment processing (if you want to use Stripe instead of PayPal)

**Where to get:** https://dashboard.stripe.com/apikeys

---

## 📧 EMAIL FUNCTIONALITY

### 7. SMTP/Email (Notifications & Forms)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```
**What it enables:**
- Travel Santa Marta booking form emails
- Voice comment notifications
- Artist signup notifications
- Song submission emails

**For Gmail:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your regular password)

**For other providers:**
- Outlook: `smtp-mail.outlook.com`, port `587`
- Custom SMTP: Use your provider's SMTP settings

---

## 🌐 CONFIGURATION

### 8. Base URL
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
**What it enables:**
- Email links
- Redirect URLs
- Webhook callbacks

**For production:** `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`

### 9. Node Environment
```bash
NODE_ENV=development
```
**For production:** `NODE_ENV=production`

---

## 📋 COMPLETE `.env.local` TEMPLATE

Copy this entire block into your `.env.local` file:

```bash
# ============================================
# REQUIRED - Core Functionality
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ============================================
# REQUIRED - AI Search (Homepage)
# ============================================
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_openai_assistant_id

# ============================================
# OPTIONAL - Enhanced RAG
# ============================================
GOOGLE_DRIVE_ACCESS_TOKEN=your_google_drive_access_token

# ============================================
# PAYMENT PROCESSING
# ============================================
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Stripe (Optional - if using Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# ============================================
# EMAIL/SMTP
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# ============================================
# CONFIGURATION
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎯 MINIMUM TO GET STARTED

**Absolute minimum** to make the site functional:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Search
GEMINI_API_KEY=your_gemini_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**With this minimum, you get:**
- ✅ Database functionality
- ✅ AI search on homepage
- ✅ Admin dashboard
- ❌ No payments (PayPal needed)
- ❌ No emails (SMTP needed)
- ❌ No Google Drive RAG (optional)

---

## 🚀 FEATURE-SPECIFIC REQUIREMENTS

| Feature | Required Keys |
|---------|--------------|
| **Homepage AI Search** | `GEMINI_API_KEY` or `OPENAI_API_KEY` |
| **Database/Storage** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Music Downloads** | `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| **Travel Booking Emails** | `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT` |
| **Google Drive RAG** | `GOOGLE_DRIVE_ACCESS_TOKEN` |
| **Voice Comments** | `EMAIL_USER`, `EMAIL_PASS` |

---

## ⚠️ IMPORTANT NOTES

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Restart dev server** after adding/changing env variables: `npm run dev`
3. **Test in order:**
   - First: Supabase (database)
   - Second: Gemini (AI search)
   - Third: PayPal (payments)
   - Fourth: Email (notifications)
4. **Production:** Change `PAYPAL_BASE_URL` and `NEXT_PUBLIC_BASE_URL` for production
5. **Costs:**
   - Supabase: Free tier available
   - Gemini: Free tier available
   - OpenAI: Pay-as-you-go
   - PayPal: Transaction fees only
   - Google Drive: Free (with Google account)

---

## 🔍 QUICK VERIFICATION

After adding keys, verify they're loaded:
```bash
# In your terminal, check if variables are loaded (they won't show values for security)
npm run dev
# Check console for any "missing" or "undefined" warnings
```

