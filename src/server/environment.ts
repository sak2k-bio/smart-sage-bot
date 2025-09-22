// Server-only: moved from backend/config/environment.js
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_TEMPERATURE: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  GEMINI_MAX_TOKENS: parseInt(process.env.GEMINI_MAX_TOKENS || '2048'),
  QDRANT_CLOUD_URL: process.env.QDRANT_CLOUD_URL,
  QDRANT_CLOUD_API_KEY: process.env.QDRANT_CLOUD_API_KEY,
  QDRANT_HOST: process.env.QDRANT_HOST || 'localhost',
  QDRANT_PORT: parseInt(process.env.QDRANT_PORT || '6333'),
  VECTOR_STORE: process.env.VECTOR_STORE || 'qdrant',
  COLLECTION_NAME: process.env.COLLECTION_NAME || 'sage_bot_collection',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'embedding-001',
  EMBEDDING_DIM: parseInt(process.env.EMBEDDING_DIM || '768'),
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
}

export function validateEnvironment() {
  const required = []
  if (!config.GOOGLE_API_KEY) required.push('GOOGLE_API_KEY')
  if (required.length) throw new Error(`Missing required environment variables: ${required.join(', ')}`)
}
