import { NextResponse } from 'next/server'
import { createPipeline } from '@/server/pipelines'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, topic, userLevel = 'intermediate', learningStyle = 'reading' } = body || {}
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required and must be a string' }, { status: 400 })
    }
    const pipeline = createPipeline('tutor')
    const result = await pipeline.process(message, { topic: topic || message, userLevel, learningStyle, documentCount: 8 })
    const response: any = {
      success: true,
      tutorialSections: result.tutorialSections || [],
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      mode: 'tutor',
      metadata: result.metadata || { topic: topic || message, userLevel, learningStyle, sectionCount: result.tutorialSections?.length || 0 },
      timestamp: new Date().toISOString(),
    }
    if (!result.tutorialSections || result.tutorialSections.length === 0) {
      response.error = result.error || 'Unable to generate tutorial content for this topic.'
    }
    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', tutorialSections: [], timestamp: new Date().toISOString() }, { status: 500 })
  }
}
