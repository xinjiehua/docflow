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
  increment: (tool: keyof Omit<UsageState, 'totalUsed' | 'increment'>) => void
  reset: () => void
}

const DAILY_FREE_LIMIT = 5

export const useUsageStore = create<UsageState>((set) => ({
  pdfMergeCount: 0,
  pdfSplitCount: 0,
  pdfWatermarkCount: 0,
  pdfCompressCount: 0,
  convertCount: 0,
  ocrCount: 0,
  batchCount: 0,
  totalUsed: 0,
  increment: (tool) => set((state) => ({
    [tool]: state[tool] + 1,
    totalUsed: state.totalUsed + 1,
  })),
  reset: () => set({
    pdfMergeCount: 0,
    pdfSplitCount: 0,
    pdfWatermarkCount: 0,
    pdfCompressCount: 0,
    convertCount: 0,
    ocrCount: 0,
    batchCount: 0,
    totalUsed: 0,
  }),
}))

export { DAILY_FREE_LIMIT }
