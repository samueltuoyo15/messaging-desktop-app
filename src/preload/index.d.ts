import { ElectronAPI } from '@electron-toolkit/preload'
import { Chat, Message } from '../shared/types'

interface API {
  getChats: (offset: number, limit: number) => Promise<Chat[]>
  getMessages: (chatId: number, offset: number, limit: number) => Promise<Message[]>
  searchMessages: (chatId: number, query: string) => Promise<Message[]>
  searchAllMessages: (query: string) => Promise<Message[]>
  markChatAsRead: (chatId: number) => Promise<{ success: boolean }>
  simulateDisconnect: () => Promise<{ success: boolean }>
  onNewMessage: (callback: (message: any) => void) => void
  onConnectionStatus: (callback: (status: string) => void) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
