import { create } from 'zustand'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string          // same as auth user id
  phone: string       // stored in user_metadata
  plan: 'free' | 'pro' | 'admin'
  expiry_date: string | null
  created_at: string
}

export interface PaymentRecord {
  id: string
  user_id: string
  phone: string
  amount: number
  transaction_id: string
  status: 'pending' | 'verified' | 'rejected'
  created_at: string
  verified_at: string | null
  activation_code: string | null
  duration_days: number
}

interface UserState {
  currentUser: UserProfile | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  isLoggedIn: boolean
  loading: boolean

  // Auth actions
  initialize: () => Promise<void>
  signUp: (phone: string, password: string) => Promise<{ error: string | null }>
  signIn: (phone: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>

  // Profile actions
  fetchProfile: (userId: string) => Promise<UserProfile | null>

  // Payment actions
  submitPayment: (transactionId: string, amount?: number, durationDays?: number) => Promise<PaymentRecord | null>
  getPayments: () => Promise<PaymentRecord[]>
  verifyPayment: (paymentId: string) => Promise<PaymentRecord | null>
  rejectPayment: (paymentId: string) => Promise<boolean>

  // User management
  getAllUsers: () => Promise<UserProfile[]>
  upgradeUser: (userId: string, days: number) => Promise<boolean>

  // Admin reset user password
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>

  // Usage
  checkUsage: () => boolean

  // Helpers
  isPro: () => boolean
  daysRemaining: () => number
  activateWithCode: (code: string) => Promise<boolean>
}

function generateActivationCode(): string {
  return 'DF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    phone: (row.phone as string) || '',
    plan: (row.plan as 'free' | 'pro') || 'free',
    expiry_date: row.expiry_date as string | null,
    created_at: row.created_at as string,
  }
}

function mapPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    phone: row.phone as string,
    amount: row.amount as number,
    transaction_id: row.transaction_id as string,
    status: row.status as 'pending' | 'verified' | 'rejected',
    created_at: row.created_at as string,
    verified_at: row.verified_at as string | null,
    activation_code: row.activation_code as string | null,
    duration_days: (row.duration_days as number) || 30,
  }
}

