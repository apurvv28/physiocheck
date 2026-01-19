'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Camera, Target, Clock, Activity, 
  AlertCircle, CheckCircle, X, RotateCcw,
  Video, Mic, Volume2, Wifi, Play, Pause, Phone
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { WebcamFeedback } from '@/components/webcam/WebcamFeedback'
import { CountdownTimer } from '@/components/animations/CountdownTimer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { api, apiEndpoints } from '@/lib/api'
import Peer from 'simple-peer'

interface LiveSessionData {
  repCount: number
  accuracy: number
  postureStatus: 'good' | 'adjusting' | 'poor'
  feedback: string
  jointAngles: Record<string, number>
}

export default function LiveSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const exerciseId = searchParams.get('exercise')
  
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showCountdown, setShowCountdown] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [doctorName, setDoctorName] = useState('Doctor');
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const [liveSessionData, setLiveSessionData] = useState<LiveSessionData>({
    repCount: 0,
    accuracy: 85,
    postureStatus: 'good',
    feedback: 'Good posture maintained',
    jointAngles: {
      shoulder: 75,
      elbow: 45,
      knee: 60,
      hip: 90
    }
  })
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const myVideo = useRef<HTMLVideoElement>(null)
  const doctorVideo = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<Peer.Instance | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [doctorStream, setDoctorStream] = useState<MediaStream | null>(null)

  // Get User Media on Mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream
        if (myVideo.current) {
          myVideo.current.srcObject = stream
        }
      })
      .catch((err) => {
         console.error("Error accessing media devices:", err)
      })
  }, [])

  // WebSocket Connection
  useEffect(() => {
    const connectWs = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const host = window.location.hostname
      const wsUrl = `ws://${host}:8000/api/v1/ws/patient/session?token=${session.access_token}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        console.log('Connected to session WS')
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)
        
        if (message.type === 'signal') {
          // Incoming signal from Doctor
          handleSignal(message)
        }
      }

      ws.onclose = () => setIsConnected(false)
    }

    if (isStarted) {
        connectWs()
    }

    return () => {
      wsRef.current?.close()
      if (peerRef.current) {
        peerRef.current.destroy()
      }
    }
  }, [isStarted])

  const handleSignal = (message: any) => {
    // If we receive an offer, it means the doctor is initiating (or re-initiating) a call.
    if (message.data.type === 'offer') {
        // If we already have a peer, destroy it to accept the new call
        if (peerRef.current) {
            console.log("Received new offer, destroying old peer");
            peerRef.current.destroy();
            peerRef.current = null;
        }
        createPeer(message.data)
    } else if (peerRef.current && !peerRef.current.destroyed) {
        // For other signals (candidates, etc), pass to existing peer
        try {
            peerRef.current.signal(message.data)
        } catch (err) {
            console.warn("Error signaling peer:", err);
        }
    }
  }

  const createPeer = (signal: any) => {
      const peer = new Peer({
          initiator: false,
          trickle: true,
          stream: streamRef.current || undefined,
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      })

      peer.on('signal', (data) => {
          wsRef.current?.send(JSON.stringify({
              type: 'signal',
              target: 'doctor', // Handled by backend logic (signal_to_doctor)
              data: data
          }))
      })

      peer.on('connect', () => {
          console.log("DEBUG: Patient Peer Connected!");
      })

      peer.on('error', (err) => {
          console.error("DEBUG: Patient Peer Error:", err);
      })

      peer.on('stream', (stream) => {
          console.log("DEBUG: Patient Received Doctor Stream");
          setDoctorStream(stream)
          if (doctorVideo.current) {
              doctorVideo.current.srcObject = stream
          }
      })

      peer.signal(signal)
      peerRef.current = peer
  }
  
  // Timer and Simulation simulation logic
  useEffect(() => {
    if (isStarted && !isPaused) {
      timerRef.current = setInterval(async () => {
        setElapsedTime(prev => prev + 1)
        
        // Simulate live data updates
        if (elapsedTime % 5 === 0) {
           const newData = {
            repCount: liveSessionData.repCount + 1,
            accuracy: Math.min(100, liveSessionData.accuracy + (Math.random() > 0.5 ? 1 : -1)),
            postureStatus: ['good', 'adjusting', 'poor'][Math.floor(Math.random() * 3)] as 'good' | 'adjusting' | 'poor',
            feedback: [
              'Good posture maintained',
              'Keep your back straight',
              'Smooth movement detected',
              'Adjust shoulder position',
              'Perfect form!'
            ][Math.floor(Math.random() * 5)]
          }
          // @ts-ignore
          setLiveSessionData(prev => ({
            ...prev,
            ...newData
          }))

          // Also send update to backend/via websocket?
          // For now, only Local state + Periodic DB update? 
          // Let's rely on final sync for DB, WebSocket for streaming live data?
          if (wsRef.current?.readyState === WebSocket.OPEN) {
             wsRef.current.send(JSON.stringify({
                 type: "exercise_data",
                 ...newData,
                 timestamp: Date.now()
             }))
          }
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isStarted, isPaused, elapsedTime, liveSessionData]) // Added dependencies

  const startSession = async () => {
    if (!exerciseId) {
        alert("No exercise selected")
        return
    }

    try {
        // Create session in DB
        const res = await api.post(apiEndpoints.sessions.create, { 
            exercise_id: exerciseId, 
            status: 'in_progress',
            notes: 'Live session started',
            duration_seconds: 0,
            repetitions: 0
        })
        console.log("Session creation response:", res.data)
        if (res.data && res.data.id) {
            setSessionId(res.data.id)
            setShowCountdown(true)
            setTimeout(() => {
                setShowCountdown(false)
                setIsStarted(true)
            }, 3000)
        }
    } catch (err: any) {
        console.error("Failed to create session in DB:", err)
        console.error("Error details:", err.response?.data)
        alert(`Failed to start session: ${err.response?.data?.detail || err.message}`)
    }
  }

  const endSession = async () => {
    // Update DB
    if (sessionId) {
        try {
            await api.patch(apiEndpoints.sessions.update(sessionId), {
                status: 'completed',
                duration_seconds: elapsedTime,
                repetitions: liveSessionData.repCount,
                accuracy: liveSessionData.accuracy
                // notes?
            })
        } catch (err) {
            console.error("Failed to update session:", err)
        }
    }

    // Send session_ended signal
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: 'session_ended'
        }))
    }

    setIsStarted(false)
    setElapsedTime(0)
    setSessionId(null)
    setLiveSessionData({
      repCount: 0,
      accuracy: 85,
      postureStatus: 'good',
      feedback: 'Good posture maintained',
      jointAngles: { shoulder: 75, elbow: 45, knee: 60, hip: 90 }
    })
    // Close peer
    if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
    }
    setDoctorStream(null)
    
    // Redirect to dashboard
    router.push('/patient/dashboard')
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Helper to set video srcObject safely - memoized to prevent video blinking on re-renders
  const setVideoRef = useCallback((videoElement: HTMLVideoElement | null, streamToSet: MediaStream | null) => {
      if (videoElement && streamToSet) {
          if (videoElement.srcObject !== streamToSet) {
              videoElement.srcObject = streamToSet;
              // Ensure it plays even if pure audio or blocked by heavy load
              videoElement.play().catch(e => console.error("Error playing video:", e));
          }
      }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800">
      {/* Countdown Overlay */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <CountdownTimer duration={3} onComplete={() => {}} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Live Exercise Session</h1>
            <p className="text-slate-600 mt-2">
              Shoulder Rehabilitation - Range of Motion
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-900/20 text-green-400' : 'bg-coral-900/20 text-coral-400'
            }`}>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isConnected ? 'Live Monitoring Active' : 'Waiting for connection...'}
              </span>
            </div>

            {isStarted && (
              <button
                onClick={endSession}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
                <span>End Session</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Webcam Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-teal-900/20">
                      <Camera className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Live Camera Feed</h3>
                      <p className="text-sm text-slate-400">
                        Ensure proper lighting and full body visibility
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Video className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                      <Mic className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {/* Local Video Feed - Patient (Self) - BIG */}
                <video 
                    ref={(el) => setVideoRef(el, streamRef.current)}
                    muted 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
                />

                {/* Remote Doctor Video (Small Window) - REQUIREMENT: Small window must be of doctor */}
                {doctorStream && (
                    <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg border-2 border-slate-700 overflow-hidden shadow-xl z-10">
                        <video 
                            ref={(el) => setVideoRef(el, doctorStream)}
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
                            Doctor
                        </div>
                    </div>
                )}
                
                {/* Start Overlay */}
                {!isStarted && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                      <div className="text-center">
                        <div className="relative w-64 h-64 mx-auto mb-4">
                          <div className="absolute inset-0 bg-linear-to-r from-teal-500/20 to-blue-500/20 rounded-full animate-pulse" />
                          <div className="absolute inset-8 bg-slate-800 rounded-full flex items-center justify-center">
                            <Camera className="w-16 h-16 text-slate-600" />
                          </div>
                        </div>
                        <p className="text-slate-400">
                           Click start to begin session
                        </p>
                      </div>
                    </div>
                )}

                {/* Session controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                  {!isStarted ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startSession}
                      className="flex items-center space-x-2 px-6 py-3 rounded-full bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors duration-200"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start Session</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center space-x-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                      <button
                        onClick={togglePause}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                      >
                        {isPaused ? (
                          <Play className="w-5 h-5 text-white" />
                        ) : (
                          <Pause className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <button 
                        onClick={() => setLiveSessionData(prev => ({ ...prev, repCount: 0 }))}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                      <div className="text-white font-mono text-lg">
                        {formatTime(elapsedTime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Live Feedback (Keep existing) */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
               <div className="p-6">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center space-x-3">
                     <div className="p-2 rounded-lg bg-blue-900/20">
                       <Activity className="w-5 h-5 text-blue-400" />
                     </div>
                     <div>
                       <h3 className="font-semibold text-white">Rep Counter</h3>
                       <p className="text-sm text-slate-400">Current set</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className="text-2xl font-bold text-white">
                       {liveSessionData.repCount}
                     </div>
                     <div className="text-sm text-slate-400">/ 12 reps</div>
                   </div>
                 </div>
                 {/* Rep dots ... */}
                 <div className="space-y-2">
                   {[1].map((set) => (
                      <div key={set} className="flex items-center justify-between">
                         <span className="text-sm text-slate-400">Set {set}</span>
                         <div className="flex items-center space-x-2">
                             {Array.from({length: 12}).map((_, i) => (
                                 <div key={i} className={`w-2 h-2 rounded-full ${i < liveSessionData.repCount ? 'bg-green-500' : 'bg-slate-700'}`} />
                             ))}
                         </div>
                      </div>
                   ))}
                 </div>
               </div>
            </Card>

            <WebcamFeedback
              postureStatus={liveSessionData.postureStatus}
              feedback={liveSessionData.feedback}
              jointAngles={liveSessionData.jointAngles}
            />
          </div>
        </div>
      </div>
    </div>
  )
}