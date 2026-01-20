import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { AuthBroadcastListener } from '@/app/_components/AuthBroadcastListener'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AI Love 两人八字匹配分析',
  description: '输入双方出生信息，生成八字匹配分析、相处建议与行动计划，并支持保存回看。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthBroadcastListener />
        {children}
      </body>
    </html>
  )
}
