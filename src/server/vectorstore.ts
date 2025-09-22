import { QdrantClient } from '@qdrant/js-client-rest'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from './environment'

const VECTOR_STORE_TYPE = process.env.VECTOR_STORE || 'qdrant'
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost'
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333')
const QDRANT_CLOUD_URL = process.env.QDRANT_CLOUD_URL
const QDRANT_CLOUD_API_KEY = process.env.QDRANT_CLOUD_API_KEY
// Note: The collection name has a leading space in Qdrant Cloud
const COLLECTION_NAME = ' pulmo_fishman_v5_google-001'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
// Use gemini-embedding-001 with 3072-dim
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-001'
const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIM || '3072')

export async function getEmbedding(text: string) {
  if (!GOOGLE_API_KEY) throw new Error('Google API key not found for embeddings')
  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)

  // Use gemini-embedding-001 with outputDimensionality set to 3072
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
    console.log(`Generating embedding with model: ${EMBEDDING_MODEL} for text length: ${text.length}, requesting ${EMBEDDING_DIM} dimensions`)
    
    const result: any = await (model as any).embedContent(text, {
      outputDimensionality: EMBEDDING_DIM
    })
    
    const values = result.embedding.values
    console.log(`Embedding generated: ${values.length} dimensions`)
    
    if (values.length !== EMBEDDING_DIM) {
      console.warn(`Embedding dimension ${values.length} != configured ${EMBEDDING_DIM}. Requested ${EMBEDDING_DIM} but got ${values.length}.`)
    }
    return values
  } catch (e: any) {
    console.error('Embedding with outputDimensionality failed:', e)
    // Try without outputDimensionality as fallback
    try {
      console.log('Retrying without outputDimensionality parameter...')
      const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
      const result = await model.embedContent(text)
      const values = result.embedding.values
      console.log(`Fallback embedding generated: ${values.length} dimensions`)
      return values
    } catch (e2: any) {
      console.error('Fallback embedding also failed:', e2)
      throw new Error(`Embedding generation failed: ${e2?.message || e2}`)
    }
  }
}

export interface RetrievedDoc { content: string; metadata: any; distance: number }

export class VectorStore {
  async init() {}
  async addDocuments(_documents: Array<{ content: string; metadata?: any }>) {}
  async similaritySearch(_query: string, _k: number): Promise<RetrievedDoc[]> { return [] }
  async deleteCollection() {}
  async getCollectionInfo(): Promise<any> { return {} }
  async countDocuments(): Promise<number> { return 0 }
}