export const useUserStore = create<UserState>()((set, get) => ({
  currentUser: null,
  supabaseUser: null,
  session: null,
  isLoggedIn: false,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await get().fetchProfile(session.user.id)
      set({
        session,
        supabaseUser: session.user,
        currentUser: profile,
        isLoggedIn: !!profile,
        loading: false,
      })
    } else {
      set({ loading: false })
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await get().fetchProfile(session.user.id)
        set({
          session,
          supabaseUser: session.user,
          currentUser: profile,
          isLoggedIn: !!profile,
        })
      } else {
        set({
          session: null,
          supabaseUser: null,
          currentUser: null,
          isLoggedIn: false,
        })
      }
    })
  },

  signUp: async (phone: string, password: string) => {
    // Supabase Auth uses email field, we store phone in user_metadata
    const email = phone + '@docflow.local'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone },
      },
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        // User exists, try sign in instead
        return get().signIn(phone, password)
      }
      return { error: error.message }
    }

    if (data.user) {
      // Create profile via trigger or manually
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        phone,
        plan: 'free',
        expiry_date: null,
      })
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      set({
        supabaseUser: data.user,
        session: data.session,
        isLoggedIn: true,
        currentUser: {
          id: data.user.id,
          phone,
          plan: 'free',
          expiry_date: null,
          created_at: new Date().toISOString(),
        },
      })
    }

    return { error: null }
  },

  signIn: async (phone: string, password: string) => {
    const email = phone + '@docflow.local'

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: '手机号或密码错误' }
    }

    if (data.user) {
      const profile = await get().fetchProfile(data.user.id)
      if (profile) {
        set({
          supabaseUser: data.user,
          session: data.session,
          isLoggedIn: true,
          currentUser: profile,
        })
      } else {
        // Profile not found (e.g. auth user exists but profile was deleted)
        // Create a new profile
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          phone,
          plan: 'free',
          expiry_date: null,
        })
        if (!upsertError) {
          const newProfile = await get().fetchProfile(data.user.id)
          set({
            supabaseUser: data.user,
            session: data.session,
            isLoggedIn: true,
            currentUser: newProfile || {
              id: data.user.id,
              phone,
              plan: 'free',
              expiry_date: null,
              created_at: new Date().toISOString(),
            },
          })
        }
      }
    }

    return { error: null }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    }
    set({
      currentUser: null,
      supabaseUser: null,
      session: null,
      isLoggedIn: false,
    })
  },

  fetchProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('Fetch profile error:', error)
      return null
    }

    const profile = mapProfile(data)

    // Check if pro plan is expired
    if (profile.plan === 'pro' && profile.expiry_date) {
      if (new Date(profile.expiry_date) < new Date()) {
        // Auto-downgrade expired pro users
        await supabase
          .from('profiles')
          .update({ plan: 'free', expiry_date: null })
          .eq('id', userId)
        profile.plan = 'free'
        profile.expiry_date = null
      }
    }

    return profile
  },

  submitPayment: async (transactionId: string, amount = 29, durationDays = 30) => {
    const { currentUser } = get()
    if (!currentUser) return null

    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: currentUser.id,
        phone: currentUser.phone,
        amount,
        transaction_id: transactionId,
        status: 'pending',
        duration_days: durationDays,
      })
      .select()
      .single()

    if (error) {
      console.error('Submit payment error:', error)
      return null
    }

    return mapPayment(data)
  },

  getPayments: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get payments error:', error)
      return []
    }

    return (data || []).map(mapPayment)
  },

  verifyPayment: async (paymentId: string) => {
    const code = generateActivationCode()

    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        activation_code: code,
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('Verify payment error:', error)
      return null
    }

    return mapPayment(data)
  },

  rejectPayment: async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', paymentId)

    if (error) {
      console.error('Reject payment error:', error)
      return false
    }
    return true
  },

  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get all users error:', error)
      return []
    }

    return (data || []).map(mapProfile)
  },

  upgradeUser: async (userId: string, days: number) => {
    // First get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) return false

    // Protect admin accounts from being overwritten
    if (profile.plan === 'admin') return false

    const baseDate = profile.expiry_date && new Date(profile.expiry_date) > new Date()
      ? new Date(profile.expiry_date)
      : new Date()
    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'pro', expiry_date: newExpiry })
      .eq('id', userId)

    if (error) {
      console.error('Upgrade user error:', error)
      return false
    }

    // Update current user in state if it's the same user
    const { currentUser } = get()
    if (currentUser && currentUser.id === userId) {
      set({
        currentUser: {
          ...currentUser,
          plan: 'pro',
          expiry_date: newExpiry,
        },
      })
    }

    return true
  },

  resetUserPassword: async (userId: string, newPassword: string) => {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      })
      if (error) {
        console.error('Reset password error:', error)
        return false
      }
      return true
    } catch {
      console.error('Reset password exception')
      return false
    }
  },

  activateWithCode: async (code: string) => {
    const { currentUser } = get()
    if (!currentUser) return false

    // Find a verified payment with this activation code for this user
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('activation_code', code.trim().toUpperCase())
      .eq('user_id', currentUser.id)
      .eq('status', 'verified')
      .single()

    if (error || !data) return false

    // Activate: upgrade user using the duration from the payment record
    const payment = mapPayment(data)
    const success = await get().upgradeUser(currentUser.id, payment.duration_days)
    if (success) {
      // Refresh profile from DB to ensure consistency
      const refreshedProfile = await get().fetchProfile(currentUser.id)
      if (refreshedProfile) {
        set({ currentUser: refreshedProfile })
      }
    }
    return success
  },

  checkUsage: () => {
    const { currentUser } = get()
    if (!currentUser) return false
    if (currentUser.plan === 'pro' || currentUser.plan === 'admin') {
      if (currentUser.plan === 'pro' && currentUser.expiry_date) {
        return new Date(currentUser.expiry_date) > new Date()
      }
      return true
    }
    // Free user: check localStorage usage
    try {
      const raw = localStorage.getItem('docflow_usage')
      if (raw) {
        const data = JSON.parse(raw)
        const today = new Date().toISOString().split('T')[0]
        if (data.lastResetDate === today && data.totalUsed >= 3) return false
      }
    } catch {}
    return true
  },

  isPro: () => {
    const { currentUser } = get()
    if (!currentUser) return false
    if (currentUser.plan === 'admin') return true
    if (currentUser.plan !== 'pro' || !currentUser.expiry_date) return false
    return new Date(currentUser.expiry_date) > new Date()
  },

  daysRemaining: () => {
    const { currentUser } = get()
    if (!currentUser || !currentUser.expiry_date) return 0
    const diff = new Date(currentUser.expiry_date).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },
}))
