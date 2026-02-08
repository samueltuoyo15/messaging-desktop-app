import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Chat, Message } from '../shared/types'

// Custom APIs for renderer
const api = {
  getChats: (offset: number, limit: number): Promise<Chat[]> => 
    ipcRenderer.invoke('get-chats', offset, limit),
  
  getMessages: (chatId: number, offset: number, limit: number): Promise<Message[]> => 
    ipcRenderer.invoke('get-messages', chatId, offset, limit),
  
  searchMessages: (chatId: number, query: string): Promise<Message[]> => 
    ipcRenderer.invoke('search-messages', chatId, query),
  
  searchAllMessages: (query: string): Promise<Message[]> => 
    ipcRenderer.invoke('search-all-messages', query),
  
  markChatAsRead: (chatId: number): Promise<{ success: boolean }> => 
    ipcRenderer.invoke('mark-chat-read', chatId),
  
  simulateDisconnect: (): Promise<{ success: boolean }> => 
    ipcRenderer.invoke('simulate-disconnect'),

  onNewMessage: (callback: (message: any) => void) => {
    ipcRenderer.on('new-message', (_, message) => callback(message))
  },

  onConnectionStatus: (callback: (status: string) => void) => {
    ipcRenderer.on('connection-status', (_, status) => callback(status))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
