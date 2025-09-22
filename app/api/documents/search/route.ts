import { NextResponse } from 'next/server'
import { getVectorStore } from '@/server/vectorstore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, limit = 5 } = body || {}
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, error: 'Query is required and must be a string' }, { status: 400 })
    }
    const vectorStore: any = await getVectorStore()
    const results = await vectorStore.similaritySearch(query, limit)
    return NextResponse.json({
      success: true,
      query,
      results: results.map((r: any, index: number) => ({ id: index, content: r.content, metadata: r.metadata, similarity: r.distance, preview: r.content.substring(0,200) + (r.content.length>200?'...':'') })),
      resultCount: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', results: [], timestamp: new Date().toISOString() }, { status: 500 })
  }
}
