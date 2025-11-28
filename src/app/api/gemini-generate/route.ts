import { NextRequest, NextResponse } from 'next/server'

// Gemini API integration for generative responses with RAG
export async function POST(req: NextRequest) {
  try {
    const { query, context } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Log API key status (without exposing the key)
    console.log('Gemini API Key status:', apiKey ? 'Present' : 'Missing')
    console.log('Query:', query.substring(0, 50) + '...')
    console.log('Context length:', context?.length || 0)
    console.log('Context preview:', context?.substring(0, 200) + '...' || 'No context')

    // If no Gemini key, fallback to OpenAI
    if (!apiKey) {
      console.log('No Gemini API key, falling back to OpenAI')
      return await fallbackToOpenAI(query, context)
    }

    // Use Gemini 2.0 Flash Experimental (supports Gemini 3 API)
    // Available models: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash
    const model = 'gemini-2.0-flash-exp' // Latest experimental model (Gemini 3 compatible)
    
    const systemPrompt = `You are an AI assistant helping users learn about Joey Hendrickson. You MUST use the provided context below to answer questions. The context contains real information about Joey's projects, work, and background.

CRITICAL: You have been provided with detailed context about Joey Hendrickson below. You MUST use this context to answer questions. Do NOT say you don't have information - use the provided context.

CRITICAL RESPONSE RULES - ALWAYS FOLLOW:

1. USE PROVIDED CONTEXT:
   - The context below contains REAL information about Joey Hendrickson
   - You MUST use this context to answer all questions
   - Do NOT say "I don't have specific information" - use what's provided
   - If the context doesn't cover something, acknowledge it but use what you have

2. TEXT FORMATTING:
   - DO NOT use asterisks (*) for emphasis or bold/italic markdown
   - DO NOT use markdown bold (**text**) or italic (*text*)
   - Use clean, professional text without markdown emphasis
   - Use clear headings (##, ###) for structure
   - Use bullet points and numbered lists for clarity

3. EMOJIS:
   - LIMIT emojis in text responses - use them very sparingly or not at all
   - Responses should look clean, professional, and human
   - Avoid emoji-heavy text that looks automated

4. VISUAL ELEMENTS:
   - Use Gemini's capabilities to describe visual elements that should be generated
   - Include descriptions for infographics, custom images, flow charts, statistics radials, and cinematic graphics
   - Describe visual data representations (charts, graphs, infographics) that would support the narrative
   - Note: You can describe these visuals, but actual image generation may require separate API calls

5. GRAPHICS FORMAT:
   - DO NOT use text-based graphics with dashes (like ASCII art)
   - Describe visual graphics that should be created
   - Use proper descriptions for visual representations

6. RESPONSE STRUCTURE:
   - Answer questions accurately based EXCLUSIVELY on the provided context
   - Create engaging, conversational responses that feel personal and human
   - Structure information clearly with headings and sections
   - Use tables for structured data when appropriate
   - If information isn't in the context, acknowledge it but use what you have

7. TONE:
   - Professional but approachable
   - Clean and human-sounding
   - Avoid overly formatted or "marketed" language
   - Focus on clear, informative communication

Make responses feel like a personalized, professional tour of Joey's work and life, using the real information provided in the context below.

=== CONTEXT ABOUT JOEY HENDRICKSON (USE THIS TO ANSWER QUESTIONS) ===
${context || 'No context provided - but you should still try to answer based on general knowledge if needed.'}
=== END OF CONTEXT ===

Remember: You MUST use the context above to answer questions. Do not say you don't have information when context is provided.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Question: ${query}\n\nPlease provide a comprehensive response following all the rules above. Include visual elements (infographics, charts, images) using Gemini's image generation capabilities where appropriate.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Increased for richer responses with visual descriptions
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      // Fallback to OpenAI
      return await fallbackToOpenAI(query, context)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text
      
      return NextResponse.json({
        success: true,
        response: generatedText,
        model: 'gemini-2.0-flash-exp',
        usage: data.usageMetadata
      })
    }

    throw new Error('No response from Gemini')

  } catch (error: any) {
    console.error('Gemini generation error:', error)
    // Fallback to OpenAI
    return await fallbackToOpenAI(query, context || '')
  }
}

// Fallback to OpenAI if Gemini is unavailable
async function fallbackToOpenAI(query: string, context: string) {
  const apiKey = process.env.OPENAI_API_KEY

  console.log('OpenAI fallback - API Key status:', apiKey ? 'Present' : 'Missing')

  if (!apiKey) {
    console.log('No OpenAI API key available for fallback')
    return NextResponse.json({
      success: true,
      response: `I'd love to help you learn about Joey Hendrickson! However, AI services are not currently configured. 

Based on what I know, Joey is a consultant, developer, and entrepreneur specializing in:
- Digital transformation and AI solutions
- Complex project management for Fortune 100 companies
- Music and creative technology
- Speaking engagements and thought leadership

Try asking about specific topics like "projects", "music", "consulting", or "founder ventures".`,
      model: 'fallback'
    })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using GPT-4o (latest)
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping users learn about Joey Hendrickson.

CRITICAL RULES - ALWAYS FOLLOW:
1. DO NOT use asterisks (*) for emphasis or markdown bold/italic
2. LIMIT emojis - use very sparingly or not at all
3. Use clean, professional text that looks human
4. Generate visual descriptions for infographics, charts, and graphics where appropriate
5. DO NOT use text-based graphics with dashes
6. Use clear headings and structured lists
7. Keep responses professional and approachable

Context: ${context || 'No specific context provided'}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const data = await response.json()
    
    if (data.choices && data.choices[0]) {
      return NextResponse.json({
        success: true,
        response: data.choices[0].message.content,
        model: 'gpt-4o',
        usage: data.usage
      })
    }

    throw new Error('No response from OpenAI')
  } catch (error: any) {
    console.error('OpenAI fallback error:', error)
    return NextResponse.json({
      success: true,
      response: `I'm having trouble connecting to AI services right now. Please try again later, or ask me about specific topics like Joey's projects, music, or consulting work.`,
      model: 'error-fallback'
    })
  }
}
