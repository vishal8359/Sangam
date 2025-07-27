import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Slide,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Use useNavigate directly
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import admin_login_bg from "../../assets/societyBg.jpg";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

const AdminLogin = () => {
  // Use useNavigate directly for navigation
  const navigate = useNavigate();
  // Get login and axios from AppContext
  const { login, axios } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      toast.error("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/admin/login", {
        email: email.trim(),
        password: password.trim(),
        // If you need to send a specific societyId during login:
        // societyId: "YOUR_SOCIETY_ID_IF_NEEDED", // <-- uncomment and set if relevant for multi-society admin
      });

      // --- CRITICAL CHANGE START ---
      // Destructure res.data to match your backend's response directly
      const { token, userId, societyId, userRole, userProfile, houseId } = res.data;

      // AppContext's login function already handles localStorage and axios default headers
      login({
        token,
        userId,       // Use the top-level userId from backend response
        userRole,     // Use the top-level userRole from backend response
        societyId,    // Use the top-level societyId from backend response
        houseId,      // Use the top-level houseId from backend response
        userProfile,  // Use the top-level userProfile object from backend response
      });
      // --- CRITICAL CHANGE END ---

      toast.success("Admin login successful");
      navigate("/my-society"); // Navigate after successful login and state update
    } catch (err) {
      console.error("Admin Login Frontend Error:", err); // Log the actual frontend error for debugging
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
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
          alignItems: "center",
          justifyContent: "center",
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
            backgroundImage: `url(${admin_login_bg})`,
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
            maxWidth: 500,
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
              🔐 Admin Login
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Access the administration panel.
            </Typography>
          </MotionBox>

          <form onSubmit={handleLogin}>
            <MotionTextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              required
              sx={{ mb: 1 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            />

            <MotionTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              required
              sx={{ mb: 1 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            />

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
              {loading ? "Logging in..." : "Login as Admin"}
            </MotionButton>
          </form>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default AdminLogin;