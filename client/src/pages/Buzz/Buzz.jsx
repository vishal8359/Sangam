import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Fab,
} from "@mui/material";
import { Send, Mic, CameraAlt } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import ForumIcon from "@mui/icons-material/Forum";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AddIcon from "@mui/icons-material/Add";
import chatWindow from "../../assets/ChatWindow.jpg";
import { useAppContext } from "../../context/AppContext";

import { keyframes } from "@emotion/react";

const SOCKET_SERVER_URL = "http://localhost:5000"; // adjust as needed

export default function SocietyBuzz() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    buzzGroups,
    setBuzzGroups,
    userProfile,
    userId,
    userRole,
    members,
    societyId,
    token,
    axios,
  } = useAppContext();

  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const socketRef = useRef();
  const isDark = theme.palette.mode === "dark";

  const [openDialog, setOpenDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const scrollContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const discardRecordingRef = useRef(false);

  // Auto‑scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;

      const { scrollTop, scrollHeight, clientHeight } = el;

      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await axios.get(`/api/users/buzz/message/${societyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // assume res.data is an array of messages
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load buzz history:", err);
      }
    };
    if (societyId && token) {
      loadHistory();
    }
  }, [societyId, token]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinBuzz", societyId);

    socket.on("receiveBuzzMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [societyId]);

  // Filter groups & current
  const groupList = buzzGroups.filter((g) => g.members.includes(userId));
  const currentGroup = tab === 0 ? null : groupList[tab - 1];

  // Send via socket + optional local echo
  const handleSend = () => {
    if (!message.trim()) return;
    const payload = {
      societyId,
      groupId: currentGroup?._id || null,
      sender: userId,
      senderName: userProfile?.name || "Unknown",
      content: message.trim(),
    };
    socketRef.current.emit("sendBuzzMessage", payload);
    setMessage("");
  };

  // Filter for display
  const getFilteredMessages = () => {
    if (tab === 0) {
      return messages.filter((m) => m.group === null);
    }
    return messages.filter((m) => m.group === currentGroup._id);
  };

  const handleToggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    const trimmed = newGroupName.trim();
    if (
      trimmed &&
      !buzzGroups.some((g) => g.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setBuzzGroups((prev) => [
        ...prev,
        { _id: Date.now().toString(), name: trimmed, members: selectedMembers },
      ]);
    }
    setNewGroupName("");
    setSelectedMembers([]);
    setOpenDialog(false);
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
  };


  return (
    <Box
      sx={{
        width: "100%",
        height: "94vh",
        bgcolor: isDark ? "#121212" : "#f0f0f0",
      }}
    >
      <Paper
        sx={{
          maxWidth: 1200,
          mx: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: isMobile ? 1 : 3,
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: isDark ? "#ccc" : theme.palette.primary.main }}
        >
          Society Buzz
        </Typography>

        {/* Tabs */}
        <Box display="flex" alignItems="center" mb={2}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{
              flexGrow: 1,
              "& .MuiTabs-indicator": {
                backgroundColor: isDark ? "#f5f5f5" : "#122525",
              },
            }}
          >
            <Tab
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ color: isDark ? "#fff" : "" }}
                >
                  <ForumIcon />
                  &nbsp;Public
                </Box>
              }
            />
            {groupList.map((g, i) => (
              <Tab
                key={g._id}
                label={
                  <Box display="flex" alignItems="center">
                    <Groups2Icon />
                    &nbsp;{g.name}
                  </Box>
                }
              />
            ))}
          </Tabs>
          {userRole === "admin" && (
            <Tooltip title="New Group">
              <IconButton onClick={() => setOpenDialog(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Message area */}
        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
            overflow: "hidden",
            borderRadius: 2,
            p: 2,
            bgcolor: isDark ? "#1a1a1a" : "#fff",
          }}
        >
          {/* Animated, tiled, blurred background */}
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
              backgroundPosition: "center 0",
              filter: "blur(1px) opacity(0.12)",
              zIndex: 0,

              // in-SX keyframes for scrolling background up over 60s
              animation: "scrollBg 120s linear infinite",
              "@keyframes scrollBg": {
                from: { backgroundPosition: "center 0" },
                to: { backgroundPosition: "center -1000px" },
              },
            }}
          />

          {/* Scrollable message container */}
          <Box
            ref={scrollContainerRef}
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Box>
              {(() => {
                const filtered = getFilteredMessages();
                let lastDate = null;

                return filtered.map((msg) => {
                  const msgDate = new Date(msg.createdAt);
                  const formattedDate = formatDate(msg.createdAt);

                  const showDate =
                    !lastDate ||
                    new Date(lastDate).toDateString() !==
                      msgDate.toDateString();
                  lastDate = msgDate;

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <Box display="flex" justifyContent="center" my={2}>
                          <Box
                            px={3}
                            py={0.5}
                            borderRadius={10}
                            sx={{
                              bgcolor: isDark ? "#f5f5f5" : "#e0e0e0",
                              color: isDark ? "#121212" : "#000",
                              fontSize: "0.7rem",
                              fontWeight: 300,
                              boxShadow: 0,
                            }}
                          >
                            {formattedDate}
                          </Box>
                        </Box>
                      )}

                      <Box
                        display="flex"
                        justifyContent={
                          msg.sender === userId ? "flex-end" : "flex-start"
                        }
                        mb={1}
                      >
                        <Box>
                          {msg.sender !== userId && (
                            <Typography
                              variant="caption"
                              color={isDark ? "#ccc" : "#333"}
                            >
                              {msg.senderName}
                            </Typography>
                          )}

                          <Box
                            sx={{
                              bgcolor:
                                msg.sender === userId
                                  ? theme.palette.grey[300]
                                  : theme.palette.primary.main,
                              color: msg.sender === userId ? "#000" : "#fff",
                              mx: 2,
                              pl: 2,
                              pr: 2,
                              pt: 1,
                              pb: 1,
                              borderRadius: 2,
                              mt: 0.5,
                              maxWidth: "80%",
                              wordBreak: "break-word",
                            }}
                          >
                            {(
                              msg.content
                            )}
                          </Box>

                          <Typography
                            variant="caption"
                            align="right"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              opacity: 0.6,
                              fontSize: "0.6rem",
                            }}
                          >
                            {formatTime(msg.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </React.Fragment>
                  );
                });
              })()}
            </Box>

            <div ref={bottomRef} />
          </Box>

          {/* FAB only when scrolled up */}
          {showScrollButton && (
            <Fab
              size="small"
              color="primary"
              onClick={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                zIndex: 10,
              }}
            >
              <ArrowDownwardIcon />
            </Fab>
          )}
        </Box>

        {/* Input */}
        {/* Input Wrapper with relative positioning */}
        <Box mt={2} position="relative">
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box position="relative" ref={emojiRef}>
                    <IconButton
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    >
                      <EmojiEmotionsIcon />
                    </IconButton>

                    {/* Emoji Picker absolutely positioned */}
                    {showEmojiPicker && (
                      <Box
                        position="absolute"
                        bottom="100%" // position above the icon
                        left={0}
                        zIndex={999}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={(emoji) =>
                            setMessage((prev) => prev + emoji.native)
                          }
                          theme={theme.palette.mode}
                        />
                      </Box>
                    )}
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Mic />
                  </IconButton>

                  <IconButton>
                    <CameraAlt />
                  </IconButton>
                  <IconButton onClick={handleSend}>
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: isDark ? "#2c2c2c" : "#fff", borderRadius: 2 }}
          />
          {recording && (
            <Box
              mt={1}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1}
              borderRadius={2}
              bgcolor={isDark ? "#333" : "#f5f5f5"}
              border="1px dashed"
              borderColor={isDark ? "#555" : "#ccc"}
            >
              <Typography
                variant="body2"
                sx={{ color: isDark ? "#fff" : "#000" }}
              >
                🎙 Recording...
              </Typography>

              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    discardRecordingRef.current = true;
                    if (mediaRecorder) mediaRecorder.stop();
                    setRecording(false);
                    setMediaRecorder(null);
                    setAudioChunks([]);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Create Group Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Typography variant="subtitle2" mt={2}>
            Select Members
          </Typography>
          <FormGroup>
            {members.map((m) => (
              <FormControlLabel
                key={m._id}
                control={
                  <Checkbox
                    checked={selectedMembers.includes(m._id)}
                    onChange={() => handleToggleMember(m._id)}
                  />
                }
                label={m.name || m.email}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
