'use client'

import { useState } from 'react'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useAuth } from '@/hooks/useAuth'

export default function PatientChatPage() {
  const { user } = useAuth()
  const [selectedContact, setSelectedContact] = useState<any>(null)

  // For patient, we might auto-select the doctor or show them in sidebar. 
  // Consistently using sidebar for now.

  if (!user) return null

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      <ChatSidebar 
        onSelectContact={setSelectedContact}
        activeContactId={selectedContact?.id}
        userRole="patient"
      />
      
      <div className="flex-1 bg-slate-50">
        {selectedContact ? (
          <ChatInterface 
            key={selectedContact.auth_user_id}
            recipientId={selectedContact.auth_user_id}
            recipientName={selectedContact.name}
            recipientRole="doctor"
            currentUserId={user.id}
            currentUserRole="patient"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
                <p className="text-lg font-medium">Select your doctor to chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
