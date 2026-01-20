import { z } from 'zod'

const personSchema = z.object({
  name: z.string().trim().min(1).max(32).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthPlace: z.string().trim().min(2).max(64).optional(),
})

export const coupleInputSchema = z.object({
  personA: personSchema,
  personB: personSchema,
  question: z.string().max(500).optional(),
})

export type CoupleInput = z.infer<typeof coupleInputSchema>

export const reportResultSchema = z.object({
  title: z.string().min(3).max(60),
  overview: z.string().min(20),
  userQuestionAnalysis: z.string().min(20).optional().describe('AI对用户提出问题的回答，如果没有问题则不返回'),
  scores: z.object({
    communication: z.number().int().min(0).max(100),
    conflict: z.number().int().min(0).max(100),
    intimacy: z.number().int().min(0).max(100),
    stability: z.number().int().min(0).max(100),
    growth: z.number().int().min(0).max(100),
  }),
  baziAnalysis: z.array(
    z.object({
      title: z.string().min(2).max(30),
      content: z.string().min(20),
    })
  ),
  gettingAlongTips: z.array(
    z.object({
      title: z.string().min(2).max(30),
      tips: z.array(z.string().min(4)).min(3).max(10),
    })
  ),
  actionPlan: z.object({
    days7: z.array(
      z.object({
        day: z.string().min(2).max(10),
        tasks: z.array(z.string().min(4)).min(2).max(6),
      })
    ),
    days30: z.array(
      z.object({
        week: z.string().min(2).max(12),
        goals: z.array(z.string().min(4)).min(2).max(8),
      })
    ),
  }),
  disclaimers: z.array(z.string().min(6)).min(1).max(4),
})

export type ReportResult = z.infer<typeof reportResultSchema>

