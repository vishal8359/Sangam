import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import { Send, Mic, CameraAlt } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import ForumIcon from "@mui/icons-material/Forum";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AddIcon from "@mui/icons-material/Add";
import chatWindow from "../../assets/ChatWindow.jpg";
import { useAppContext } from "../../context/AppContext";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { keyframes } from "@emotion/react";
import WaveformPlayer from "../../components/WaveformPlayer";

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
    setMembers,
    societyId,
    token,
    buzzMessages,
    setBuzzMessages,
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
  const [audioChunks, setAudioChunks] = useState([]);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const [sendingMedia, setSendingMedia] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(""); // "image", "video", "pdf"
  const [previewUrl, setPreviewUrl] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

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
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await axios.get(`/api/users/buzz/members/${societyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMembers(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch members", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    if (openDialog && societyId) {
      fetchMembers();
    }
  }, [openDialog, societyId]);

  // Filter groups & current
  const groupList = useMemo(() => {
    return buzzGroups.filter((g) => g.members.includes(userId));
  }, [buzzGroups, userId]);

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

  useEffect(() => {
    if (societyId && token) {
      fetchGroups(); // fetch on initial load
    }
  }, [societyId, token]);

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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          stopStream(); // Clean up mic
          return;
        }
        const formData = new FormData();
        formData.append("audio", blob, "voice-message.webm");
        formData.append("sender", userId);
        formData.append("senderName", userProfile?.name || "Unknown");
        formData.append("societyId", societyId);
        formData.append("groupId", currentGroup?._id || "");

        try {
          setSendingMedia(true);
          const res = await axios.post(
            "/api/users/buzz/upload/voice",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const audioUrl = res.data.url;

          const payload = {
            societyId,
            groupId: currentGroup?._id || null,
            sender: userId,
            senderName: userProfile?.name || "Unknown",
            content: "🎤 Voice Message",
            audio: audioUrl,
          };
        } catch (err) {
          console.error("🎙 Audio Upload Failed", err);
        } finally {
          setSendingMedia(false);
          stopStream();
          setRecording(false);
          setMediaRecorder(null);
          audioChunksRef.current = [];
        }
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      discardRecordingRef.current = false;
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // Stops mic
      streamRef.current = null;
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/users/buzz/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const fileUrl = res.data.url;
      const fileType = file.type;

      const payload = {
        societyId,
        groupId: currentGroup?._id || null,
        sender: userId,
        senderName: userProfile?.name || "Unknown",
        content: "📎 Attachment",
        fileUrl,
        fileType,
      };

      socketRef.current.emit("sendBuzzMessage", payload);
    } catch (err) {
      console.error(" File upload failed:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL("image/jpeg");
    stopCamera(); // stop the video stream
    setCapturedImage(dataURL); // set image preview
  };

  const handleSendCapturedImage = async () => {
    if (!capturedImage) return;

    const blob = await (await fetch(capturedImage)).blob();
    const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });

    await handleFileUpload(file); // your existing upload method
    setCapturedImage(null); // close preview after sending
  };

  const openPreview = (type, url) => {
    setPreviewType(type);
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewType("");
    setPreviewUrl("");
  };

  const handleDelete = async (messageId, type) => {
    try {
      const endpoint =
        type === "me"
          ? `/api/users/buzz/message/${messageId}/me`
          : `/api/users/buzz/message/${messageId}/all`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socketRef.current.emit("buzzDeleteMessage", {
        messageId,
        type,
        userId,
      });

      // Instantly remove the message from UI
      setMessages((prevMessages) =>
        type === "me"
          ? prevMessages.filter((msg) => msg._id !== messageId)
          : prevMessages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    content: "🗑 Message deleted",
                    fileUrl: null,
                    audioUrl: null,
                  }
                : msg
            )
      );
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`/api/users/buzz/groups/${societyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newGroups = res.data.groups || [];
      setBuzzGroups(newGroups); // updates context/global state
      return newGroups; // return to use after group creation
    } catch (err) {
      console.error("❌ Failed to fetch groups after creation:", err);
      return [];
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return alert("Enter a group name.");
    if (selectedMembers.length === 0)
      return alert("Select at least one member.");

    try {
      setCreatingGroup(true);

      const members = [...new Set([...selectedMembers, userId])];

      const res = await axios.post(
        "/api/users/buzz/create-group",
        {
          groupName: newGroupName,
          members,
          societyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert("Group created!");
        setOpenDialog(false);
        setNewGroupName("");
        setSelectedMembers([]);

        // Fetch new group list
        const updatedGroups = await fetchGroups();

        // Find index of the new group in the updated list
        const myGroups = updatedGroups.filter((g) =>
          g.members.includes(userId)
        );
        const newGroupIndex = myGroups.findIndex(
          (g) => g.groupName === newGroupName
        );

        // Set tab to newly created group (+1 because 0 is Public)
        if (newGroupIndex !== -1) {
          setTab(newGroupIndex + 1);
        }
        socketRef.current.emit("buzzGroupCreated", {
          societyId,
          group: res.data.group,
        });
      }
    } catch (err) {
      console.error("❌ Error creating group:", err);
      alert("Failed to create group.");
    } finally {
      setCreatingGroup(false);
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
            {groupList.map((g) => (
              <Tab
                key={g._id}
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ color: isDark ? "#fff" : "" }}
                  >
                    <Groups2Icon />
                    &nbsp;{g.groupName}
                  </Box>
                }
              />
            ))}
          </Tabs>

          {
            <Tooltip title="New Group">
              <IconButton onClick={() => setOpenDialog(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          }
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
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            mouseX: e.clientX - 2,
                            mouseY: e.clientY - 4,
                            messageId: msg._id,
                            isSender: msg.sender === userId,
                          });
                        }}
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

                          {msg.fileUrl && msg.fileType?.startsWith("image") ? (
                            <img
                              src={msg.fileUrl}
                              alt="attachment"
                              style={{
                                maxWidth: "300px",
                                height: "auto",
                                borderRadius: "10px",
                                display: "block",
                                marginTop: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => openPreview("image", msg.fileUrl)}
                            />
                          ) : msg.fileUrl &&
                            msg.fileType?.startsWith("video") ? (
                            <video
                              src={msg.fileUrl}
                              style={{
                                width: "300px",
                                borderRadius: 15,
                                display: "block",
                                marginTop: "4px",
                                cursor: "pointer",
                              }}
                              muted
                              autoPlay
                              loop
                              onClick={() => openPreview("video", msg.fileUrl)}
                            />
                          ) : (
                            <Box
                              sx={{
                                bgcolor:
                                  msg.sender === userId
                                    ? theme.palette.grey[300]
                                    : "#121212",
                                color: msg.sender === userId ? "#000" : "#fff",
                                mx: 2,
                                p: 1.5,
                                borderRadius: 2,
                                mt: 0.5,
                                maxWidth: "80%",
                                wordBreak: "break-word",
                                cursor:
                                  msg.content === "🎤 Voice Message"
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {(msg.content === "🎤 Voice Message" &&
                                msg.audio) ||
                              msg.fileType?.startsWith("audio") ? (
                                <WaveformPlayer
                                  audioUrl={msg.audio || msg.fileUrl}
                                  fromSender={msg.sender === userId}
                                />
                              ) : msg.fileUrl ? (
                                msg.fileUrl.endsWith(".mp4") ? (
                                  <video
                                    src={msg.fileUrl}
                                    controls
                                    muted
                                    loop
                                    playsInline
                                    style={{
                                      width: "100%",
                                      maxHeight: 360,
                                      borderRadius: 8,
                                      marginTop: 8,
                                    }}
                                  />
                                ) : msg.fileType?.includes("pdf") ? (
                                  <Typography
                                    onClick={() =>
                                      openPreview("pdf", msg.fileUrl)
                                    }
                                    sx={{
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                    }}
                                  >
                                    📄 View PDF
                                  </Typography>
                                ) : (
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "inherit",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    📎 Download File
                                  </a>
                                )
                              ) : (
                                <Typography variant="body2">
                                  {msg.content}
                                </Typography>
                              )}
                            </Box>
                          )}

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
                  <>
                    <input
                      type="file"
                      id="upload-file"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          handleFileUpload(e.target.files[0]);
                          e.target.value = null; // reset input for re-uploading same file
                        }
                      }}
                    />
                    <label htmlFor="upload-file">
                      <IconButton component="span">
                        <AttachFileIcon />
                      </IconButton>
                    </label>
                  </>

                  <IconButton
                    onClick={() => {
                      if (recording) {
                        mediaRecorder?.stop();
                      } else {
                        handleStartRecording();
                      }
                    }}
                  >
                    <Mic color={recording ? "error" : "inherit"} />
                  </IconButton>

                  <IconButton onClick={startCamera}>
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

                    if (mediaRecorder && mediaRecorder.state === "recording") {
                      mediaRecorder.onstop = null;
                      mediaRecorder.stop();
                    }
                    stopStream();
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
          {sendingMedia && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "8px 12px",
                borderRadius: 2,
                bgcolor: isDark ? "#333" : "#f0f0f0",
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2">Uploading audio...</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Create Group Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Group</DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Group Name"
            fullWidth
            required
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mt: 1 }}
          />

          <Typography variant="subtitle2" mt={2}>
            Select Members
          </Typography>

          <FormGroup>
            {members.length > 0 ? (
              members.map((m) => (
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
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No members available
              </Typography>
            )}
          </FormGroup>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={creatingGroup}>
            Cancel
          </Button>

          <Button
            onClick={handleCreateGroup}
            disabled={
              creatingGroup ||
              !newGroupName.trim() ||
              selectedMembers.length === 0
            }
            variant="contained"
            color="primary"
          >
            {creatingGroup ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={closePreview} fullScreen>
        <Box
          onClick={closePreview}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff",
          }}
        >
          {previewType === "image" && (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: 8,
              }}
            />
          )}

          {previewType === "video" && (
            <video
              src={previewUrl}
              controls
              autoPlay
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: 8,
              }}
            />
          )}

          {previewType === "pdf" && (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
              style={{
                width: "90%",
                height: "90%",
                border: "none",
                borderRadius: 8,
              }}
              title="PDF Preview"
            />
          )}
        </Box>
      </Dialog>
      <Dialog
        open={showCamera || !!capturedImage}
        onClose={() => {
          stopCamera();
          setCapturedImage(null);
        }}
        fullScreen
      >
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            bgcolor: "#000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                style={{ maxWidth: "90%", maxHeight: "80vh", borderRadius: 10 }}
              />
              <Box mt={2} display="flex" gap={2}>
                <Button variant="contained" onClick={handleSendCapturedImage}>
                  Send
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera(); // go back to camera
                  }}
                >
                  Retake
                </Button>
              </Box>
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  maxHeight: "80vh",
                  maxWidth: "90vw",
                  borderRadius: 10,
                }}
              />
              <Box mt={2} display="flex" gap={2}>
                <Button variant="contained" onClick={capturePhoto}>
                  Capture
                </Button>
                <Button variant="outlined" color="error" onClick={stopCamera}>
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={async () => {
            await handleDelete(contextMenu.messageId, "me");
            setContextMenu(null);
          }}
        >
          🧍Delete for Me
        </MenuItem>

        {contextMenu?.isSender && (
          <MenuItem
            onClick={async () => {
              await handleDelete(contextMenu.messageId, "all");
              setContextMenu(null);
            }}
          >
            🌐 Delete for Everyone
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
