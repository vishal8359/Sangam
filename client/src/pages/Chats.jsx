import React, { useState } from "react";
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
  IconButton as MuiIconButton,
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
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSend = () => {
    if (newMessage.trim()) {
      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
      setNewMessage("");
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height={isMobile ? "100%" : "85vh"}
      bgcolor={theme.palette.background.default}
      sx={{ borderRadius: 2, overflow: "hidden" }}
    >
      {/* Sidebar */}
      {(!isMobile || !selectedChat) && (
        <Box
          width={isMobile ? "100%" : "30%"}
          borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
          bgcolor={theme.palette.background.paper}
          sx={{
            minHeight: isMobile ? "100%" : "auto",
          }}
        >
          <Typography
            variant="h6"
            px={2.5}
            py={1.5}
            fontWeight={700}
            color={
              theme.palette.mode === "dark"
                ? "#fff"
                : theme.palette.text.primary
            }
          >
            Conversations
          </Typography>
          <Divider />
          <List>
            {dummyChats.map((chat) => (
              <ListItem
                button
                color={
                  theme.palette.mode === "dark"
                    ? "#fff"
                    : theme.palette.text.primary
                }
                key={chat.id}
                selected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 2,
                  mx: 0,
                  mb: 1,
                  bgcolor:
                    selectedChat?.id === chat.id
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
                  secondary={chat.lastMessage}
                  sx={{
                    "& .MuiTypography-root": {
                      color:
                        theme.palette.mode === "dark"
                          ? "#fff"
                          : theme.palette.text.primary,
                    },
                    "& .MuiTypography-body2": {
                      color:
                        theme.palette.mode === "dark"
                          ? "#ccc"
                          : theme.palette.text.secondary,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Chat Box */}
      {(!isMobile || selectedChat) && (
        <Box
          flex={1}
          p={2}
          display="flex"
          flexDirection="column"
          bgcolor={theme.palette.background.default}
        >
          {/* Back button for mobile */}
          {isMobile && selectedChat && (
            <Box display="flex" alignItems="center" mb={2}>
              <MuiIconButton onClick={handleBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </MuiIconButton>
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
          </Paper>

          {/* Input Field */}
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              variant="outlined"
              size="small"
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSend();
              }}
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
