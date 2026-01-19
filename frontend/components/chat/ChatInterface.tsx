'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, MoreVertical, Phone, Video, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useNotifications } from '@/components/providers/NotificationProvider'

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  sender_role: string
  is_read: boolean
  attachment_url?: string
  attachment_type?: string
}

interface ChatInterfaceProps {
  recipientId: string // User's Auth ID (uuid)
  recipientName: string
  recipientRole: string
  currentUserId: string // My Auth ID
  currentUserRole: string
}

export function ChatInterface({ 
  recipientId, 
  recipientName, 
  recipientRole,
  currentUserId,
  currentUserRole
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* Ref to track current props for WebSocket closure usage without re-connecting */
  const recipientIdRef = useRef(recipientId)
  useEffect(() => {
      recipientIdRef.current = recipientId
  }, [recipientId])

  /* Fetch History on Mount */
  useEffect(() => {
      const fetchHistory = async () => {
          try {
              const { data: { session } } = await supabase.auth.getSession()
              const token = session?.access_token
              if (!token) return

              const res = await api.get(`/chat/history/${recipientId}?token=${token}`, {
                  headers: { Authorization: `Bearer ${token}` } 
              })
              if (res.data) {
                  setMessages(res.data)
                  // Scroll to bottom after history load
                  setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100)
              }
          } catch (err) {
              console.error("Failed to fetch history", err)
          }
      }
      fetchHistory()
  }, [recipientId])

  /* WebSocket Connection */
  useEffect(() => {
    let websocket: WebSocket | null = null;
    let isMounted = true;

    // Debug logging for Token
    const initSocket = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        
        // If unmounted while waiting for session
        if (!isMounted) return;

        const token = session?.access_token
        
        if (!token) {
            console.error("ChatInterface: No auth token found")
            return
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        // Ensure we're hitting the correct backend port (8000 for Python) if running locally
        const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/chat?token=${token}`
        
        console.log("ChatInterface: Connecting to", wsUrl)

        websocket = new WebSocket(wsUrl)

        websocket.onopen = () => {
            if (isMounted) {
                console.log("ChatInterface: WS Connected")
                setIsConnected(true)
                setWs(websocket) // Only set state if mounted
            } else {
                websocket?.close()
            }
        }

        websocket.onmessage = (event) => {
            if (!isMounted) return;
            const data = JSON.parse(event.data)
            console.log("ChatInterface: Received", data)
            
            if (data.type === 'new_message' || data.type === 'message_sent') {
                const msg = data.message;
                
                // Filter: Only allow messages relevant to current chat
                // msg.sender_id or msg.recipient_id must match recipientId
                // AND the other ID must match currentUserId (implicit usually, but good to check)
                const currentRecipientId = recipientIdRef.current
                
                const isRelevant = 
                    (msg.sender_id === currentRecipientId) || 
                    (msg.recipient_id === currentRecipientId);

                if (isRelevant) {
                    setMessages(prev => {
                        // Dedup check
                        if (prev.some(m => m.id === msg.id)) {
                            return prev;
                        }
                        return [...prev, msg]
                    })
                    // Scroll to bottom
                    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
                }
            }
        }

        websocket.onclose = (e) => {
            if (isMounted) {
                console.log("ChatInterface: WS Closed", e.code, e.reason)
                setIsConnected(false)
                setWs(null)
            }
        }

        websocket.onerror = (e) => {
            console.error("ChatInterface: WS Error", e)
        }
    }

    initSocket()

    return () => {
        isMounted = false;
        if (websocket) {
            console.log("ChatInterface: Cleaning up WS")
            websocket.close()
        }
    }
  }, []) // Empty dependency array means one socket per mount. (Parent key change forces unmount/remount)


  const { addEphemeralNotification } = useNotifications()

  // Scroll to bottom on new message
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && !fileInputRef.current?.files?.length) || !ws) return

    // Handle Text Message
    if (newMessage.trim()) {
        const messagePayload = {
            recipient_id: recipientId,
            content: newMessage,
            type: 'text'
        }
        ws.send(JSON.stringify(messagePayload))
        setNewMessage('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
          const formData = new FormData()
          formData.append('file', file)
          
          // Determine path based on role? Or just generic upload.
          const { data: session } = await supabase.auth.getSession()
          const token = session.session?.access_token
          
          if (!token) throw new Error("No auth token")

          // Upload to backend
          const res = await api.post('/chat/upload', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  // Authorization header is usually handled by api helper, but ensure logic matches
              }
          })
          
          const { url, type } = res.data
          
          // Send message with attachment
          // Note: Backend expects recipient_id in payload? 
          // Wait, the backend websocket handler treats the payload as the message.
          // But here we are sending a message with attachment.
          // Should we send it via WS? Yes.
          
          if (ws) {
             const messagePayload = {
                recipient_id: recipientId,
                content: `Sent an attachment: ${file.name}`,
                attachment_url: url,
                attachment_type: type, // image/png etc
                type: 'attachment'
            } 
            ws.send(JSON.stringify(messagePayload))
          }

      } catch (error) {
          console.error("Upload failed", error)
          if (addEphemeralNotification) {
              addEphemeralNotification({
                  title: 'Upload Failed',
                  message: 'Could not upload file',
                  type: 'error'
              })
          }
      } finally {
          // Clear input
          if (fileInputRef.current) fileInputRef.current.value = ''
      }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="font-semibold text-teal-700">
                {recipientName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{recipientName}</h3>
            {isConnected ? (
                <span className="flex items-center text-xs text-green-600">
                    <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                    Online
                </span>
            ) : (
                <span className="flex items-center text-xs text-red-500">
                    <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                    Offline (Connection Failed)
                </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <button className="hover:text-slate-600"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-slate-600"><Video className="w-5 h-5" /></button>
          <button className="hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                }`}
              >
                 {msg.attachment_url ? (
                     <div className="mb-2">
                        {msg.attachment_type?.startsWith('image/') ? (
                             <img src={msg.attachment_url} alt="Attachment" className="max-w-full rounded-lg" />
                         ) : (
                             <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 underline text-sm">
                                <Paperclip className="w-4 h-4"/>
                                <span>View Attachment</span>
                             </a>
                         )}
                     </div>
                 ) : null}
                <p className="text-sm">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${
                    isMe ? 'text-teal-100' : 'text-slate-400'
                }`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
