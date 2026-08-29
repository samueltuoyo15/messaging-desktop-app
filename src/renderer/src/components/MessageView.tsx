import React, { memo, useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import {
    Box,
    Typography,
    Avatar,
    TextField,
    IconButton,
    Paper,
    InputAdornment,
    Button,
    List,
    ListItem,
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';
import {
    Send as SendIcon,
    MoreVert as MoreVertIcon,
    Phone as PhoneIcon,
    Videocam as VideocamIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    EmojiEmotions as EmojiIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';

interface MessageViewProps {
    chatId: number;
    messages: Message[];
    onLoadMore: () => void;
    hasMore: boolean;
}

const MessageBubble = memo(({ message, isOwn }: { message: Message; isOwn: boolean }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                mb: 2,
                px: 2,
            }}
        >
            {!isOwn && (
                <Avatar
                    sx={{
                        mr: 1.5,
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.secondary.main,
                        fontSize: '0.875rem'
                    }}
                >
                    {message.sender.charAt(0).toUpperCase()}
                </Avatar>
            )}

            <Box sx={{ maxWidth: '70%' }}>
                {!isOwn && (
                    <Typography variant="caption" sx={{ ml: 1, color: theme.palette.text.secondary }}>
                        {message.sender}
                    </Typography>
                )}
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        borderTopLeftRadius: !isOwn ? 0 : 2,
                        borderTopRightRadius: isOwn ? 0 : 2,
                        bgcolor: isOwn ? theme.palette.primary.main : alpha(theme.palette.background.paper, 0.6),
                        color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                >
                    <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                        {message.body}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            textAlign: 'right',
                            mt: 0.5,
                            opacity: 0.8,
                            fontSize: '0.7rem'
                        }}
                    >
                        {new Date(message.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
});

export const MessageView: React.FC<MessageViewProps> = ({
    chatId,
    messages,
    onLoadMore,
    hasMore
}) => {
    const theme = useTheme();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages if near bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, chatId]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;
        // Logic to send message would go here
        setInputValue('');
    };

    if (!chatId) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    p: 4,
                    textAlign: 'center'
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h5" color="text.primary" gutterBottom fontWeight="600">
                        Select a chat to start messaging
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Choose a conversation from the sidebar to view messages
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            {/* Header */}
            <Paper
                component="header"
                square
                elevation={0}
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                        {String(chatId).charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                            Chat #{chatId}
                        </Typography>
                        <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 0.5 }} />
                            Online
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <IconButton color="primary">
                        <PhoneIcon />
                    </IconButton>
                    <IconButton color="primary">
                        <VideocamIcon />
                    </IconButton>
                    <IconButton sx={{ color: theme.palette.text.secondary }}>
                        <SearchIcon />
                    </IconButton>
                    <IconButton sx={{ color: theme.palette.text.secondary }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Paper>

            {/* Messages Area */}
            <Box
                ref={scrollContainerRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundImage: 'radial-gradient(circle at center, #1f2937 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    backgroundColor: theme.palette.background.default
                }}
            >
                {hasMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={onLoadMore}
                            sx={{ borderRadius: 4, textTransform: 'none' }}
                        >
                            Load older messages
                        </Button>
                    </Box>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender === 'You'} // Assuming 'You' is the current user
                    />
                ))}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Paper
                component="footer"
                square
                elevation={0}
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: theme.palette.background.paper
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton color="primary" size="small">
                        <EmojiIcon />
                    </IconButton>
                    <IconButton color="primary" size="small">
                        <AttachFileIcon />
                    </IconButton>

                    <TextField
                        fullWidth
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.action.hover, 0.05)
                            }
                        }}
                    />

                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        sx={{
                            bgcolor: inputValue.trim() ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
};
