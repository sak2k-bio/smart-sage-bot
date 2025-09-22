import { NextResponse } from 'next/server'
import { getVectorStore } from '@/server/vectorstore'

export async function DELETE() {
  try {
    const vectorStore: any = await getVectorStore()
    await vectorStore.deleteCollection()
    await vectorStore.init()
    return NextResponse.json({ success: true, message: 'Knowledge base cleared successfully', timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
