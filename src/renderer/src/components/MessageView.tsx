import React, { memo, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from '../../shared/types';
import './MessageView.css';

interface MessageViewProps {
    chatId: number;
    messages: Message[];
    onLoadMore: () => void;
    hasMore: boolean;
}

const MessageItem = memo(({ message, isOwn }: { message: Message; isOwn: boolean }) => {
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message-item ${isOwn ? 'own' : 'other'}`}>
            <div className="message-bubble">
                <div className="message-sender">{message.sender}</div>
                <div className="message-body">{message.body}</div>
                <div className="message-time">{formatTime(message.ts)}</div>
            </div>
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

export const MessageView: React.FC<MessageViewProps> = ({
    chatId,
    messages,
    onLoadMore,
    hasMore
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            setIsSearching(true);
            const results = await window.api.searchMessages(chatId, query);
            setSearchResults(results);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const displayMessages = isSearching ? searchResults : messages;

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const message = displayMessages[index];
        const isOwn = message.sender === 'You'; // Simplified for demo

        return (
            <div style={style}>
                <MessageItem message={message} isOwn={isOwn} />
            </div>
        );
    };

    if (!chatId) {
        return (
            <div className="message-view-empty">
                <div className="empty-state">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" fill="#f5f5f5" />
                        <path d="M40 50h40M40 60h30M40 70h35" stroke="#bdbdbd" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    <h3>Select a chat to start messaging</h3>
                    <p>Choose a conversation from the list to view messages</p>
                </div>
            </div>
        );
    }

    return (
        <div className="message-view-container">
            <div className="message-view-header">
                <div className="header-info">
                    <h3>Chat #{chatId}</h3>
                </div>
                <div className="header-search">
                    <input
                        type="text"
                        placeholder="Search in chat..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="message-list">
                {hasMore && !isSearching && (
                    <button className="load-more-btn" onClick={onLoadMore}>
                        Load older messages
                    </button>
                )}
                <List
                    height={window.innerHeight - 180}
                    itemCount={displayMessages.length}
                    itemSize={100}
                    width="100%"
                >
                    {Row}
                </List>
            </div>
        </div>
    );
};
