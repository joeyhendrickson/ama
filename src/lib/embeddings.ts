import OpenAI from 'openai'

// Initialize OpenAI for embeddings
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }

  return new OpenAI({ apiKey })
}

// Generate embeddings using text-embedding-3-small (1536 dimensions)
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

// Generate embeddings for multiple texts
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAIClient()
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })

  return response.data.map(item => item.embedding)
}

