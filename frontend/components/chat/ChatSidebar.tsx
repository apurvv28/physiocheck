'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

interface Contact {
  id: string
  name: string
  avatar_url?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  role: 'doctor' | 'patient'
  auth_user_id: string 
}

interface ChatSidebarProps {
  onSelectContact: (contact: Contact) => void
  activeContactId?: string
  userRole: 'doctor' | 'patient'
}

export function ChatSidebar({ onSelectContact, activeContactId, userRole }: ChatSidebarProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [userRole])

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let contactsData: Contact[] = []

      if (userRole === 'doctor') {
        // Fetch doctor's patients
        // We need to get the doctor's record first
        const { data: doctor } = await supabase.from('doctors').select('id').eq('auth_user_id', user.id).single()
        
        if (doctor) {
            const { data: patients } = await supabase
            .from('patients')
            .select('id, full_name, auth_user_id')
            .eq('doctor_id', doctor.id)
            
            if (patients) {
                contactsData = patients.map(p => ({
                    id: p.id, // This is public.patients.id
                    auth_user_id: p.auth_user_id, // This is auth.users.id
                    name: p.full_name,
                    role: 'patient',
                    lastMessage: 'Tap to start chatting', // TODO: Fetch real last message
                    unreadCount: 0
                }))
            }
        }
      } else {
        // Fetch patient's doctor via Backend API to get proper name from Auth
        try {
            const res = await api.get('/patient/my-doctor')
            if (res.data) {
                contactsData = [{
                    id: res.data.id,
                    auth_user_id: res.data.auth_user_id,
                    name: res.data.name || 'Dr. Physiotherapist',
                    role: 'doctor',
                    lastMessage: 'Tap to start chatting',
                    unreadCount: 0
                }]
            }
        } catch (error) {
            console.error('Failed to fetch my doctor', error)
        }
      }

      setContacts(contactsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-80">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-500">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-slate-500">No contacts found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors text-left ${
                  activeContactId === contact.id ? 'bg-teal-50 hover:bg-teal-50' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  {/* Status dot could go here */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-slate-900 truncate">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {/* 12:30 PM */}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unreadCount && contact.unreadCount > 0 ? (
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">{contact.unreadCount}</span>
                    </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
