import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
} from "@mui/material";
import { motion } from "framer-motion";
import societyBg from "../../assets/societyBg.jpg";
import MySocietyImg from "../../assets/mySocietyImg.jpg";
import society_icon from "../../assets/society_icon.png";
import { useAppContext } from "../../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-hot-toast";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const MySociety = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { navigate, userRole, token, societyId } = useAppContext();
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/society/${societyId}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSociety(data.society);
      } catch (err) {
        console.error(
          "Failed to fetch society:",
          err.response?.data || err.message
        );
        toast.error(
          err.response?.data?.message || "Failed to load society data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && societyId) {
      fetchSociety();
    } else {
      setLoading(false);
      if (!token) toast.error("Authentication token missing. Please log in.");
      if (!societyId) toast.error("Society ID missing. Please join a society.");
    }
  }, [token, societyId, axios]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" ml={2} color="text.secondary">
          Loading society details...
        </Typography>
      </Box>
    );
  }

  if (!society) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h6" color="error">
          Society data not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 5,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${societyBg})`,
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
            background: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.7)",
            zIndex: -1,
          },
        }}
      >
        <MotionPaper
          variants={itemVariants}
          elevation={10}
          sx={{
            position: "relative",
            maxWidth: isMobile ? "95%" : "800px",
            width: "100%",
            mx: "auto",
            p: isMobile ? 4 : 6,
            backgroundColor: isDark
              ? theme.palette.background.paper
              : theme.palette.common.white,
            borderRadius: theme.shape.borderRadius * 3,
            boxShadow: theme.shadows[10],
            overflow: "hidden",
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <MotionBox
            variants={itemVariants}
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={isMobile ? 2 : 3}
          >
            <Avatar
              src={isDark ? "" : society_icon}
              alt="Society Icon"
              sx={{
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                mr: 2,
                boxShadow: theme.shadows[4],
                
              }}
            />
            <Box
              component="h1"
              sx={{
                fontSize: isMobile
                  ? theme.typography.h5.fontSize
                  : theme.typography.h4.fontSize,
                fontWeight: 700,
              }}
            >
              My Society
            </Box>
          </MotionBox>

          <MotionBox
            variants={itemVariants}
            display="flex"
            justifyContent="center"
            mb={isMobile ? 4 : 6}
          >
            <Box
              component="img"
              src={MySocietyImg}
              alt={`${society.name} Image`}
              sx={{
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[6],
                maxHeight: isMobile ? 150 : 250,
                width: "50%",
                objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
            />
          </MotionBox>

          <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="medium"
              >
                Society Name:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="text.primary"
              >
                {society.name}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="medium"
              >
                Society ID:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="text.primary"
              >
                {society._id}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="medium"
              >
                Address:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="text.primary"
              >
                {society.created_by?.address || "N/A"}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight="medium"
              >
                Admin:
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="text.primary"
              >
                {society.created_by?.name || "N/A"}
              </Typography>
            </Box>
          </MotionBox>

          <MotionBox
            variants={itemVariants}
            sx={{
              mt: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {userRole === "admin" && (
              <MotionButton
                onClick={() => navigate("/my-society/admin/panel")}
                variant="contained"
                color="primary"
                sx={{
                  width: isMobile ? "100%" : 250,
                  py: 1.5,
                  borderRadius: theme.shape.borderRadius * 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: theme.shadows[6],
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Open Admin Panel
              </MotionButton>
            )}

            <MotionButton
              onClick={() => navigate("/")}
              variant="outlined"
              color="secondary"
              sx={{
                width: isMobile ? "100%" : 250,
                py: 1.5,
                borderRadius: theme.shape.borderRadius * 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: theme.shadows[3],
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[6],
                },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Leave Society
            </MotionButton>
          </MotionBox>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default MySociety;
