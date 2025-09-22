import { NextResponse } from 'next/server'
import { createPipeline } from '@/server/pipelines'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, creativity = 'balanced', domain, useContext = true } = body || {}
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required and must be a string' }, { status: 400 })
    }
    const pipeline = createPipeline('suggestions')
    const result = await pipeline.process(message, {
      creativity,
      domain,
      useContext,
      documentCount: 5
    })
    return NextResponse.json({
      success: true,
      suggestions: result.suggestions,
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      mode: 'suggestions',
      metadata: result.metadata,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Suggestions API error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
