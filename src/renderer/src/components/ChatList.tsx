import React, { useCallback } from 'react';
import { Chat } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChat } from '../store/chatsSlice';
import { List } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import {
    Box,
    Typography,
    Avatar,
    TextField,
    IconButton,
    InputAdornment,
    Badge,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
    Sync as SyncIcon
} from '@mui/icons-material';

interface ChatListProps {
    chats: Chat[];
    onLoadMore: () => void;
    connectionStatus?: 'connected' | 'reconnecting' | 'offline';
}

export const ChatList: React.FC<ChatListProps> = ({ chats, onLoadMore, connectionStatus = 'connected' }) => {
    const dispatch = useAppDispatch();
    const selectedChatId = useAppSelector(state => state.chats.selectedChatId);
    const theme = useTheme();

    const handleChatClick = (chatId: number) => {
        dispatch(selectChat(chatId));
        window.api.markChatAsRead(chatId);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 86400000 && now.getDate() === date.getDate()) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 172800000) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected': return <WifiIcon color="secondary" fontSize="small" />;
            case 'reconnecting': return <SyncIcon color="warning" fontSize="small" sx={{ animation: 'spin 2s linear infinite' }} />;
            case 'offline': return <WifiOffIcon color="error" fontSize="small" />;
            default: return <WifiIcon color="disabled" fontSize="small" />;
        }
    };

    const getConnectionText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Online';
            case 'reconnecting': return 'Reconnecting...';
            case 'offline': return 'Offline';
            default: return '';
        }
    };

    // Row component for react-window
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const chat = chats[index];
        if (!chat) return null; // Safety check

        const isSelected = selectedChatId === chat.id;

        return (
            <div style={style}>
                <Box
                    onClick={() => handleChatClick(chat.id)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        cursor: 'pointer',
                        height: '100%',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        '&:hover': {
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.action.hover, 0.1),
                        },
                        transition: 'background-color 0.2s',
                    }}
                >
                    <Avatar
                        sx={{
                            bgcolor: theme.palette.primary.main, // Updated to primary blue
                            color: theme.palette.primary.contrastText,
                            mr: 2,
                            width: 48,
                            height: 48,
                            fontSize: '1.2rem',
                            fontWeight: 600
                        }}
                    >
                        {chat.title.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography
                                variant="subtitle1"
                                noWrap
                                sx={{ fontWeight: chat.unreadCount > 0 ? 700 : 500, color: theme.palette.text.primary }}
                            >
                                {chat.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: chat.unreadCount > 0 ? theme.palette.secondary.main : theme.palette.text.secondary }}>
                                {formatTime(chat.lastMessageAt)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    color: theme.palette.text.secondary,
                                    maxWidth: '180px'
                                }}
                            >
                                {isSelected ? 'Typing...' : 'Latest message...'}
                            </Typography>

                            {chat.unreadCount > 0 && (
                                <Badge
                                    badgeContent={chat.unreadCount}
                                    color="secondary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontWeight: 'bold',
                                            minWidth: '20px',
                                            height: '20px'
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </div>
        );
    };

    const onRowsRendered = useCallback(({ stopIndex }: { stopIndex: number }) => {
        if (stopIndex >= chats.length - 5) {
            onLoadMore();
        }
    }, [chats.length, onLoadMore]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(8px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="700" sx={{ letterSpacing: '-0.5px' }}>
                        Chats
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={getConnectionText()}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getConnectionIcon()}
                            </Box>
                        </Tooltip>

                        <Tooltip title="Simulate Connection Drop">
                            <IconButton
                                size="small"
                                color="warning"
                                onClick={() => window.api.simulateDisconnect()}
                                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) } }}
                            >
                                <WifiOffIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search chats..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.action.hover, 0.05),
                            '& fieldset': { border: 'none' },
                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) }
                        }
                    }}
                />
            </Box>

            {/* List */}
            <Box sx={{ flex: 1 }}>
                <AutoSizer renderProp={({ height, width }) => (
                    <List
                        rowCount={chats.length}
                        rowHeight={80}
                        rowComponent={Row}
                        onRowsRendered={onRowsRendered}
                        style={{ height: height ?? '100%', width: width ?? '100%' }}
                        rowProps={{}}
                    />
                )} />
            </Box>

            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </Box>
    );
};
