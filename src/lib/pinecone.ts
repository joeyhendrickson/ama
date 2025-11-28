import { Pinecone } from '@pinecone-database/pinecone'

// Initialize Pinecone client
export const getPineconeClient = () => {
  const apiKey = process.env.PINECONE_API_KEY
  const environment = process.env.PINECONE_ENVIRONMENT || 'us-east-1'

  if (!apiKey) {
    throw new Error('PINECONE_API_KEY is not set in environment variables')
  }

  return new Pinecone({
    apiKey: apiKey,
  })
}

// Get the index (ama-knowledge)
export const getPineconeIndex = async () => {
  const client = getPineconeClient()
  const indexName = process.env.PINECONE_INDEX_NAME || 'ama-knowledge'
  return client.index(indexName)
}

