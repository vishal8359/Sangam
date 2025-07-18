import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button, // Make sure to import Button
  Stack,
  Avatar,
  Chip,
  useTheme,
  CircularProgress,
  Divider,
  useMediaQuery,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const dummyStats = {
  totalViews: 32500,
  uploads: 15,
  followers: 2200,
  earnings: 5600,
  reach: 78,
  viewerTypes: [
    { name: "Residents", value: 60 },
    { name: "Other Societies", value: 30 },
    { name: "Guests", value: 10 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const MuiMotionButton = motion(Button); // Create a motion-enabled Material-UI Button

const UploadReelPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const { userReels, setUserReels, axios, userId, token, currency } = useAppContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/users/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(data);
      } catch (err) {
        console.error("❌ Failed to fetch user info:", err);
      }
    };

    if (userId && token) fetchUserData();
  }, [userId, token, axios]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}/reel-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch reel stats:", err);
        setStats(dummyStats);
        toast.error("Failed to load reel statistics. Showing dummy data.");
      }
    };

    if (userId && token) fetchStats();
  }, [userId, token, axios]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a video file to upload.");
      return;
    }
    if (!desc.trim()) {
      toast.error("Please add a description for your reel.");
      return;
    }
    if (tags.length === 0) {
      toast.error("Please add at least one tag for your reel.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("tags", JSON.stringify(tags));
    formData.append("description", desc);
    formData.append("userId", userId);

    const toastId = toast.loading("Uploading reel...", { duration: 0 });

    try {
      const response = await axios.post(
        "/api/users/gallery/reels/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedReel = response.data.reel;

      if (!savedReel || !savedReel.videoUrl) {
        throw new Error("Invalid reel data returned from server");
      }

      setUserReels((prev) => [savedReel, ...(Array.isArray(prev) ? prev : [])]);
      toast.success("🎉 Reel uploaded successfully!", { id: toastId });
      navigate("/gallery/reels");

      setFile(null);
      setDesc("");
      setTags([]);
      setTagInput("");
    } catch (error) {
      console.error("❌ Reel upload failed:", error);
      toast.dismiss(toastId);
      toast.error(
        error.response?.data?.message ||
          "Failed to upload reel. Please try again."
      );
    }
  };

  // --- Framer Motion Variants ---
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const sectionVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: `0 8px 20px ${
      theme.palette.mode === "dark" ? "rgba(0,255,255,0.2)" : "rgba(0,0,0,0.15)"
    }`,
  };
  const buttonTap = { scale: 0.95 };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        padding: theme.spacing(4),
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          color="primary"
          align="center"
          mb={6}
          sx={{
            textShadow:
              theme.palette.mode === "dark"
                ? "3px 3px 10px rgba(0,255,255,0.3)"
                : "3px 3px 10px rgba(0,0,0,0.2)",
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Your Reel Studio 🎬
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* Left Stats Panel */}
          <motion.div
            variants={sectionVariants}
            style={{ flex: 1, width: "100%" }}
          >
            <Box
              p={4}
              borderRadius={3}
              bgcolor={theme.palette.background.paper}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === "dark" ? 4 : 3,
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: theme.palette.mode === "dark" ? 6 : 5 },
                minHeight: { md: "700px" },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* User Profile */}
              <motion.div variants={itemVariants}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Avatar
                    src={userData?.avatar || "/user_photo.jpg"}
                    sx={{
                      width: 72,
                      height: 72,
                      border: `3px solid ${theme.palette.primary.main}`,
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 0 15px rgba(0,255,255,0.3)"
                          : "0 0 10px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {userData?.name || "Loading..."}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {userData?.address || "Unknown Location"}
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>

              <Divider sx={{ mb: 3 }} />

              {/* My Reels Button */}
              <motion.div variants={itemVariants}>
                <MuiMotionButton // Use the created motion-enabled button here
                  variant="outlined"
                  onClick={() => navigate("./myreels")}
                  sx={{
                    mb: 3,
                    width: "100%",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      borderColor: theme.palette.primary.light,
                    },
                  }}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  View My Reels
                </MuiMotionButton>
              </motion.div>

              <Divider sx={{ mb: 3 }} />

              <motion.div variants={itemVariants}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Reel Performance
                </Typography>
                <Stack spacing={1.5} mb={3}>
                  <Typography variant="body1">
                    Total Reels Uploaded:{" "}
                    {stats?.uploads ?? <CircularProgress size={16} />}
                  </Typography>
                  <Typography variant="body1">
                    Total Views:{" "}
                    {stats?.totalViews?.toLocaleString() ?? (
                      <CircularProgress size={16} />
                    )}
                  </Typography>
                  <Typography variant="body1">
                    Followers:{" "}
                    {stats?.followers?.toLocaleString() ?? (
                      <CircularProgress size={16} />
                    )}
                  </Typography>
                  <Typography variant="body1">
                    Estimated Earnings: {currency}
                    {stats?.earnings?.toLocaleString() ?? (
                      <CircularProgress size={16} />
                    )}
                  </Typography>
                </Stack>
              </motion.div>

              <Divider sx={{ mb: 3 }} />

              {/* Viewer Type Distribution Chart */}
              <motion.div
                variants={itemVariants}
                style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  👥 Viewer Type Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats?.viewerTypes || dummyStats.viewerTypes}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      fill="#8884d8"
                      labelLine={false}
                      label={renderCustomLabel}
                      isAnimationActive={true}
                    >
                      {(stats?.viewerTypes || dummyStats.viewerTypes).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <Divider sx={{ mb: 3 }} />

              {/* Reach Radial Bar Chart */}
              <motion.div variants={itemVariants}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🚀 Overall Reach
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[
                      {
                        name: "Reach",
                        value: stats?.reach || 0,
                        fill: theme.palette.success.main,
                      },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      minAngle={15}
                      background={{
                        fill: theme.palette.action.disabledBackground,
                      }}
                      clockWise
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="progress-label"
                      fill={theme.palette.text.primary}
                      fontSize="2rem"
                      fontWeight="bold"
                    >
                      {`${stats?.reach ?? 0}%`}
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </motion.div>
            </Box>
          </motion.div>

          {/* Right Upload Section */}
          <motion.div
            variants={sectionVariants}
            style={{ flex: 1, width: "100%" }}
          >
            <Box
              p={4}
              borderRadius={3}
              boxShadow={theme.palette.mode === "dark" ? 4 : 3}
              bgcolor={theme.palette.background.paper}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: theme.palette.mode === "dark" ? 6 : 5 },
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  🚀 Upload Your Reel
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Reel Description"
                  placeholder="Tell us about your reel content (e.g., 'Morning views from my balcony')..."
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mb: 3 }}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <TextField
                    size="medium"
                    label="Add Tags (e.g., #nature #community)"
                    value={tagInput}
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTagAdd()}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <MuiMotionButton // Use the created motion-enabled button here
                    variant="contained"
                    onClick={handleTagAdd}
                    sx={{
                      textTransform: "none",
                      height: "56px",
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  >
                    Add
                  </MuiMotionButton>
                </Stack>
              </motion.div>

              {tags.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Box
                    sx={{
                      width: "100%",
                      mt: 2,
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.action.selected,
                      border: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {tags.map((tag) => (
                        <motion.div key={tag} variants={itemVariants}>
                          <Chip
                            label={`#${tag}`}
                            onDelete={() => handleTagDelete(tag)}
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              fontWeight: 500,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1.5,
                              "& .MuiChip-deleteIcon": {
                                color:
                                  theme.palette.primary.contrastText +
                                  " !important",
                                "&:hover": {
                                  color: theme.palette.error.light + " !important",
                                },
                              },
                            }}
                          />
                        </motion.div>
                      ))}
                    </Stack>
                  </Box>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <MuiMotionButton // Use the created motion-enabled button here
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  component="label" // Keep component="label" here as it's for file input interaction
                  fullWidth
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    "&:hover": {
                      bgcolor: theme.palette.secondary.light,
                      color: theme.palette.secondary.contrastText,
                    },
                  }}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  {file ? `Selected: ${file.name}` : "Select Video Reel"}
                  <input
                    hidden
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </MuiMotionButton>
              </motion.div>

              {file && (
                <motion.div variants={itemVariants}>
                  <Box
                    mb={3}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.grey[900],
                    }}
                  >
                    <video
                      src={URL.createObjectURL(file)}
                      controls
                      width="100%"
                      style={{
                        height: isMobile ? 200 : 300,
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <MuiMotionButton // Use the created motion-enabled button here
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!file || !desc.trim() || tags.length === 0}
                  sx={{
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: 2,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    transition: "background-color 0.3s ease",
                  }}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  Upload Reel
                </MuiMotionButton>
              </motion.div>

              {userReels.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Divider sx={{ my: 4 }} />
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    My Recent Reels
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {userReels.slice(0, 4).map((reel) => (
                      <motion.div key={reel._id} variants={itemVariants}>
                        <video
                          src={reel.videoUrl}
                          width={120}
                          height={180}
                          muted
                          style={{
                            borderRadius: 8,
                            objectFit: "cover",
                            boxShadow:
                              theme.palette.mode === "dark"
                                ? "0 5px 15px rgba(0,255,255,0.1)"
                                : "0 5px 15px rgba(0,0,0,0.1)",
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        />
                      </motion.div>
                    ))}
                  </Stack>
                </motion.div>
              )}
            </Box>
          </motion.div>
        </Stack>
      </Box>
    </motion.div>
  );
};

export default UploadReelPage;