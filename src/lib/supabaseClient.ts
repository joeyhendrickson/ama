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
  from: (table: string) => ({
    select: () => {
      if (table === 'artists') {
        // Return fallback artists data
        return Promise.resolve({
          data: [
            {
              id: 'fallback-1',
              name: 'Douggert',
              bio: 'Punk Electronica artist pushing boundaries',
              image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
              spotify_url: '',
              soundcloud_url: '',
              website_url: '',
              status: 'approved'
            },
            {
              id: 'fallback-2',
              name: 'Joey Hendrickson',
              bio: 'Alternative acoustic songwriter',
              image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
              spotify_url: '',
              soundcloud_url: '',
              website_url: '',
              status: 'approved'
            },
            {
              id: 'fallback-3',
              name: 'Columbus Songwriters Association',
              bio: 'Local songwriting collective',
              image_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop',
              spotify_url: '',
              soundcloud_url: '',
              website_url: '',
              status: 'approved'
            }
          ],
          error: null
        })
      }
      return Promise.resolve({ data: [], error: null })
    },
    insert: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Mock client' } }),
    order: () => ({
      limit: () => Promise.resolve({ data: [], error: null })
    }),
    eq: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      })
    })
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