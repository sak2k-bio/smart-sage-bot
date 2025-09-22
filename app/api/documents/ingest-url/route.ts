import { NextResponse } from 'next/server'
import { getVectorStore } from '@/server/vectorstore'

function stripHtml(html: string): string {
  // Remove script/style blocks
  const noScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  // Remove all HTML tags
  const noTags = noScripts.replace(/<[^>]+>/g, ' ')
  // Collapse whitespace
  return noTags.replace(/\s+/g, ' ').trim()
}

function chunkText(text: string, chunkSize = 1200, overlap = 100): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length)
    chunks.push(text.slice(i, end))
    if (end === text.length) break
    i = end - overlap
  }
  return chunks
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : body?.url ? [body.url] : []
    if (!urls.length) {
      return NextResponse.json({ success: false, error: 'Provide url or urls[]' }, { status: 400 })
    }

    const vectorStore: any = await getVectorStore()
    let added = 0
    const errors: { url: string; error: string }[] = []

    for (const url of urls) {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const html = await res.text()
        const text = stripHtml(html).slice(0, 200_000)
        const chunks = chunkText(text)
        const docs = chunks.map((c, idx) => ({
          content: c,
          metadata: { source: url, category: 'web', type: 'article', chunk: idx },
        }))
        await vectorStore.addDocuments(docs)
        added += docs.length
      } catch (e: any) {
        errors.push({ url, error: String(e?.message || e) })
      }
    }

    return NextResponse.json({ success: true, addedCount: added, errors, timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}