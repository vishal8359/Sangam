import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  useTheme,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress, // Added CircularProgress for loading state
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarsIcon from "@mui/icons-material/Stars";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const TopContributorsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [contributors, setContributors] = useState([]);
  const [loadingContributors, setLoadingContributors] = useState(true); // New loading state
  const [openDialog, setOpenDialog] = useState(false);
  const [isAddingContributor, setIsAddingContributor] = useState(false); // Loading state for adding
  const [newContributor, setNewContributor] = useState({
    name: "",
    house: "",
    designation: "",
    achievements: "",
  });
  const { userRole, token, axios, societyId } = useAppContext(); // Destructure societyId from useAppContext
  const isAdmin = userRole === "admin";

  // Log userRole and societyId for debugging
  useEffect(() => {
    console.log("Current userRole:", userRole);
    console.log("Current societyId:", societyId);
  }, [userRole, societyId]);

  useEffect(() => {

    fetchContributors();
  }, [token, axios, societyId]); // Added societyId to dependencies

  const fetchContributors = async () => {
    setLoadingContributors(true); // Start loading
    try {
      // Modified API endpoint to include societyId as a query parameter
      const res = await axios.get(`/api/users/contributors/all?societyId=${societyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContributors(res.data.contributors || []);
    } catch (err) {
      console.error(
        "Failed to fetch contributors:",
        err.response?.data || err.message
      );
      toast.error(
        err.response?.data?.message ||
          "Unauthorized or failed to fetch contributors."
      );
    } finally {
      setLoadingContributors(false); // End loading
    }
  };

  const handleMarkContributor = async () => {
    setIsAddingContributor(true); // Start adding loading
    try {
      // Ensure the backend URL is correctly configured in your .env file
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/contributors/mark`;

      await axios.post(
        url,
        {
          name: newContributor.name,
          house: newContributor.house,
          designation: newContributor.designation,
          achievements: newContributor.achievements
            .split(",")
            .map((ach) => ach.trim()),
          society_id: societyId, // Ensure society_id is sent for admin actions
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Top contributor added successfully!");
      setNewContributor({
        name: "",
        house: "",
        designation: "",
        achievements: "",
      });
      setOpenDialog(false);
      fetchContributors(); // Re-fetch contributors to update the list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add contributor");
      console.error(err.response?.data || err.message);
    } finally {
      setIsAddingContributor(false); // End adding loading
    }
  };

  return (
    <Box
      p={3}
      sx={{
        bgcolor: isDark ? theme.palette.background.default : "#fff",
        minHeight: "100vh",
        background: isDark
          ? `linear-gradient(180deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`
          : `linear-gradient(180deg, ${theme.palette.primary.light}10, ${theme.palette.secondary.light}10)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: isDark
              ? `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: theme.palette.primary.contrastText,
            fontSize: {
              xs: "1.8rem",
              sm: "2.2rem",
              md: "2.8rem",
            },
            fontWeight: 800,
            letterSpacing: 1,
            boxShadow: theme.shadows[8],
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          🌟 Celebrating Our Top Contributors 🌟
        </Box>
      </motion.div>
      {isAdmin && (
        <Box textAlign="center" mb={4}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpenDialog(true)}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: theme.shadows[4],
                background: isDark
                  ? `linear-gradient(90deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`
                  : `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                color: theme.palette.secondary.contrastText,
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              ➕ Add Top Contributor
            </Button>
          </motion.div>
        </Box>
      )}

      {loadingContributors ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" ml={2} color="text.secondary">
            Loading Top Contributors...
          </Typography>
        </Box>
      ) : contributors.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary">
            No top contributors found yet.
          </Typography>
          {isAdmin && (
            <Typography variant="body1" color="text.secondary">
              Add the first one using the button above!
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {contributors.map((contributor, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <Card
                  elevation={10}
                  sx={{
                    borderRadius: 5,
                    background: isDark
                      ? `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${theme.palette.background.default})`
                      : `linear-gradient(to bottom right, ${theme.palette.background.default}, ${theme.palette.grey[50]})`,
                    color: theme.palette.text.primary,
                    boxShadow: isDark ? `0 8px 32px 0 ${theme.palette.common.black}80` : theme.shadows[10],
                    overflow: "hidden",
                    px: 3,
                    pt: 3,
                    pb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backdropFilter: "blur(5px)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      src={contributor.avatar}
                      sx={{
                        background: "linear-gradient(to right, #FF6B6B, #FFD93D)",
                        fontWeight: "bold",
                        fontSize: "1.8rem",
                        width: 70,
                        height: 70,
                        color: "#fff",
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: theme.shadows[3],
                      }}
                    >
                      {contributor.avatar || (contributor.name ? contributor.name.charAt(0).toUpperCase() : '')}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: isDark ? "#fff" : theme.palette.primary.main }}>
                        {contributor.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", mt: 0.5 }}
                      >
                        {contributor.house}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    icon={<StarsIcon />}
                    label={contributor.designation}
                    color="secondary"
                    size="medium"
                    sx={{
                      mt: 1,
                      mb: 2,
                      fontWeight: "bold",
                      borderRadius: "10px",
                      px: 2,
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      boxShadow: theme.shadows[2],
                    }}
                  />

                  <Divider sx={{ my: 2.5, borderColor: theme.palette.divider, borderStyle: "dashed" }} />

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      textTransform: "uppercase",
                      color: isDark ? theme.palette.info.light : theme.palette.primary.dark,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <EmojiEventsIcon sx={{ color: theme.palette.warning.main }} /> Achievements
                  </Typography>

                  <Box sx={{ maxHeight: 150, overflowY: "auto", pr: 1 }}>
                    {contributor.achievements && contributor.achievements.length > 0 ? (
                      contributor.achievements.map((ach, i) => (
                        <Box
                          key={i}
                          display="flex"
                          alignItems="flex-start"
                          gap={1.5}
                          mb={1}
                          sx={{
                            background: isDark ? theme.palette.action.hover : theme.palette.action.selected,
                            p: 1,
                            borderRadius: 2,
                            "&:last-child": { mb: 0 },
                          }}
                        >
                          <Tooltip title="Achievement" arrow>
                            <EmojiEventsIcon
                              fontSize="small"
                              color="warning"
                              sx={{ mt: "3px", flexShrink: 0 }}
                            />
                          </Tooltip>
                          <Typography variant="body2" color="text.secondary">{ach}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No achievements listed.
                      </Typography>
                    )}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark ? theme.palette.background.paper : theme.palette.background.default,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[12],
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
          Add Top Contributor
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={newContributor.name}
            onChange={(e) =>
              setNewContributor({ ...newContributor, name: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            label="House"
            variant="outlined"
            fullWidth
            value={newContributor.house}
            onChange={(e) =>
              setNewContributor({ ...newContributor, house: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            label="Designation"
            variant="outlined"
            fullWidth
            value={newContributor.designation}
            onChange={(e) =>
              setNewContributor({
                ...newContributor,
                designation: e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
            }}
          />
          <TextField
            label="Achievements (comma separated)"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={newContributor.achievements}
            onChange={(e) =>
              setNewContributor({
                ...newContributor,
                achievements: e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
              "& .MuiInputLabel-root": { color: theme.palette.text.secondary },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            variant="outlined"
            sx={{ px: 3, py: 1 }}
            disabled={isAddingContributor}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkContributor}
            color="secondary"
            sx={{ px: 3, py: 1, boxShadow: theme.shadows[3] }}
            disabled={isAddingContributor}
            startIcon={isAddingContributor ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isAddingContributor ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TopContributorsPage;
