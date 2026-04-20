import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

let browserClient: SupabaseClient | undefined;

export function createClient(
  options?: SupabaseClientOptions,
): SupabaseClient {
  if (isBrowser()) {
    if (!browserClient) {
      browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        options,
      );
    }
    return browserClient;
  }

  // Server-side
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookies().set(name, value, options);
            });
          } catch {
            // Called from Server Component
          }
        },
      },
      ...options,
    },
  );
}

export function createServiceClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}