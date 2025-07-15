import React, { useState, useRef, useEffect } from "react";

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
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import CommentIcon from "@mui/icons-material/Comment";
import DownloadIcon from "@mui/icons-material/Download";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useAppContext } from "../../context/AppContext";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeReelId, setActiveReelId] = useState(null);
  const { token, axios, userId } = useAppContext();
  const currentReel = reels.find((r) => r.id === commentModal.reelId);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await axios.get("/api/users/gallery/reels");

        const updated = res.data.map((reel) => ({
          ...reel,
          id: reel._id,
          liked: reel.likes.some(
            (id) => id === userId || id === String(userId)
          ),
          likesCount: reel.likes.length,
        }));

        setReels(updated);
      } catch (error) {
        console.error("❌ Failed to load reels:", error);
      }
    };

    fetchReels();
  }, [userId]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.9,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const reelId = entry.target.getAttribute("data-id");

        if (entry.isIntersecting) {
          setActiveReelId(reelId);

          // ✅ Update views only when it becomes visible
          axios
            .put(`/api/users/gallery/reels/${reelId}/view`)
            .catch((err) => console.error("View update failed:", err));
        }
      });
    }, observerOptions);

    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

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
      if (video.paused) video.play().catch(() => {});
    }
  };

  const handleDoubleClick = async (id) => {
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
    }
  };

  const toggleFollow = (id) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === id ? { ...reel, following: !reel.following } : reel
      )
    );
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
    } catch (error) {
      console.error("Failed to reply:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        overflowY: "auto",
        bgcolor: "#f9f9f9",
        p: 0,
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
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
            width: isMobile ? "100vw" : "420",
            maxWidth: 420,
            mx: "auto",
            height: "100vh",
            display: "flex",
            flexDirection: "row",
            position: "relative",
            scrollSnapAlign: "start",
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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0px",
            }}
          />

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
              py: 30,
            }}
          >
            <IconButton onClick={() => handleDoubleClick(reel.id)}>
              <FavoriteIcon sx={{ color: reel.liked ? "red" : "white" }} />
            </IconButton>

            <Typography color="white" fontSize={12}>
              {reel.likesCount}
            </Typography>

            <IconButton
              onClick={() => setCommentModal({ open: true, reelId: reel.id })}
            >
              <CommentIcon sx={{ color: "white" }} />
            </IconButton>
            <Typography color="white" fontSize={12}>
              {reel.comments.length}
            </Typography>

            <IconButton>
              <ShareIcon sx={{ color: "white" }} />
            </IconButton>
            <Typography color="white" fontSize={12}>
              Share
            </Typography>

            <IconButton>
              <DownloadIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              p: 2,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={reel.user.avatar} />
              <Typography color="white">{reel.user.name}</Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  ml: "auto",
                  color: "white",
                  borderColor: "white",
                }}
                onClick={() => toggleFollow(reel.id)}
              >
                {reel.following ? "Following" : "Follow"}
              </Button>
            </Stack>
          </Box>
        </Box>
      ))}

      {/* Comments Modal */}
      <Dialog
        open={commentModal.open}
        onClose={() => setCommentModal({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <ChatBubbleOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Comments
            </Typography>
          </Stack>

          {/* Comment List */}
          {currentReel?.comments.map((c, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={c.avatar} />
                <Typography fontWeight="bold">{c.user}</Typography>
              </Stack>
              <Typography sx={{ ml: 5, mt: 0.5 }}>{c.text}</Typography>

              {/* Replies */}
              <Box sx={{ ml: 7, mt: 1 }}>
                {c.replies.map((r, j) => (
                  <Stack
                    key={j}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={0.5}
                  >
                    <Avatar src={r.avatar} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2">
                      <strong>{r.user}:</strong> {r.text}
                    </Typography>
                  </Stack>
                ))}

                {/* Add Reply */}
                {replyInput.index === i ? (
                  <Stack direction="row" spacing={1} mt={1}>
                    <TextField
                      size="small"
                      value={replyInput.text}
                      onChange={(e) =>
                        setReplyInput({ ...replyInput, text: e.target.value })
                      }
                      placeholder="Reply..."
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={() => addReply(i)}
                      disabled={!replyInput.text.trim()}
                    >
                      Send
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    size="small"
                    onClick={() => setReplyInput({ index: i, text: "" })}
                    sx={{ mt: 1 }}
                  >
                    Reply
                  </Button>
                )}
              </Box>

              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          {/* Add New Comment */}
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Avatar src="/user_photo.jpg" />
            <TextField
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              size="small"
            />
            <Button
              variant="contained"
              onClick={addComment}
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </Stack>
        </DialogContent>

        {/* Close Button */}
        <Box textAlign="center" py={2}>
          <Button
            variant="outlined"
            onClick={() => setCommentModal({ open: false })}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
