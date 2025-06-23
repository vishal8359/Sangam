import React, { useState, useRef } from "react";
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

import dummyReel from "../../assets/dummy2.mp4";

const initialReels = [
  {
    id: 1,
    user: { name: "Vishal", avatar: "/user_photo.jpg" },
    videoUrl: dummyReel,
    likes: 10,
    liked: false,
    following: false,
    comments: [
      {
        user: "Aman",
        avatar: "/user_photo.jpg",
        text: "Nice video!",
        replies: [
          { user: "Vishal", text: "Thanks!", avatar: "/user_photo.jpg" },
        ],
      },
    ],
  },
];

export default function ScrollReelsPage() {
  const [reels, setReels] = useState(initialReels);
  const [commentModal, setCommentModal] = useState({
    open: false,
    reelId: null,
  });
  const [newComment, setNewComment] = useState("");
  const [replyInput, setReplyInput] = useState({ index: null, text: "" });
  const videoRefs = useRef({});

  const handleToggleMute = (id) => {
    const video = videoRefs.current[id];
    if (video) video.muted = !video.muted;
  };

  const handleDoubleClick = (id) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === id
          ? {
              ...reel,
              liked: !reel.liked,
              likes: reel.liked ? reel.likes - 1 : reel.likes + 1,
            }
          : reel
      )
    );
  };

  const toggleFollow = (id) => {
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === id ? { ...reel, following: !reel.following } : reel
      )
    );
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setReels((prev) =>
      prev.map((reel) =>
        reel.id === commentModal.reelId
          ? {
              ...reel,
              comments: [
                ...reel.comments,
                {
                  user: "You",
                  avatar: "/user_photo.jpg",
                  text: newComment,
                  replies: [],
                },
              ],
            }
          : reel
      )
    );
    setNewComment("");
  };

  const addReply = (index) => {
    if (!replyInput.text.trim()) return;
    setReels((prev) =>
      prev.map((reel) => {
        if (reel.id !== commentModal.reelId) return reel;
        const updatedComments = [...reel.comments];
        updatedComments[index].replies.push({
          user: "You",
          text: replyInput.text,
          avatar: "/user_photo.jpg",
        });
        return { ...reel, comments: updatedComments };
      })
    );
    setReplyInput({ index: null, text: "" });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const currentReel = reels.find((r) => r.id === commentModal.reelId);

  return (
    <Box sx={{ height: "100vh", overflowY: "auto", bgcolor: "#f9f9f9", p: 0 }}>
      {reels.map((reel) => (
        <Box
          key={reel.id}
          sx={{
            mb: 0,
            borderRadius: isMobile?0 : 4,
            overflow: "hidden",
            position: "relative",
            bgcolor: "black",
            width:isMobile ? "100vw": "420",
            maxWidth: 420,
            mx: "auto",
            height: "100vh",
            display: "flex",
            flexDirection: "row",
            position: "relative",
          }}
        >
          <video
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
              gap: 2,
              px: 1,
            }}
          >
            <IconButton onClick={() => handleDoubleClick(reel.id)}>
              <FavoriteIcon sx={{ color: reel.liked ? "red" : "white" }} />
            </IconButton>
            <Typography color="white" fontSize={12}>
              {reel.likes}
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
