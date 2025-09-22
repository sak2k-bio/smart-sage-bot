import { NextResponse } from 'next/server'
import { loadSampleDocuments } from '@/server/vectorstore'

export async function POST() {
  try {
    const result = await loadSampleDocuments()
    return NextResponse.json({ success: true, message: result.message, documentCount: result.documentCount, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
