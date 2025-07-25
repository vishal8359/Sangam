import React, { useState, useEffect, useRef, useMemo } from "react";
import io from "socket.io-client";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";
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
  CircularProgress,
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

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL;

// Keyframe Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInFromSide = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 5px rgba(255,255,255,0.4); }
  50% { text-shadow: 0 0 15px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6); }
  100% { text-shadow: 0 0 5px rgba(255,255,255,0.4); }
`;

const inputFocus = keyframes`
  0% { box-shadow: 0 0 0px 0px rgba(0, 123, 255, 0.5); }
  100% { box-shadow: 0 0 0px 4px rgba(0, 123, 255, 0); }
`;

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

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle click outside for emoji picker
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

  // Handle scroll for scroll-to-bottom button
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

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await axios.get(`/api/users/buzz/message/${societyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load buzz history:", err);
      }
    };
    if (societyId && token) {
      loadHistory();
    }
  }, [societyId, token, axios]); // Added axios to dependency array

  // Socket.io setup
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("joinBuzz", societyId);

    socket.on("receiveBuzzMessage", (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already present
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    // Handle message deletion from other users
    socket.on(
      "buzzMessageDeleted",
      ({ messageId, type, userId: deletedByUserId }) => {
        setMessages((prevMessages) =>
          type === "me" && deletedByUserId !== userId // Only remove for the specific user who deleted "for me"
            ? prevMessages.filter((msg) => msg._id !== messageId)
            : prevMessages.map((msg) =>
                msg._id === messageId
                  ? {
                      ...msg,
                      content: "🗑 Message deleted",
                      fileUrl: null,
                      audio: null, // ensure audio is also nullified
                      deletedFor:
                        type === "all"
                          ? [...(msg.deletedFor || []), "all"]
                          : [...(msg.deletedFor || []), deletedByUserId],
                    }
                  : msg
              )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [societyId, userId]); // Added userId to dependency array

  // Fetch members for group creation dialog
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
  }, [openDialog, societyId, axios, token, setMembers]); // Added axios, token, setMembers to dependency array

  // Filter groups
  const groupList = useMemo(() => {
    return buzzGroups.filter((g) => g.members.includes(userId));
  }, [buzzGroups, userId]);

  const currentGroup = tab === 0 ? null : groupList[tab - 1];

  // Send message via socket
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

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.unified);
  };

  // Fetch groups on initial load
  useEffect(() => {
    if (societyId && token) {
      fetchGroups();
    }
  }, [societyId, token]); // fetchGroups added to dependencies

  // Filter messages for display based on selected tab
  const getFilteredMessages = () => {
    return messages.filter((m) => {
      const isDeletedForMe = m.deletedFor?.includes(userId);
      const isDeletedForAll = m.deletedFor?.includes("all");

      if (isDeletedForMe || isDeletedForAll) {
        return false; // Exclude messages deleted for the current user or everyone
      }

      if (tab === 0) {
        return m.group === null; // Public messages
      }
      return m.group === currentGroup?._id; // Group messages
    });
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

      audioChunksRef.current = []; // Clear previous chunks
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

        setSendingMedia(true);
        const formData = new FormData();
        formData.append("audio", blob, "voice-message.webm");
        formData.append("sender", userId);
        formData.append("senderName", userProfile?.name || "Unknown");
        formData.append("societyId", societyId);
        formData.append("groupId", currentGroup?._id || "");

        try {
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
          socketRef.current.emit("sendBuzzMessage", payload);
        } catch (err) {
          console.error("Audio Upload Failed", err);
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

    setSendingMedia(true);
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
    } finally {
      setSendingMedia(false);
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
      alert(
        "Camera access denied. Please allow camera permissions in your browser settings."
      );
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

      // Emit to socket to update other clients
      socketRef.current.emit("buzzDeleteMessage", {
        messageId,
        type,
        userId, // Current user's ID to handle "delete for me"
      });

      // Instantly remove the message from UI based on type
      setMessages((prevMessages) =>
        type === "me"
          ? prevMessages.filter((msg) => msg._id !== messageId)
          : prevMessages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    content: "🗑 Message deleted",
                    fileUrl: null,
                    audio: null,
                    deletedFor: msg.deletedFor
                      ? [...msg.deletedFor, "all"]
                      : ["all"], // Mark as deleted for all
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
      console.error("Failed to fetch groups after creation:", err);
      return [];
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return alert("Enter a group name.");
    if (selectedMembers.length === 0)
      return alert("Select at least one member.");

    try {
      setCreatingGroup(true);

      const membersToSend = [...new Set([...selectedMembers, userId])]; // Ensure current user is always a member

      const res = await axios.post(
        "/api/users/buzz/create-group",
        {
          groupName: newGroupName,
          members: membersToSend,
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
      console.error("Error creating group:", err);
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
          boxShadow: isDark
            ? "0px 0px 15px rgba(0,0,0,0.5)"
            : "0px 0px 15px rgba(0,0,0,0.1)",
          borderRadius: 3,
        }}
      >
        {/* Header */}

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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0ms", // Smooth transition
              },
              "& .MuiTab-root": {
                transition:
                  "color 0.2s ease-in-out, transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              },
            }}
          >
            <Tab
              label={
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ color: isDark ? "#fff" : theme.palette.text.primary }}
                >
                  <ForumIcon sx={{ mr: 0.5 }} />
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
                    sx={{ color: isDark ? "#fff" : theme.palette.text.primary }}
                  >
                    <Groups2Icon sx={{ mr: 0.5 }} />
                    &nbsp;{g.groupName}
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Tooltip title="New Group">
            <IconButton
              onClick={() => setOpenDialog(true)}
              sx={{
                ml: 1,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                transition:
                  "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
                "&:hover": {
                  transform: "rotate(90deg) scale(1.1)",
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
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
            border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
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
              backgroundSize: "cover", // Changed from 'cover' to 'contain' for better tile effect, adjust as needed
              backgroundRepeat: "repeat", // Changed from 'repeat-y' to 'repeat'
              backgroundPosition: "center 0",
              filter: "blur(1px) opacity(0.12)",
              zIndex: 0,
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
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: isDark
                  ? theme.palette.grey[700]
                  : theme.palette.grey[400],
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: isDark
                  ? theme.palette.grey[900]
                  : theme.palette.grey[200],
              },
              scrollBehavior: "smooth", // Ensure smooth scrolling
            }}
          >
            <Box>
              {(() => {
                const filtered = getFilteredMessages();
                let lastDate = null;

                return filtered.map((msg, index) => {
                  const msgDate = new Date(msg.createdAt);
                  const formattedDate = formatDate(msg.createdAt);

                  const showDate =
                    !lastDate ||
                    new Date(lastDate).toDateString() !==
                      msgDate.toDateString();
                  lastDate = msgDate;

                  const isMyMessage = msg.sender === userId;
                  const messageBgColor = isMyMessage
                    ? isDark
                      ? "#ccc"
                      : theme.palette.grey[200]
                    : "#000";
                  const messageColor = isMyMessage
                    ? "#000"
                    : isDark
                      ? "#fff"
                      : "#fff";

                  return (
                    <React.Fragment key={msg._id}>
                      {showDate && (
                        <Box
                          display="flex"
                          justifyContent="center"
                          my={2}
                          sx={{ animation: `${fadeIn} 0.5s ease-out` }} // Date fade-in animation
                        >
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
                              transition:
                                "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                            }}
                          >
                            {formattedDate}
                          </Box>
                        </Box>
                      )}

                      <Box
                        display="flex"
                        justifyContent={isMyMessage ? "flex-end" : "flex-start"}
                        mb={1}
                        sx={{
                          animation: `${slideInFromSide} 0.4s ease-out ${index * 0.05}s forwards`, // Staggered message animation
                          opacity: 0, // Start invisible for animation
                          alignItems: "flex-end", // Align items to the bottom for better look with time
                          pr: isMyMessage ? 0 : "10%", // Add some padding on the opposite side
                          pl: isMyMessage ? "10%" : 0,
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            mouseX: e.clientX - 2,
                            mouseY: e.clientY - 4,
                            messageId: msg._id,
                            isSender: isMyMessage,
                          });
                        }}
                      >
                        <Box>
                          {!isMyMessage && (
                            <Typography
                              variant="caption"
                              color={isDark ? "#ccc" : "#333"}
                              sx={{
                                display: "block",
                                mb: 0.5,
                                ml: 2, // Align with message bubble
                                fontWeight: 500,
                                opacity: 0.8,
                              }}
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
                                boxShadow: isDark
                                  ? "0 4px 8px rgba(0,0,0,0.5)"
                                  : "0 4px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
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
                                boxShadow: isDark
                                  ? "0 4px 8px rgba(0,0,0,0.5)"
                                  : "0 4px 8px rgba(0,0,0,0.1)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                              muted
                              autoPlay
                              loop
                              onClick={() => openPreview("video", msg.fileUrl)}
                            />
                          ) : (
                            <Box
                              sx={{
                                bgcolor: messageBgColor,
                                color: messageColor,
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
                                boxShadow: isMyMessage
                                  ? `0 2px 5px ${theme.palette.primary.dark}40`
                                  : isDark
                                    ? "0 2px 5px rgba(0,0,0,0.3)"
                                    : "0 2px 5px rgba(0,0,0,0.1)",
                                transition:
                                  "background-color 0.3s ease-in-out, color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                              }}
                            >
                              {(msg.content === "🎤 Voice Message" &&
                                msg.audio) ||
                              msg.fileType?.startsWith("audio") ? (
                                <WaveformPlayer
                                  audioUrl={msg.audio || msg.fileUrl}
                                  fromSender={isMyMessage}
                                />
                              ) : msg.fileUrl ? (
                                msg.fileUrl.endsWith(".mp4") ||
                                msg.fileUrl.endsWith(".mov") ||
                                msg.fileUrl.includes("reels") ? (
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
                                      boxShadow: isDark
                                        ? "0 4px 8px rgba(0,0,0,0.5)"
                                        : "0 4px 8px rgba(0,0,0,0.1)",
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
                                      color: isMyMessage
                                        ? "inherit"
                                        : theme.palette.info.light,
                                      "&:hover": {
                                        opacity: 0.8,
                                      },
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
                                      color: isMyMessage
                                        ? "inherit"
                                        : theme.palette.info.light,
                                      textDecoration: "underline",
                                      transition: "opacity 0.2s ease-in-out",
                                      "&:hover": {
                                        opacity: 0.8,
                                      },
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
                            sx={{
                              display: "block",
                              mt: 0.5,
                              opacity: 0.6,
                              fontSize: "0.6rem",
                              textAlign: isMyMessage ? "right" : "left",
                              mr: isMyMessage ? 2 : 0,
                              ml: isMyMessage ? 0 : 2,
                              color: isDark ? "#aaa" : "#555",
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
                animation: `${pulse} 1.5s infinite`, // Pulsing animation
                boxShadow: isDark
                  ? "0 4px 10px rgba(0,0,0,0.6)"
                  : "0 4px 10px rgba(0,0,0,0.2)",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  animation: "none",
                },
              }}
            >
              <ArrowDownwardIcon />
            </Fab>
          )}
        </Box>

        {/* Input */}
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
                      sx={{
                        transition:
                          "color 0.2s ease-in-out, transform 0.2s ease-in-out",
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    >
                      <EmojiEmotionsIcon
                        color={showEmojiPicker ? "primary" : "inherit"}
                      />
                    </IconButton>

                    {/* Emoji Picker absolutely positioned */}
                    {showEmojiPicker && (
                      <Box
                        position="absolute"
                        bottom="100%"
                        left={0}
                        zIndex={999}
                        sx={{
                          cursor: "pointer",
                          transformOrigin: "bottom left",
                          bgcolor: (theme) => theme.palette.background.paper,
                          boxShadow: 8,
                          borderRadius: 2,
                          overflow: "hidden",
                          border: (theme) =>
                            `1px solid ${theme.palette.divider}`,
                          animation: `${fadeIn} 0.3s ease-out`,
                        }}
                      >
                        <EmojiPicker
                          onEmojiSelect={(emoji) => {
                            
                            console.dir("Full emoji object:", emoji);
                            // debugger;
                            setMessage((prev) => prev + emoji);
                          }}
                        >
                          <EmojiPicker.Header>
                            <EmojiPicker.Input placeholder="Search emoji" />
                          </EmojiPicker.Header>
                          <EmojiPicker.Group>
                            <EmojiPicker.List />
                          </EmojiPicker.Group>
                        </EmojiPicker>
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
                          e.target.value = null;
                        }
                      }}
                    />
                    <label htmlFor="upload-file">
                      <IconButton
                        component="span"
                        sx={{
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
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
                    sx={{
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <Mic color={recording ? "error" : "inherit"} />
                  </IconButton>

                  <IconButton
                    onClick={startCamera}
                    sx={{
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <CameraAlt />
                  </IconButton>

                  <IconButton
                    onClick={handleSend}
                    color="primary"
                    disabled={!message.trim()}
                    sx={{
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: isDark ? "#2c2c2c" : "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: isDark ? "#444" : "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: isDark ? "#666" : "#999",
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                  borderWidth: "2px",
                  animation: `${inputFocus} 1s forwards`, // Focus animation
                },
              },
            }}
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
              sx={{ animation: `${fadeIn} 0.3s ease-out` }} // Fade in recording indicator
            >
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? "#fff" : "#000",
                  animation: `${pulse} 1.5s infinite`, // Pulsing recording indicator
                }}
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
                      mediaRecorder.onstop = null; // Prevent onstop from firing upload logic
                      mediaRecorder.stop();
                    }
                    stopStream();
                    setRecording(false);
                    setMediaRecorder(null);
                    setAudioChunks([]);
                  }}
                  sx={{
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Delete
                </Button>
                {/* Optional: Add a send button for recording if desired */}
                {/* <Button
                  size="small"
                  color="success"
                  variant="contained"
                  onClick={() => {
                    if (mediaRecorder && mediaRecorder.state === "recording") {
                      mediaRecorder.stop(); // This will trigger onstop and upload
                    }
                  }}
                >
                  Send
                </Button> */}
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
                mt: 1,
                border: "1px solid",
                borderColor: isDark ? "#555" : "#ddd",
                animation: `${fadeIn} 0.3s ease-out`, // Fade in uploading indicator
              }}
            >
              <CircularProgress size={20} color="primary" />
              <Typography variant="body2" color="textSecondary">
                Uploading media...
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Create Group Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        TransitionProps={{ timeout: 300 }} // Smooth dialog entry
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: isDark
              ? "0 8px 30px rgba(0,0,0,0.8)"
              : "0 8px 30px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{ bgcolor: theme.palette.primary.main, color: "#fff" }}
        >
          Create New Group
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Group Name"
            fullWidth
            required
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
            variant="outlined"
            size="small"
          />

          <Typography variant="subtitle2" mt={2} mb={1} color="textSecondary">
            Select Members:
          </Typography>

          <FormGroup sx={{ maxHeight: 200, overflowY: "auto", pr: 1 }}>
            {loadingMembers ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : members.length > 0 ? (
              members.map((m) => (
                <FormControlLabel
                  key={m._id}
                  control={
                    <Checkbox
                      checked={selectedMembers.includes(m._id)}
                      onChange={() => handleToggleMember(m._id)}
                      disabled={m._id === userId}
                    />
                  }
                  label={m.name || m.email}
                  sx={{
                    transition: "background-color 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: isDark
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                    },
                    ...(m._id === userId && {
                      opacity: 0.7,
                      fontStyle: "italic",
                    }), // Style for self
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No members available to add.
              </Typography>
            )}
          </FormGroup>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={creatingGroup}
            variant="outlined"
            color="secondary"
          >
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
            startIcon={
              creatingGroup ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {creatingGroup ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={closePreview}
        fullScreen
        TransitionProps={{ timeout: 300 }} // Smooth dialog entry
      >
        <Box
          onClick={closePreview}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column", // Changed to column for better centering
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.9)"
                : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(5px)", // Subtle blur background
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          <IconButton
            onClick={closePreview}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: isDark ? "white" : "black",
              zIndex: 1000,
              bgcolor: "rgba(0,0,0,0.3)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.5)",
                transform: "scale(1.1)",
              },
              transition:
                "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
            }}
          >
            <AddIcon sx={{ transform: "rotate(45deg)" }} /> {/* Close icon */}
          </IconButton>
          {previewType === "image" && (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: 8,
                boxShadow: isDark
                  ? "0 8px 30px rgba(0,0,0,0.8)"
                  : "0 8px 30px rgba(0,0,0,0.2)",
                objectFit: "contain", // Ensure the image fits within bounds
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
                boxShadow: isDark
                  ? "0 8px 30px rgba(0,0,0,0.8)"
                  : "0 8px 30px rgba(0,0,0,0.2)",
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
                boxShadow: isDark
                  ? "0 8px 30px rgba(0,0,0,0.8)"
                  : "0 8px 30px rgba(0,0,0,0.2)",
              }}
              title="PDF Preview"
            />
          )}
          {/* Add a descriptive text for larger screens, maybe not on mobile */}
          {!isMobile && (
            <Typography
              variant="caption"
              color={isDark ? "textSecondary" : "textPrimary"}
              mt={2}
            >
              Click anywhere or press ESC to close.
            </Typography>
          )}
        </Box>
      </Dialog>

      {/* Camera Capture Dialog */}
      <Dialog
        open={showCamera || !!capturedImage}
        onClose={() => {
          stopCamera();
          setCapturedImage(null);
        }}
        fullScreen
        TransitionProps={{ timeout: 300 }} // Smooth dialog entry
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
            position: "relative", // For absolute positioning of controls
          }}
        >
          <IconButton
            onClick={() => {
              stopCamera();
              setCapturedImage(null);
            }}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "white",
              zIndex: 1000,
              bgcolor: "rgba(0,0,0,0.3)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.5)",
                transform: "scale(1.1)",
              },
              transition:
                "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
            }}
          >
            <AddIcon sx={{ transform: "rotate(45deg)" }} />
          </IconButton>

          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  maxWidth: "90%",
                  maxHeight: "80vh",
                  borderRadius: 10,
                  objectFit: "contain",
                }}
              />
              <Box mt={3} display="flex" gap={2} sx={{ zIndex: 10 }}>
                <Button
                  variant="contained"
                  onClick={handleSendCapturedImage}
                  color="primary"
                  sx={{
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Send Photo
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera(); // go back to camera
                  }}
                  sx={{
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
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
                  bgcolor: "#000", // Ensure black background for video area
                }}
              />
              <Box mt={3} display="flex" gap={2} sx={{ zIndex: 10 }}>
                <Button
                  variant="contained"
                  onClick={capturePhoto}
                  color="primary"
                  sx={{
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Capture Photo
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={stopCamera}
                  sx={{
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* Message Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.6)"
              : "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
        TransitionProps={{ timeout: 150 }} // Smooth menu transition
      >
        <MenuItem
          onClick={async () => {
            await handleDelete(contextMenu.messageId, "me");
            setContextMenu(null);
          }}
          sx={{
            py: 1,
            px: 2,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
            },
            transition: "background-color 0.2s ease-in-out",
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
            sx={{
              py: 1,
              px: 2,
              color: theme.palette.error.main,
              "&:hover": {
                bgcolor: theme.palette.error.light + "10", // Light red hover
              },
              transition:
                "background-color 0.2s ease-in-out, color 0.2s ease-in-out",
            }}
          >
            🌐 Delete for Everyone
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
