'use client'

import { useState } from 'react'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useAuth } from '@/hooks/useAuth'

export default function DoctorChatPage() {
  const { user } = useAuth()
  const [selectedContact, setSelectedContact] = useState<any>(null)

  if (!user) return null

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <ChatSidebar 
        onSelectContact={setSelectedContact}
        activeContactId={selectedContact?.id}
        userRole="doctor"
      />
      
      <div className="flex-1 bg-slate-50">
        {selectedContact ? (
          <ChatInterface 
            key={selectedContact.auth_user_id}
            recipientId={selectedContact.auth_user_id}
            recipientName={selectedContact.name}
            recipientRole="patient"
            currentUserId={user.id}
            currentUserRole="doctor"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
                <p className="text-lg font-medium">Select a patient to start chatting</p>
                <p className="text-sm">Secure, encrypted connection</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
