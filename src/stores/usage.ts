import { create } from 'zustand'

interface UsageState {
  pdfMergeCount: number
  pdfSplitCount: number
  pdfWatermarkCount: number
  pdfCompressCount: number
  convertCount: number
  ocrCount: number
  batchCount: number
  totalUsed: number
  lastResetDate: string
  increment: (tool?: string) => boolean
  canUse: () => boolean
  reset: () => void
}

const DAILY_FREE_LIMIT = 3

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function loadFromStorage(): Partial<UsageState> {
  try {
    const raw = localStorage.getItem('docflow_usage')
    if (raw) {
      const data = JSON.parse(raw)
      // Reset if different day
      if (data.lastResetDate !== getTodayStr()) {
        return { lastResetDate: getTodayStr(), totalUsed: 0, pdfMergeCount: 0, pdfSplitCount: 0, pdfWatermarkCount: 0, pdfCompressCount: 0, convertCount: 0, ocrCount: 0, batchCount: 0 }
      }
      return data
    }
  } catch {}
  return {}
}

function saveToStorage(state: UsageState) {
  try {
    localStorage.setItem('docflow_usage', JSON.stringify({
      totalUsed: state.totalUsed,
      lastResetDate: state.lastResetDate,
    }))
  } catch {}
}

const initial = loadFromStorage()

export const useUsageStore = create<UsageState>((set, get) => ({
  pdfMergeCount: initial.pdfMergeCount || 0,
  pdfSplitCount: initial.pdfSplitCount || 0,
  pdfWatermarkCount: initial.pdfWatermarkCount || 0,
  pdfCompressCount: initial.pdfCompressCount || 0,
  convertCount: initial.convertCount || 0,
  ocrCount: initial.ocrCount || 0,
  batchCount: initial.batchCount || 0,
  totalUsed: initial.totalUsed || 0,
  lastResetDate: initial.lastResetDate || getTodayStr(),

  increment: (tool) => {
    const state = get()
    const newState = {
      ...state,
      totalUsed: state.totalUsed + 1,
      lastResetDate: getTodayStr(),
    }
    if (tool && tool in state) {
      (newState as any)[tool] = (state as any)[tool] + 1
    }
    set(newState)
    saveToStorage(newState as UsageState)
    return true
  },

  canUse: () => {
    const state = get()
    // Auto reset if new day
    if (state.lastResetDate !== getTodayStr()) {
      const resetState = { totalUsed: 0, lastResetDate: getTodayStr() }
      set(resetState)
      saveToStorage({ ...state, ...resetState })
      return true
    }
    return state.totalUsed < DAILY_FREE_LIMIT
  },

  reset: () => {
    const resetState = {
      pdfMergeCount: 0,
      pdfSplitCount: 0,
      pdfWatermarkCount: 0,
      pdfCompressCount: 0,
      convertCount: 0,
      ocrCount: 0,
      batchCount: 0,
      totalUsed: 0,
      lastResetDate: getTodayStr(),
    }
    set(resetState)
    saveToStorage(resetState as any)
  },
}))

export { DAILY_FREE_LIMIT }
