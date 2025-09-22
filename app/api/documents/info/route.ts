import { NextResponse } from 'next/server'
import { getVectorStore } from '@/server/vectorstore'

export async function GET() {
  try {
    const vectorStore = await getVectorStore()
    const documentCount = await (vectorStore as any).countDocuments?.()
    const collectionInfo = await (vectorStore as any).getCollectionInfo?.()
    return NextResponse.json({
      success: true,
      info: {
        documentCount: documentCount || 0,
        collectionName: collectionInfo?.config?.params?.collection || 'Unknown',
        vectorSize: collectionInfo?.config?.params?.vectors?.size || 'Unknown',
        distance: collectionInfo?.config?.params?.vectors?.distance || 'Unknown',
        status: (documentCount || 0) > 0 ? 'ready' : 'empty',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', info: { documentCount: 0, status: 'error' }, timestamp: new Date().toISOString() }, { status: 500 })
  }
}
