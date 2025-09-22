import { NextResponse } from 'next/server'
import { getVectorStore } from '@/server/vectorstore'

export async function GET() {
  try {
    const vectorStore: any = await getVectorStore()
    const documentCount = await vectorStore.countDocuments()
    let status: 'healthy' | 'warning' = 'healthy'
    const issues: string[] = []
    if (documentCount === 0) { status = 'warning'; issues.push('Knowledge base is empty - consider loading sample documents') }
    return NextResponse.json({ success: true, status: { vectorStore: { status: 'connected', documentCount, collectionName: vectorStore.collectionName }, environment: { googleApiKey: process.env.GOOGLE_API_KEY ? 'configured' : 'missing', qdrantConfig: process.env.QDRANT_CLOUD_URL ? 'cloud' : 'local' }, overall: status, issues }, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', status: { overall: 'error', issues: [String(error?.message || error)] }, timestamp: new Date().toISOString() }, { status: 500 })
  }
}
