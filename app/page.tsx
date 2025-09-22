"use client"

import dynamic from 'next/dynamic'

// Disable SSR for the chat to avoid hydration mismatches from client-only state like timestamps
const Chat = dynamic(() => import('@/components/ChatInterface').then(m => m.ChatInterface), { ssr: false })

export default function Page() {
  return <Chat />
}
