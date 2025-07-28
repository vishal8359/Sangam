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
  Slide,
  Fade,
  Avatar,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import register_bg from "../../assets/societyBg.jpg";
import { CloudUpload } from "@mui/icons-material";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

export default function Register() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    phone_no: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { axios, navigate } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar file size exceeds 2MB limit.");
        setAvatarFile(null);
        setAvatarPreview("");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarFile(null);
      setAvatarPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requiredFields = [
      "user_name",
      "email",
      "phone_no",
      "address",
      "password",
      "confirm_password",
    ];

    const anyEmpty = requiredFields.some(
      (key) => !formData[key] || formData[key].trim() === ""
    );

    if (anyEmpty) {
      setError("All fields except avatar are required.");
      toast.error("All fields except avatar are required.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    const dataToSend = new FormData();
    for (const key in formData) {
      if (key !== "avatar") {
        dataToSend.append(key, formData[key].trim());
      }
    }
    if (avatarFile) {
      dataToSend.append("avatar", avatarFile);
    }

    try {
      const { data } = await axios.post("/api/users/register", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("otp_phone", formData.phone_no.trim());
      toast.success(data.message || "Registration submitted. Awaiting OTP.");
      setError(null);

      setFormData({
        user_name: "",
        email: "",
        phone_no: "",
        address: "",
        password: "",
        confirm_password: "",
      });
      setAvatarFile(null);
      setAvatarPreview("");

      navigate("/verify-otp");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Registration failed.";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: isMobile ? 2 : 4,
          py: 5,
          position: "relative",
          zIndex: 1,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${register_bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(5px)",
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
            background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
            zIndex: -1,
          },
        }}
      >
        <MotionPaper
          elevation={isMobile ? 0 : 10}
          sx={{
            p: isMobile ? 3 : 5,
            width: "100%",
            maxWidth: 600,
            borderRadius: isMobile ? 0 : 4,
            maxHeight: "95vh",
            overflowY: "auto",
            boxShadow: isMobile ? "none" : theme.shadows[10],
            backgroundColor: isDark ? theme.palette.background.paper : theme.palette.common.white,
            color: theme.palette.text.primary,
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
              textAlign="center"
              gutterBottom
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.3)" : "none",
              }}
            >
              New User Registration
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Join your society and connect with your community.
            </Typography>
          </MotionBox>

          <form onSubmit={handleSubmit}>
            {[
              { label: "Full Name", name: "user_name" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone Number", name: "phone_no", type: "tel" },
              { label: "Address", name: "address", multiline: true, rows: 2 },
              { label: "Password", name: "password", type: "password" },
              {
                label: "Confirm Password",
                name: "confirm_password",
                type: "password",
              },
            ].map((field) => (
              <MotionTextField
                key={field.name}
                fullWidth
                margin="normal"
                required
                variant="outlined"
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                multiline={field.multiline || false}
                rows={field.rows || 1}
                value={formData[field.name]}
                onChange={handleChange}
                sx={{ mb: 1 }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
                variants={itemVariants}
              />
            ))}

            <MotionBox variants={itemVariants} sx={{ my: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Profile Avatar (optional)
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{
                    py: 1,
                    px: 2,
                    borderRadius: theme.shape.borderRadius,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
                    },
                  }}
                >
                  {avatarFile ? avatarFile.name : "Choose Avatar File"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </Button>
                {avatarPreview && (
                  <Fade in={Boolean(avatarPreview)} timeout={500}>
                    <Avatar
                      src={avatarPreview}
                      sx={{
                        width: 60,
                        height: 60,
                        boxShadow: theme.shadows[3],
                        border: `2px solid ${theme.palette.primary.light}`,
                      }}
                      alt="Avatar Preview"
                    />
                  </Fade>
                )}
              </Box>
            </MotionBox>

            {error && (
              <Fade in={Boolean(error)} timeout={500}>
                <Typography color="error" mt={1} mb={2} textAlign="center" variant="body2" sx={{ fontWeight: 'bold' }}>
                  {error}
                </Typography>
              </Fade>
            )}

            <MotionButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                mt: 2,
                py: 1.2,
                fontWeight: "bold",
                borderRadius: theme.shape.borderRadius * 1.5,
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
              {loading ? "Registering..." : "Register"}
            </MotionButton>

            <MotionBox variants={itemVariants}>
              <Typography variant="body2" textAlign="center" mt={2} color="text.secondary">
                Already have an account?{" "}
                <RouterLink
                  to="/resident-login"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "color 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.palette.primary.dark}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.palette.primary.main}
                >
                  Login here
                </RouterLink>
              </Typography>
            </MotionBox>
          </form>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
}
