import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  useTheme,
  Fab, // Adding Fab for a potential "Back" button or similar action
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"; // More general icon for gallery
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // For a back button
import { keyframes } from "@emotion/react"; // For CSS keyframe animations

// Assume you have this image in your assets folder
import gallery_bg from "../../assets/gallery_bg.jpg";

// 1. Keyframe Animations for Background
// A subtle, slow panoramic scroll
const backgroundPan = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 0%; }
`;

// A subtle pulsating light effect on the overlay
const pulseLight = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

export default function SocietyGalleryPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Data for gallery sections
  const sections = [
    {
      title: "Upload & Share Reels",
      description: "Contribute your creative videos and short-form content to the community gallery.",
      icon: <VideoLibraryIcon sx={{ fontSize: 60 }} />, // Larger icon
      path: "/gallery/upload-reel",
      color: theme.palette.primary.main, 
    },
    {
      title: "Watch Community Reels",
      description: "Immerse yourself in a curated feed of engaging community reels.",
      icon: <VideoLibraryIcon sx={{ fontSize: 60 }} />,
      path: "/gallery/reels",
      color: theme.palette.info.main, // Another color
    },
  ];

  // 2. Framer Motion Variants for Staggered Entrance
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1, // Stagger children slightly
      },
    },
    exit: { opacity: 0, transition: { duration: 0.5 } }, // For exit animation if used with AnimatePresence
  };

  const cardContainerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Cards appear one after another
      },
    },
  };

  const cardVariants = {
    initial: { y: 100, opacity: 0, scale: 0.8 },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80, // Softer spring
        damping: 10,
        mass: 0.5, // Lighter, faster spring
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit" // Essential for exit animations if using React Router's AnimatePresence
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
    >
      {/* 3. Immersive Background Layer */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${gallery_bg})`,
          backgroundSize: "cover", // Ensures image covers
          backgroundRepeat: "no-repeat", // Prevent tiling
          backgroundPosition: "center center", // Start centered
          animation: `${backgroundPan} 120s linear infinite alternate`, // Slow pan, alternates direction
          filter: "blur(5px) saturate(1.5) brightness(0.8)", // More aggressive blur for art background, desaturate slightly
          opacity: 0.3, // Make it very subtle
        }}
      />

      {/* 4. Overlay for Depth and Mood */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: `linear-gradient(135deg, ${
            isDark ? "rgba(20, 20, 40, 0.8)" : "rgba(240, 248, 255, 0.8)"
          }, ${
            isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(220, 230, 240, 0.9)"
          })`, // Gradient overlay
          animation: `${pulseLight} 15s ease-in-out infinite`, // Subtle pulsing light
          backdropFilter: "brightness(0.8)", // Darken the blurred background further
        }}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          p: { xs: 3, sm: 6, md: 8 }, // Generous padding
          color: isDark ? theme.palette.grey[100] : theme.palette.grey[900],
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh", // Ensure it fills the viewport
          textAlign: "center",
        }}
      >

        {/* Cards Grid */}
        <motion.div variants={cardContainerVariants}>
          <Grid
            container
            spacing={{ xs: 3, sm: 4, md: 6 }} // Responsive spacing
            justifyContent="center"
            alignItems="stretch" // Ensure cards in a row have same height
            sx={{ maxWidth: 1400, width: "100%", mt:5}}
          >
            {sections.map((section, index) => (
              <Grid item xs={12} sm={6} md={4} key={section.title}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    y: -10, // Lift slightly more
                    scale: 1.03, // Slightly less scale for stability
                    boxShadow: `0 15px 40px ${
                      isDark
                        ? "rgba(0, 255, 255, 0.3)"
                        : "rgba(0, 0, 0, 0.2)"
                    }`, // Stronger, colored shadow
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ height: "100%" }} // Important for stretch alignment
                >
                  <Card
                    elevation={8} // Higher elevation for more pop
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between", // Pushes button to bottom
                      alignItems: "center",
                      p: { xs: 3, sm: 4, md: 5 }, // Increased internal padding
                      borderRadius: 5, // More rounded corners
                      backdropFilter: "blur(12px) brightness(1.2) saturate(1.5)", // Stronger glass effect
                      backgroundColor: isDark
                        ? `rgba(255, 255, 255, 0.08)` // Very subtle transparent white
                        : `rgba(255, 255, 255, 0.65)`, // More opaque white for light mode
                      border: `1px solid ${
                        isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
                      }`, // Defined border
                      transition: "background-color 0.3s ease-in-out", // Smooth mode transition
                      overflow: "hidden", // Ensures nothing spills out of rounded corners
                    }}
                  >
                    {/* Icon Section */}
                    <Box
                      sx={{
                        mb: 3,
                        color: section.color, // Use dynamic color
                        p: 2,
                        borderRadius: "50%",
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)",
                        boxShadow: `inset 0 0 10px ${
                          isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
                        }`,
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          transform: "rotate(5deg) scale(1.1)", // Icon spin
                        },
                      }}
                    >
                      {section.icon}
                    </Box>

                    <CardContent
                      sx={{
                        flexGrow: 1, // Allows content to fill space
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "100%", // Ensures card content fills card width
                      }}
                    >
                      {/* Card Title */}
                      <Typography
                        variant="h5"
                        fontWeight={600}
                        gutterBottom
                        sx={{
                          color: isDark ? "#ffffff" : "#333333",
                          lineHeight: 1.3,
                        }}
                      >
                        {section.title}
                      </Typography>
                      {/* Card Description */}
                      <Typography
                        variant="body1" 
                        sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 , color: isDark? "#ccc" : ""}}
                      >
                        {section.description}
                      </Typography>
                      {/* Call to Action Button */}
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="contained"
                          onClick={() => navigate(section.path)}
                          sx={{
                            mt: "auto", // Pushes button to the bottom
                            bgcolor: section.color, // Use dynamic color
                            color: theme.palette.getContrastText(section.color), // Auto text color
                            px: { xs: 4, sm: 6 },
                            py: { xs: 1.2, sm: 1.5 },
                            borderRadius: 3,
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            textTransform: "none", // Preserve casing
                            letterSpacing: 0.5,
                            transition: "all 0.3s ease-in-out",
                            "&:hover": {
                              bgcolor: section.color, // Keep same background, but motion handles effect
                              opacity: 0.9,
                            },
                          }}
                        >
                          Explore Now
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Optional Back Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 1.5, duration: 0.5 } }}
          style={{ position: "absolute", bottom: theme.spacing(4), right: theme.spacing(4) }}
        >
          <Fab
            color="primary"
            aria-label="back"
            onClick={() => navigate(-1)} // Navigates back
            sx={{
              boxShadow: `0 8px 25px ${isDark ? "rgba(0,255,255,0.3)" : "rgba(0,0,0,0.2)"}`,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.1) rotate(5deg)",
              },
            }}
          >
            <ArrowBackIcon />
          </Fab>
        </motion.div>
      </Box>
    </motion.div>
  );
}