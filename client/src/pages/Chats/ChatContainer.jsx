import React, { useState, useRef, useEffect } from "react";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
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

  const selectedMember = members.find((m) => m._id === selectedChatId);
  const [openImage, setOpenImage] = useState(null);

  function isEmojiOnlyMessage(text) {
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    return emojiRegex.test(text.trim());
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSend(file); // Make sure your `handleSend` accepts file input
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);
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

    const handleReceive = (msg) => {
      // If this is a local echo or already exists, skip
      if (msg.local || String(msg.sender) === String(userId)) return;

      const otherUserId =
        String(msg.sender) === String(userId) ? msg.receiver : msg.sender;

      setChats((prev) => {
        const existingMsgs = prev[otherUserId] || [];

        // Optional: avoid true duplicates (based on text/timestamp/etc)
        const isDuplicate = existingMsgs.some(
          (m) => m.text === msg.text && String(m.sender) === String(msg.sender)
        );

        if (isDuplicate) return prev;

        return {
          ...prev,
          [otherUserId]: [...existingMsgs, msg],
        };
      });
    };

    return () => {
      socket.current.off("receive message", handleReceive);
    };
  }, [socket, userId, setChats]);

  const handleSend = async (file = null) => {
    if (!selectedChatId) return;

    const societyId = user.joined_society || user.societyId;

    if (file) {
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
          ...res.data, // returned { sender, receiver, text, fileUrl, etc. }
          local: true,
        };

        // Optimistic UI update
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

    // Handle text messages
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const msg = {
      sender: user._id,
      receiver: selectedChatId,
      text: trimmed,
      societyId,
      local: true,
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
      flex={1}
      p={3}
      display="flex"
      flexDirection="column"
      bgcolor={theme.palette.background.default}
      sx={{
        flex: 1,
        minWidth: 0,
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
        elevation={2}
        sx={{
          flex: 1,
          p: 2,
          mb: 2,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: isDark ? "#1e1e1e" : "#fdfdfd",
          borderRadius: 2,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {selectedChat.map((msg, idx) => {
          const isYou = String(msg.sender) === String(userId);
          return (
            <Box
              key={idx}
              display="flex"
              justifyContent={isYou ? "flex-end" : "flex-start"}
              mb={1}
            >
              <Box
                px={msg.fileUrl || isEmojiOnlyMessage(msg.text) ? 0 : 2}
                py={msg.fileUrl || isEmojiOnlyMessage(msg.text) ? 0 : 1}
                maxWidth="75%"
                borderRadius={
                  msg.fileUrl || isEmojiOnlyMessage(msg.text) ? 0 : 2
                }
                bgcolor={
                  msg.fileUrl
                    ? "transparent"
                    : isEmojiOnlyMessage(msg.text)
                      ? "transparent"
                      : isYou
                        ? "#f5f5f5"
                        : "#000"
                }
                sx={{
                  color:
                    msg.fileUrl || isEmojiOnlyMessage(msg.text)
                      ? undefined
                      : isYou
                        ? "#000"
                        : "#f5f5ff",
                  wordBreak: "break-word",
                }}
              >
                {msg.fileUrl ? (
                  msg.fileType?.startsWith("image") ? (
                    <img
                      src={msg.fileUrl}
                      alt="uploaded"
                      style={{
                        cursor: "pointer",
                        height: "100%",
                        maxWidth: "100px",
                        borderRadius: "8px",
                      }}
                      onClick={() => setOpenImage(msg.fileUrl)}
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
                  <Typography
                    variant={isEmojiOnlyMessage(msg.text) ? "h3" : "body2"}
                    sx={{
                      fontSize: isEmojiOnlyMessage(msg.text)
                        ? "2.5rem"
                        : undefined,
                      background: "transparent",
                      padding: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {msg.text}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Paper>

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
            left={0}
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
                  maxHeight: "90vh",
                  maxWidth: "90vw",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />

              {/* Download Button */}
              <a
                href={openImage}
                download
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
                }}
                onClick={(e) => e.stopPropagation()}
                title="Download"
              >
                ⬇
              </a>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
