import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { Send, Mic, CameraAlt } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";

const dummyGroups = ["Chai Group", "Mandir Group", "Festival Team"];

const dummyMessages = [
  { id: 1, sender: "self", content: "Hey everyone!" },
  { id: 2, sender: "other", content: "Hello! What’s up?" },
  { id: 3, sender: "self", content: "Shall we plan a chai meetup?" },
  {
    id: 4,
    sender: "group",
    group: "Chai Group",
    senderName: "Radha",
    content: "Yes please!",
  },
  {
    id: 5,
    sender: "group",
    group: "Mandir Group",
    senderName: "Suresh",
    content: "Join aarti at 7!",
  },
];

export default function SocietyBuzz() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(dummyMessages);

  const isDark = theme.palette.mode === "dark";

  const dummyGroups = ["Chai Group", "Mandir Group", "Festival Team"];
  const currentGroup = tab > 0 ? dummyGroups[tab - 1] : null;

  const handleSend = () => {
    if (message.trim()) {
      const newMessage =
        tab === 0
          ? { id: Date.now(), sender: "self", content: message }
          : {
              id: Date.now(),
              sender: "self",
              group: currentGroup,
              content: message,
              senderName: "You",
            };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  const getFilteredMessages = () => {
    if (tab === 0) return messages.filter((msg) => !msg.group);
    return messages.filter((msg) => msg.group === currentGroup);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        p: isMobile ? 1 : 3,
        pt: 2,
        bgcolor: isDark ? "#121212" : "#f0f0f0",
        backgroundImage: isDark
          ? "linear-gradient(135deg, #1f1f1f, #2a2a2a)"
          : "linear-gradient(135deg, #fdfbfb, #ebedee)",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: "960px",
          mx: "auto",
          p: isMobile ? 1 : 3,
          borderRadius: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="h4"
          textAlign="center"
          fontWeight="bold"
          mb={2}
          sx={{
            color: theme.palette.primary.main,
            fontSize: "2rem",
            lineHeight: 1.2,
          }}
        >
          Society Buzz
        </Box>

        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Public Chat" />
          {dummyGroups.map((g, i) => (
            <Tab
              key={i}
              label={
                <>
                  <Groups2Icon sx={{ fontSize: 18, mr: 1 }} />
                  {g}
                </>
              }
            />
          ))}
        </Tabs>

        {/* Chat Window */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            bgcolor: isDark ? "#1a1a1a" : "#ffffff",
            borderRadius: 2,
            p: 2,
            mb: 2,
            boxShadow: isDark ? "0 0 10px #000" : "0 0 5px #ccc",
          }}
        >
          {getFilteredMessages().map((msg) => {
            const isSelf = msg.sender === "self";
            const showName = msg.sender === "group" && msg.senderName;

            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: isSelf ? "flex-end" : "flex-start",
                  mb: 1.5,
                  p:0,
                  textAlign: isSelf ? "right" : "left",
                }}
              >
                <Box>
                  {showName && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? "#ccc" : "#555",
                        ml: 1,
                        mb: 0.3,
                        display: "block",
                      }}
                    >
                      {msg.senderName}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      maxWidth: "105%",
                      bgcolor: isSelf
                        ? theme.palette.primary.main
                        : theme.palette.grey[300],
                      color: isSelf ? "white" : "black",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: "0.9rem",
                      whiteSpace: "pre-line",
                      boxShadow: 1,
                    }}
                  >
                    {msg.content}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Chat Input */}
        <TextField
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          variant="outlined"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Record Voice">
                  <IconButton>
                    <Mic />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upload Reels">
                  <IconButton>
                    <CameraAlt />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Send">
                  <IconButton onClick={handleSend} color="primary">
                    <Send />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: isDark ? "#2c2c2c" : "white",
            borderRadius: 2,
            boxShadow: isDark ? "0 0 10px #111" : "0 0 5px #aaa",
          }}
        />
      </Paper>
    </Box>
  );
}
