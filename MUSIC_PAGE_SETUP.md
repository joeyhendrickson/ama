# Music Page Setup Guide

## Overview
The music page has been updated to support:
- Admin dashboard song uploads (single-user, simplified)
- Song streaming with flip cards for listening and commentary
- Individual song downloads ($3 per song)
- Custom album creation (select 10 songs, $15 total)
- PayPal checkout integration

## Environment Variables

Add these to your `.env.local` file:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com  # Use https://api-m.paypal.com for production
```

### Getting PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create a new app or use an existing one
3. Copy the Client ID and Secret
4. For testing, use the Sandbox credentials
5. For production, use Live credentials and update `PAYPAL_BASE_URL`

## Features

### Admin Dashboard - Music Management

1. Navigate to `/admin-dashboard`
2. Click on the "Music" tab
3. Upload songs with:
   - Song title (required)
   - Artist name (defaults to "Joey Hendrickson")
   - Genre (defaults to "Alternative • Acoustic")
   - Audio file (required, MP3, WAV, etc.)
   - Cover image (optional)

Songs are automatically set to `approved` and `is_public: true` when uploaded.

### Music Page Features

1. **Streaming**: Click on any song card to play audio
2. **Flip Cards**: Click the card to flip and add voice comments
3. **Download Individual Songs**: Click "Download ($3)" button on each song
4. **Create Custom Album**:
   - Select up to 10 songs using the checkbox on each card
   - A selection bar appears at the top
   - Click "Create Album" when you have 10 songs selected ($15)
   - Or purchase individually selected songs

### PayPal Checkout Flow

1. User clicks download or creates album
2. Redirected to PayPal for payment
3. After payment, redirected back to `/music?token=ORDER_ID&PayerID=PAYER_ID`
4. System automatically captures payment and downloads files
5. Files are downloaded to user's device

## API Routes

### `/api/admin/upload-song`
- **Method**: POST
- **Auth**: Admin only (admin@launchthatsong.com or admin_users table)
- **Body**: FormData with title, artist_name, genre, file, image
- **Returns**: Song data

### `/api/music/songs`
- **Method**: GET
- **Returns**: List of all public, approved songs

### `/api/paypal/create-order`
- **Method**: POST
- **Body**: `{ type: 'song' | 'album', items: string[] }`
- **Returns**: `{ orderId, approvalUrl }`

### `/api/paypal/capture-order`
- **Method**: POST
- **Body**: `{ orderId: string }`
- **Returns**: Payment confirmation and purchase details

### `/api/music/download`
- **Method**: POST
- **Body**: `{ songIds: string[], orderId: string }`
- **Returns**: Download URLs for purchased songs

## Database Requirements

The `songs` table should have these fields:
- `id` (uuid)
- `title` (text)
- `artist_name` (text)
- `genre` (text)
- `audio_url` (text)
- `image_url` (text, nullable)
- `file_url` (text)
- `file_size` (integer)
- `status` (text, should be 'approved')
- `is_public` (boolean, should be true)
- `created_at` (timestamp)

## Supabase Storage

Ensure you have a `songs` storage bucket in Supabase with:
- Public access enabled
- File size limits configured (recommended: 50MB max)
- CORS configured for your domain

## Testing

1. **Upload a song** via admin dashboard
2. **View on music page** - song should appear
3. **Test streaming** - click play button
4. **Test flip card** - click card to flip and add comment
5. **Test download** - use PayPal sandbox account
6. **Test album creation** - select 10 songs and purchase

## Notes

- Songs are immediately public after upload (no approval workflow)
- All downloads require PayPal payment
- Custom albums are exactly 10 songs for $15 (saves $15 vs individual purchases)
- Voice comments are stored locally (not persisted to database yet)

