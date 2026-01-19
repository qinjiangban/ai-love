import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 [background-image:radial-gradient(800px_circle_at_25%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(800px_circle_at_80%_-10%,rgba(16,185,129,0.10),transparent_55%)]">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl px-4 pb-14 pt-12">
        <section className="grid gap-8">
          <div className="grid gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              结构化关系报告 · 可保存回看
            </div>

            <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl">
              双方八字适配，让建议更清晰、更可执行
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              输入双方出生信息，生成匹配分析、相处建议与 7/30 天行动计划。
              内容用于自我觉察与沟通练习，不用于现实决策。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/analyze" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  开始生成报告
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold text-zinc-900">关键点更明确</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                把优势、摩擦与沟通重点写成可讨论的句子，便于对齐预期。
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold text-zinc-900">行动计划可落地</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                7/30 天任务按节奏拆解：做什么、怎么做、如何复盘。
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-sm font-semibold text-zinc-900">报告可保存回看</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                邮箱登录后自动保存生成记录，随时回看并迭代行动。
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-zinc-900">一份长这样</div>
                <div className="text-xs leading-5 text-zinc-600">
                  结构化章节 + 清晰结论 + 任务清单，读完就知道下一步做什么。
                </div>
              </div>
              <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="grid gap-2">
                  <div className="h-3 w-4/5 rounded bg-zinc-200" />
                  <div className="h-3 w-11/12 rounded bg-zinc-200" />
                  <div className="h-3 w-3/5 rounded bg-zinc-200" />
                  <div className="mt-2 h-3 w-10/12 rounded bg-zinc-200" />
                  <div className="h-3 w-4/6 rounded bg-zinc-200" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mt-14 scroll-mt-24">
          <div className="grid gap-2">
            <div className="text-xs font-semibold text-zinc-500">HOW IT WORKS</div>
            <h2 className="text-xl font-semibold text-zinc-900">三步生成报告</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              先填写信息再登录也可以；登录后才会生成并保存报告。
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-xs font-semibold text-zinc-500">01</div>
              <div className="mt-2 text-sm font-semibold text-zinc-900">填写双方出生信息</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                出生日期必填；出生时间/地点可选，用于更细颗粒度的解读。
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-xs font-semibold text-zinc-500">02</div>
              <div className="mt-2 text-sm font-semibold text-zinc-900">邮箱验证码登录</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                无需密码，登录后可保存报告并在“我的报告”回看。
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-xs font-semibold text-zinc-500">03</div>
              <div className="mt-2 text-sm font-semibold text-zinc-900">生成并查看报告详情</div>
              <div className="mt-2 text-xs leading-5 text-zinc-600">
                自动跳转到报告页，查看分析、建议与行动计划；失败可重试。
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="grid gap-2">
              <div className="text-sm font-semibold text-zinc-900">准备好开始了吗？</div>
              <div className="text-xs leading-5 text-zinc-600">
                生成报告并保存到你的账号，之后可随时回看与复盘。
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/analyze" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  立即开始
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
