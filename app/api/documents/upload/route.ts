import { NextResponse } from 'next/server'
import { getVectorStore, loadSampleDocuments } from '@/server/vectorstore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { documents } = body || {}
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ success: false, error: 'Documents array is required and must not be empty' }, { status: 400 })
    }
    const vectorStore = await getVectorStore()
    await vectorStore.addDocuments(documents)
    return NextResponse.json({ success: true, message: `Successfully uploaded ${documents.length} documents`, documentCount: documents.length, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
