'use client'

import { useChat } from '@ai-sdk/react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { UIMessage as Message } from 'ai'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ReportChat({ reportId }: { reportId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { messages, status, sendMessage, setMessages } = useChat({
    api: '/api/chat',
    body: { report_id: reportId },
  } as any) as {
    messages: Message[]
    status: string
    sendMessage: (message: any) => Promise<any>
    setMessages: (messages: Message[]) => void
  }

  const [input, setInput] = useState('')
  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage = input
    setInput('')
    await sendMessage({ role: 'user', content: userMessage })
  }

  // 加载历史消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch(`/api/report/${reportId}/messages`)
        .then(res => res.json())
        .then(data => {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages)
          }
        })
        .catch(err => console.error('Failed to load messages', err))
    }
  }, [isOpen, reportId, setMessages]) // Removed messages.length dependency to avoid infinite loop if fetch fails or returns empty

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[360px] flex-col sm:max-w-[400px]">
      <Card className="flex h-[600px] flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900">情感咨询助手</div>
              <div className="text-xs text-zinc-500">基于本报告分析</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-zinc-500" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-zinc-50 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-zinc-500">
              <MessageCircle className="h-8 w-8 opacity-20" />
              <p className="text-sm">你可以问我关于这段关系的任何问题，<br/>我会基于八字分析给你建议。</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex w-max max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-2 text-sm',
                    m.role === 'user'
                      ? 'self-end bg-zinc-900 text-white'
                      : 'self-start border border-zinc-200 bg-white text-zinc-700'
                  )}
                >
                  <div className="whitespace-pre-wrap">{(m as any).content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="flex w-max items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  思考中...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-zinc-100 bg-white p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="h-10 w-10 p-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
