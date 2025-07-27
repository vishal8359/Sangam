import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  useMediaQuery,
  CircularProgress,
  Slide,
  Fade,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import login_bg from "../../assets/societyBg.jpg";
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; 

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

export default function ResidentLogin() {
  const [formData, setFormData] = useState({
    society_id: "",
    user_id: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { axios, login } = useAppContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { society_id, user_id, password } = formData;

    if (!society_id.trim() || !user_id.trim() || !password.trim()) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("ResidentLogin: Submitting standard login with:", {
      society_id: society_id.trim(),
      user_id: user_id.trim(),
      password: "********", // Don't log actual password
    });

    try {
      const response = await axios.post("/api/users/login", {
        society_id: society_id.trim(),
        user_id: user_id.trim(),
        password: password.trim(),
      });

      const data = response.data;
      console.log("ResidentLogin: Backend response for standard login:", data);

      if (data.success) {
        toast.success(data.message || "Login successful");

        login({
          token: data.token,
          userId: data.userId,
          houseId: data.houseId,
          societyId: data.societyId,
          userRole: data.userRole,
          userProfile: data.userProfile,
        });

        navigate("/my-society");
      } else {
        toast.error(data.message || "Login failed.");
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Login failed";

      if (status === 403) {
        toast.success(message);
        setError(null);
      } else {
        toast.error(message);
        setError(message);
      }
      console.error("ResidentLogin: Standard login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError(null);

    const googleIdToken = credentialResponse?.credential; 

    if (!googleIdToken) {
      console.error("❌ Google ID Token not found in credentialResponse.");
      toast.error("Google login failed: ID token missing.");
      setGoogleLoading(false);
      return;
    }

    console.log("ResidentLogin: Google ID Token received.");

    try {
      const decoded = jwtDecode(googleIdToken); // Attempt to decode
      console.log("ResidentLogin: Decoded Google ID Token:", decoded); // Log decoded token

      const response = await axios.post("/api/users/google-login", {
        society_id: formData.society_id.trim(),
        googleIdToken: googleIdToken,
      });

      const data = response.data;
      console.log("ResidentLogin: Backend response for Google login:", data); // Log backend response

      if (data.success) {
        toast.success(data.message || "Google login successful!");

        login({
          token: data.token,
          userId: data.userId, // Ensure this is the Mongoose _id
          houseId: data.houseId,
          societyId: data.societyId,
          userRole: data.userRole,
          userProfile: data.userProfile,
        });

        navigate("/my-society");
      } else {
        toast.error(data.message || "Google login failed.");
        setError(data.message || "Google login failed.");
      }
    } catch (err) {
      console.error("❌ ResidentLogin: Google login process error:", err.response?.data || err.message); // More generic error log
      toast.error(err.response?.data?.message || "Google login failed. Please try again.");
      setError(err.response?.data?.message || "Google login failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log('ResidentLogin: Google Login Failed (user cancelled or other error)');
    toast.error("Google login failed. Please try again.");
    setGoogleLoading(false);
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

  const showLoginForm = formData.society_id.trim().length > 0;

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
            backgroundImage: `url(${login_bg})`,
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
              Resident Login
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Access your society dashboard.
            </Typography>
          </MotionBox>

          <MotionTextField
            fullWidth
            label="Enter Your Society ID"
            name="society_id"
            value={formData.society_id}
            onChange={handleChange}
            variant="outlined"
            margin="normal"
            required
            sx={{ mb: 3 }}
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
            variants={itemVariants}
          />

          {showLoginForm && (
            <Fade in={showLoginForm} timeout={500}>
              <Box>
                <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                  Login using your User ID and Password:
                </Typography>
                <form onSubmit={handleSubmit}>
                  <MotionTextField
                    fullWidth
                    label="User ID"
                    name="user_id"
                    value={formData.user_id}
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
                    type="password"
                    name="password"
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
                  
                  {/* Moved Google Login button and Divider above the standard Login button */}
                  <MotionBox variants={itemVariants} mt={2}>
                    <Divider sx={{ my: 3, borderColor: theme.palette.divider }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      render={({ onClick, disabled }) => (
                        <MotionButton
                          variant="outlined"
                          color="secondary"
                          fullWidth
                          onClick={onClick}
                          disabled={disabled || loading || googleLoading}
                          startIcon={googleLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                          sx={{
                            mt: 2,
                            py: 1.2,
                            fontWeight: "bold",
                            borderRadius: theme.shape.borderRadius * 1.5,
                            fontSize: "1.1rem",
                            boxShadow: theme.shadows[3],
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: theme.shadows[6],
                            },
                            transition: "all 0.3s ease-in-out",
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {googleLoading ? "Logging in with Google..." : "Login with Google"}
                        </MotionButton>
                      )}
                    />
                    
                  </MotionBox>

                  <MotionButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading || googleLoading}
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
                    {loading ? "Logging in..." : "Login"}
                  </MotionButton>
                </form>

                {/* Moved "New User? Register here" inside the Fade block */}
                <MotionBox variants={itemVariants}>
                  <Typography variant="body2" textAlign="center" mt={showLoginForm ? 2 : 4} color="text.secondary">
                    New User?{" "}
                    <RouterLink
                      to="/register"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        fontWeight: "bold",
                        transition: "color 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = theme.palette.primary.dark}
                      onMouseLeave={(e) => e.currentTarget.style.color = theme.palette.primary.main}
                    >
                      Register here
                    </RouterLink>
                  </Typography>
                </MotionBox>
              </Box>
            </Fade>
          )}
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
}
