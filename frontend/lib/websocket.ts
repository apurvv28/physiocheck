import { useState, useEffect, useCallback, useRef } from 'react'

interface PostureData {
  exercise_id: string
  patient_id: string
  timestamp: string
  angles: Record<string, number>
  rep_count: number
  correct_reps: number
  incorrect_reps: number
  accuracy: number
  posture_status: 'correct' | 'incorrect'
  feedback_message: string
}

interface WebSocketContextType {
  isConnected: boolean
  postureData: PostureData | null
  sendFrame: (base64Frame: string) => void
  connect: (exerciseId: string, patientId: string) => void
  disconnect: () => void
}

export const useWebSocket = (): WebSocketContextType => {
  const [isConnected, setIsConnected] = useState(false)
  const [postureData, setPostureData] = useState<PostureData | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  const connect = useCallback((exerciseId: string, patientId: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/session/start'
    const socket = new WebSocket(`${wsUrl}?exercise_id=${exerciseId}&patient_id=${patientId}`)

    socket.onopen = () => {
      // WebSocket connected
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setPostureData(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing WebSocket message:', error)
      }
    }

    socket.onclose = () => {
      // WebSocket disconnected
      setIsConnected(false)
      socketRef.current = null
    }

    socket.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }

    socketRef.current = socket
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const sendFrame = useCallback((base64Frame: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ frame: base64Frame }))
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    postureData,
    sendFrame,
    connect,
    disconnect
  }
}