'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Phone, Mail, Save, Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface ProfileData {
  full_name: string
  email: string
  phone: string
  role: string
}

export function UserProfileDialog({ isOpen, onClose }: UserProfileDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    role: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  })
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
      // Reset password state on open
      setPasswordData({ oldPassword: '', newPassword: '' })
      setShowPasswordSection(false)
      setPasswordError('')
      setPasswordSuccess('')
    }
  }, [isOpen])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/profile/me')
      setData({
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        role: res.data.role || ''
      })
    } catch (err) {
      console.error(err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault()
      setPasswordError('')
      setPasswordSuccess('')
      setChangingPassword(true)
      
      try {
          await api.post('/profile/change-password', {
              old_password: passwordData.oldPassword,
              new_password: passwordData.newPassword
          })
          
          setPasswordSuccess("Password changed successfully")
          setPasswordData({ oldPassword: '', newPassword: '' })
          setTimeout(() => setShowPasswordSection(false), 2000)
      } catch (err: any) {
          console.error(err)
          setPasswordError(err.response?.data?.detail || 'Failed to change password')
      } finally {
          setChangingPassword(false)
      }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put('/profile/me', {
        full_name: data.full_name,
        phone: data.phone
      })
      onClose()
      // Optional: Trigger a global user refresh if needed, but for now local state is fine 
      // or rely on next page load. 
      // ideally we update the auth context user object if it holds name.
    } catch (err) {
      console.error(err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Email (Read Only) */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={data.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={data.full_name}
                        onChange={e => setData({ ...data, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={data.phone}
                        onChange={e => setData({ ...data, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                   {/* Role Badge */}
                   <div className="pt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 capitalize">
                      {data.role} Account
                    </span>
                  </div>

                  {/* Password Change Section */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="flex items-center space-x-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                    </button>

                    <AnimatePresence>
                        {showPasswordSection && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-4">
                                    {passwordSuccess && (
                                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                                            {passwordSuccess}
                                        </div>
                                    )}
                                    {passwordError && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                            {passwordError}
                                        </div>
                                    )}
                                    
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.oldPassword}
                                            onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Current Password"
                                        />
                                    </div>
                                    
                                     <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                                            placeholder="New Password"
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handlePasswordChange}
                                            disabled={changingPassword || !passwordData.oldPassword || !passwordData.newPassword}
                                            className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                                        >
                                            {changingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
