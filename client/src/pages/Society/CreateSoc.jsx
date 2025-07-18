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
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import society_creation_bg from "../../assets/societyBg.jpg"; // Reusing background image

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);

const CreateSociety = () => {
  const { login, axios } = useAppContext(); // Removed 'colors' as we'll use theme.palette directly
  const [formData, setFormData] = useState({
    name: "",
    house: "",
    contact: "",
    email: "",
    password: "",
    location: "", // JSON string input
  });
  const navigate = useNavigate();

  const [createdDetails, setCreatedDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);
    setError("");

    const { name, house, contact, password, location } = formData;

    if (!name.trim() || !house.trim() || !contact.trim() || !password.trim() || !location.trim()) {
      setError("Please fill all required fields.");
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    let parsedLocation;
    try {
      parsedLocation = JSON.parse(location);
      if (
        !parsedLocation.type ||
        parsedLocation.type !== "Polygon" ||
        !Array.isArray(parsedLocation.coordinates)
      ) {
        throw new Error("Invalid GeoJSON format.");
      }
    } catch (err) {
      setError("Invalid GeoJSON format for location.");
      toast.error("Invalid GeoJSON format for location.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/users/society/create", {
        ...formData,
        location: parsedLocation,
      });

      login({
        token: data.token, // Assuming token is returned upon society creation
        userId: data.user_id,
        houseId: data.home_id,
        societyId: data.society_id,
        userRole: "admin", // The creator is automatically an admin
        userProfile: {
          name: formData.name,
          contact: formData.contact,
          email: formData.email,
        },
      });

      setCreatedDetails({
        societyId: data.society_id,
        userId: data.user_id,
        password: formData.password,
      });
      toast.success("Society created successfully!");
    } catch (err) {
      console.error("Error creating society:", err?.response?.data || err.message);
      const msg = err?.response?.data?.message || "Failed to create society.";
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
            backgroundImage: `url(${society_creation_bg})`,
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
              🏢 Create New Society
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Establish your new society and become its first administrator.
            </Typography>
          </MotionBox>

          {!createdDetails ? (
            <form onSubmit={handleSubmit}>
              {[
                { label: "Society Name", name: "name" },
                { label: "Your House Number", name: "house" },
                { label: "Your Contact Number", name: "contact", type: "tel" },
                { label: "Your Email (Optional)", name: "email", type: "email" },
                { label: "Admin Password", name: "password", type: "password" },
                {
                  label: "Society Location (GeoJSON Polygon)",
                  name: "location",
                  multiline: true,
                  rows: 4,
                  helperText: 'e.g., {"type":"Polygon","coordinates":[[[10,10],[20,10],[20,20],[10,20],[10,10]]]}',
                },
              ].map((field) => (
                <MotionTextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  fullWidth
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.name !== "email"} // Email is optional
                  multiline={field.multiline || false}
                  rows={field.rows || 1}
                  margin="normal"
                  variant="outlined"
                  sx={{ mb: 1 }}
                  InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                  InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
                  variants={itemVariants}
                />
              ))}

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
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  mt: 2,
                  py: 1.5,
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
                {loading ? "Creating Society..." : "Create Society"}
              </MotionButton>
            </form>
          ) : (
            <MotionBox variants={itemVariants} textAlign="center" sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[100], border: `1px solid ${theme.palette.primary.light}` }}>
              <Typography variant="h6" gutterBottom color="success.main" fontWeight="bold">
                ✅ Society Created Successfully!
              </Typography>
              <Typography variant="body1" mt={2} color="text.primary">
                <strong>Society ID:</strong> <Typography component="span" fontWeight="bold" color="primary.main">{createdDetails.societyId}</Typography>
              </Typography>
              <Typography variant="body1" color="text.primary">
                <strong>Admin User ID:</strong> <Typography component="span" fontWeight="bold" color="primary.main">{createdDetails.userId}</Typography>
              </Typography>
              <Typography variant="body1" color="text.primary" mb={3}>
                <strong>Admin Password:</strong> <Typography component="span" fontWeight="bold" color="primary.main">{createdDetails.password}</Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Please save these credentials. You can now log in as an admin.
              </Typography>
              <MotionButton
                variant="contained"
                color="primary"
                onClick={() => navigate("/admin-login")}
                sx={{
                  py: 1,
                  px: 3,
                  borderRadius: theme.shape.borderRadius * 1.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Admin Login
              </MotionButton>
            </MotionBox>
          )}
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default CreateSociety;
