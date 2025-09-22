import { NextResponse } from 'next/server'
import { createPipeline } from '@/server/pipelines'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, creativity = 'balanced', domain } = body || {}
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required and must be a string' }, { status: 400 })
    }
    const pipeline = createPipeline('meta')
    const result = await pipeline.process(message)
    return NextResponse.json({
      success: true,
      answer: result.answer,
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      mode: 'suggestions',
      metadata: { creativity, domain: domain || 'general', suggestionCount: 3 },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
