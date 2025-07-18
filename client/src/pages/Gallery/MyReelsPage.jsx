import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  useTheme,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";
import { formatDistanceToNow } from "date-fns";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const MyReelsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userId, token, axios } = useAppContext();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReelId, setSelectedReelId] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (event, reelId) => {
    setAnchorEl(event.currentTarget);
    setSelectedReelId(reelId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedReelId(null);
  };

  useEffect(() => {
    const fetchMyReels = async () => {
      try {
        const res = await axios.get(`/api/users/user/${userId}/reels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fixedReels = (res.data || []).map((reel) => ({
          ...reel,
          tags: Array.isArray(reel.tags)
            ? reel.tags
            : typeof reel.tags === "string"
            ? JSON.parse(reel.tags)
            : [],
        }));

        setReels(fixedReels);
      } catch (err) {
        console.error("❌ Failed to fetch user's reels:", err);
        toast.error("Failed to load your reels.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) fetchMyReels();
  }, [userId, token, axios]);

  const handleDeleteReel = async () => {
    handleCloseMenu();
    if (!selectedReelId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reel? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/users/gallery/reels/${selectedReelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReels((prev) => prev.filter((reel) => reel._id !== selectedReelId));
      toast.success("🗑️ Reel deleted successfully!");
    } catch (err) {
      console.error("❌ Failed to delete reel:", err);
      toast.error("Failed to delete reel. Please try again.");
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const titleVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const reelGridVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const reelCardVariants = {
    initial: { y: 50, opacity: 0, scale: 0.9 },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.03,
      y: -5,
      boxShadow: theme.palette.mode === 'dark' ? "0 10px 25px rgba(0,255,255,0.2)" : "0 10px 25px rgba(0,0,0,0.15)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        padding: theme.spacing(3, 4),
        minHeight: "calc(100vh - 64px)",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <motion.div variants={titleVariants}>
        <Typography
          variant="h4"
          fontWeight="bold"
          mb={4}
          sx={{
            color: theme.palette.text.primary,
            textShadow: theme.palette.mode === 'dark' ? "2px 2px 5px rgba(0,255,255,0.2)" : "2px 2px 5px rgba(0,0,0,0.1)",
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            display: "inline-block",
            pb: 0.5,
          }}
        >
          🎞️ My Reels
        </Typography>
      </motion.div>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress size={60} color="primary" />
          <Typography variant="h6" color="text.secondary" ml={2}>
            Loading your reels...
          </Typography>
        </Box>
      ) : reels.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh" flexDirection="column">
          <Typography variant="h5" color="text.secondary" gutterBottom>
            You haven't uploaded any reels yet!
          </Typography>
          <Typography variant="body1" color="text.disabled">
            Start sharing your creativity with the community.
          </Typography>
        </Box>
      ) : (
        <motion.div variants={reelGridVariants} initial="initial" animate="animate">
          <Grid container spacing={4} justifyContent="center">
            {reels.map((reel) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={reel._id}>
                <motion.div
                  variants={reelCardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ height: "100%" }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: theme.palette.mode === 'dark' ? 6 : 4,
                      overflow: "hidden",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      // --- MODIFICATION HERE: Fixed width ---
                      width: 380, // Fixed width for the card
                      mx: "auto", // Keeps the card centered within its grid column
                      // Removed maxWidth: 400 as width is now fixed
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <CardMedia
                      component="video"
                      src={reel.videoUrl}
                      controls
                      muted
                      sx={{
                        width: "100%",
                        height: isMobile ? 200 : 280,
                        backgroundColor: theme.palette.grey[900],
                        objectFit: "contain",
                      }}
                    />

                    <CardContent
                      sx={{
                        flex: 1,
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                          noWrap
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {reel.description}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                            mb: 2,
                            "&::-webkit-scrollbar": {
                              display: "none",
                            },
                            scrollbarWidth: "none",
                          }}
                        >
                          {(reel.tags || []).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={`#${tag}`}
                              size="small"
                              sx={{
                                bgcolor: theme.palette.primary.dark,
                                color: theme.palette.primary.contrastText,
                                fontSize: "0.8rem",
                                mr: 1,
                                flexShrink: 0,
                                px: 1,
                                borderRadius: 1.5,
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                  bgcolor: theme.palette.primary.light,
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ color: theme.palette.text.secondary, mt: 1 }}
                      >
                        <VisibilityIcon fontSize="small" />
                        <Typography variant="body2">{reel.views}</Typography>
                        <FavoriteIcon fontSize="small" />
                        <Typography variant="body2">{reel.likes.length}</Typography>
                        <VideoLibraryIcon fontSize="small" />
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(reel.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </Stack>
                    </CardContent>

                    <Tooltip title="More options">
                      <IconButton
                        aria-label="more options"
                        aria-controls={openMenu ? "reel-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={openMenu ? "true" : undefined}
                        onClick={(event) => handleClickMenu(event, reel._id)}
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
                          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                          zIndex: 2,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                            color: theme.palette.action.active,
                          },
                          borderRadius: "50%",
                          p: 0.5,
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      <Menu
        id="reel-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleDeleteReel} sx={{ color: theme.palette.error.main }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete Reel
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

export default MyReelsPage;