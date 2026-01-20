import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const next = url.searchParams.get('next') || '/'

  const supabase = await getSupabaseServerClient()

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin))
      }
      return NextResponse.redirect(new URL(`/auth/confirmed?next=${encodeURIComponent(next)}`, url.origin))
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash: tokenHash,
      })
      if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin))
      }
      return NextResponse.redirect(new URL(`/auth/confirmed?next=${encodeURIComponent(next)}`, url.origin))
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '认证回调失败'
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin))
  }

  return NextResponse.redirect(new URL('/login?error=missing_auth_params', url.origin))
}

