import React, { useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setChats, appendChats, setLoading as setChatsLoading } from './store/chatsSlice';
import { setMessages, appendMessages, setLoading as setMessagesLoading } from './store/messagesSlice';
import { useWebSocket } from './hooks/useWebSocket';
import { ChatList } from './components/ChatList';
import { MessageView } from './components/MessageView';
import { ConnectionStatus } from './components/ConnectionStatus';
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
        const chatMessages = await window.api.getMessages(selectedChatId, 0, 50);
        dispatch(setMessages({ chatId: selectedChatId, messages: chatMessages }));
        dispatch(setMessagesLoading(false));
      };
      loadMessages();
    }
  }, [selectedChatId, dispatch]);

  const handleLoadMoreChats = useCallback(async () => {
    if (!hasMoreChats) return;

    const moreChats = await window.api.getChats(chats.length, 50);
    dispatch(appendChats(moreChats));
  }, [chats.length, hasMoreChats, dispatch]);

  const handleLoadMoreMessages = useCallback(async () => {
    if (!selectedChatId || !hasMoreMessages) return;

    const moreMessages = await window.api.getMessages(selectedChatId, messagesOffset, 50);
    dispatch(appendMessages({ chatId: selectedChatId, messages: moreMessages }));
  }, [selectedChatId, messagesOffset, hasMoreMessages, dispatch]);

  const handleSimulateDisconnect = async () => {
    await window.api.simulateDisconnect();
  };

  return (
    <div className="app-container">
      <div className="app-sidebar">
        <ConnectionStatus onSimulateDisconnect={handleSimulateDisconnect} />
        <ChatList chats={chats} onLoadMore={handleLoadMoreChats} />
      </div>
      <div className="app-main">
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
      <AppContent />
    </Provider>
  );
}

export default App;
