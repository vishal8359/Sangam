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
import ForumIcon from "@mui/icons-material/Forum";
import chatWindow from "../assets/ChatWindow.jpg";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

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
  const tabColor = isDark ? "#f5f5f5" : "inherit";
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
  const scrollAnimation = {
    "@keyframes scrollVertical": {
      "0%": { backgroundPositionY: "0%" },
      "100%": { backgroundPositionY: "100%" },
    },
  };

  const getFilteredMessages = () => {
    if (tab === 0) return messages.filter((msg) => !msg.group);
    return messages.filter((msg) => msg.group === currentGroup);
  };

  return (
    <Box
      sx={{
        height: "94vh",
        bgcolor: isDark ? "#121212" : "#f0f0f0",
      }}
    >
      <Paper
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          p: isMobile ? 1 : 3,
          borderRadius: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="h4"
          textAlign="center"
          fontWeight="bold"
          mb={1}
          pt={1}
          sx={{
            color: isDark ? "#ccc" : theme.palette.primary.main,
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
          textColor={isDark ? "#f5f5f5" : "#ccc"}
          indicatorColor="primary"
          sx={{
            mb: 1.5, // Slight margin below the tabs for spacing from chatbox
            px: 1, // Horizontal padding for scrollable area
            "& .MuiTabs-indicator": {
              backgroundColor: isDark ? "#f5f5f5" : "#122525",
              height: 2,
              borderRadius: 2,
            },
          }}
        >
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: tabColor,
                }}
              >
                <ForumIcon sx={{ fontSize: 20 }} />
                Public Chat
              </Box>
            }
            sx={{
              color: tabColor,
              minHeight: "48px",
              px: 2,
            }}
          />

          {dummyGroups.map((g, i) => (
            <Tab
              key={i}
              label={
                <Box display="flex" alignItems="center">
                  <Groups2Icon sx={{ fontSize: 20, mr: 1, color: tabColor }} />
                  {g}
                </Box>
              }
              sx={{
                color: tabColor,
                minHeight: "48px",
                px: 2,
              }}
            />
          ))}
        </Tabs>

        {/* Chat Window */}
        <Box
          sx={{
            height: 600,
            flexGrow: 1,
            overflowY: "auto",
            bgcolor: isDark ? "#1a1a1a" : "#ffffff",
            borderRadius: 2,
            p: 2,
            pt: 2,
            mb: 3,
            boxShadow: isDark ? "0 0 10px #000" : "0 0 5px #ccc",
            maxHeight: isMobile ? 600 : 500,
            position: "relative",
            zIndex: 1,
            ...scrollAnimation,
          }}
        >
          {/* Background Image Layer inside chat box */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${chatWindow})`,
              backgroundSize: "cover",
              backgroundRepeat: "repeat-y",
              backgroundPosition: "center",
              filter: isDark
                ? "blur(6px) opacity(0.2)"
                : "blur(6px) opacity(0.2)",
              borderRadius: 0,
              zIndex: 0,
              animation: "scrollVertical 60s linear infinite",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Chat Content Layer */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              overflowY: "auto",
              height: "100%",
              p: 0,
            }}
          >
            {getFilteredMessages().map((msg, idx) => {
              const isSelf = msg.sender === "self";
              const showName = msg.sender === "group" && msg.senderName;

              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: isSelf ? "flex-end" : "flex-start", 
                    mb: 1.5,
                    mt: idx === 0 ? 0 : 1.5,
                    px: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isSelf ? "flex-end" : "flex-start", // control alignment of the message content box
                    }}
                  >
                    {showName && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: isDark ? "#ccc" : "#121212",
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
                        maxWidth: isMobile ? "75%" : "90%",
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
                        backdropFilter: "blur(4px)",
                        alignSelf: isSelf ? "flex-end" : "flex-start", // push the bubble to the correct side
                      }}
                    >
                      {msg.content}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
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
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Add Emoji">
                  <IconButton size="small" edge="start">
                    <EmojiEmotionsIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
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
                  <IconButton
                    onClick={handleSend}
                    color={isDark ? "#f5f5f5" : "primary"}
                  >
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
