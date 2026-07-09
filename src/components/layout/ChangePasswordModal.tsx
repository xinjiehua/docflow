import { useState } from 'react'
import { X, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  phone: string
}

export default function ChangePasswordModal({ isOpen, onClose, phone }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const resetAndClose = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setShowOld(false)
    setShowNew(false)
    setShowConfirm(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!oldPassword) {
      setError('请输入当前密码')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError('新密码至少6位')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }
    if (oldPassword === newPassword) {
      setError('新密码不能和旧密码相同')
      return
    }

    setLoading(true)
    try {
      // Supabase email = phone + '@docflow.local'
      const email = phone + '@docflow.local'

      // Step 1: Verify old password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      })

      if (signInError) {
        setError('当前密码错误')
        setLoading(false)
        return
      }

      // Step 2: Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message || '修改密码失败')
      } else {
        setSuccess('密码修改成功')
        setTimeout(() => resetAndClose(), 1500)
      }
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-navy-800">修改密码</h2>
              <p className="text-xs text-navy-400">{phone}</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-lg hover:bg-navy-50 transition-colors"
          >
            <X className="w-5 h-5 text-navy-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">当前密码</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入当前密码"
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-600"
              >
                {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">新密码</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6位）"
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">确认新密码</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-600"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />修改中...</>
            ) : (
              '确认修改'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
