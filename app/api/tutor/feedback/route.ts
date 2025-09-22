import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { topic, completedSections, strugglingAreas } = body || {}
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ success: false, error: 'Topic is required and must be a string' }, { status: 400 })
    }

    const completionRate = completedSections?.length || 0
    const hasStruggling = Array.isArray(strugglingAreas) && strugglingAreas.length > 0

    let level = 'good'
    let encouragement = 'Great progress! Keep up the excellent work!'
    let nextSteps: string[] = []

    if (hasStruggling) {
      level = 'needs-improvement'
      encouragement = "Learning takes time - you're doing great by identifying areas to improve!"
      nextSteps = strugglingAreas.map((a: string) => `Review concepts related to: ${a}`)
    } else if (completionRate >= 3) {
      level = 'excellent'
      encouragement = "Outstanding! You've mastered this topic. Ready for advanced concepts?"
      nextSteps = [`Explore advanced ${topic} concepts`, 'Try related topics', `Take a challenging quiz on ${topic}`]
    }

    return NextResponse.json({
      success: true,
      feedback: {
        level,
        encouragement,
        completionRate: `${completionRate} sections completed`,
        nextSteps,
        recommendations: [
          `Continue practicing ${topic} concepts`,
          'Try explaining the concepts to others',
          'Apply the knowledge in practical exercises',
        ],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
