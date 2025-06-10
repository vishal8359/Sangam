import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

const dummyChats = [
  {
    id: 1,
    name: "Rohit Sharma",
    avatar: "🧑‍🦱",
    messages: ["Hey!", "Are you coming to the meeting?"],
  },
  {
    id: 2,
    name: "Sneha Roy",
    avatar: "👩‍💼",
    messages: ["Hi there!", "Don’t forget the society party."],
  },
  {
    id: 3,
    name: "Security Guard",
    avatar: "🛡️",
    messages: ["Entry done for Zomato at 8:32 PM"],
  },
];

export default function ChatsPage() {
  const [chats, setChats] = useState(dummyChats);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim() && selectedChatId !== null) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? { ...chat, messages: [...chat.messages, newMessage] }
            : chat
        )
      );
      setNewMessage("");
    }
  };

  const handleBack = () => {
    setSelectedChatId(null);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height={isMobile ? "100%" : "92vh"}
      bgcolor={theme.palette.background.default}
      sx={{ borderRadius: 0, overflow: "hidden" }}
    >
      {/* Sidebar */}
      {(!isMobile || !selectedChatId) && (
        <Box
          width={isMobile ? "100%" : "30%"}
          borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
          bgcolor={theme.palette.background.paper}
          sx={{ minHeight: isMobile ? "100%" : "auto" }}
        >
          <Typography
            variant="h6"
            px={2.5}
            py={1.5}
            fontWeight={700}
            color={theme.palette.mode === "dark" ? "#fff" : "#333"}
          >
            Conversations
          </Typography>
          <Divider />
          <List>
            {chats.map((chat) => (
              <ListItem
                button
                key={chat.id}
                selected={selectedChatId === chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  mb: 1,
                  bgcolor:
                    selectedChatId === chat.id
                      ? theme.palette.action.selected
                      : "transparent",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar>{chat.avatar}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.name}
                  sx={{
                    "& .MuiTypography-root": {
                      color:
                        theme.palette.mode === "dark"
                          ? "#fff"
                          : theme.palette.text.primary,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Chat Area */}
      {(!isMobile || selectedChatId !== null) && (
        <Box
          flex={1}
          p={3}
          display="flex"
          flexDirection="column"
          bgcolor={theme.palette.background.default}
        >
          {/* Mobile back button */}
          {isMobile && selectedChat && (
            <Box display="flex" alignItems="center" mb={2}>
              <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {selectedChat.name}
              </Typography>
            </Box>
          )}

          {!isMobile && selectedChat && (
            <Typography
              variant="h6"
              fontWeight={600}
              mb={2}
              color={theme.palette.text.primary}
            >
              {selectedChat.name}
            </Typography>
          )}

          {/* Messages */}
          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              mb: 2,
              overflowY: "auto",
              backgroundColor:
                theme.palette.mode === "light" ? "#fdfdfd" : "#1e1e1e",
              borderRadius: 2,
            }}
          >
            {selectedChat?.messages.map((msg, idx) => (
              <Typography
                key={idx}
                variant="body1"
                mb={1}
                color={theme.palette.text.primary}
              >
                {msg}
              </Typography>
            ))}
            <div ref={messagesEndRef} />
          </Paper>

          {/* Input */}
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              size="small"
              variant="outlined"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
