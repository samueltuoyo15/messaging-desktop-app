import React, { useEffect, useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setChats, appendChats, setLoading as setChatsLoading } from './store/chatsSlice';
import { setMessages, appendMessages, setLoading as setMessagesLoading } from './store/messagesSlice';
import { useWebSocket } from './hooks/useWebSocket';
import { ChatList } from './components/ChatList';
import { MessageView } from './components/MessageView';
import { Sidebar } from './components/Sidebar';
import { theme } from './theme';
import './App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector(state => state.chats.chats);
  const selectedChatId = useAppSelector(state => state.chats.selectedChatId);
  const hasMoreChats = useAppSelector(state => state.chats.hasMore);
  const messages = useAppSelector(state =>
    selectedChatId ? state.messages.messagesByChatId[selectedChatId] || [] : []
  );
  const hasMoreMessages = useAppSelector(state =>
    selectedChatId ? state.messages.hasMore[selectedChatId] ?? true : false
  );
  const messagesOffset = useAppSelector(state =>
    selectedChatId ? state.messages.offset[selectedChatId] || 0 : 0
  );
  const connectionStatus = useAppSelector(state => state.connection.status);

  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'profile'>('messages');

  // Initialize WebSocket connection
  useWebSocket();

  // Load initial chats
  useEffect(() => {
    const loadChats = async () => {
      dispatch(setChatsLoading(true));
      const initialChats = await window.api.getChats(0, 50);
      dispatch(setChats(initialChats));
      dispatch(setChatsLoading(false));
    };
    loadChats();
  }, [dispatch]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      const loadMessages = async () => {
        dispatch(setMessagesLoading(true));
        const initialMessages = await window.api.getMessages(selectedChatId, 0, 50);
        dispatch(setMessages({ chatId: selectedChatId, messages: initialMessages }));
        dispatch(setMessagesLoading(false));
      };
      loadMessages();
    }
  }, [selectedChatId, dispatch]);

  const handleLoadMoreChats = useCallback(async () => {
    if (hasMoreChats) {
      const nextChats = await window.api.getChats(chats.length, 50);
      if (nextChats.length > 0) {
        dispatch(appendChats(nextChats));
      }
    }
  }, [chats.length, hasMoreChats, dispatch]);

  const handleLoadMoreMessages = useCallback(async () => {
    if (selectedChatId && hasMoreMessages) {
      const nextMessages = await window.api.getMessages(selectedChatId, messagesOffset + 50, 50);
      if (nextMessages.length > 0) {
        dispatch(appendMessages({ chatId: selectedChatId, messages: nextMessages }));
      }
    }
  }, [selectedChatId, hasMoreMessages, messagesOffset, dispatch]);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="chat-sidebar">
        <ChatList
          chats={chats}
          onLoadMore={handleLoadMoreChats}
          connectionStatus={connectionStatus}
        />
      </div>

      <div className="main-content">
        <MessageView
          chatId={selectedChatId || 0}
          messages={messages}
          onLoadMore={handleLoadMoreMessages}
          hasMore={hasMoreMessages}
        />
      </div>
    </div>
  );
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
