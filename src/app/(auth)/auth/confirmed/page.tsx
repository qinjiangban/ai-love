import { ConfirmedClient } from './ConfirmedClient'

export const dynamic = 'force-dynamic'

export default async function AuthConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const sp = await searchParams
  const nextUrl = typeof sp.next === 'string' && sp.next.startsWith('/') ? sp.next : '/'
  return <ConfirmedClient nextUrl={nextUrl} />
}

