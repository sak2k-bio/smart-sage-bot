import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, status: 'healthy', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() })
}
