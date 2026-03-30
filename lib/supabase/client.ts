import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Bypass navigator.locks — Chrome can get a stuck lock that causes
          // signInWithPassword and signOut to hang indefinitely.
          // This runs auth operations directly without cross-tab serialization.
          lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => {
            return await fn()
          },
        },
      }
    )
  }
  return client
}
