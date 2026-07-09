import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  phone: string
  plan: 'free' | 'pro'
  expiryDate: string | null
  createdAt: string
}

export interface PaymentRecord {
  id: string
  userId: string
  phone: string
  amount: number
  transactionId: string
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
  verifiedAt: string | null
  activationCode: string | null
}

interface UserState {
  currentUser: User | null
  isLoggedIn: boolean
  users: Record<string, User>
  payments: PaymentRecord[]
  login: (phone: string) => User
  register: (phone: string) => User
  logout: () => void
  isPro: () => boolean
  daysRemaining: () => number
  submitPayment: (transactionId: string) => PaymentRecord
  addPayment: (payment: PaymentRecord) => void
  verifyPayment: (paymentId: string) => PaymentRecord | null
  getAllPayments: () => PaymentRecord[]
  getAllUsers: () => User[]
  upgradeUser: (userId: string, days: number) => void
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function generateActivationCode() {
  return 'DF-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoggedIn: false,
      users: {},
      payments: [],

      register: (phone: string) => {
        const id = generateId()
        const user: User = {
          id,
          phone,
          plan: 'free',
          expiryDate: null,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          users: { ...state.users, [id]: user },
          currentUser: user,
          isLoggedIn: true,
        }))
        return user
      },

      login: (phone: string) => {
        const state = get()
        const existing = Object.values(state.users).find((u) => u.phone === phone)
        if (existing) {
          // Check if expired
          if (existing.plan === 'pro' && existing.expiryDate) {
            const expired = new Date(existing.expiryDate) < new Date()
            if (expired) {
              const updated = { ...existing, plan: 'free' as const, expiryDate: null }
              set((s) => ({
                users: { ...s.users, [existing.id]: updated },
                currentUser: updated,
                isLoggedIn: true,
              }))
              return updated
            }
          }
          set({ currentUser: existing, isLoggedIn: true })
          return existing
        }
        return get().register(phone)
      },

      logout: () => {
        set({ currentUser: null, isLoggedIn: false })
      },

      isPro: () => {
        const { currentUser } = get()
        if (!currentUser || currentUser.plan !== 'pro' || !currentUser.expiryDate) return false
        return new Date(currentUser.expiryDate) > new Date()
      },

      daysRemaining: () => {
        const { currentUser } = get()
        if (!currentUser || !currentUser.expiryDate) return 0
        const diff = new Date(currentUser.expiryDate).getTime() - new Date().getTime()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
      },

      submitPayment: (transactionId: string) => {
        const { currentUser } = get()
        if (!currentUser) throw new Error('Not logged in')
        const payment: PaymentRecord = {
          id: generateId(),
          userId: currentUser.id,
          phone: currentUser.phone,
          amount: 29,
          transactionId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          verifiedAt: null,
          activationCode: null,
        }
        set((state) => ({
          payments: [...state.payments, payment],
        }))
        return payment
      },

      addPayment: (payment: PaymentRecord) => {
        set((state) => ({
          payments: [...state.payments, payment],
        }))
      },

      verifyPayment: (paymentId: string) => {
        const code = generateActivationCode()
        let updated: PaymentRecord | null = null
        set((state) => {
          const newPayments = state.payments.map((p) => {
            if (p.id === paymentId) {
              updated = {
                ...p,
                status: 'verified',
                verifiedAt: new Date().toISOString(),
                activationCode: code,
              }
              return updated
            }
            return p
          })
          return { payments: newPayments }
        })
        return updated
      },

      getAllPayments: () => get().payments,

      getAllUsers: () => Object.values(get().users),

      upgradeUser: (userId: string, days: number) => {
        set((state) => {
          const user = state.users[userId]
          if (!user) return state

          const baseDate = user.expiryDate && new Date(user.expiryDate) > new Date()
            ? new Date(user.expiryDate)
            : new Date()
          const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

          const updated = { ...user, plan: 'pro' as const, expiryDate: newExpiry }

          // Also update currentUser if it's the same user
          const isCurrentUser = state.currentUser?.id === userId

          return {
            users: { ...state.users, [userId]: updated },
            ...(isCurrentUser ? { currentUser: updated } : {}),
          }
        })
      },
    }),
    {
      name: 'docflow-user-data',
    }
  )
)