export class QdrantVectorStore extends VectorStore {
  client: QdrantClient
  collectionName: string
  constructor() {
    super()
    if (QDRANT_CLOUD_URL && QDRANT_CLOUD_API_KEY && QDRANT_CLOUD_URL.startsWith('http')) {
      this.client = new QdrantClient({ url: QDRANT_CLOUD_URL, apiKey: QDRANT_CLOUD_API_KEY })
    } else {
      this.client = new QdrantClient({ host: QDRANT_HOST, port: QDRANT_PORT })
    }
    this.collectionName = COLLECTION_NAME
  }
  async init() {
    try {
      const collections = await this.client.getCollections()
      console.log(`[QdrantVectorStore] Available collections:`, collections.collections.map(c => c.name))
      const exists = collections.collections.find(c => c.name === this.collectionName)
      if (!exists) {
        console.warn(`[QdrantVectorStore] Collection "${this.collectionName}" not found in Qdrant!`)
        console.warn(`[QdrantVectorStore] Available collections are:`, collections.collections.map(c => c.name).join(', '))
        // Do NOT create a new collection - use the existing one
        // await this.client.createCollection(this.collectionName, { vectors: { size: EMBEDDING_DIM, distance: 'Cosine' } })
      } else {
        const info = await this.client.getCollection(this.collectionName)
        console.log(`[QdrantVectorStore] Using existing collection "${this.collectionName}" with ${info.points_count} points, vector size: ${info.config?.params?.vectors?.size || 'unknown'}`)
      }
    } catch (error: any) {
      console.error(`[QdrantVectorStore] Error during init:`, error.message || error)
    }
  }
  async addDocuments(documents: Array<{ content: string; metadata?: any }>) {
    const embeddings = await Promise.all(documents.map(d => getEmbedding(d.content)))
    const points = documents.map((doc, i) => ({
      id: Date.now() + i,
      vector: embeddings[i],
      payload: { content: doc.content, ...doc.metadata },
    }))
    await this.client.upsert(this.collectionName, { wait: true, points })
  }
  private extractContent(payload: any): string {
    if (!payload) return ''
    const candidates = [
      'content', 'text', 'page_content', 'chunk', 'document', 'body', 'data', 'summary'
    ]
    for (const key of candidates) {
      const v = payload[key] ?? payload?.payload?.[key]
      if (typeof v === 'string' && v.trim().length > 0) return v
      if (Array.isArray(v)) {
        const joined = v.filter(Boolean).join(' ').trim()
        if (joined) return joined
      }
      if (v && typeof v === 'object') {
        const str = JSON.stringify(v)
        if (str && str.length > 0) return str
      }
    }
    // If payload has a single string field, use it
    const values = Object.values(payload)
    const firstStr = values.find(v => typeof v === 'string') as string | undefined
    if (firstStr) return firstStr
    return ''
  }
  private extractSource(payload: any): string | undefined {
    return (
      payload?.source || payload?.url || payload?.link || payload?.metadata?.source || payload?.file || undefined
    )
  }
  async similaritySearch(query: string, k: number): Promise<RetrievedDoc[]> {
    console.log(`[QdrantVectorStore] Searching in collection: "${this.collectionName}" for query: "${query}" with k=${k}`);
    const vector = await getEmbedding(query)
    console.log(`[QdrantVectorStore] Vector generated, searching with ${vector.length} dimensions...`);
    try {
      const results: any = await this.client.search(this.collectionName, { vector, limit: k, with_payload: true })
      console.log(`[QdrantVectorStore] Search completed, found ${results.length} results`);
      return results.map((r: any) => {
        const content = this.extractContent(r.payload)
        const meta = { ...r.payload }
        if (!meta.source) {
          const src = this.extractSource(r.payload)
          if (src) (meta as any).source = src
        }
        return { content, metadata: meta, distance: r.score }
      })
    } catch (error: any) {
      console.error(`[QdrantVectorStore] Search failed:`, error.response?.data || error.message || error);
      throw error;
    }
  }
  async deleteCollection() { await this.client.deleteCollection(this.collectionName) }
  async getCollectionInfo() { return this.client.getCollection(this.collectionName) }
  async countDocuments() { const info: any = await this.getCollectionInfo(); return info?.points_count || 0 }
}

let vectorStoreInstance: VectorStore | null = null
export async function getVectorStore(): Promise<VectorStore> {
  if (!vectorStoreInstance) {
    vectorStoreInstance = VECTOR_STORE_TYPE === 'qdrant' ? new QdrantVectorStore() : new VectorStore()
    await vectorStoreInstance.init()
  }
  return vectorStoreInstance
}

export async function loadSampleDocuments() {
  const vectorStore = await getVectorStore()
  const sampleDocuments = [
    { content: 'Artificial Intelligence (AI) ...', metadata: { source: 'AI Basics', category: 'technology', type: 'definition' } },
    { content: 'Machine Learning is a subset ...', metadata: { source: 'ML Fundamentals', category: 'machine-learning', type: 'definition' } },
    { content: 'RAG (Retrieval-Augmented Generation) ...', metadata: { source: 'RAG Architecture', category: 'ai-architecture', type: 'explanation' } },
  ]
  await vectorStore.addDocuments(sampleDocuments)
  return { success: true, message: `Successfully loaded ${sampleDocuments.length} sample documents`, documentCount: sampleDocuments.length }
}
