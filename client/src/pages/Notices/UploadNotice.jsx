import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Slide, Fade } from "@mui/material";
import { Send } from "@mui/icons-material";
import notice_bg from "../../assets/poll_bg.jpg"; // Reusing a background image for consistency

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

const noticeTypes = ["Maintenance", "Event", "Emergency", "Meeting", "Other"];

const UploadNoticePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { addNotice, societyId, token, axios } = useAppContext();

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, type, description } = form;

    if (!title.trim() || !type.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/notices/create`,
        {
          title,
          type,
          description,
          society_id: societyId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.notice) {
        addNotice(data.notice);
        toast.success("Notice uploaded successfully!");
        navigate("/my-society/notices");
      } else {
        toast.error("Failed to upload notice.");
      }
    } catch (err) {
      console.error("Error posting notice:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || "Server error while posting notice.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 8,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${notice_bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(8px)",
            zIndex: -2,
            animation: "panBackground 60s linear infinite alternate",
            "@keyframes panBackground": {
              "0%": { backgroundPosition: "0% 0%" },
              "100%": { backgroundPosition: "100% 100%" },
            },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)",
            zIndex: -1,
          },
        }}
      >
        <MotionPaper
          elevation={isMobile ? 0 : 10}
          variants={itemVariants}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: isMobile ? 0 : 4,
            width: "100%",
            maxWidth: 650,
            backgroundColor: isDark ? theme.palette.background.paper : theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: isMobile ? "none" : theme.shadows[10],
            overflow: "hidden",
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <MotionBox variants={itemVariants}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={700}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
              }}
              textAlign="center"
              gutterBottom
            >
              📝 Post a New Notice
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Share important updates and announcements with your society members.
            </Typography>
          </MotionBox>

          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <MotionTextField
              label="Notice Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            />

            <MotionTextField
              select
              label="Notice Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            >
              {noticeTypes.map((type, idx) => (
                <MenuItem
                  key={idx}
                  value={type}
                  sx={{
                    bgcolor: isDark ? theme.palette.grey[800] : theme.palette.common.white,
                    color: theme.palette.text.primary,
                  }}
                >
                  {type}
                </MenuItem>
              ))}
            </MotionTextField>

            <MotionTextField
              label="Notice Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              sx={{ mb: 1 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            />

            <MotionButton
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                py: 1.5,
                borderRadius: theme.shape.borderRadius,
                fontSize: "1.1rem",
                boxShadow: theme.shadows[6],
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
                transition: "all 0.3s ease-in-out",
              }}
              variants={itemVariants}
            >
              {loading ? "Uploading Notice..." : "Upload Notice"}
            </MotionButton>
          </Box>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default UploadNoticePage;
