import React, { useState, useRef, useEffect } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
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
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import CommentIcon from "@mui/icons-material/Comment";
import DownloadIcon from "@mui/icons-material/Download";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

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
  const { token, axios, userId, societyId } = useAppContext();
  const currentReel = reels.find((r) => r.id === commentModal.reelId);
  const [replyEmojiPickers, setReplyEmojiPickers] = useState({});
  const replyEmojiRefs = useRef({});
  const emojiPickerRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});

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
        behavior: "smooth",
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
        setBuzzGroups(groupRes.data.groups);
      } catch (err) {
        console.error("❌ Failed to load members/groups:", err);
      }
    };

    if (token && societyId) {
      fetchShareData();
    }
  }, [token, societyId]);

  // useEffect(() => {
  //   console.log("👥 Members:", members);
  //   console.log("📢 Buzz Groups:", buzzGroups);
  // }, [members, buzzGroups]);

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

    // Cleanup
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

  const shareReel = async (reelId, receiverId, groupId) => {
    try {
      await axios.post(
        `/api/users/gallery/reels/send`,
        {
          senderId: userId,
          receiverId: type === "user" ? targetId : null,
          groupId: type === "group" ? targetId : null,
          reelUrl: reels.find((r) => r.id === reelId)?.videoUrl,
          societyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reel shared!");
    } catch (err) {
      toast.error("Failed to share reel.");
    }
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

  // Final share
  const handleBatchShare = () => {
    selectedChats.forEach((id) => handleShare(selectedReelId, id, "user"));
    selectedGroups.forEach((id) => handleShare(selectedReelId, id, "group"));

    // toast.success("Shared successfully!");
    setSelectedChats([]);
    setSelectedGroups([]);
    setShareAnchorEl(null);
    setShareTab(0);
  };

  const userGroups = buzzGroups.filter((group) =>
    group.members.some((m) => m === userId || m._id === userId)
  );

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
            maxWidth: 430,
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
              borderRadius: "0px",
            }}
          />
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
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${videoProgress[reel.id] || 0}%`,
                backgroundColor: "white",
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
              py: 25,
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

            <IconButton
              onClick={(e) => {
                setShareAnchorEl(e.currentTarget);
                setSelectedReelId(reel.id);
              }}
            >
              <ShareIcon sx={{ color: "white" }} />
            </IconButton>

            <div className="cursor-pointer">
              <IconButton
                onClick={() =>
                  handleDownload(reel.videoUrl, `reel-${reel.id}.mp4`)
                }
              >
                <DownloadIcon sx={{ color: "white" }} />
              </IconButton>
            </div>
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
            <Stack direction="column" spacing={1}>
              {/* Top row: Avatar + Name + Follow */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={reel.user.avatar} />
                <Typography color="white" fontWeight="bold">
                  {reel.user.name}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    ml: "auto",
                    color: "white",
                    borderColor: "white",
                  }}
                  onClick={() => toggleFollow(reel.id, reel.user._id)}
                >
                  {reel.following ? "Following" : "Follow"}
                </Button>
              </Stack>

              {/* Description below user info */}
              {reel.description && (
                <Typography color="white" fontSize={14} sx={{ ml: 7 }}>
                  {reel.description}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      ))}

      {/* Comments Modal */}

      <Dialog
        open={commentModal.open}
        onClose={() => setCommentModal({ open: false })}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            position: "fixed",
            bottom: 0,
            m: 0,
            width: "100%",
            height: "66vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Fixed Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #ddd",
            backgroundColor: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ChatBubbleOutlineIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Comments
            </Typography>
          </Stack>
        </Box>

        {/* Scrollable Comments */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}>
          {currentReel?.comments.map((c, i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={c.user?.avatar} />
                <Typography fontWeight="bold">{c.user?.name}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#888", ml: "auto" }}
                >
                  {getTimeAgo(c.createdAt)}
                </Typography>
              </Stack>
              <Typography sx={{ ml: 6, mt: 0.5 }}>{c.text}</Typography>

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
                    <Avatar
                      src={r.user?.avatar}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="body2">
                      <strong>{r.user?.name}</strong>: {r.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeAgo(r.createdAt)}
                    </Typography>
                  </Stack>
                ))}

                {/* Reply Input */}
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
                        setReplyInput({ ...replyInput, text: e.target.value })
                      }
                      placeholder="Reply..."
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setReplyEmojiPickers((prev) => ({
                          ...prev,
                          [i]: !prev[i],
                        }))
                      }
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
                          bottom: 50,
                          right: 10,
                          zIndex: 1000,
                        }}
                      >
                        <Picker
                          data={data}
                          onEmojiSelect={(emoji) =>
                            setReplyInput((prev) => ({
                              ...prev,
                              text: prev.text + emoji.native,
                            }))
                          }
                          theme="light"
                        />
                      </Box>
                    )}
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
        </Box>

        {/* Fixed Input Bar */}
        <Box
          sx={{ p: 2, borderTop: "1px solid #ddd", backgroundColor: "#fff" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src="/user_photo.jpg" />
            <TextField
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              size="small"
              onFocus={() => setShowEmojiPicker(false)} // optional
            />
            <Button
              variant="outlined"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
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
                bottom: 70,
                left: 60,
                zIndex: 9999,
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={(emoji) =>
                  setNewComment((prev) => prev + emoji.native)
                }
                theme="light"
              />
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
        }}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 300 } }}
      >
        <Tabs
          value={shareTab}
          onChange={(_, newVal) => setShareTab(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Chats" />
          <Tab label="Groups" />
        </Tabs>

        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {shareTab === 0 && (
            <List>
              {members.map((member) => {
                const isSelected = selectedChats.includes(member._id);
                return (
                  <ListItem
                    key={member._id}
                    button
                    selected={isSelected}
                    onClick={() => toggleChatSelection(member._id)}
                  >
                    <ListItemAvatar>
                      <Avatar src={member.avatar} />
                    </ListItemAvatar>
                    <ListItemText primary={member.name} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent ListItem click event
                          toggleChatSelection(member._id); // or toggleGroupSelection
                        }}
                      >
                        {isSelected ? (
                          <CheckCircleIcon sx={{ color: "green" }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ color: "grey.500" }}
                          />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}

          {shareTab === 1 && (
            <List>
              {userGroups.map((group) => {
                const isSelected = selectedGroups.includes(group._id);
                return (
                  <ListItem
                    key={group._id}
                    button
                    selected={isSelected}
                    onClick={() => toggleGroupSelection(group._id)}
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
                      >
                        {isSelected ? (
                          <CheckCircleIcon sx={{ color: "primary.main" }} />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ color: "text.secondary" }}
                          />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBatchShare}
            disabled={selectedChats.length === 0 && selectedGroups.length === 0}
          >
            Send
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
