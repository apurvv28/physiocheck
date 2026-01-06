export interface PostureFeedback {
  timestamp: string
  joint: string
  angle: number
  expectedAngle: number
  deviation: number
  feedback: 'correct' | 'warning' | 'incorrect'
  message: string
}

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
}
