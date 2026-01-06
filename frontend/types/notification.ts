export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'alert' | 'success'
  time: string
  read: boolean
  userId: string
}
