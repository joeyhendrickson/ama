# Troubleshooting AI Search Issues

## Current Issue: "I'm having trouble connecting to AI services right now"

This error occurs when both Gemini and OpenAI API calls fail.

## Quick Fixes

### 1. Restart Your Dev Server
**CRITICAL:** Environment variables are only loaded when the server starts.

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Verify API Keys in `.env.local`

Make sure your `.env.local` file has:
```bash
GEMINI_API_KEY=your_actual_key_here
OPENAI_API_KEY=your_actual_key_here
```

**Important:**
- No quotes around the values
- No spaces before/after the `=`
- Keys should be on separate lines

### 3. Check Server Console Logs

Look at your terminal where `npm run dev` is running. You should see:
- `Gemini API Key status: Present` or `Missing`
- `OpenAI fallback - API Key status: Present` or `Missing`
- Any error messages from the API calls

### 4. Common Issues

#### Issue: API Key Not Being Read
**Symptoms:** Logs show "Missing" for API keys
**Solution:** 
- Restart dev server
- Check `.env.local` file location (should be in project root)
- Verify no typos in variable names

#### Issue: Gemini API Error 400/401
**Symptoms:** "Gemini API error" in logs with 400 or 401 status
**Solution:**
- Verify your Gemini API key is correct
- Check if the key has restrictions in Google Cloud Console
- Make sure you're using the correct API key (not a refresh token)

#### Issue: Gemini API Error 429
**Symptoms:** "Gemini API error" with 429 status
**Solution:**
- Rate limit exceeded
- Wait a few minutes and try again
- Check your API quota in Google Cloud Console

#### Issue: OpenAI API Error
**Symptoms:** "OpenAI fallback error" in logs
**Solution:**
- Verify your OpenAI API key is correct
- Check your OpenAI account has credits
- Verify the key hasn't expired

### 5. Test API Keys Directly

You can test if your keys work by making a direct API call:

**Test Gemini:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_GEMINI_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**Test OpenAI:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_KEY"
```

### 6. Check Network/Firewall

If you're behind a corporate firewall or VPN:
- The API calls might be blocked
- Try disabling VPN temporarily
- Check if your network allows outbound HTTPS to:
  - `generativelanguage.googleapis.com`
  - `api.openai.com`

### 7. Verify Model Name

The code uses `gemini-2.0-flash-exp`. If this model isn't available:
- Check Google's documentation for available models
- Update the model name in `src/app/api/gemini-generate/route.ts`

## Debug Steps

1. **Check server logs** when you make a search query
2. **Look for these log messages:**
   - `Gemini API Key status: Present/Missing`
   - `Query: [your query]...`
   - `Context length: [number]`
   - `Gemini API error: [error details]`
   - `OpenAI fallback - API Key status: Present/Missing`

3. **If keys are "Present" but still failing:**
   - Check the actual error message in logs
   - Verify the API key format (no extra characters)
   - Test the key directly with curl (see above)

## Still Not Working?

1. **Check browser console** (F12) for client-side errors
2. **Check server terminal** for server-side errors
3. **Verify `.env.local` is in the project root** (same directory as `package.json`)
4. **Make sure `.env.local` is not in `.gitignore` issues** (it should be ignored, but the file should exist)

## Expected Behavior

When working correctly, you should see in server logs:
```
Gemini API Key status: Present
Query: What projects have you worked on?...
Context length: 1234
AI response generated successfully: { model: 'gemini-2.0-flash-exp', responseLength: 567 }
```

And in the browser, you should get a detailed, formatted response about Joey's projects.

