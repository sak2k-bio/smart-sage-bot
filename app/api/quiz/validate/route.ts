import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { questionId, selectedAnswer, correctAnswer, explanation } = body || {}
    if (typeof selectedAnswer !== 'number' || typeof correctAnswer !== 'number') {
      return NextResponse.json({ success: false, error: 'selectedAnswer and correctAnswer must be numbers' }, { status: 400 })
    }
    const isCorrect = selectedAnswer === correctAnswer
    return NextResponse.json({
      success: true,
      isCorrect,
      selectedAnswer,
      correctAnswer,
      explanation: explanation || 'No explanation provided',
      feedback: isCorrect ? 'Excellent! You got it right!' : 'Not quite right, but keep learning!',
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
