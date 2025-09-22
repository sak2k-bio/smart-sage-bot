import { NextResponse } from 'next/server'

export async function GET() {
  const suggestedTopics = [
    { name: 'Artificial Intelligence', description: 'Fundamentals of AI and machine learning', difficulty: 'medium', estimatedQuestions: 10 },
    { name: 'Machine Learning', description: 'Core concepts and algorithms', difficulty: 'medium', estimatedQuestions: 8 },
    { name: 'Natural Language Processing', description: 'Text processing and language understanding', difficulty: 'hard', estimatedQuestions: 6 },
    { name: 'Vector Databases', description: 'Storage and retrieval of high-dimensional data', difficulty: 'hard', estimatedQuestions: 5 },
    { name: 'RAG Architecture', description: 'Retrieval-Augmented Generation systems', difficulty: 'hard', estimatedQuestions: 7 },
  ]
  return NextResponse.json({ success: true, topics: suggestedTopics, timestamp: new Date().toISOString() })
}
