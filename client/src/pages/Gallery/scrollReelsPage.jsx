import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Dialog,
  DialogContent,
  TextField,
  Button,
  Divider,
  Popover,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  createTheme,
  ThemeProvider,
  Slide,
  Zoom,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import CommentIcon from "@mui/icons-material/Comment";
import DownloadIcon from "@mui/icons-material/Download";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF4081",
    },
    secondary: {
      main: "#4CAF50",
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h6: {
      fontWeight: 600,
      fontSize: "1.2rem",
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
    caption: {
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ScrollReelsPage() {
  const [commentModal, setCommentModal] = useState({
    open: false,
    reelId: null,
  });
  const { userReels } = useAppContext();
  const [reels, setReels] = useState(userReels || []);
  const [newComment, setNewComment] = useState("");
  const [replyInput, setReplyInput] = useState({ index: null, text: "" });
  const videoRefs = useRef({});
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [activeReelId, setActiveReelId] = useState(null);
  const { token, axios, userId, societyId } = useAppContext();
  const currentReel = reels.find((r) => r.id === commentModal.reelId);
  const [replyEmojiPickers, setReplyEmojiPickers] = useState({});
  const replyEmojiRefs = useRef({});
  const emojiPickerRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [isLikedAnimating, setIsLikedAnimating] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState({
    id: null,
    type: null,
  });

  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [shareTab, setShareTab] = useState(0);
  const [selectedReelId, setSelectedReelId] = useState(null);

  const [members, setMembers] = useState([]);
  const [buzzGroups, setBuzzGroups] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [searchParams] = useSearchParams();
  const reelIdFromUrl = searchParams.get("reel");

  useEffect(() => {
    if (reelIdFromUrl && videoRefs.current[reelIdFromUrl]) {
      videoRefs.current[reelIdFromUrl].scrollIntoView({
        behavior: "hard",
        block: "center",
      });
    }
  }, [reelIdFromUrl]);

  useEffect(() => {
    const fetchShareData = async () => {
      try {
        const memberRes = await axios.get("/api/users/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(memberRes.data);

        const groupRes = await axios.get(
          `/api/users/buzz/groups/${societyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBuzzGroups([
          { _id: "public", name: "Public Group", groupName: "Public Group" },
          ...groupRes.data.groups,
        ]);
      } catch (err) {
        console.error("❌ Failed to load members/groups:", err);
      }
    };

    if (token && societyId) {
      fetchShareData();
    }
  }, [token, societyId]);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await axios.get("/api/users/gallery/reels");

        const updated = res.data.map((reel) => {
          const isLiked = reel.likes.includes(userId);

          const isFollowing = reel.user?.followers
            ?.map((f) => f.toString())
            .includes(userId);

          return {
            ...reel,
            id: reel._id,
            liked: isLiked,
            likesCount: reel.likes.length,
            following: isFollowing,
          };
        });

        setReels(updated);
      } catch (error) {
        console.error("❌ Failed to load reels:", error);
      }
    };

    fetchReels();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const updated = { ...replyEmojiPickers };

      Object.keys(replyEmojiRefs.current).forEach((index) => {
        const ref = replyEmojiRefs.current[index];
        if (ref && !ref.contains(event.target)) {
          updated[index] = false;
        }
      });

      setReplyEmojiPickers(updated);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [replyEmojiPickers]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.9, // Adjust this threshold as needed (e.g., 0.75 or 0.8)
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const reelId = entry.target.getAttribute("data-id");
        const video = videoRefs.current[reelId];

        if (!video) return; // Ensure video element exists

        if (entry.isIntersecting) {
          // When a video enters the viewport and is significantly visible
          setActiveReelId(reelId); // Set the new active reel

          // Pause all other videos
          Object.values(videoRefs.current).forEach((vid) => {
            if (vid && vid.getAttribute("data-id") !== reelId && !vid.paused) {
              vid.pause();
            }
          });

          // Play the active video
          video.play().catch((err) => {
            // Handle play promise rejection (e.g., user hasn't interacted yet)
            if (err.name === "NotAllowedError") {
              console.warn("Autoplay was prevented. User interaction needed.");
              // Optionally, show a play button to the user
            } else {
              console.error("Error playing video:", err);
            }
          });

          // Update view count
          axios
            .put(`/api/users/gallery/reels/${reelId}/view`)
            .catch((err) => console.error("View update failed:", err));
        } else {
          // When a video leaves the viewport
          if (!video.paused) {
            video.pause(); // Explicitly pause videos that are no longer intersecting
          }
        }
      });
    }, observerOptions);

    // Observe all video elements
    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    // Cleanup function
    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [reels]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (id === activeReelId) {
        video.play().catch(() => {});
        video.muted = false;
      } else {
        video.pause();
      }
    });
  }, [activeReelId]);

  const handleToggleMute = (id) => {
    const video = videoRefs.current[id];
    if (video) {
      video.muted = !video.muted;
      -setShowPlayPauseIcon({ id, type: video.muted ? "paused" : "playing" });
      +setShowPlayPauseIcon({ id, type: video.muted ? "muted" : "unmuted" });
      setTimeout(() => setShowPlayPauseIcon({ id: null, type: null }), 1000);
      if (video.paused) video.play().catch(() => {});
    }
  };

  const handleDoubleClick = async (id) => {
    setIsLikedAnimating(true);
    try {
      const res = await axios.put(
        `/api/users/gallery/reels/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReels((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, liked: res.data.liked, likesCount: res.data.likesCount }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to like reel:", err);
    } finally {
      setTimeout(() => setIsLikedAnimating(false), 300);
    }
  };

  const toggleFollow = async (id, userIdToFollow) => {
    try {
      const res = await axios.put(
        `/api/users/user/${userIdToFollow}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReels((prev) =>
        prev.map((reel) =>
          reel.id === id ? { ...reel, following: res.data.following } : reel
        )
      );
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `/api/users/gallery/reels/${commentModal.reelId}/comment`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReels((prev) =>
        prev.map((r) =>
          r.id === commentModal.reelId
            ? { ...r, comments: res.data.comments }
            : r
        )
      );
      setNewComment("");
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const addReply = async (index) => {
    if (!replyInput.text.trim()) return;

    try {
      const res = await axios.post(
        `/api/users/gallery/reels/${commentModal.reelId}/comment/${index}/reply`,
        { text: replyInput.text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReels((prev) =>
        prev.map((r) =>
          r.id === commentModal.reelId
            ? { ...r, comments: res.data.comments }
            : r
        )
      );
      setReplyInput({ index: null, text: "" });
      setReplyEmojiPickers({});
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;

    const mins = Math.floor(diff / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    const weeks = Math.floor(days / 7);

    if (weeks >= 1) return `${weeks}wk.`;
    if (days >= 1) return `${days}dys.`;
    if (hrs >= 1) return `${hrs}hrs.`;
    if (mins >= 1) return `${mins}mins.`;
    return `Just now`;
  };
  const handleDownload = async (url, filename) => {
    const downloadPromise = fetch(url, { mode: "cors" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch file");
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      });

    toast.promise(downloadPromise, {
      loading: "Downloading...",
      success: "Download complete!",
      error: "Download failed",
    });
  };

  const handleShare = async (reelId, targetId, type) => {
    try {
      const reel = reels.find((r) => r.id === reelId);
      if (!reel) throw new Error("Reel not found");

      await axios.post(
        `/api/users/gallery/reels/send`,
        {
          senderId: userId,
          receiverId: type === "user" ? targetId : null,
          groupId: type === "group" ? targetId : null,
          reelUrl: reel.videoUrl,
          societyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reel shared!");
      setShareAnchorEl(null);
    } catch (err) {
      console.error("❌ Error sharing reel:", err);
      toast.error("Failed to share reel");
    }
  };

  const toggleChatSelection = (id) => {
    setSelectedChats((prev) =>
      prev.includes(id) ? prev.filter((chatId) => chatId !== id) : [...prev, id]
    );
  };

  const toggleGroupSelection = (id) => {
    setSelectedGroups((prev) =>
      prev.includes(id)
        ? prev.filter((groupId) => groupId !== id)
        : [...prev, id]
    );
  };

  const handleBatchShare = () => {
    selectedChats.forEach((id) => handleShare(selectedReelId, id, "user"));
    selectedGroups.forEach((id) => handleShare(selectedReelId, id, "group"));

    toast.success("Shared successfully!");
    setSelectedChats([]);
    setSelectedGroups([]);
    setShareAnchorEl(null);
    setShareTab(0);
  };

  const userGroups = buzzGroups.filter(
    (group) =>
      group._id === "public" ||
      (Array.isArray(group.members) &&
        group.members.some((m) => m === userId || m._id === userId))
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100vh",
          overflowY: "auto",
          bgcolor: theme.palette.background.default,
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {reels.map((reel) => (
          <Box
            key={reel.id}
            sx={{
              mb: 0,
              borderRadius: isMobile ? 0 : 4,
              overflow: "hidden",
              position: "relative",
              bgcolor: "black",
              width: isMobile ? "100vw" : "420px",
              maxWidth: 430,
              mx: "auto",
              height: "100vh",
              display: "flex",
              flexDirection: "row",
              scrollSnapAlign: "start",
              boxShadow: isMobile ? "none" : "0px 8px 24px rgba(0,0,0,0.2)",
              transition:
                "width 0.3s ease-in-out, border-radius 0.3s ease-in-out",
            }}
          >
            <video
              data-id={reel.id}
              ref={(el) => (videoRefs.current[reel.id] = el)}
              src={reel.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              onClick={() => handleToggleMute(reel.id)}
              onDoubleClick={() => handleDoubleClick(reel.id)}
              onTimeUpdate={(e) => {
                const current = e.target.currentTime;
                const duration = e.target.duration;
                setVideoProgress((prev) => ({
                  ...prev,
                  [reel.id]: (current / duration) * 100,
                }));
              }}
              onLoadedMetadata={(e) => {
                const current = e.target.currentTime;
                const duration = e.target.duration;
                setVideoProgress((prev) => ({
                  ...prev,
                  [reel.id]: (current / duration) * 100,
                }));
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: isMobile ? "0px" : "12px",
                cursor: "pointer",
              }}
            />

            {showPlayPauseIcon.id === reel.id && (
              <Zoom in={true} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 20,
                    color: "white",
                    fontSize: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                    p: 2,
                  }}
                >
                  {showPlayPauseIcon.type === "muted" ? (
                    <VolumeOffIcon fontSize="inherit" />
                  ) : (
                    <VolumeUpIcon fontSize="inherit" />
                  )}
                </Box>
              </Zoom>
            )}

            <Box
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const percent = clickX / width;

                const video = videoRefs.current[reel.id];
                if (video && video.duration) {
                  video.currentTime = percent * video.duration;
                }
              }}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: 6,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${videoProgress[reel.id] || 0}%`,
                  backgroundColor: theme.palette.primary.main,
                  transition: "width 0.1s linear",
                }}
              />
            </Box>

            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 20,
              }}
            >
              <IconButton onClick={() => handleDoubleClick(reel.id)}>
                <Zoom in={reel.liked && isLikedAnimating} timeout={300}>
                  <FavoriteIcon
                    sx={{ color: reel.liked ? "red" : "white", fontSize: 30 }}
                  />
                </Zoom>
                {!isLikedAnimating && (
                  <FavoriteIcon
                    sx={{
                      color: reel.liked ? "red" : "white",
                      fontSize: 30,
                      position: "absolute",
                      opacity: reel.liked ? 1 : 0.7,
                    }}
                  />
                )}
              </IconButton>
              <Typography color="white" fontSize={12}>
                {reel.likesCount}
              </Typography>

              <IconButton
                onClick={() => setCommentModal({ open: true, reelId: reel.id })}
              >
                <CommentIcon sx={{ color: "white", fontSize: 30 }} />
              </IconButton>
              <Typography color="white" fontSize={12}>
                {reel.comments.length}
              </Typography>

              <IconButton
                onClick={(e) => {
                  setShareAnchorEl(e.currentTarget);
                  setSelectedReelId(reel.id);
                }}
              >
                <ShareIcon sx={{ color: "white", fontSize: 30 }} />
              </IconButton>

              <IconButton
                onClick={() =>
                  handleDownload(reel.videoUrl, `reel-${reel.id}.mp4`)
                }
              >
                <DownloadIcon sx={{ color: "white", fontSize: 30 }} />
              </IconButton>
            </Box>

            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                p: 2,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
              }}
            >
              <Stack direction="column" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={reel.user.avatar}
                    sx={{ width: 48, height: 48, border: "2px solid white" }}
                  />
                  <Typography
                    color="white"
                    fontWeight="bold"
                    variant="body1"
                    sx={{ textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {reel.user.name}
                  </Typography>
                  {reel.user._id !== userId && (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        ml: "auto",
                        color: "white",
                        borderColor: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: theme.palette.primary.light,
                        },
                      }}
                      onClick={() => toggleFollow(reel.id, reel.user._id)}
                    >
                      {reel.following ? "Following" : "Follow"}
                    </Button>
                  )}
                </Stack>

                {reel.description && (
                  <Typography
                    color="white"
                    fontSize={14}
                    sx={{ ml: 7, textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {reel.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        ))}

        <Dialog
          open={commentModal.open}
          onClose={() => setCommentModal({ open: false })}
          fullWidth
          maxWidth="sm"
          TransitionComponent={Transition}
          PaperProps={{
            sx: {
              position: "fixed",
              bottom: 0,
              m: 0,
              width: "100%",
              height: "66vh",
              borderTopLeftRadius: theme.shape.borderRadius,
              borderTopRightRadius: theme.shape.borderRadius,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.1)",
              bgcolor: theme.palette.background.paper,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ChatBubbleOutlineIcon color="primary" />
              <Typography variant="h6" color="text.primary">
                Comments
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: "auto" }}
              >
                {currentReel?.comments.length || 0} comments
              </Typography>
            </Stack>
          </Box>

          <DialogContent
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2,
              py: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.light,
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.background.default,
              },
            }}
          >
            {currentReel?.comments.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="body1">
                  No comments yet. Be the first!
                </Typography>
              </Box>
            ) : (
              currentReel?.comments.map((c, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={c.user?.avatar} />
                    <Typography fontWeight="bold" color="text.primary">
                      {c.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeAgo(c.createdAt)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ ml: 6, mt: 0.5 }} color="text.primary">
                    {c.text}
                  </Typography>

                  <Box sx={{ ml: 7, mt: 1 }}>
                    {c.replies.map((r, j) => (
                      <Stack
                        key={j}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={0.5}
                      >
                        <Avatar
                          src={r.user?.avatar}
                          sx={{ width: 28, height: 28 }}
                        />
                        <Typography variant="body2" color="text.primary">
                          <strong>{r.user?.name}</strong>: {r.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeAgo(r.createdAt)}
                        </Typography>
                      </Stack>
                    ))}

                    {replyInput.index === i ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        mt={1}
                        position="relative"
                        alignItems="center"
                      >
                        <TextField
                          size="small"
                          value={replyInput.text}
                          onChange={(e) =>
                            setReplyInput({
                              ...replyInput,
                              text: e.target.value,
                            })
                          }
                          placeholder="Reply..."
                          fullWidth
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() =>
                            setReplyEmojiPickers((prev) => ({
                              ...prev,
                              [i]: !prev[i],
                            }))
                          }
                          sx={{ minWidth: 40, p: 1 }}
                        >
                          😀
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => addReply(i)}
                          disabled={!replyInput.text.trim()}
                        >
                          Send
                        </Button>

                        {replyEmojiPickers[i] && (
                          <Box
                            ref={(el) => (replyEmojiRefs.current[i] = el)}
                            sx={{
                              position: "absolute",
                              bottom: -300,
                              right: 0,
                              zIndex: 1000,
                              boxShadow: theme.shadows[4],
                              borderRadius: "30px",
                              overflow: "hidden",
                              bgcolor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <EmojiPicker
                              onEmojiSelect={(emoji) => {
                                setReplyInput((prev) => ({
                                  ...prev,
                                  text: prev.text + emoji,
                                }));
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
                      </Stack>
                    ) : (
                      <Button
                        size="small"
                        onClick={() => setReplyInput({ index: i, text: "" })}
                        sx={{ mt: 1, color: theme.palette.text.secondary }}
                      >
                        Reply
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ mt: 2, borderColor: theme.palette.divider }} />
                </Box>
              ))
            )}
          </DialogContent>

          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src="/user_photo.jpg" />
              <TextField
                fullWidth
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
                onFocus={() => setShowEmojiPicker(false)}
              />
              <Button
                variant="outlined"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                sx={{ minWidth: 40, p: 1 }}
              >
                😀
              </Button>
              <Button
                variant="contained"
                onClick={addComment}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </Stack>

            {showEmojiPicker && (
              <Box
                ref={emojiPickerRef}
                sx={{
                  position: "absolute",
                  bottom: isMobile ? 70 : 50,
                  height: isMobile ? 350 : 420,
                  left: isMobile ? 15 : 60,
                  zIndex: 9999,
                  boxShadow: theme.shadows[4],
                  borderRadius: "30px",
                  overflow: "hidden",
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setNewComment((prev) => prev + emoji);
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
        </Dialog>

        <Popover
          open={Boolean(shareAnchorEl)}
          anchorEl={shareAnchorEl}
          onClose={() => {
            setShareAnchorEl(null);
            setShareTab(0);
            setSelectedChats([]);
            setSelectedGroups([]);
          }}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{ sx: { width: 300, borderRadius: 0 } }}
        >
          <Tabs
            value={shareTab}
            onChange={(_, newVal) => setShareTab(newVal)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Tab label="Chats" />
            <Tab label="Groups" />
          </Tabs>

          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {shareTab === 0 && (
              <List disablePadding>
                {members.map((member) => {
                  const isSelected = selectedChats.includes(member._id);
                  return (
                    <ListItem
                      key={member._id}
                      button
                      selected={isSelected}
                      onClick={() => toggleChatSelection(member._id)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={member.avatar} />
                      </ListItemAvatar>
                      <ListItemText primary={member.name} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChatSelection(member._id);
                          }}
                          sx={{
                            color: isSelected
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon />
                          ) : (
                            <RadioButtonUncheckedIcon />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}

            {shareTab === 1 && (
              <List disablePadding>
                {userGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group._id);
                  return (
                    <ListItem
                      key={group._id}
                      button
                      selected={isSelected}
                      onClick={() => toggleGroupSelection(group._id)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={group.image || "/group-icon.png"} />
                      </ListItemAvatar>
                      <ListItemText primary={group.groupName} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroupSelection(group._id);
                          }}
                          sx={{
                            color: isSelected
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon />
                          ) : (
                            <RadioButtonUncheckedIcon />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleBatchShare}
              disabled={
                selectedChats.length === 0 && selectedGroups.length === 0
              }
              fullWidth
            >
              Send
            </Button>
          </Box>
        </Popover>
      </Box>
    </ThemeProvider>
  );
}
