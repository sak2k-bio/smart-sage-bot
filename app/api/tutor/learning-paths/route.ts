import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get('level') || 'intermediate'
  const interest = searchParams.get('interest') || undefined

  const learningPaths = [
    { id: 'ai-fundamentals', name: 'AI Fundamentals', description: 'Complete introduction to artificial intelligence concepts', level: 'beginner', duration: '4-6 weeks', modules: ['Introduction to AI','Machine Learning Basics','Neural Networks','AI Applications'], prerequisites: [] },
    { id: 'ml-advanced', name: 'Advanced Machine Learning', description: 'Deep dive into machine learning algorithms and techniques', level: 'intermediate', duration: '6-8 weeks', modules: ['Supervised Learning','Unsupervised Learning','Deep Learning','Model Optimization'], prerequisites: ['Basic statistics','Programming knowledge'] },
    { id: 'rag-systems', name: 'RAG Architecture Mastery', description: 'Build and deploy Retrieval-Augmented Generation systems', level: 'advanced', duration: '3-4 weeks', modules: ['Vector Databases','Embedding Techniques','RAG Pipeline Design','Production Deployment'], prerequisites: ['NLP basics','Python programming','API development'] },
    { id: 'nlp-specialization', name: 'NLP Specialization', description: 'Master natural language processing from basics to advanced', level: 'intermediate', duration: '5-7 weeks', modules: ['Text Preprocessing','Language Models','Sentiment Analysis','Text Generation'], prerequisites: ['Basic ML knowledge'] },
  ]

  let filtered = learningPaths
  if (level !== 'all') filtered = filtered.filter(p => p.level === level || p.level === 'beginner')
  if (interest) filtered = filtered.filter(p => p.name.toLowerCase().includes(interest.toLowerCase()) || p.description.toLowerCase().includes(interest.toLowerCase()))

  return NextResponse.json({ success: true, learningPaths: filtered, metadata: { totalPaths: learningPaths.length, filteredCount: filtered.length, level, interest: interest || 'all' }, timestamp: new Date().toISOString() })
}
