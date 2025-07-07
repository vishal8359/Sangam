import React, { useState, useRef, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import chat_bg from "../../assets/chats_bg.jpg";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { useAppContext } from "../../context/AppContext";

export default function ChatContainer({
  isMobile,
  selectedChatId,
  members,
  selectedChat,
  newMessage,
  setNewMessage,
  setChats,
  handleBack,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const messagesEndRef = useRef(null);
  const { user, userId, socket, axios, token } = useAppContext();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const selectedMember = members.find((m) => m._id === selectedChatId);
  const [openImage, setOpenImage] = useState(null);
  const chatBoxRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  function isEmojiOnlyMessage(text) {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    return emojiRegex.test(text.trim());
  }
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "--:--";
    }
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
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSend(file);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      // Optional: Give a default filename
      link.download = "chat-image.jpg";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };
  useEffect(() => {
    if (isAutoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleScroll = () => {
      const el = chatBoxRef.current;
      if (!el) return;

      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      // user is near bottom
      const atBottom = distanceFromBottom < 100;

      setShowScrollButton(!atBottom);
      setIsAutoScrollEnabled(atBottom); // ✅ only auto-scroll if at bottom
    };

    const el = chatBoxRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Real-time message receiving
  useEffect(() => {
    if (!socket.current) return;

    const handleMessagesSeen = ({ from }) => {
      console.log("📩 Seen ack from:", from);

      setChats((prev) => {
        const updated = { ...prev };
        if (updated[from]) {
          updated[from] = updated[from].map((msg) =>
            String(msg.sender) === String(userId) ? { ...msg, seen: true } : msg
          );
        }
        return updated;
      });
    };

    socket.current.on("messages seen", handleMessagesSeen);

    return () => {
      socket.current.off("messages seen", handleMessagesSeen);
    };
  }, [socket, userId, setChats]);

  useEffect(() => {
    const onFocus = () => {
      if (selectedChatId && socket.current) {
        socket.current.emit("mark as seen", {
          userId,
          peerId: selectedChatId,
        });
      }
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [selectedChatId, socket, userId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && selectedChatId && socket.current) {
          socket.current.emit("mark as seen", {
            userId,
            peerId: selectedChatId,
          });
          console.log("👁️ Last message visible, marked as seen.");
        }
      },
      {
        root: chatBoxRef.current,
        threshold: 0.8, // 80% of element should be visible
      }
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }

    return () => {
      if (lastMessageRef.current) {
        observer.unobserve(lastMessageRef.current);
      }
    };
  }, [selectedChatId, userId, socket, selectedChat]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("messages seen", ({ from }) => {
      setChats((prev) => {
        const updated = { ...prev };
        if (updated[from]) {
          updated[from] = updated[from].map((msg) =>
            String(msg.sender) === String(userId) ? { ...msg, seen: true } : msg
          );
        }
        return updated;
      });
    });

    return () => {
      socket.current.off("messages seen");
    };
  }, [socket, userId]);

  const handleSend = async (file = null) => {
    if (!selectedChatId) return;

    const societyId = user.joined_society || user.societyId;

    // If both message is empty and no file, return early
    const trimmed = newMessage.trim();
    if (!file && !trimmed) return;

    // Handle FILE Upload
    if (file instanceof File) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sender", user._id);
      formData.append("receiver", selectedChatId);
      formData.append("societyId", societyId);

      try {
        const res = await axios.post("/api/users/chats/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        const msg = {
          ...res.data,
          local: true,
          createdAt: res.data.createdAt || new Date().toISOString(),
        };

        setChats((prev) => ({
          ...prev,
          [selectedChatId]: [...(prev[selectedChatId] || []), msg],
        }));

        socket.current?.emit("send message", msg);
      } catch (err) {
        console.error("❌ File upload failed:", err);
      }

      return;
    }

    // Handle TEXT messages
    const msg = {
      sender: user._id,
      receiver: selectedChatId,
      text: trimmed,
      societyId,
      local: true,
      createdAt: new Date().toISOString(),
    };

    setChats((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), msg],
    }));

    setNewMessage("");

    try {
      socket.current?.emit("send message", msg);
      await axios.post("/api/users/chats/send", msg);
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.default}
      sx={{
        width: "100vw",
        height: "92vh",
        maxHeight: "100vh",
        overflow: "hidden",
        padding: isMobile ? 1 : 3,
        color: isDark ? "#f5f5ff" : undefined,
      }}
    >
      {selectedChatId && (
        <Box display="flex" alignItems="center" mb={2}>
          {isMobile && (
            <IconButton onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" fontWeight={600}>
            {selectedMember?.name || "Chat"}
          </Typography>
        </Box>
      )}

      <Paper
        ref={chatBoxRef}
        elevation={2}
        sx={{
          position: "relative",
          flex: 1,
          p: 0,
          mb: 2,
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${chat_bg})`,
            backgroundSize: "cover",
            backgroundRepeat: "repeat-y",
            backgroundPosition: "center",
            filter: "blur(1.5px) opacity(0.1)",
            zIndex: 0,
          }}
        />
        <Box
          ref={chatBoxRef}
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            overflowY: "auto",
            p: 2,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box position="relative" zIndex={1} width="100%">
            {selectedChat.reduce((acc, msg, idx, arr) => {
              console.log("msg:", msg);
              const isYou = String(msg.sender) === String(userId);
              const msgDate = formatDate(
                msg.createdAt || msg.timestamp || msg.date
              );
              const prevMsg = arr[idx - 1];
              const prevDate = prevMsg
                ? formatDate(prevMsg.createdAt || prevMsg.date)
                : null;

              // Add date header if it's first message or date changed
              if (idx === 0 || msgDate !== prevDate) {
                acc.push(
                  <Box key={`date-${idx}`} textAlign="center" my={2}>
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: "#ccc",
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        color: "#333",
                        display: "inline-block",
                      }}
                    >
                      {msgDate}
                    </Typography>
                  </Box>
                );
              }

              acc.push(
                <Box
                  key={idx}
                  display="flex"
                  justifyContent={isYou ? "flex-end" : "flex-start"}
                  mb={1}
                >
                  <Box
                    px={1.7}
                    py={1}
                    maxWidth="75%"
                    borderRadius={2}
                    bgcolor={isYou ? "#f5f5f5" : "#000"}
                    sx={{
                      color: isYou ? "#000" : "#f5f5ff",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.fileUrl ? (
                      msg.fileType?.startsWith("image") ? (
                        <img
                          src={msg.fileUrl}
                          alt="uploaded"
                          style={{
                            maxWidth: "200px",
                            borderRadius: "8px",
                            marginBottom: 4,
                          }}
                        />
                      ) : (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: isYou ? "#000" : "#f5f5ff",
                            textDecoration: "underline",
                          }}
                        >
                          📎 View File
                        </a>
                      )
                    ) : (
                      <Typography variant="body2">{msg.text}</Typography>
                    )}

                    {/* TIME */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                      gap={0.5}
                      mt={0.5}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isMobile ? "0.5rem" : "0.6rem",
                          color: isYou ? "#333" : "#ccc",
                        }}
                      >
                        {formatTime(msg.createdAt || msg.timestamp)}
                      </Typography>

                      {isYou && (
                        <DoneAllIcon
                          fontSize="small"
                          sx={{
                            color: msg.seen ? "blue" : "gray",
                            verticalAlign: "middle",
                            fontSize: "1rem",
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              );

              return acc;
            }, [])}

            <div
              ref={(el) => {
                messagesEndRef.current = el;
                lastMessageRef.current = el;
              }}
            />
          </Box>
        </Box>
      </Paper>
      {showScrollButton && (
        <Box position="absolute" right={24} bottom={100} zIndex={10}>
          <IconButton
            onClick={scrollToBottom}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              boxShadow: 3,
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>
      )}

      <Box position="relative">
        <Box display="flex" gap={1} alignItems="center">
          <IconButton
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            sx={{
              color: isDark ? "#f5f5f5" : theme.palette.primary.main,
            }}
          >
            <InsertEmoticonIcon />
          </IconButton>
          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* File Attach Icon */}
          <IconButton onClick={() => fileInputRef.current.click()}>
            <AttachFileIcon />
          </IconButton>

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

        {showEmojiPicker && (
          <Box
            ref={emojiPickerRef}
            position="absolute"
            bottom={50}
            left={0}
            zIndex={10}
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji) =>
                setNewMessage((prev) => prev + emoji.native)
              }
              theme={isDark ? "dark" : "light"}
            />
          </Box>
        )}
        {openImage && (
          <Box
            position="fixed"
            top={0}
            left={30}
            width="100vw"
            height="100vh"
            zIndex={1300}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(0, 0, 0, 0.85)"
            onClick={() => setOpenImage(null)}
            sx={{ cursor: "zoom-out" }}
          >
            <Box position="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={openImage}
                alt="Full view"
                style={{
                  maxHeight: "80vh",
                  maxWidth: "80vw",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />

              {/* Download Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(openImage);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "50%",
                  padding: "8px",
                  textDecoration: "none",
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "18px",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Download"
              >
                ⬇
              </button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
