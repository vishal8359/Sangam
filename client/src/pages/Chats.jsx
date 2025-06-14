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
import chats_bg from "../assets/chats_bg.jpg"

const dummyChats = [
  {
    id: 1,
    name: "Rohit Sharma",
    avatar: "🧑‍🦱",
    messages: [
      { text: "Hey!", sender: "Rohit Sharma" },
      { text: "Are you coming to the meeting?", sender: "Rohit Sharma" },
    ],
  },
  {
    id: 2,
    name: "Sneha Roy",
    avatar: "👩‍💼",
    messages: [
      { text: "Hi there!", sender: "Sneha Roy" },
      { text: "Don’t forget the society party.", sender: "Sneha Roy" },
    ],
  },
  {
    id: 3,
    name: "Security Guard",
    avatar: "🛡️",
    messages: [
      { text: "Entry done for Zomato at 8:32 PM", sender: "Security Guard" },
    ],
  },
];

export default function ChatsPage() {
  const [chats, setChats] = useState(dummyChats);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim() && selectedChatId !== null) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { text: newMessage, sender: "You" },
                ],
              }
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
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height={isMobile ? "100%" : "92vh"}
      bgcolor={theme.palette.background.default}
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${chats_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(8px)",
          zIndex: -2,
        },
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(100, 10, 10, 0.1)", // slightly darker dim
            zIndex: -1,
          },
        }),
      }}
    >
      {/* Sidebar */}
      {(!isMobile || !selectedChatId) && (
        <Box
          width={isMobile ? "100%" : "30%"}
          borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
          bgcolor={theme.palette.background.paper}
          sx={{
            color: theme.palette.mode === "dark" ? "#f5f5ff" : "",
          }}
        >
          <Typography variant="h6" px={2.5} py={1.5} fontWeight={700}>
            Conversations
          </Typography>
          <Divider />
          <Box px={2.5} py={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <List>
            {chats
              .filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
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
                  <ListItemText primary={chat.name} />
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
          sx={{
            flex: 1,
            minWidth: 0,
            color: theme.palette.mode === "dark" ? "#f5f5ff" : "",
          }}
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
            <Typography variant="h6" fontWeight={600} mb={2}>
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
              overflowX: "auto",
              backgroundColor:
                theme.palette.mode === "light" ? "#fdfdfd" : "#1e1e1e",
              borderRadius: 2,
              scrollbarWidth: "none", // For Firefox
              "&::-webkit-scrollbar": {
                display: "none", // For Chrome, Safari, Edge
              },
            }}
          >
            {selectedChat?.messages.map((msg, idx) => {
              const isYou = msg.sender === "You";
              return (
                <Box
                  key={idx}
                  display="flex"
                  justifyContent={isYou ? "flex-end" : "flex-start"}
                  mb={1}
                >
                  <Box
                    px={2}
                    py={1}
                    maxWidth="75%"
                    borderRadius={2}
                    bgcolor={isYou ? "#f5f5f5" : "#000"}
                    sx={{
                      color: isYou ? "#000" : "#f5f5ff", // Fix text visibility
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </Box>
              );
            })}

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
