import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client with service role key
// Bypasses RLS — use only in API routes for operations that require elevated access
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
        throw new Error('Missing Supabase environment variables for admin client')
    }

    return createClient(url, serviceKey)
}
