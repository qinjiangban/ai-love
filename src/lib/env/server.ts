import { z } from 'zod'

const optionalNonEmptyString = (schema: z.ZodTypeAny) =>
  z.preprocess((v) => {
    if (typeof v === 'string' && v.trim() === '') return undefined
    return v
  }, schema)

export const serverEnv = z
  .object({
    SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString(z.string().min(20).optional()),
    AI_GATEWAY_API_KEY: z.string().min(10),
    ADMIN_EMAILS: z.string().optional(),
  })
  .parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  })

export const adminEmails = (serverEnv.ADMIN_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function requireServiceRoleKey() {
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('未配置 SUPABASE_SERVICE_ROLE_KEY（service_role）')
  }
  return key
}
