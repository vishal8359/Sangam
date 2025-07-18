import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Slide,
  CircularProgress,
} from "@mui/material";
import { UploadFileOutlined, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Complaint_Bg from "../../assets/Complaint_Bg.jpg";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

const complaintTypes = [
  "Water Leakage",
  "Electricity Issue",
  "Noise Complaint",
  "Security Concern",
  "Other",
];

const SubmitComplaint = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { token, axios } = useAppContext();

  const [form, setForm] = useState({
    name: "", // You can still collect this for display if needed, but it won't be sent to backend explicitly for the complaint document
    flat: "",
    type: "",
    description: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      setForm({ ...form, file: null });
      return;
    }
    setForm({ ...form, file: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("complaint_type", form.type);
    formData.append("description", form.description);
    formData.append("house_no", form.flat);
    // REMOVED: No longer need to append 'name' from frontend, backend gets it from req.user
    // formData.append("name", form.name);

    if (form.file) formData.append("file", form.file);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/complaints/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast.success(
        "Complaint submitted successfully! We'll get back to you shortly."
      );
      navigate("/my-society/complaints");
    } catch (err) {
      console.error(
        "❌ Complaint submission failed:",
        err.response?.data || err.message
      );
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit complaint. Please try again.";
      toast.error(errorMessage);
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
        damping: 10,
      },
    },
  };

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        minHeight="100vh"
        sx={{
          position: "relative",
          zIndex: 1,
          background: isDark ? "#1a1a1a" : theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${Complaint_Bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(8px)",
            zIndex: -2,
            animation: "bgPulse 10s infinite alternate ease-in-out",
            "@keyframes bgPulse": {
              "0%": { transform: "scale(1)" },
              "100%": { transform: "scale(1.05)" },
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
          elevation={isMobile ? 0 : 8}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          sx={{
            width: isMobile ? "100%" : "min(80vw, 600px)",
            p: isMobile ? 3 : 5,
            borderRadius: isMobile ? 0 : 3,
            bgcolor: isDark ? theme.palette.background.paper : "#fff",
            color: "theme.palette.text.primary",
            boxShadow: isMobile ? "none" : theme.shadows[8],
            overflow: "hidden",
          }}
        >
          <MotionBox variants={itemVariants}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={700}
              mb={isMobile ? 2 : 3}
              color="#000" // This color should ideally come from theme.palette.text.primary
              textAlign="center"
            >
              📝 Register Your Complaint
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              mb={isMobile ? 3 : 4}
            >
              Help us improve your living experience in Sangam Society.
            </Typography>
          </MotionBox>

          <form onSubmit={handleSubmit}>
            <MotionTextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDark
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
              variants={itemVariants}
            />
            <MotionTextField
              fullWidth
              label="Flat Number"
              name="flat"
              value={form.flat}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDark
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
              variants={itemVariants}
            />
            <MotionTextField
              select
              fullWidth
              label="Complaint Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDark
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
              variants={itemVariants}
            >
              {complaintTypes.map((type, i) => (
                <MenuItem
                  key={i}
                  value={type}
                  sx={{
                    bgcolor: isDark
                      ? theme.palette.grey[800]
                      : theme.palette.common.white,
                    color: theme.palette.text.primary,
                  }}
                >
                  {type}
                </MenuItem>
              ))}
            </MotionTextField>
            <MotionTextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: isDark
                    ? theme.palette.grey[900]
                    : theme.palette.grey[100],
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.light,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDark
                    ? theme.palette.grey[300]
                    : theme.palette.grey[700],
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
              variants={itemVariants}
            />
            <MotionButton
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                my: 2,
                py: 1.5,
                borderRadius: 2,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: isDark
                    ? theme.palette.grey[800]
                    : theme.palette.grey[50],
                },
                bgcolor: isDark
                  ? theme.palette.grey[900]
                  : theme.palette.grey[100],
              }}
              startIcon={<UploadFileOutlined />}
              variants={itemVariants}
            >
              {form.file ? form.file.name : "Upload Photo / Document (Max 5MB)"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </MotionButton>
            <MotionButton
              variant="contained"
              // Corrected: Use theme.palette.primary.main for consistency
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Send />
                )
              }
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[6],
                },
                transition: "all 0.3s ease-in-out",
              }}
              variants={itemVariants}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </MotionButton>
          </form>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default SubmitComplaint;