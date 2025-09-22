import { NextResponse } from 'next/server'
import { createPipeline } from '@/server/pipelines'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, topic, difficulty = 'medium', questionCount = 5 } = body || {}
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required and must be a string' }, { status: 400 })
    }
    const pipeline = createPipeline('quiz')
    const result = await pipeline.process(message, { topic: topic || message, difficulty, questionCount, documentCount: 10 })
    const response: any = {
      success: true,
      questions: result.questions || [],
      thinkingSteps: result.thinkingSteps,
      pipelineInfo: result.pipelineInfo,
      sources: result.sources || [],
      mode: 'quiz',
      metadata: result.metadata || { topic: topic || message, difficulty, questionCount: result.questions?.length || 0 },
      timestamp: new Date().toISOString(),
    }
    if (!result.questions || result.questions.length === 0) {
      response.error = result.error || 'Unable to generate quiz questions for this topic.'
    }
    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', questions: [], timestamp: new Date().toISOString() }, { status: 500 })
  }
}
