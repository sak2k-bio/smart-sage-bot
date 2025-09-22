import { NextResponse } from 'next/server'
import { createPipeline } from '@/server/pipelines'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, pipelineMode = 'meta', mode = 'general' } = body || {}
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required and must be a string' }, { status: 400 })
    }
    const pipeline = createPipeline(pipelineMode)
    const result = await pipeline.process(message)
    return NextResponse.json({
      success: true,
      answer: result.answer,
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      mode,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
