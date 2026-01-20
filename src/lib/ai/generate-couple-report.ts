import { generateObject, gateway } from 'ai'

import { calculateBazi } from '@/lib/bazi/calculator'
import { serverEnv } from '@/lib/env/server'
import { reportResultSchema, type CoupleInput } from '@/lib/validation'

export type PromptTemplate = {
  model: string
  system_prompt: string
  user_prompt_template: string
}

function renderUserPrompt(template: string, input: CoupleInput) {
  // 1. 计算八字排盘
  const baziA = calculateBazi(input.personA.birthDate, input.personA.birthTime)
  const baziB = calculateBazi(input.personB.birthDate, input.personB.birthTime)

  // 2. 构造增强的输入数据
  const enrichedInput = {
    ...input,
    analysisData: {
      personA: baziA,
      personB: baziB,
    }
  }

  const inputJson = JSON.stringify(enrichedInput, null, 2)
  return template.replaceAll('{{input_json}}', inputJson)
}

export async function generateCoupleReport(options: {
  input: CoupleInput
  template: PromptTemplate
}) {
  void serverEnv.AI_GATEWAY_API_KEY
  const prompt = renderUserPrompt(options.template.user_prompt_template, options.input)

  const result = await generateObject({
    model: gateway(options.template.model),
    schema: reportResultSchema,
    system: options.template.system_prompt,
    prompt,
  })

  return result.object
}
