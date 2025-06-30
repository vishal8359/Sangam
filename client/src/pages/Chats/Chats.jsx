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
import chats_bg from "../../assets/chats_bg.jpg";
import { useAppContext } from "../../context/AppContext";

export default function ChatsPage() {
  const { societyId, userId, userProfile, axios } = useAppContext();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messagesEndRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [chats, setChats] = useState({}); // { memberId: [{ sender, text }] }
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const selectedChat = selectedChatId ? chats[selectedChatId] || [] : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const message = {
      sender: userId,
      text: newMessage,
      receiver: selectedChatId,
    };

    setChats((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), { ...message }],
    }));

    setNewMessage("");

    try {
      await axios.post("/api/chats/send", message);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleBack = () => setSelectedChatId(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await axios.get(`/api/users/society/${societyId}`);
        if (data.success) {
          const filtered = data.users.filter((u) => u._id !== userId);
          setMembers(filtered);
        }
      } catch (err) {
        console.error("Error loading members:", err);
      }
    };

    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chats/me");
        if (data.success) {
          const grouped = {};
          data.messages.forEach((msg) => {
            const otherId = msg.sender === userId ? msg.receiver : msg.sender;
            if (!grouped[otherId]) grouped[otherId] = [];
            grouped[otherId].push(msg);
          });
          setChats(grouped);
        }
      } catch (err) {
        console.error("Fetch chats error:", err);
      }
    };

    fetchMembers();
    fetchChats();
  }, [societyId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

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
            backgroundColor: "rgba(100, 10, 10, 0.1)",
            zIndex: -1,
          },
        }),
      }}
    >
      {(!isMobile || !selectedChatId) && (
        <Box
          width={isMobile ? "100%" : "30%"}
          borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
          bgcolor={isDark ? "#272727" : "#f5f5f5"}
          sx={{ color: isDark ? "#f5f5ff" : "" }}
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
            {members
              .filter((m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((member) => (
                <ListItem
                  button
                  key={member._id}
                  selected={selectedChatId === member._id}
                  onClick={() => setSelectedChatId(member._id)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    mb: 1,
                    bgcolor:
                      selectedChatId === member._id
                        ? theme.palette.action.selected
                        : "transparent",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={member.avatar || undefined}>
                      {member.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={member.name} />
                </ListItem>
              ))}
          </List>
        </Box>
      )}

      {(!isMobile || selectedChatId !== null) && (
        <Box
          flex={1}
          p={3}
          display="flex"
          flexDirection="column"
          bgcolor={theme.palette.background.default}
          sx={{ flex: 1, minWidth: 0, color: isDark ? "#f5f5ff" : "" }}
        >
          {isMobile && selectedChatId && (
            <Box display="flex" alignItems="center" mb={2}>
              <IconButton onClick={handleBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {members.find((m) => m._id === selectedChatId)?.name || "Chat"}
              </Typography>
            </Box>
          )}

          {!isMobile && selectedChatId && (
            <Typography variant="h6" fontWeight={600} mb={2}>
              {members.find((m) => m._id === selectedChatId)?.name || "Chat"}
            </Typography>
          )}

          <Paper
            elevation={2}
            sx={{
              flex: 1,
              p: 2,
              mb: 2,
              overflowY: "auto",
              overflowX: "auto",
              backgroundColor: isDark ? "#1e1e1e" : "#fdfdfd",
              borderRadius: 2,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {selectedChat.map((msg, idx) => {
              const isYou = msg.sender === userId;
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
                      color: isYou ? "#000" : "#f5f5ff",
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
                "&:hover": { backgroundColor: theme.palette.primary.dark },
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
