import { createClient } from '@supabase/supabase-js'

// Use placeholder values if environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'

// Create a mock client if we're in a build environment without real credentials
const createMockClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock client' } }),
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock client' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
      download: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    }),
  },
})

// Use real client if we have proper credentials, otherwise use mock
const isMockEnvironment = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

export const supabase = isMockEnvironment ? createMockClient() : createClient(supabaseUrl, supabaseKey)