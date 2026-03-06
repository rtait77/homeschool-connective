import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isGamesRoute = request.nextUrl.pathname.startsWith('/games')

  if (isGamesRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/signup', request.url))
    }

    // Check trial/subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('trial_end, subscription_status')
      .eq('id', user.id)
      .single()

    const status = profile?.subscription_status
    const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null
    const trialActive = trialEnd && trialEnd > new Date()

    if (status === 'active' || trialActive) {
      return response
    }

    return NextResponse.redirect(new URL('/subscribe', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|pdf)$).*)',
  ],
}
