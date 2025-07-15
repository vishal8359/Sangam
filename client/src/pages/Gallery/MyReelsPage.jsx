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

const MyReelsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userId, token, axios } = useAppContext();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

 

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
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) fetchMyReels();
  }, [userId, token]);

  const handleDeleteReel = async (reelId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this reel?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`/api/users/gallery/reels/${reelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReels((prev) => prev.filter((reel) => reel._id !== reelId));
      toast.success("🗑️ Reel deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete reel:", err);
      toast.error("Failed to delete reel");
    }
  };


  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🎞️ My Reels
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : reels.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          You haven't uploaded any reels yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {reels.map((reel) => (
            <Grid item xs={12} sm={6} md={4} key={reel._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column", 
                  height: "100%",
                  width: 380,
                }}
              >
                <CardMedia
                  component="video"
                  src={reel.videoUrl}
                  controls
                  muted
                  sx={{
                    width: "100%",
                    height:  isMobile ? 200 : 250,
                    backgroundColor: theme.palette.grey[200],
                  }}
                />

                <CardContent
                  sx={{
                    flex: 1,
                    px: 2,
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      gutterBottom
                      noWrap
                    >
                      {reel.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        overflowX: "auto",
                        whiteSpace: "nowrap",
                        mb: 1,
                        pr: 1,
                      }}
                    >
                      {(reel.tags || []).map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={`#${tag}`}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.primary.light,
                            color: "#fff",
                            fontSize: "0.75rem",
                            mr: 1,
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="body2">{reel.views}</Typography>
                    <FavoriteIcon fontSize="small" color="action" />
                    <Typography variant="body2">{reel.likes.length}</Typography>
                    <VideoLibraryIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {formatDistanceToNow(new Date(reel.createdAt), {
                        addSuffix: true,
                      })}
                    </Typography>
                  </Stack>
                </CardContent>

                {/* 3 Dots Menu Button */}
                <Tooltip title="Delete Reel">
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: theme.palette.error.main,
                      color: "#fff",
                      "&:hover": {
                        bgcolor: theme.palette.error.dark,
                      },
                    }}
                    onClick={() => handleDeleteReel(reel._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyReelsPage;
